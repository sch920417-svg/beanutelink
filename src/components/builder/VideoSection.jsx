import React, { useState } from 'react';
import { Icons } from '../../data/links';
import { uploadVideo } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export function VideoSection({ config, updateConfig, showToast, activeTab }) {
  const videoData = config.video || { title: '영상', items: [] };
  const items = videoData.items || [];
  const [uploading, setUploading] = useState(false);

  const updateVideoData = (newData) => {
    updateConfig('video', { ...videoData, ...newData });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // 같은 파일 재업로드 허용
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('영상 파일만 업로드 가능합니다.', 'error');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      showToast(`영상 크기가 50MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`, 'error');
      return;
    }

    setUploading(true);
    const fileSize = (file.size / 1024 / 1024).toFixed(1);

    try {
      showToast(`영상 업로드 중... (${fileSize}MB)`, 'loading', 0);

      // Firebase Storage에 직접 업로드
      const category = activeTab || 'video';
      const url = await uploadVideo(file, category);

      const newItem = {
        id: `video-${Date.now()}`,
        url,
        videoFileName: file.name,
        videoFileSize: file.size,
        caption: '',
      };
      updateVideoData({ items: [...items, newItem] });
      showToast(`영상 업로드 완료! (${fileSize}MB)`, 'success', 3000);
    } catch (err) {
      console.error('영상 업로드 실패:', err);
      showToast('영상 업로드 실패: ' + err.message, 'error', 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    const newItem = {
      id: `video-${Date.now()}`,
      url: '',
      videoFileName: '',
      videoFileSize: 0,
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
          {item.url ? (
            <div className="relative rounded-lg overflow-hidden group">
              <video src={item.url} controls className="w-full" preload="metadata" />
              {item.videoFileName && (
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  {item.videoFileName} ({(item.videoFileSize / 1024 / 1024).toFixed(1)}MB)
                </div>
              )}
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
        <label className={`flex-1 py-3 border-2 border-dashed border-neutral-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
          uploading ? 'opacity-50 pointer-events-none text-neutral-600' : 'text-neutral-500 hover:text-lime-400 hover:border-lime-500/50'
        }`}>
          <Icon name="Upload" size={16} /> {uploading ? '처리 중...' : '영상 파일 업로드'}
          <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
        </label>
        <button onClick={handleUrlAdd} disabled={uploading} className="flex-1 py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          <Icon name="Link" size={16} /> URL로 추가
        </button>
      </div>
    </div>
  );
}
