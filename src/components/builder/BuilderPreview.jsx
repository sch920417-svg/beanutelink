import { useState, useRef, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../../data/links';
import { ArrowLeft, ChevronRight, Home, ShoppingBag, BookOpen, MessageCircle, Phone, Clock, Check, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import ServiceHeader from '../service/ServiceHeader';
import HeroSlider from '../service/HeroSlider';
import ShootingGuide from '../service/ShootingGuide';
import SegmentedControl from '../service/SegmentedControl';
import QuoteCalculator from '../service/QuoteCalculator';
import BlogList from '../service/BlogList';
import { SECTION_REGISTRY, SECTION_GROUPS } from '../../data/pageConfigData';
import { getYouTubeEmbedUrl, renderBlock } from './blogBlockRenderer';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};



// ─── 리치텍스트 미리보기 ──────────────────────────────────────
function RichTextPreview({ config, sectionId }) {
  const data = config.richTextData?.[sectionId];
  const blocks = data?.blocks || [];
  if (blocks.length === 0) return null;

  return (
    <div className="px-5 py-4">
      <div className="space-y-4">
        {blocks.map((block, idx) => renderBlock(block, idx))}
      </div>
    </div>
  );
}

// ─── 블로그 상세 뷰어 (미리보기 내부) ──────────────────────────
function BlogDetailView({ post, onBack }) {
  if (!post) return null;

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
        {/* 헤더 이미지 (원본 비율) */}
        {(post.headerImage || post.thumbnail) && (
          <div className="w-full overflow-hidden">
            <img src={post.headerImage || post.thumbnail} alt={post.title} className="w-full h-auto" />
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
function UploadedVideoPlayer({ url }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <div className="relative rounded-xl overflow-hidden group aspect-video bg-neutral-100">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* 컨트롤 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex justify-between items-center">
        <button onClick={togglePlay} className="p-1.5 rounded-full bg-black/40 text-white active:bg-black/70 transition-colors">
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={toggleMute} className="p-1.5 rounded-full bg-black/40 text-white active:bg-black/70 transition-colors">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}

function VideoPreviewItem({ item }) {
  if (item.url) {
    // 업로드된 영상 (R2)
    if (item.type === 'upload') {
      return <UploadedVideoPlayer url={item.url} />;
    }
    // YouTube
    const embedUrl = getYouTubeEmbedUrl(item.url);
    if (embedUrl) {
      return (
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />
        </div>
      );
    }
    return (
      <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 border border-neutral-200">
        <span className="text-sm">영상: {item.url}</span>
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

  const autoPlayEnabled = data.autoPlay !== false;
  const autoPlayMs = ((data.autoPlayInterval ?? 3.5) * 1000);

  // 자동 슬라이드
  useEffect(() => {
    if (slides.length <= 1 || !autoPlayEnabled) return;
    autoRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0));
    }, autoPlayMs);
    return () => clearInterval(autoRef.current);
  }, [slides.length, autoPlayEnabled, autoPlayMs]);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (slides.length > 1 && autoPlayEnabled) {
      autoRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0));
      }, autoPlayMs);
    }
  };

  // 양옆 슬라이드 보이게: 좌우 패딩 + 슬라이드 폭
  const slideWidthPercent = 75;
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
        style={{ padding: `0 ${paddingPx}px`, touchAction: data.lockScroll ? 'none' : 'pan-y' }}
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
          animate={{ x: `calc(${(100 - slideWidthPercent) / 2}% - ${currentIndex} * (${slideWidthPercent}% + ${gapPx}px))` }}
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
              <div className="rounded-2xl overflow-hidden bg-neutral-800 mb-3">
                {slide.image ? (
                  <img src={slide.image} className="w-full h-auto select-none pointer-events-none" draggable={false} alt="" />
                ) : (
                  <div className="w-full aspect-[3/4] flex items-center justify-center text-neutral-600">
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
  const segmentRef = useRef(null);

  // pageConfigs에서 탭 정보 동적 파생
  const productTabs = Object.entries(pageConfigs || {})
    .filter(([id]) => id !== 'home')
    .map(([id, cfg]) => ({
      id,
      label: cfg?.header?.tabLabel || cfg?.meta?.label || id,
      icon: cfg?.meta?.icon || '📦',
      order: cfg?.meta?.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order);
  const tabs = [{ id: 'home', label: '홈', order: -1 }, ...productTabs];

  const effectiveTab = activeTab;

  // 탭 변경 시 네비 상태 동기화
  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    setActiveSegment('quote');
    setActiveNav(tabId === 'home' ? 'home' : 'product');
  };

  // 하단 네비게이션 핸들러
  const handleNavChange = (navId) => {
    if (navId === 'home') {
      setDetailPost(null); // 홈 이동 시에만 블로그 상세 닫기
      onTabChange('home');
      setActiveNav('home');
      setActiveSegment('quote');
      setBottomSheet(null);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // 상품, 블로그, 채팅, 전화 → 바텀시트 열기 (BlogDetailView 위에 표시됨)
    setBottomSheet(navId);
  };

  // 바텀시트에서 상품 선택 시
  const handleSheetProductSelect = (tabId) => {
    if (bottomSheet === 'product') {
      setDetailPost(null); // 블로그 상세에서 선택 시 닫기
      onTabChange(tabId);
      setActiveSegment('quote');
      setActiveNav('product');
      setBottomSheet(null);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (bottomSheet === 'blog') {
      setDetailPost(null); // 블로그 상세에서 선택 시 닫기
      onTabChange(tabId);
      setActiveSegment('blog');
      setActiveNav('blog');
      setBottomSheet(null);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
      setTimeout(() => {
        if (segmentRef.current) segmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (bottomSheet === 'chat') {
      const channel = (settings.chatChannels || []).find(ch => ch.id === tabId);
      const kakaoUrl = channel?.kakaoUrl || settings.kakaoUrl || '';
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
  const groupOrder = useMemo(() => {
    const order = config.sectionGroupOrder || SECTION_GROUPS.map(g => g.id);
    // 누락된 신규 그룹 자동 추가
    const missing = SECTION_GROUPS.filter(g => !order.includes(g.id)).map(g => g.id);
    return missing.length > 0 ? [...order, ...missing] : order;
  }, [config.sectionGroupOrder]);

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
        return <HeroSlider key={section.id} images={config.heroImages || []} lockScroll={config.heroScrollLock ?? false} />;
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
      case 'richText':
        return <RichTextPreview key={section.id} config={config} sectionId={section.id} />;
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
          <div key="segment-combined" ref={segmentRef}>
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-white relative z-10 scrollbar-hide [&>*+*]:mt-2 pb-[72px]">
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
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="fixed inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => { if (info.offset.y > 80 || info.velocity.y > 300) setBottomSheet(null); }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
                style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
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
                <div className="px-5 pb-8 space-y-1 pb-[max(2rem,env(safe-area-inset-bottom,2rem))]">
                  {bottomSheet === 'chat' ? (
                    (settings.chatChannels || []).length > 0 ? (settings.chatChannels || []).map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleSheetProductSelect(ch.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                      >
                        <p className="font-bold text-[14px] text-neutral-900 text-left">{ch.label}</p>
                        <ChevronRight size={18} className="text-neutral-400" />
                      </button>
                    )) : (
                      <div className="py-6 text-center text-sm text-neutral-400">등록된 채널이 없습니다.</div>
                    )
                  ) : (
                    productTabs.map((tab) => {
                      const isSelected = effectiveTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSheetProductSelect(tab.id)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                        >
                          <p className="font-bold text-[14px] text-neutral-900 text-left">{tab.label}</p>
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check size={14} strokeWidth={3} className="text-white" />
                            </div>
                          ) : null}
                        </button>
                      );
                    })
                  )}
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
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="fixed inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => { if (info.offset.y > 80 || info.velocity.y > 300) setBottomSheet(null); }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
                style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
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
                  {settings.phone && (
                    <a
                      href={`tel:${(settings.phone || '').replace(/-/g, '')}`}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={16} />
                      <span>전화 연결하기</span>
                    </a>
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
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="absolute inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
                style={{ backfaceVisibility: 'hidden' }}
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
                    {bottomSheet === 'chat' && (settings.chatGreeting || '상품별 카카오톡 채널로 이동')}
                  </p>
                </div>

                {/* 상품 목록 */}
                <div className="px-5 pb-8 space-y-1">
                  {bottomSheet === 'chat' ? (
                    (settings.chatChannels || []).length > 0 ? (settings.chatChannels || []).map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleSheetProductSelect(ch.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                      >
                        <p className="font-bold text-[14px] text-neutral-900 text-left">{ch.label}</p>
                        <ChevronRight size={18} className="text-neutral-400" />
                      </button>
                    )) : (
                      <div className="py-6 text-center text-sm text-neutral-400">등록된 채널이 없습니다.</div>
                    )
                  ) : (
                    productTabs.map((tab) => {
                      const isSelected = effectiveTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSheetProductSelect(tab.id)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                        >
                          <p className="font-bold text-[14px] text-neutral-900 text-left">{tab.label}</p>
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check size={14} strokeWidth={3} className="text-white" />
                            </div>
                          ) : null}
                        </button>
                      );
                    })
                  )}
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
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="absolute inset-0 bg-black/40 z-[55]"
                onClick={() => setBottomSheet(null)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.5rem] z-[56] shadow-2xl"
                style={{ backfaceVisibility: 'hidden' }}
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
                  {settings.phone && (
                    <a
                      href={`tel:${(settings.phone || '').replace(/-/g, '')}`}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={16} />
                      <span>전화 연결하기</span>
                    </a>
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
