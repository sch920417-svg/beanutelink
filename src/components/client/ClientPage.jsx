import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from '../service/SplashScreen';
import VisitPurposeModal from '../service/VisitPurposeModal';
import { BuilderPreview } from '../builder/BuilderPreview';
import { trackEvent, EVENT_TYPES, initLocationDetection, getVisitPurpose } from '../../utils/analytics';
import { subscribeSettings, subscribePageConfigs, subscribeBlogs } from '../../services/firestore';
import { initialPageConfigs } from '../../data/pageConfigData';
import { initialBlogs } from '../../data/data';

/**
 * 고객용 페이지 — BuilderPreview(mode="client")를 직접 사용
 * Firestore 실시간 리스너로 최신 데이터 표시, localStorage 폴백
 */
export default function ClientPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showPurposeModal, setShowPurposeModal] = useState(() => !getVisitPurpose());

  // localStorage에서 초기값 읽기 (즉시 표시), 이후 Firestore 리스너가 덮어씀
  const [pageConfigs, setPageConfigs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sl_page_configs') || '{}'); } catch { return {}; }
  });
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sl_settings') || '{}'); } catch { return {}; }
  });
  const [blogs, setBlogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sl_blogs') || '{}'); } catch { return {}; }
  });

  // Firestore 실시간 리스너 + 폴백 타이머
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    let gotData = false;
    const unsubs = [
      subscribePageConfigs((data) => {
        if (data && Object.keys(data).length > 0) {
          gotData = true;
          setPageConfigs(data);
          setDataReady(true);
          try { localStorage.setItem('sl_page_configs', JSON.stringify(data)); } catch {}
        }
      }),
      subscribeSettings((data) => {
        if (data) {
          setSettings(data);
          try { localStorage.setItem('sl_settings', JSON.stringify(data)); } catch {}
        }
      }),
      subscribeBlogs((data) => {
        if (data) {
          setBlogs(data);
          try { localStorage.setItem('sl_blogs', JSON.stringify(data)); } catch {}
        }
      }),
    ];

    // 3초 후에도 Firestore 데이터가 없으면 초기 데이터로 폴백
    const fallbackTimer = setTimeout(() => {
      if (!gotData) {
        console.log('Firestore 데이터 없음 — 초기 데이터로 폴백');
        setPageConfigs(initialPageConfigs);
        setBlogs(initialBlogs);
        setDataReady(true);
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      unsubs.forEach(u => u());
    };
  }, []);

  // pageConfigs에서 탭 정보 파생
  const productTabs = useMemo(() =>
    Object.entries(pageConfigs)
      .map(([id, cfg]) => ({
        id,
        label: cfg?.header?.tabLabel || cfg?.meta?.label || id,
        order: cfg?.meta?.order ?? 0,
      }))
      .sort((a, b) => a.order - b.order),
    [pageConfigs]
  );

  const firstTabId = productTabs[0]?.id || '';
  const effectiveTab = activeTab === 'home' ? firstTabId : activeTab;
  const config = pageConfigs[effectiveTab];

  // 스플래시 타이머
  useEffect(() => {
    const splashConfig = pageConfigs[firstTabId]?.splash;
    const duration = (splashConfig?.duration || 1.8) * 1000;
    const timer = setTimeout(() => setShowSplash(false), duration);
    return () => clearTimeout(timer);
  }, [pageConfigs, firstTabId]);

  // 서비스 페이지 방문 추적 (스플래시 종료 후)
  useEffect(() => {
    if (!showSplash && activeTab) {
      initLocationDetection().then(() => {
        trackEvent(EVENT_TYPES.SERVICE_PAGE, { tab: activeTab });
      });
    }
  }, [showSplash]);

  // config가 없으면 (데이터 미로드) 로딩 표시
  if (!config) {
    return (
      <div className="min-h-screen bg-neutral-100 flex justify-center">
        <div className="w-full max-w-[430px] bg-white min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const splashLogoText = pageConfigs[firstTabId]?.splash?.logoText || settings?.brandName || 'BEANUTE';

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen relative overflow-hidden">
        {/* 스플래시 */}
        <AnimatePresence>
          {showSplash && (
            <motion.div
              key="splash"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-[9999]"
            >
              <SplashScreen logoText={splashLogoText} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 방문 목적 팝업 (스플래시 종료 후 표시) */}
        {!showSplash && (
          <VisitPurposeModal
            isOpen={showPurposeModal}
            tabs={productTabs}
            onSelect={(tabId) => {
              setShowPurposeModal(false);
              setActiveTab(tabId);
            }}
          />
        )}

        {/* BuilderPreview를 client 모드로 렌더링 — 실시간 미리보기와 동일 */}
        <BuilderPreview
          mode="client"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          config={config}
          pageConfigs={pageConfigs}
          blogs={blogs}
          settings={settings}
        />
      </div>
    </div>
  );
}
