import React from 'react';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function GallerySection({ config, updateConfig, showToast }) {
  const galleryData = config.gallery || { title: '갤러리', images: [] };
  const images = galleryData.images || [];

  const updateGalleryData = (newData) => {
    updateConfig('gallery', { ...galleryData, ...newData });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    showToast('이미지 업로드 중...');
    const compressedPromises = files.map(f => uploadCompressed(f, 'gallery'));
    const compressedUrls = await Promise.all(compressedPromises);
    const newImages = compressedUrls.map((url, i) => ({
      id: `gallery-${Date.now()}-${i}`,
      url,
      alt: '',
      caption: '',
    }));
    updateGalleryData({ images: [...images, ...newImages] });
    showToast(`${files.length}장의 이미지가 추가되었습니다.`);
  };

  const updateImage = (id, fields) => {
    updateGalleryData({ images: images.map(img => img.id === id ? { ...img, ...fields } : img) });
  };

  const removeImage = (id) => {
    updateGalleryData({ images: images.filter(img => img.id !== id) });
    showToast('이미지가 삭제되었습니다.');
  };

  const moveImage = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    updateGalleryData({ images: newImages });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-2 block">섹션 제목</label>
        <input
          value={galleryData.title}
          onChange={e => updateGalleryData({ title: e.target.value })}
          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="갤러리"
        />
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
            {img.url ? (
              <img src={img.url} alt={img.alt} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-neutral-600">
                <Icon name="Image" size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {index > 0 && (
                <button onClick={() => moveImage(index, 'up')} className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                  <Icon name="ChevronLeft" size={14} />
                </button>
              )}
              <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors">
                <Icon name="Trash2" size={14} />
              </button>
              {index < images.length - 1 && (
                <button onClick={() => moveImage(index, 'down')} className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                  <Icon name="ChevronRight" size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 업로드 버튼 */}
        <label className="aspect-square border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800/50 hover:border-lime-500/50 text-neutral-500 hover:text-lime-400 transition-colors">
          <Icon name="Plus" size={24} className="mb-1" />
          <span className="text-xs font-bold">사진 추가</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        </label>
      </div>
    </div>
  );
}
