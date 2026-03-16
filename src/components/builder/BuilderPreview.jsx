import { useState, useRef, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../../data/links';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX, Home, ShoppingBag, BookOpen, MessageCircle, Phone, Clock, Check } from 'lucide-react';
import ServiceHeader from '../service/ServiceHeader';
import HeroSlider from '../service/HeroSlider';
import ShootingGuide from '../service/ShootingGuide';
import SegmentedControl from '../service/SegmentedControl';
import QuoteCalculator from '../service/QuoteCalculator';
import BlogList from '../service/BlogList';
import { SECTION_REGISTRY, SECTION_GROUPS } from '../../data/pageConfigData';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

// ─── 슬라이더 블록 (카드형 캐러셀 — 스와이프 + 버튼) ──────────
function SliderBlock({ block }) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const images = block.images || [];
  if (images.length === 0) return null;

  const goPrev = () => setSliderIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  const goNext = () => setSliderIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));

  const slidePercent = 85;
  const gapPx = 8;

  // 터치 스와이프 핸들러
  const onTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, swiping: false };
  };
  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    // 가로 이동이 세로보다 크면 스와이프로 판정 → 세로 스크롤 방지
    if (!touchRef.current.swiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      touchRef.current.swiping = true;
    }
    if (touchRef.current.swiping) {
      e.preventDefault();
    }
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // 마우스 드래그 핸들러
  const onMouseDown = (e) => {
    touchRef.current = { startX: e.clientX, startY: e.clientY, swiping: true };
  };
  const onMouseUp = (e) => {
    if (!touchRef.current.swiping) return;
    const dx = e.clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchRef.current.swiping = false;
  };

  return (
    <div className="relative w-full group">
      {/* 캐러셀 트랙 */}
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { touchRef.current.swiping = false; }}
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing select-none"
          style={{ gap: `${gapPx}px` }}
          animate={{ x: `calc(-${sliderIndex * slidePercent}% - ${sliderIndex * gapPx}px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {images.map((img, i) => (
            <div key={i} style={{ width: `${slidePercent}%`, flexShrink: 0 }} className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <img src={img} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} alt="" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* 좌/우 화살표 (hover 시 표시) */}
      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goNext} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === sliderIndex ? 'w-4 bg-neutral-800' : 'w-1.5 bg-neutral-300'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Before/After 비교 뷰어 (드래그 슬라이더) ─────────────────
function BeforeAfterBlock({ block }) {
  const [pos, setPos] = useState(50);
  if (!block.before || !block.after) return null;

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl shadow-sm select-none group touch-none bg-neutral-100">
      <img src={block.after} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="After" />
      <img src={block.before} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} alt="Before" />

      {/* 슬라이더 라인 */}
      <div className="absolute top-0 bottom-0 w-[3px] bg-white flex items-center justify-center pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10" style={{ left: `calc(${pos}% - 1.5px)` }}>
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-neutral-200 text-neutral-500">
          <ChevronLeft className="w-4 h-4 -mr-0.5" /><ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* 투명 Range Input */}
      <input
        type="range" min="0" max="100" value={pos}
        onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize m-0 p-0 z-20 touch-pan-x"
      />

      <div className="absolute top-3 left-3 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm pointer-events-none z-10">Before</div>
      <div className="absolute top-3 right-3 bg-blue-600/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm pointer-events-none z-10">After</div>
    </div>
  );
}

// ─── 블로그 상세 뷰어 (미리보기 내부) ──────────────────────────
function BlogDetailView({ post, onBack }) {
  if (!post) return null;

  const renderBlock = (block, idx) => {
    switch (block.type) {
      case 'h1':
        return <h1 key={idx} className={`text-xl font-bold text-black mt-4 text-${block.align || 'left'}`}>{block.content}</h1>;
      case 'h2':
        return <h2 key={idx} className={`text-lg font-bold text-black mt-3 text-${block.align || 'left'}`}>{block.content}</h2>;
      case 'text':
        return <p key={idx} className={`text-[14px] text-neutral-700 leading-relaxed whitespace-pre-line text-${block.align || 'left'}`}>{block.content}</p>;
      case 'image':
        return block.url ? (
          <div key={idx} className="rounded-xl overflow-hidden">
            <img src={block.url} alt={block.caption || ''} className="w-full h-auto" />
            {block.caption && <p className="text-center text-[12px] text-neutral-400 mt-1.5">{block.caption}</p>}
          </div>
        ) : null;
      case 'quote':
        return (
          <div key={idx} className="border-l-4 border-black pl-4 py-2">
            <p className="text-[14px] font-bold text-neutral-800 italic">{block.content}</p>
            {block.author && <p className="text-[12px] text-neutral-400 mt-1">{block.author}</p>}
          </div>
        );
      case 'callout':
        return (
          <div key={idx} className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <span className="text-xl">💡</span>
            <p className="text-[14px] text-neutral-700 leading-relaxed">{block.content}</p>
          </div>
        );
      case 'ul':
        return (
          <ul key={idx} className="space-y-1.5 ml-1">
            {(block.content || '').split('\n').filter(Boolean).map((item, i) => (
              <li key={i} className="text-[14px] text-neutral-700 flex items-start gap-2">
                <span className="text-neutral-400 mt-1.5 text-[8px]">●</span>{item}
              </li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol key={idx} className="space-y-1.5 ml-1">
            {(block.content || '').split('\n').filter(Boolean).map((item, i) => (
              <li key={i} className="text-[14px] text-neutral-700 flex items-start gap-2">
                <span className="text-neutral-400 font-bold text-[13px] w-5 shrink-0">{i + 1}.</span>{item}
              </li>
            ))}
          </ol>
        );
      case 'slider':
        return <SliderBlock key={idx} block={block} />;
      case 'beforeAfter':
        return <BeforeAfterBlock key={idx} block={block} />;
      case 'link':
        return (
          <div key={idx} className={`text-${block.align || 'left'}`}>
            <a href={block.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-3 bg-white border border-neutral-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/50 rounded-2xl transition-all group text-left">
              {block.image && (
                <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-100">
                  <img src={block.image} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <span className="font-bold text-[14px] text-neutral-800 group-hover:text-blue-700 line-clamp-1">{block.title || block.url}</span>
                {block.desc && <span className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{block.desc}</span>}
                <span className="text-[10px] text-neutral-300 line-clamp-1 mt-0.5">{block.url}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 flex-shrink-0 mr-1" />
            </a>
          </div>
        );
      case 'video':
        if (block.videoObjectUrl) {
          return (
            <div key={idx} className="rounded-xl overflow-hidden">
              <VideoPreviewItem item={block} />
            </div>
          );
        } else if (block.url) {
          return (
            <div key={idx} className="aspect-video bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-400">
              <span className="text-sm">외부 영상: {block.url}</span>
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-30 bg-white flex flex-col"
    >
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-100 pt-12 px-4 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-800" />
        </button>
        <span className="text-[15px] font-bold text-black truncate flex-1">{post.title || '콘텐츠'}</span>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* 썸네일 */}
        {post.thumbnail && (
          <div className="w-full aspect-video overflow-hidden">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-5 py-5 space-y-4">
          {/* 태그 & 날짜 */}
          <div className="flex items-center gap-2 flex-wrap">
            {post.tag && (
              <span className="text-[11px] font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">{post.tag}</span>
            )}
            {post.date && (
              <span className="text-[11px] text-neutral-400">{post.date}</span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-[20px] font-bold text-black leading-snug">{post.title}</h1>

          {/* 본문 블록 */}
          {(post.blocks || []).length > 0 ? (
            <div className="space-y-4">
              {post.blocks.map((block, idx) => renderBlock(block, idx))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-400 text-[13px]">아직 본문 내용이 없습니다.</p>
              <p className="text-neutral-300 text-[11px] mt-1">관리자 패널에서 콘텐츠를 작성해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── 간단한 미리보기 컴포넌트 (video, gallery, review, faq, priceTable) ──
function VideoPreviewItem({ item }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  if (item.videoObjectUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          src={item.videoObjectUrl}
          autoPlay
          muted={muted}
          loop
          playsInline
          className="w-full"
          preload="metadata"
        />
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    );
  }

  if (item.url) {
    return (
      <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 border border-neutral-200">
        <span className="text-sm">외부 영상: {item.url}</span>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 border border-neutral-200">
      <span className="text-2xl">🎬</span>
    </div>
  );
}

function VideoPreview({ config }) {
  const items = config.video?.items || [];
  if (items.length === 0) return null;
  return (
    <div className="px-5 py-4">
      <h3 className="text-[15px] font-bold text-black mb-3">{config.video?.title || '영상'}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <VideoPreviewItem key={item.id || i} item={item} />
        ))}
      </div>
    </div>
  );
}

function GalleryPreview({ config }) {
  const images = config.gallery?.images || [];
  if (images.length === 0) return null;
  return (
    <div className="px-5 py-4">
      <h3 className="text-[15px] font-bold text-black mb-3">{config.gallery?.title || '갤러리'}</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {images.slice(0, 6).map((img, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
            {img.url ? <img src={img.url} className="w-full h-full object-cover" alt="" /> : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300"><span className="text-xl">📷</span></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 슬라이드 리뷰형 미리보기 ─────────────────────────────────────
function SlideReviewPreview({ config }) {
  const data = config.slideReview;
  if (!data || (data.slides || []).length === 0) return null;

  const slides = data.slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchRef = useRef({ startX: 0, swiping: false });
  const autoRef = useRef(null);

  const goPrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : slides.length - 1));
  const goNext = () => setCurrentIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0));

  // 자동 슬라이드 (3.5초)
  useEffect(() => {
    if (slides.length <= 1) return;
    autoRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0));
    }, 3500);
    return () => clearInterval(autoRef.current);
  }, [slides.length]);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (slides.length > 1) {
      autoRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0));
      }, 3500);
    }
  };

  // 양옆 슬라이드 보이게: 좌우 패딩 + 슬라이드 폭
  const slideWidthPercent = 72;
  const gapPx = 10;
  const paddingPx = 20; // 좌우 패딩으로 양옆 슬라이드 노출

  const onTouchStart = (e) => { touchRef.current = { startX: e.touches[0].clientX, swiping: false }; };
  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 10) touchRef.current.swiping = true;
    if (touchRef.current.swiping) e.preventDefault();
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) { dx < 0 ? goNext() : goPrev(); resetAuto(); }
  };
  const onMouseDown = (e) => { touchRef.current = { startX: e.clientX, swiping: true }; };
  const onMouseUp = (e) => {
    if (!touchRef.current.swiping) return;
    const dx = e.clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) { dx < 0 ? goNext() : goPrev(); resetAuto(); }
    touchRef.current.swiping = false;
  };

  const bgColor = data.bgColor || '#000000';
  const textColor = data.textColor || '#ffffff';
  const subtitleColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const locationColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
  const venueColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';

  const handleSlideClick = (slide) => {
    if (slide.link) {
      window.open(slide.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ backgroundColor: bgColor }} className="py-8">
      {/* 타이틀 */}
      <div className="px-5">
        <h3 style={{ color: textColor }} className="text-[17px] font-extrabold leading-snug mb-1">
          {data.title}
        </h3>
        <p style={{ color: subtitleColor }} className="text-[12px] mb-5">
          {data.subtitle}
        </p>
      </div>

      {/* 캐러셀 — 양옆 슬라이드 노출 */}
      <div
        className="overflow-hidden"
        style={{ padding: `0 ${paddingPx}px` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { touchRef.current.swiping = false; }}
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing select-none"
          style={{ gap: `${gapPx}px` }}
          animate={{ x: `calc(-${currentIndex} * (${slideWidthPercent}% + ${gapPx}px))` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              style={{ width: `${slideWidthPercent}%`, flexShrink: 0 }}
              className={`transition-opacity duration-300 ${i === currentIndex ? 'opacity-100' : 'opacity-50'} ${slide.link ? 'cursor-pointer' : ''}`}
              onClick={() => handleSlideClick(slide)}
            >
              {/* 이미지 */}
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-800 mb-3">
                {slide.image ? (
                  <img src={slide.image} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <span className="text-2xl">📷</span>
                  </div>
                )}
              </div>
              {/* 텍스트 */}
              {slide.location && (
                <p style={{ color: locationColor }} className="text-[11px] text-center mb-1">{slide.location}</p>
              )}
              {slide.description && (
                <p style={{ color: textColor }} className="text-[13px] font-bold text-center leading-snug whitespace-pre-line">{slide.description}</p>
              )}
              {slide.venueName && (
                <p style={{ color: venueColor }} className="text-[11px] text-center mt-1.5">{slide.venueName}</p>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* 인디케이터 */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? '16px' : '6px',
                backgroundColor: i === currentIndex ? textColor : (textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 메인 빌더 프리뷰 ──────────────────────────────────────────
export function BuilderPreview({ activeTab, onTabChange, config, pageConfigs, blogs = {}, settings = {}, mode = 'preview' }) {
  const [activeSegment, setActiveSegment] = useState('quote');
  const [detailPost, setDetailPost] = useState(null);
  const [activeNav, setActiveNav] = useState('home');
  const [bottomSheet, setBottomSheet] = useState(null); // 'product' | 'blog' | 'chat' | 'phone' | null
  const scrollRef = useRef(null);

  // pageConfigs에서 탭 정보 동적 파생 (홈 탭을 맨 앞에 추가)
  const productTabs = Object.entries(pageConfigs || {})
    .map(([id, cfg]) => ({
      id,
      label: cfg?.header?.tabLabel || cfg?.meta?.label || id,
      icon: cfg?.meta?.icon || '📦',
      order: cfg?.meta?.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order);
  const tabs = [{ id: 'home', label: '홈', order: -1 }, ...productTabs];

  // 홈 탭일 때는 첫 번째 실제 상품 탭의 데이터를 보여줌
  const effectiveTab = activeTab === 'home' ? (productTabs[0]?.id || '') : activeTab;

  // 탭 변경 시 네비 상태 동기화
  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    setActiveSegment('quote');
    setActiveNav(tabId === 'home' ? 'home' : 'product');
  };

  // 하단 네비게이션 핸들러
  const handleNavChange = (navId) => {
    if (navId === 'home') {
      onTabChange('home');
      setActiveNav('home');
      setActiveSegment('quote');
      setBottomSheet(null);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // 상품, 블로그, 채팅, 전화 → 바텀시트 열기
    setBottomSheet(navId);
  };

  // 바텀시트에서 상품 선택 시
  const handleSheetProductSelect = (tabId) => {
    if (bottomSheet === 'product') {
      onTabChange(tabId);
      setActiveSegment('quote');
      setActiveNav('product');
      setBottomSheet(null);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (bottomSheet === 'blog') {
      onTabChange(tabId);
      setActiveSegment('blog');
      setActiveNav('blog');
      setBottomSheet(null);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } else if (bottomSheet === 'chat') {
      const kakaoUrl = settings.kakaoUrls?.[tabId] || settings.kakaoUrl || '';
      if (kakaoUrl) {
        window.open(kakaoUrl, '_blank');
      }
      setBottomSheet(null);
    }
  };

  // 블로그 게시물 변환 (BlogList 형태)
  const blogKey = effectiveTab;
  const currentBlogs = (blogs[blogKey] || []).map(b => ({
    id: b.id,
    category: b.tag || config.header.tabLabel,
    title: b.title || '(제목 없음)',
    thumbnail: b.thumbnail || '',
    _raw: b,
  }));

  // 가이드 카드 블로그 조회
  const guideBlogKey = `guide-${effectiveTab}`;
  const guideBlogs = blogs[guideBlogKey] || [];

  const handleGuideCardClick = (card) => {
    if (card.blogId) {
      const blog = guideBlogs.find(b => b.id === card.blogId);
      if (blog) {
        setDetailPost(blog);
        return;
      }
    }
  };

  const handleBlogClick = (post) => {
    if (post._raw) {
      setDetailPost(post._raw);
    }
  };

  // ─── 그룹 순서 기반 섹션 렌더링 ──────────────────────────
  const groupOrder = config.sectionGroupOrder || SECTION_GROUPS.map(g => g.id);

  // 그룹별 활성 섹션 (sections 배열 순서 유지)
  const groupedEnabled = useMemo(() => {
    const groups = {};
    SECTION_GROUPS.forEach(g => { groups[g.id] = []; });
    (config.sections || []).forEach(s => {
      const meta = SECTION_REGISTRY[s.type];
      if (meta && s.enabled) {
        if (!groups[meta.group]) groups[meta.group] = [];
        groups[meta.group].push(s);
      }
    });
    return groups;
  }, [config.sections]);

  // 섹션 타입 → 미리보기 컴포넌트 매핑
  // NOTE: priceTable, review, faq는 QuoteCalculator 내부에서 이미 렌더링하므로 스킵
  const renderSection = (section) => {
    switch (section.type) {
      case 'splash':
        return <ServiceHeader key={section.id} tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />;
      case 'hero':
        return <HeroSlider key={section.id} images={config.heroImages || []} />;
      case 'video':
        return <VideoPreview key={section.id} config={config} />;
      case 'gallery':
        return <GalleryPreview key={section.id} config={config} />;
      case 'slideReview':
        return <SlideReviewPreview key={section.id} config={config} />;
      case 'guide':
        return <ShootingGuide key={section.id} guide={config.guide} onCardClick={handleGuideCardClick} />;
      case 'quote':
        return <QuoteCalculator key={section.id} config={config} />;
      case 'blog':
        return <BlogList key={section.id} posts={currentBlogs} onPostClick={handleBlogClick} />;
      default:
        return null;
    }
  };

  // 각 그룹의 미리보기 렌더링
  const renderGroup = (groupId) => {
    const groupSections = groupedEnabled[groupId] || [];
    if (groupSections.length === 0) return null;

    // segment-quote + segment-blog → SegmentedControl로 합산
    if (groupId === 'segment-quote' || groupId === 'segment-blog') {
      const quoteGroupSections = groupedEnabled['segment-quote'] || [];
      const blogGroupSections = groupedEnabled['segment-blog'] || [];
      const bothExist = quoteGroupSections.length > 0 && blogGroupSections.length > 0;

      if (bothExist) {
        // 두 그룹 모두 존재 → 먼저 나오는 그룹에서 합산 렌더링, 나중 그룹은 스킵
        const quoteIdx = groupOrder.indexOf('segment-quote');
        const blogIdx = groupOrder.indexOf('segment-blog');
        const isFirst = (groupId === 'segment-quote' && quoteIdx < blogIdx) || (groupId === 'segment-blog' && blogIdx < quoteIdx);
        if (!isFirst) return null;

        return (
          <div key="segment-combined">
            <SegmentedControl activeSegment={activeSegment} onSegmentChange={setActiveSegment} />
            {activeSegment === 'quote' && quoteGroupSections.map(s => renderSection(s))}
            {activeSegment === 'blog' && blogGroupSections.map(s => renderSection(s))}
          </div>
        );
      }

      // 한쪽만 존재 → 단독 렌더링 (SegmentedControl 없이)
      return groupSections.map(s => renderSection(s));
    }

    // 일반 그룹: sections 배열 순서대로 렌더링
    return groupSections.map(s => renderSection(s));
  };

  // ─── Client 모드: iPhone 프레임 없이 전체 화면 렌더링 ───
  if (mode === 'client') {
    return (
      <div className="w-full h-full bg-white flex flex-col relative font-sans text-neutral-900">
        {/* LIVE CONTENT */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-white scrollbar-hide [&>*+*]:mt-2 pb-[72px]">
          {groupOrder.map(groupId => {
            const content = renderGroup(groupId);
            if (!content) return null;
            return <div key={groupId}>{content}</div>;
          })}
        </div>

        {/* 블로그 상세 뷰 오버레이 */}
        <AnimatePresence>
          {detailPost && (
            <BlogDetailView
              post={detailPost}
              onBack={() => setDetailPost(null)}
            />
          )}
        </AnimatePresence>

        {/* 바텀시트 모달 (상품 / 블로그 / 채팅) */}
        <AnimatePresence>
          {(bottomSheet === 'product' || bottomSheet === 'blog' || bottomSheet === 'chat') && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-neutral-300" />
                </div>
                <div className="px-5 pt-2 pb-3">
                  <h3 className="font-bold text-[16px] text-neutral-900">
                    {bottomSheet === 'product' && '상품 선택'}
                    {bottomSheet === 'blog' && '블로그 선택'}
                    {bottomSheet === 'chat' && '카카오톡 채팅 상담'}
                  </h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">
                    {bottomSheet === 'product' && '상품별 페이지로 이동'}
                    {bottomSheet === 'blog' && '상품별 블로그로 이동'}
                    {bottomSheet === 'chat' && (settings.chatGreeting || '상품별 카카오톡 채널로 이동')}
                  </p>
                </div>
                <div className="px-5 pb-5 space-y-1 pb-[env(safe-area-inset-bottom,16px)]">
                  {productTabs.map((tab) => {
                    const isSelected = effectiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSheetProductSelect(tab.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                      >
                        <p className="font-bold text-[14px] text-neutral-900 text-left">{tab.label}</p>
                        {bottomSheet === 'chat' ? (
                          <ChevronRight size={18} className="text-neutral-400" />
                        ) : isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check size={14} strokeWidth={3} className="text-white" />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 전화문의 팝업 */}
        <AnimatePresence>
          {bottomSheet === 'phone' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-neutral-300" />
                </div>
                <div className="px-5 pt-2 pb-3">
                  <h3 className="font-bold text-[16px] text-neutral-900">전화 문의</h3>
                  <p className="text-[12px] text-neutral-500 mt-0.5">{settings.brandName || '스튜디오'} 대표번호</p>
                </div>
                <div className="px-5 pb-5 space-y-3 pb-[env(safe-area-inset-bottom,16px)]">
                  {settings.phoneGuideMessage && (
                    <div className="bg-neutral-50 rounded-xl p-3 text-center">
                      <p className="text-[12px] text-neutral-600 leading-relaxed">{settings.phoneGuideMessage}</p>
                    </div>
                  )}
                  <div className="bg-neutral-50 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">대표 상담 전화번호</p>
                    <p className="text-[20px] font-bold text-neutral-900 tracking-wide">
                      {settings.phone || '전화번호 미등록'}
                    </p>
                  </div>
                  {settings.businessHours && (
                    <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                      <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-blue-900 mb-0.5">운영시간 안내</p>
                        <p className="text-[11px] text-blue-700 whitespace-pre-line leading-relaxed">{settings.businessHours}</p>
                      </div>
                    </div>
                  )}
                  {settings.phone ? (
                    <a
                      href={`tel:${(settings.phone || '').replace(/-/g, '')}`}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={16} />
                      <span>전화 연결하기</span>
                    </a>
                  ) : (
                    <div className="text-center py-2 text-neutral-400 text-[11px]">
                      환경설정에서 전화번호를 등록해주세요.
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 하단 네비게이션 바 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-neutral-200 z-40">
          <div className="flex items-center justify-around py-2 pb-3">
            {[
              { id: 'home', label: '홈', icon: Home },
              { id: 'product', label: '상품', icon: ShoppingBag },
              { id: 'blog', label: '블로그', icon: BookOpen },
              { id: 'chat', label: '채팅상담', icon: MessageCircle },
              { id: 'phone', label: '전화문의', icon: Phone },
            ].map((item) => {
              const isActive = activeNav === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavChange(item.id)}
                  className="flex flex-col items-center gap-1 min-w-[48px] py-1 transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-neutral-900' : ''}`}>
                    <IconComp
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      fill={isActive ? 'white' : 'none'}
                      className={isActive ? 'text-white' : 'text-neutral-400'}
                    />
                  </div>
                  <span className={`text-[10px] transition-all duration-200 ${isActive ? 'text-neutral-900 font-bold' : 'text-neutral-400 font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mx-auto w-1/3 h-[4px] bg-neutral-900/40 rounded-full mb-1"></div>
        </div>
      </div>
    );
  }

  // ─── Preview 모드: iPhone 프레임 포함 ───
  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex items-center gap-2 mb-3 self-start">
        <Icon name="Smartphone" size={16} className="text-lime-400" />
        <span className="text-sm font-bold text-white">실시간 미리보기</span>
        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">{config.header.tabLabel}</span>
        <span className="text-[9px] bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded-full font-bold ml-1">LIVE</span>
      </div>

      {/* iPhone 15 Pro Max Frame — 430:932 (19.5:9) */}
      <div
        className="w-full bg-white rounded-[2.5rem] border-[12px] border-neutral-800 shadow-2xl overflow-hidden relative font-sans text-neutral-900 flex flex-col ring-1 ring-neutral-700 shrink-0"
        style={{ aspectRatio: '430 / 932' }}
      >
        {/* Dynamic Island */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[28%] h-[3.2%] bg-black rounded-full z-50 pointer-events-none"></div>

        {/* Status Bar */}
        <div className="absolute top-0 inset-x-0 h-[5%] w-full flex justify-between items-end px-[7%] pb-[0.4%] text-[10px] font-bold text-neutral-900 z-40 pointer-events-none">
          <span>12:00</span>
          <div className="flex gap-1 items-center mb-0.5">
            <div className="w-3 h-2.5 rounded-full bg-neutral-300"></div>
            <div className="w-4 h-2 bg-neutral-800 rounded-sm"></div>
          </div>
        </div>

        {/* LIVE CONTENT — 그룹 순서 기반 동적 렌더링 */}
        <div ref={scrollRef} className="w-full flex-1 overflow-y-auto overflow-x-hidden bg-white relative z-10 scrollbar-hide [&>*+*]:mt-2">
          {groupOrder.map(groupId => {
            const content = renderGroup(groupId);
            if (!content) return null;
            return <div key={groupId}>{content}</div>;
          })}
        </div>

        {/* 블로그 상세 뷰 오버레이 */}
        <AnimatePresence>
          {detailPost && (
            <BlogDetailView
              post={detailPost}
              onBack={() => setDetailPost(null)}
            />
          )}
        </AnimatePresence>

        {/* 바텀시트 모달 (상품 / 블로그 / 채팅) */}
        <AnimatePresence>
          {(bottomSheet === 'product' || bottomSheet === 'blog' || bottomSheet === 'chat') && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
              >
                {/* 핸들 바 */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-8 h-1 rounded-full bg-neutral-300" />
                </div>

                {/* 타이틀 */}
                <div className="px-5 pt-2 pb-3">
                  <h3 className="font-bold text-[16px] text-neutral-900">
                    {bottomSheet === 'product' && '상품 선택'}
                    {bottomSheet === 'blog' && '블로그 선택'}
                    {bottomSheet === 'chat' && '카카오톡 채팅 상담'}
                  </h3>
                  <p className="text-[12px] text-neutral-400 mt-0.5">
                    {bottomSheet === 'product' && '상품별 페이지로 이동'}
                    {bottomSheet === 'blog' && '상품별 블로그로 이동'}
                    {bottomSheet === 'chat' && '상품별 카카오톡 채널로 이동'}
                  </p>
                </div>

                {/* 상품 목록 */}
                <div className="px-5 pb-5 space-y-1">
                  {productTabs.map((tab) => {
                    const isSelected = effectiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSheetProductSelect(tab.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                      >
                        <p className="font-bold text-[14px] text-neutral-900 text-left">{tab.label}</p>
                        {bottomSheet === 'chat' ? (
                          <ChevronRight size={18} className="text-neutral-400" />
                        ) : isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check size={14} strokeWidth={3} className="text-white" />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 전화문의 팝업 */}
        <AnimatePresence>
          {bottomSheet === 'phone' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
              >
                {/* 핸들 바 */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-8 h-1 rounded-full bg-neutral-300" />
                </div>

                {/* 타이틀 */}
                <div className="px-5 pt-2 pb-3">
                  <h3 className="font-bold text-[16px] text-neutral-900">전화 문의</h3>
                  <p className="text-[12px] text-neutral-500 mt-0.5">{settings.brandName || '스튜디오'} 대표번호</p>
                </div>

                {/* 내용 */}
                <div className="px-5 pb-5 space-y-3">
                  {/* 안내 메시지 */}
                  {settings.phoneGuideMessage && (
                    <div className="bg-neutral-50 rounded-xl p-3 text-center">
                      <p className="text-[12px] text-neutral-600 leading-relaxed">{settings.phoneGuideMessage}</p>
                    </div>
                  )}

                  {/* 전화번호 */}
                  <div className="bg-neutral-50 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">대표 상담 전화번호</p>
                    <p className="text-[20px] font-bold text-neutral-900 tracking-wide">
                      {settings.phone || '전화번호 미등록'}
                    </p>
                  </div>

                  {/* 운영시간 */}
                  {settings.businessHours && (
                    <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                      <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-blue-900 mb-0.5">운영시간 안내</p>
                        <p className="text-[11px] text-blue-700 whitespace-pre-line leading-relaxed">{settings.businessHours}</p>
                      </div>
                    </div>
                  )}

                  {/* 연결 버튼 */}
                  {settings.phone ? (
                    <a
                      href={`tel:${(settings.phone || '').replace(/-/g, '')}`}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={16} />
                      <span>전화 연결하기</span>
                    </a>
                  ) : (
                    <div className="text-center py-2 text-neutral-400 text-[11px]">
                      환경설정에서 전화번호를 등록해주세요.
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 하단 네비게이션 바 */}
        <div className="shrink-0 bg-white border-t border-neutral-200 z-40 relative">
          <div className="flex items-center justify-around py-2 pb-3">
            {[
              { id: 'home', label: '홈', icon: Home },
              { id: 'product', label: '상품', icon: ShoppingBag },
              { id: 'blog', label: '블로그', icon: BookOpen },
              { id: 'chat', label: '채팅상담', icon: MessageCircle },
              { id: 'phone', label: '전화문의', icon: Phone },
            ].map((item) => {
              const isActive = activeNav === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavChange(item.id)}
                  className="flex flex-col items-center gap-1 min-w-[48px] py-1 transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-neutral-900' : ''}`}>
                    <IconComp
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      fill={isActive ? 'white' : 'none'}
                      className={isActive ? 'text-white' : 'text-neutral-400'}
                    />
                  </div>
                  <span className={`text-[10px] transition-all duration-200 ${isActive ? 'text-neutral-900 font-bold' : 'text-neutral-400 font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Home Indicator */}
          <div className="mx-auto w-1/3 h-[4px] bg-neutral-900/40 rounded-full mb-1"></div>
        </div>
      </div>
    </div>
  );
}
