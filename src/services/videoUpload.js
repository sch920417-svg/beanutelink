/**
 * R2에 영상 파일 업로드 (Presigned URL 방식)
 * @param {File} file - 영상 파일
 * @param {function} onProgress - 진행률 콜백 (0~100)
 * @returns {Promise<{url: string}>}
 */
export async function uploadVideo(file, onProgress) {
  // Step 1: Presigned URL 발급
  const params = new URLSearchParams({ contentType: file.type });
  const res = await fetch(`/api/upload-video?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Presigned URL 발급 실패');
  }
  const { uploadUrl, publicUrl } = await res.json();

  // Step 2: R2에 직접 업로드 (진행률 추적)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: publicUrl });
      } else {
        reject(new Error(`업로드 실패 (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('네트워크 오류'));
    xhr.send(file);
  });
}
