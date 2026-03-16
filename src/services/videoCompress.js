/**
 * FFmpeg.wasm 기반 브라우저 영상 압축
 * 30MB 영상 → 3~5MB MP4 (720p, H.264)
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

async function getFFmpeg(onLog) {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (onLog) {
    ffmpeg.on('log', ({ message }) => {
      onLog(message);
    });
  }

  // single-thread 모드 (SharedArrayBuffer 불필요 → Vercel 호환)
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

/**
 * 영상 파일을 압축하여 Blob으로 반환
 * @param {File} file - 원본 영상 파일
 * @param {function} onProgress - 진행률 콜백 (0~100)
 * @returns {Promise<Blob>} 압축된 MP4 Blob
 */
export async function compressVideo(file, onProgress) {
  const ff = await getFFmpeg((msg) => {
    // FFmpeg 로그에서 진행률 추출
    const timeMatch = msg.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    if (timeMatch && onProgress) {
      const secs = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseFloat(timeMatch[3]);
      // 대략적 진행률 (영상 길이를 모르므로 30초 기준 추정)
      const estimated = Math.min(95, Math.round((secs / 30) * 100));
      onProgress(estimated);
    }
  });

  const inputName = 'input' + (file.name.endsWith('.mov') ? '.mov' : '.mp4');
  const outputName = 'output.mp4';

  // 파일을 FFmpeg 메모리에 로드
  await ff.writeFile(inputName, await fetchFile(file));

  // 압축: 720p, CRF 28, fast preset, AAC 128k
  await ff.exec([
    '-i', inputName,
    '-vf', 'scale=-2:720',        // 720p (가로 자동 비율)
    '-c:v', 'libx264',            // H.264 코덱
    '-preset', 'fast',             // 빠른 인코딩
    '-crf', '28',                  // 화질 (낮을수록 좋음, 28=적절한 압축)
    '-c:a', 'aac',                 // AAC 오디오
    '-b:a', '128k',                // 오디오 비트레이트
    '-movflags', '+faststart',     // 웹 스트리밍 최적화
    outputName,
  ]);

  if (onProgress) onProgress(100);

  // 결과 파일 읽기
  const data = await ff.readFile(outputName);
  const blob = new Blob([data.buffer], { type: 'video/mp4' });

  // 메모리 정리
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return blob;
}
