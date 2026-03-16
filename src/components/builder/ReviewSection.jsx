import React from 'react';
import { Icons } from '../../data/links';
import { compressImage } from '../../utils';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function ReviewSection({ config, updateConfig, showToast }) {
  const reviews = config.reviews;

  const update = (newReviews) => updateConfig('reviews', newReviews);

  const addReview = () => {
    const newItem = {
      id: `rev-${Date.now()}`,
      image: '',
    };
    update({ ...reviews, items: [...reviews.items, newItem] });
    showToast('리뷰 이미지가 추가되었습니다.');
  };

  const removeReview = (id) => {
    update({ ...reviews, items: reviews.items.filter(item => item.id !== id) });
    showToast('리뷰 이미지가 삭제되었습니다.');
  };

  const handleImageUpload = async (e, reviewId) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('이미지 업로드 중...');
    const compressed = await compressImage(file);
    update({ ...reviews, items: reviews.items.map(item => item.id === reviewId ? { ...item, image: compressed } : item) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">섹션 타이틀</label>
        <input
          value={reviews.title}
          onChange={(e) => update({ ...reviews, title: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="리뷰"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {reviews.items.map((review) => (
          <div key={review.id} className="aspect-[3/4] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden relative group">
            {review.image ? (
              <>
                <img src={review.image} className="w-full h-full object-cover" alt="리뷰" />
                <button
                  onClick={() => removeReview(review.id)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icon name="Trash2" size={12} />
                </button>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-neutral-500 hover:text-lime-400 transition-colors">
                <Icon name="ImagePlus" size={20} className="mb-1" />
                <span className="text-[10px] font-bold">이미지</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, review.id)} />
              </label>
            )}
          </div>
        ))}
      </div>

      <button onClick={addReview} className="w-full py-2.5 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex items-center justify-center gap-2">
        <Icon name="Plus" size={14} /> 리뷰 이미지 추가
      </button>
    </div>
  );
}
