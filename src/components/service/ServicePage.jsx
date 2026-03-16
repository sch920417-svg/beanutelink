import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './SplashScreen';
import ServiceHeader from './ServiceHeader';
import HeroSlider from './HeroSlider';
import ShootingGuide from './ShootingGuide';
import SegmentedControl from './SegmentedControl';
import QuoteCalculator from './QuoteCalculator';
import BlogList from './BlogList';
import ServiceBottomNav from './ServiceBottomNav';
import KakaoChannelModal from '../public/KakaoChannelModal';
import PhoneCallModal from './PhoneCallModal';
import VisitPurposeModal from './VisitPurposeModal';
import {
  HeaderSkeleton,
  HeroSkeleton,
  GuideSkeleton,
  SegmentSkeleton,
  ProductSkeleton,
  BlogListSkeleton,
} from './SkeletonUI';
import { useServiceConfig, useServiceProducts, useServicePosts } from '../../hooks/useFirestoreConfig';
import { trackEvent, EVENT_TYPES, initLocationDetection, getVisitPurpose } from '../../utils/analytics';

/**
 * 서비스 페이지 — 전체 조립
 * 스플래시 → 메인 전환
 * 탭별 콘텐츠 • 세그먼트 전환
 * 하단 네비게이션: 홈 / 상품 / 블로그 / 채팅상담 / 전화문의
 */
