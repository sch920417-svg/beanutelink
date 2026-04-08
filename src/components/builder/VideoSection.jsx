import React, { useState, useRef } from 'react';
import { Icons } from '../../data/links';
import { uploadVideo } from '../../services/videoUpload';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function VideoSection({ config, updateConfig, showToast }) {
  const videoData = config.video || { title: '영상', items: [] };
  const items = videoData.items || [];
  const [uploadingId, setUploadingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const updateVideoData = (newData) => {
    updateConfig('video', { ...videoData, ...newData });
  };

  const handleUrlAdd = () => {
    const newItem = {
      id: `video-${Date.now()}`,
      url: '',
      caption: '',
    };
    updateVideoData({ items: [...items, newItem] });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const id = `video-${Date.now()}`;
    const newItem = { id, url: '', caption: '', type: 'upload' };
    updateVideoData({ items: [...items, newItem] });

    setUploadingId(id);
    setProgress(0);
    showToast('영상 업로드 중...');

    try {
      const result = await uploadVideo(file, (p) => setProgress(p));
      // items가 stale할 수 있으므로 config에서 최신값을 가져옴
      const latest = config.video?.items || [];
      const updated = [...latest, newItem].map(item =>
        item.id === id ? { ...item, url: result.url } : item
      );
      updateVideoData({ items: updated });
      showToast('영상 업로드 완료!');
    } catch (err) {
      showToast(`업로드 실패: ${err.message}`);
      // 실패 시 해당 아이템 제거
      const latest = config.video?.items || [];
      updateVideoData({ items: latest.filter(i => i.id !== id) });
    } finally {
      setUploadingId(null);
      setProgress(0);
    }
  };

  const updateItem = (id, fields) => {
    updateVideoData({ items: items.map(item => item.id === id ? { ...item, ...fields } : item) });
  };

  const removeItem = (id) => {
    updateVideoData({ items: items.filter(i => i.id !== id) });
    showToast('영상이 삭제되었습니다.');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-2 block">섹션 제목</label>
        <input
          value={videoData.title}
          onChange={e => updateVideoData({ title: e.target.value })}
          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="영상"
        />
      </div>

      {/* 영상 목록 */}
      {items.map(item => (
        <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
          {/* 업로드 중 프로그레스 */}
          {uploadingId === item.id && !item.url && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Icon name="Upload" size={14} className="animate-pulse text-lime-400" />
                <span>업로드 중... {progress}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 업로드된 영상 미리보기 */}
          {item.type === 'upload' && item.url && (
            <BuilderVideoPlayer url={item.url} />
          )}

          {/* YouTube URL 입력 (업로드 타입이 아닌 경우) */}
          {item.type !== 'upload' && (
            <>
              <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-lime-500/50 transition-all">
                <Icon name="MonitorPlay" size={16} className="text-neutral-500" />
                <input
                  value={item.url || ''}
                  onChange={e => updateItem(item.id, { url: e.target.value })}
                  className="w-full text-sm bg-transparent outline-none text-neutral-200 placeholder-neutral-600"
                  placeholder="유튜브 URL 입력 (예: https://youtu.be/xxx)"
                />
              </div>
              {item.url && <VideoUrlPreview url={item.url} />}
            </>
          )}

          <div className="flex gap-2">
            <input
              value={item.caption || ''}
              onChange={e => updateItem(item.id, { caption: e.target.value })}
              className="flex-1 text-sm px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg outline-none text-neutral-300 placeholder-neutral-600 focus:border-lime-500/50"
              placeholder="캡션 (선택)"
            />
            <button onClick={() => removeItem(item.id)} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
              <Icon name="Trash2" size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* 추가 버튼들 */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleUrlAdd} className="py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors text-sm font-bold flex items-center justify-center gap-2">
          <Icon name="Link" size={16} /> YouTube URL
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!!uploadingId}
          className="py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="Upload" size={16} /> 영상 업로드
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

function BuilderVideoPlayer({ url }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <div className="relative rounded-xl overflow-hidden group">
      <video ref={videoRef} src={url} className="w-full" autoPlay muted loop playsInline />
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center">
        <button onClick={togglePlay} className="p-1.5 rounded-full bg-black/40 text-white active:bg-black/70 transition-colors">
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={toggleMute} className="p-1.5 rounded-full bg-black/40 text-white active:bg-black/70 transition-colors">
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
}

function VideoUrlPreview({ url }) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) {
    return (
      <div className="aspect-video bg-neutral-950 rounded-xl flex items-center justify-center text-neutral-500 border border-neutral-800">
        <span className="text-sm">유효한 유튜브 URL을 입력하세요</span>
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video preview"
      />
    </div>
  );
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  let match = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  match = url.match(/(?:youtu\.be\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  match = url.match(/(?:youtube\.com\/embed\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  match = url.match(/(?:youtube\.com\/shorts\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}
