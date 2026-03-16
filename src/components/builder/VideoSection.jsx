import React from 'react';
import { Icons } from '../../data/links';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function VideoSection({ config, updateConfig, showToast }) {
  const videoData = config.video || { title: '영상', items: [] };
  const items = videoData.items || [];

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
      <button onClick={handleUrlAdd} className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors text-sm font-bold flex items-center justify-center gap-2">
        <Icon name="Link" size={16} /> YouTube URL 추가
      </button>
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
  // youtube.com/watch?v=ID
  let match = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // youtu.be/ID
  match = url.match(/(?:youtu\.be\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // youtube.com/embed/ID (already embed)
  match = url.match(/(?:youtube\.com\/embed\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // youtube.com/shorts/ID
  match = url.match(/(?:youtube\.com\/shorts\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}
