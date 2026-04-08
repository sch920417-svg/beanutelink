import React from 'react';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function HeroSliderSection({ config, updateConfig, showToast }) {
  const images = config.heroImages;

  const addImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    showToast('이미지 업로드 중...');
    const newImages = [];
    for (const file of files) {
      const compressed = await uploadCompressed(file, 'hero');
      newImages.push({
        id: `hero-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: compressed,
        alt: `배너 ${images.length + newImages.length + 1}`,
      });
    }
    updateConfig('heroImages', [...images, ...newImages]);
    showToast(`${newImages.length}장 추가 완료`);
  };

  const removeImage = (id) => {
    updateConfig('heroImages', images.filter(img => img.id !== id));
    showToast('이미지가 삭제되었습니다.');
  };

  const updateAlt = (id, alt) => {
    updateConfig('heroImages', images.map(img => img.id === id ? { ...img, alt } : img));
  };

  const moveImage = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    updateConfig('heroImages', newImages);
  };

  return (
    <div className="space-y-4">
      {/* 스크롤 고정 토글 */}
      <label className="flex items-center gap-2.5 cursor-pointer bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
        <input
          type="checkbox"
          checked={config.heroScrollLock ?? false}
          onChange={(e) => updateConfig('heroScrollLock', e.target.checked)}
          className="w-4 h-4 rounded border-neutral-600 bg-neutral-950 text-lime-500 focus:ring-lime-500 focus:ring-offset-0 cursor-pointer"
        />
        <span className="text-xs font-bold text-neutral-400">스와이프 시 스크롤 고정</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {images.map((img, idx) => (
          <div key={img.id} className="relative group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="aspect-square flex items-center justify-center bg-neutral-800">
              {img.url ? (
                <img src={img.url} className="w-full h-full object-cover" alt={img.alt} />
              ) : (
                <Icon name="Image" size={24} className="text-neutral-600" />
              )}
            </div>
            <div className="p-2">
              <input
                value={img.alt}
                onChange={(e) => updateAlt(img.id, e.target.value)}
                className="w-full text-[11px] bg-transparent text-neutral-400 outline-none focus:text-white"
                placeholder="배너 설명"
              />
            </div>
            {/* Controls */}
            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {idx > 0 && (
                <button onClick={() => moveImage(idx, 'up')} className="p-1 bg-black/60 rounded text-white hover:bg-lime-500 transition-colors"><Icon name="ChevronUp" size={12} /></button>
              )}
              {idx < images.length - 1 && (
                <button onClick={() => moveImage(idx, 'down')} className="p-1 bg-black/60 rounded text-white hover:bg-lime-500 transition-colors"><Icon name="ChevronDown" size={12} /></button>
              )}
              <button onClick={() => removeImage(img.id)} className="p-1 bg-black/60 rounded text-white hover:bg-red-500 transition-colors"><Icon name="Trash2" size={12} /></button>
            </div>
            <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">{idx + 1}</span>
          </div>
        ))}

        {/* Add Button */}
        <label className="aspect-square border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800/50 hover:border-lime-500/50 text-neutral-500 hover:text-lime-400 transition-colors">
          <Icon name="Plus" size={24} className="mb-1" />
          <span className="text-xs font-bold">이미지 추가</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={addImage} />
        </label>
      </div>
    </div>
  );
}
