import React from 'react';
import { Icons } from '../../data/links';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export function VideoSection({ config, updateConfig, showToast }) {
  const videoData = config.video || { title: '영상', items: [] };
  const items = videoData.items || [];

  const updateVideoData = (newData) => {
    updateConfig('video', { ...videoData, ...newData });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('영상 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      showToast(`영상 크기가 50MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    showToast('영상 업로드 중...');
    const objectUrl = URL.createObjectURL(file);
    const newItem = {
      id: `video-${Date.now()}`,
      videoObjectUrl: objectUrl,
      videoFileName: file.name,
      videoFileSize: file.size,
      url: '',
      caption: '',
    };
    updateVideoData({ items: [...items, newItem] });
    showToast('영상이 추가되었습니다.');
  };

  const handleUrlAdd = () => {
    const newItem = {
      id: `video-${Date.now()}`,
      videoObjectUrl: '',
      videoFileName: '',
      videoFileSize: 0,
      url: '',
      caption: '',
    };
    updateVideoData({ items: [...items, newItem] });
  };

  const updateItem = (id, fields) => {
    updateVideoData({ items: items.map(item => item.id === id ? { ...item, ...fields } : item) });
  };

  const removeItem = (id) => {
    const item = items.find(i => i.id === id);
    if (item?.videoObjectUrl) URL.revokeObjectURL(item.videoObjectUrl);
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
          {item.videoObjectUrl ? (
            <div className="relative rounded-lg overflow-hidden group">
              <video src={item.videoObjectUrl} controls className="w-full" preload="metadata" />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {item.videoFileName} ({(item.videoFileSize / 1024 / 1024).toFixed(1)}MB)
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-lime-500/50 transition-all">
              <Icon name="MonitorPlay" size={16} className="text-neutral-500" />
              <input
                value={item.url || ''}
                onChange={e => updateItem(item.id, { url: e.target.value })}
                className="w-full text-sm bg-transparent outline-none text-neutral-200 placeholder-neutral-600"
                placeholder="유튜브 또는 비메오 URL 입력"
              />
            </div>
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

      {/* 추가 버튼 */}
      <div className="flex gap-2">
        <label className="flex-1 py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
          <Icon name="Upload" size={16} /> 영상 파일 업로드
          <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleVideoUpload} />
        </label>
        <button onClick={handleUrlAdd} className="flex-1 py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors text-sm font-bold flex items-center justify-center gap-2">
          <Icon name="Link" size={16} /> URL로 추가
        </button>
      </div>
    </div>
  );
}
