import React, { useState } from 'react';
import { Icons } from '../../data/links';
import { compressImage } from '../../utils';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function SlideReviewSection({ config, updateConfig, showToast }) {
  const data = config.slideReview || { title: '', subtitle: '', bgColor: '#000000', textColor: '#ffffff', slides: [] };
  const slides = data.slides || [];
  const [expandedId, setExpandedId] = useState(null);

  const update = (newData) => updateConfig('slideReview', { ...data, ...newData });

  const addSlide = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    showToast('이미지 업로드 중...');
    const newSlides = [];
    for (const file of files) {
      const compressed = await compressImage(file);
      newSlides.push({
        id: `sr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        image: compressed,
        location: '',
        description: '',
        venueName: '',
        link: '',
      });
    }
    update({ slides: [...slides, ...newSlides] });
    showToast(`${newSlides.length}장 추가 완료`);
  };

  const updateSlide = (id, fields) => {
    update({ slides: slides.map(s => s.id === id ? { ...s, ...fields } : s) });
  };

  const removeSlide = (id) => {
    update({ slides: slides.filter(s => s.id !== id) });
    if (expandedId === id) setExpandedId(null);
    showToast('슬라이드가 삭제되었습니다.');
  };

  const handleImageChange = async (e, slideId) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('이미지 변경 중...');
    const compressed = await compressImage(file);
    updateSlide(slideId, { image: compressed });
  };

  const moveSlide = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    update({ slides: newSlides });
  };

  return (
    <div className="space-y-4">
      {/* 섹션 타이틀 */}
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">섹션 타이틀</label>
        <input
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="내가 이 웨딩홀을 예약한 이유"
        />
      </div>

      {/* 서브타이틀 */}
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">서브타이틀</label>
        <input
          value={data.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="실제 신랑신부의 생생한 리뷰"
        />
      </div>

      {/* 배경색 / 텍스트색 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-neutral-400 mb-1.5 block">배경 컬러</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.bgColor || '#000000'}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
            />
            <input
              value={data.bgColor || '#000000'}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-400 mb-1.5 block">텍스트 컬러</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.textColor || '#ffffff'}
              onChange={(e) => update({ textColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
            />
            <input
              value={data.textColor || '#ffffff'}
              onChange={(e) => update({ textColor: e.target.value })}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 슬라이드 그리드 (2열, 히어로 슬라이더 스타일) */}
      <div className="grid grid-cols-2 gap-3">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="relative group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {/* 이미지 썸네일 */}
            <div className="aspect-square flex items-center justify-center bg-neutral-800">
              {slide.image ? (
                <img src={slide.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <Icon name="Image" size={24} className="text-neutral-600" />
              )}
            </div>

            {/* 간략 정보 (링크 유무 표시) */}
            <div className="p-2 flex items-center justify-between gap-1">
              <span className="text-[11px] text-neutral-400 truncate flex-1">
                {slide.venueName || slide.location || `슬라이드 ${idx + 1}`}
              </span>
              {slide.link && <Icon name="Link" size={10} className="text-lime-400 flex-shrink-0" />}
            </div>

            {/* 호버 컨트롤 */}
            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {idx > 0 && (
                <button onClick={() => moveSlide(idx, 'up')} className="p-1 bg-black/60 rounded text-white hover:bg-lime-500 transition-colors">
                  <Icon name="ChevronUp" size={12} />
                </button>
              )}
              {idx < slides.length - 1 && (
                <button onClick={() => moveSlide(idx, 'down')} className="p-1 bg-black/60 rounded text-white hover:bg-lime-500 transition-colors">
                  <Icon name="ChevronDown" size={12} />
                </button>
              )}
              <button onClick={() => removeSlide(slide.id)} className="p-1 bg-black/60 rounded text-white hover:bg-red-500 transition-colors">
                <Icon name="Trash2" size={12} />
              </button>
            </div>
            <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">{idx + 1}</span>

            {/* 정보 편집 토글 버튼 */}
            <button
              onClick={() => setExpandedId(expandedId === slide.id ? null : slide.id)}
              className={`w-full py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border-t border-neutral-800 ${
                expandedId === slide.id ? 'bg-lime-400/10 text-lime-400' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon name={expandedId === slide.id ? 'ChevronUp' : 'ChevronDown'} size={10} />
              정보 편집
            </button>

            {/* 토글 상세 정보 */}
            {expandedId === slide.id && (
              <div className="p-3 space-y-2 border-t border-neutral-800 bg-neutral-950/50">
                {/* 이미지 변경 */}
                <label className="flex items-center gap-2 text-[11px] text-neutral-400 hover:text-lime-400 cursor-pointer transition-colors">
                  <Icon name="ImagePlus" size={12} />
                  <span className="font-bold">이미지 변경</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, slide.id)} />
                </label>

                <input
                  value={slide.location}
                  onChange={(e) => updateSlide(slide.id, { location: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-lime-500/50 transition-colors"
                  placeholder="위치 (예: 서울 강남구)"
                />
                <textarea
                  value={slide.description}
                  onChange={(e) => updateSlide(slide.id, { description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-lime-500/50 transition-colors resize-none"
                  rows={2}
                  placeholder="설명 텍스트"
                />
                <input
                  value={slide.venueName}
                  onChange={(e) => updateSlide(slide.id, { venueName: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-lime-500/50 transition-colors"
                  placeholder="장소명 / 작성자"
                />
                <div className="flex items-center gap-1.5">
                  <Icon name="Link" size={11} className="text-neutral-500 flex-shrink-0" />
                  <input
                    value={slide.link}
                    onChange={(e) => updateSlide(slide.id, { link: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-lime-500/50 transition-colors"
                    placeholder="클릭 시 이동할 링크"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 추가 버튼 */}
        <label className="aspect-square border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800/50 hover:border-lime-500/50 text-neutral-500 hover:text-lime-400 transition-colors">
          <Icon name="Plus" size={24} className="mb-1" />
          <span className="text-xs font-bold">슬라이드 추가</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={addSlide} />
        </label>
      </div>
    </div>
  );
}