export default function ServicePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [activeSegment, setActiveSegment] = useState('quote');
  const [activeNav, setActiveNav] = useState('home');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(() => !getVisitPurpose());
  const scrollRef = useRef(null);

  // Firestore hooks (현재는 폴백 데이터)
  const { config, loading: configLoading } = useServiceConfig();
  const { products, loading: productsLoading } = useServiceProducts();
  const { posts, loading: postsLoading } = useServicePosts();

  // settings를 URL params 또는 window message로 받을 수 있도록 (미리보기용)
  // 현재는 기본값 사용, 나중에 App에서 전달 가능
  const [settings] = useState(() => {
    try {
      const stored = localStorage.getItem('sl_settings');
      return stored ? JSON.parse(stored) : { kakaoUrl: '', phone: '', businessHours: '', brandName: 'BEANUTE' };
    } catch {
      return { kakaoUrl: '', phone: '', businessHours: '', brandName: 'BEANUTE' };
    }
  });

  // "홈" 탭을 맨 앞에 추가한 탭 목록
  const allTabs = useMemo(() => {
    if (!config?.tabs) return [];
    return [{ id: 'home', label: '홈' }, ...config.tabs];
  }, [config]);

  // 설정 로드 후 홈 탭 활성화
  useEffect(() => {
    if (allTabs.length > 0 && !activeTab) {
      setActiveTab('home');
    }
  }, [allTabs]);

  // 스플래시 타이머
  useEffect(() => {
    const duration = (config?.splash?.duration || 1.8) * 1000;
    const timer = setTimeout(() => setShowSplash(false), duration);
    return () => clearTimeout(timer);
  }, [config]);

  // 서비스 페이지 방문 추적 (스플래시 종료 후)
  useEffect(() => {
    if (!showSplash && activeTab) {
      initLocationDetection().then(() => {
        trackEvent(EVENT_TYPES.SERVICE_PAGE, { tab: activeTab });
      });
    }
  }, [showSplash]);

  const effectiveTab = activeTab;

  // 현재 탭에 맞는 데이터 필터링
  const currentHeroImages = useMemo(
    () => config?.heroImages?.[effectiveTab] || [],
    [config, effectiveTab]
  );

  const currentGuide = useMemo(
    () => config?.guides?.[effectiveTab] || null,
    [config, effectiveTab]
  );

  const currentProducts = useMemo(
    () => products.filter((p) => p.tabId === effectiveTab),
    [products, effectiveTab]
  );

  const currentPosts = useMemo(
    () => posts.filter((p) => p.tabId === effectiveTab),
    [posts, effectiveTab]
  );

  // 현재 탭의 페이지 설정 (견적 계산기 config 전달용) — localStorage에서 읽기
  const currentPageConfig = useMemo(() => {
    try {
      const stored = localStorage.getItem('sl_page_configs');
      if (stored) {
        const pageConfigs = JSON.parse(stored);
        return pageConfigs[effectiveTab] || null;
      }
    } catch {}
    return null;
  }, [effectiveTab]);

  // 채팅 모달용 상품 목록 (탭별 kakaoUrl 매핑)
  const chatProducts = useMemo(() => {
    if (!config?.tabs) return [];
    return config.tabs.map((tab) => ({
      id: tab.id,
      title: tab.label,
      kakaoUrl: settings.kakaoUrls?.[tab.id] || settings.kakaoUrl || '',
    }));
  }, [config, settings]);

  const isLoading = configLoading || productsLoading || postsLoading;

  // 하단 네비게이션 핸들러
  const handleNavChange = (navId) => {
    if (navId === 'chat') {
      setShowChatModal(true);
      return;
    }
    if (navId === 'phone') {
      setShowPhoneModal(true);
      return;
    }
    if (navId === 'blog') {
      // 블로그 세그먼트로 전환
      setActiveSegment('blog');
      setActiveNav('blog');
      // 스크롤 하단으로
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
      return;
    }
    if (navId === 'product') {
      // 상품 (견적 계산기) 세그먼트로 전환
      setActiveSegment('quote');
      setActiveNav('product');
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
      return;
    }
    // home
    setActiveTab('home');
    setActiveNav('home');
    setActiveSegment('quote');
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 탭 변경 시 네비 상태 동기화
  const handleTabChange = (tabId) => {
    trackEvent(EVENT_TYPES.TAB_CHANGE, { fromTab: activeTab, toTab: tabId });
    setActiveTab(tabId);
    setActiveSegment('quote');
    setActiveNav(tabId === 'home' ? 'home' : 'product');
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative overflow-hidden flex flex-col">
        {/* 스플래시 */}
        <AnimatePresence>
          {showSplash && (
            <motion.div
              key="splash"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-[9999]"
            >
              <SplashScreen logoText={config?.splash?.logoText || 'BEANUTE'} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 방문 목적 팝업 (스플래시 종료 후 표시) */}
        {!showSplash && (
          <VisitPurposeModal
            isOpen={showPurposeModal}
            tabs={config?.tabs || []}
            onSelect={(tabId) => {
              setShowPurposeModal(false);
              setActiveTab(tabId);
              setActiveNav('product');
            }}
          />
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col pb-[72px]">
          {/* 헤더 */}
          {isLoading ? (
            <HeaderSkeleton />
          ) : (
            <ServiceHeader
              tabs={allTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {/* 스크롤 가능 영역 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                key={effectiveTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* 히어로 슬라이더 */}
                {isLoading ? (
                  <HeroSkeleton />
                ) : (
                  <HeroSlider images={currentHeroImages} />
                )}

                {/* 촬영 가이드 */}
                {isLoading ? (
                  <GuideSkeleton />
                ) : (
                  <ShootingGuide guide={currentGuide} />
                )}

                {/* 세그먼트 컨트롤러 */}
                {isLoading ? (
                  <SegmentSkeleton />
                ) : (
                  <SegmentedControl
                    activeSegment={activeSegment}
                    onSegmentChange={(segment) => {
                      trackEvent(EVENT_TYPES.SEGMENT_CHANGE, { segment });
                      setActiveSegment(segment);
                      setActiveNav(segment === 'blog' ? 'blog' : 'product');
                    }}
                  />
                )}

                {/* 세그먼트별 콘텐츠 */}
                <AnimatePresence mode="wait">
                  {activeSegment === 'quote' ? (
                    isLoading ? (
                      <ProductSkeleton key="product-skeleton" />
                    ) : (
                      <QuoteCalculator
                        key="quote"
                        products={currentProducts}
                        config={currentPageConfig}
                        activeTab={effectiveTab}
                      />
                    )
                  ) : isLoading ? (
                    <BlogListSkeleton key="blog-skeleton" />
                  ) : (
                    <BlogList key="blog" posts={currentPosts} />
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <ServiceBottomNav activeNav={activeNav} onNavChange={handleNavChange} />

        {/* 채팅 상담 모달 */}
        <KakaoChannelModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          products={chatProducts}
          greeting={settings.chatGreeting}
        />

        {/* 전화 문의 팝업 */}
        <PhoneCallModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          phone={settings.phone}
          businessHours={settings.businessHours}
          studioName={settings.brandName}
        />
      </div>
    </div>
  );
}
