import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Icons, initialBlocks } from './data/links';
import { initialStats, initialProducts, initialBlogs } from './data/data';
import { initialPageConfigs } from './data/pageConfigData';
import { Toast } from './components/ui/Toast';
import { onAuthChange, logout } from './services/auth';
import {
  loadSettings, saveSettings, subscribeSettings,
  loadAllPageConfigs, saveAllPageConfigs, savePageConfig, subscribePageConfigs,
  loadAllBlogs, saveAllBlogs, saveBlogs, subscribeBlogs,
} from './services/firestore';
import './index.css';

// Lazy-loaded: 고객 페이지
const PublicProductView = lazy(() => import('./components/views/PublicViews').then(m => ({ default: m.PublicProductView })));
const PublicBlogListView = lazy(() => import('./components/views/PublicViews').then(m => ({ default: m.PublicBlogListView })));
const ClientPage = lazy(() => import('./components/client/ClientPage'));
const AllBlogsPage = lazy(() => import('./components/public/AllBlogsPage'));
const ContactPage = lazy(() => import('./components/public/ContactPage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));

// 공개 페이지 레이아웃
import PublicLayout from './components/public/PublicLayout';

// Lazy-loaded: 관리자 전용 컴포넌트
const DashboardView = lazy(() => import('./components/views/DashboardView').then(m => ({ default: m.DashboardView })));
const ProductsView = lazy(() => import('./components/views/ProductsView').then(m => ({ default: m.ProductsView })));
const EditorView = lazy(() => import('./components/views/EditorView').then(m => ({ default: m.EditorView })));
const BlogView = lazy(() => import('./components/views/BlogView').then(m => ({ default: m.BlogView })));
const AnalyticsView = lazy(() => import('./components/views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const SettingsView = lazy(() => import('./components/views/SettingsView').then(m => ({ default: m.SettingsView })));
const MainPreview = lazy(() => import('./components/views/MainPreview').then(m => ({ default: m.MainPreview })));
const MobilePreviewDrawer = lazy(() => import('./components/views/MobilePreviewDrawer').then(m => ({ default: m.MobilePreviewDrawer })));
const PageBuilderView = lazy(() => import('./components/builder/PageBuilderView').then(m => ({ default: m.PageBuilderView })));

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

// 전체 화면 로딩
const FullScreenLoading = () => (
  <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-neutral-500 text-sm">데이터를 불러오는 중...</p>
    </div>
  </div>
);

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ─── 인증 상태 ───
  const [user, setUser] = useState(undefined); // undefined=loading, null=logged out, object=logged in
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [stats] = useState(initialStats);
  const [products, setProducts] = useState(initialProducts);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [pageConfigs, setPageConfigs] = useState(initialPageConfigs);

  const defaultSettings = {
    profileImage: null,
    brandName: 'Beanute Studio',
    greeting: '당신만의 특별한 순간을 기록합니다.',
    kakaoUrl: '',
    kakaoUrls: {},
    chatGreeting: '상품을 선택하면 카카오톡 채팅 상담으로 연결됩니다.',
    phone: '',
    businessHours: '평일 10:00 - 18:00\n주말/공휴일 휴무',
    phoneGuideMessage: '전화 상담은 운영시간 내에 가능합니다.',
    instagramEnabled: true
  };
  const [settings, setSettings] = useState(defaultSettings);

  // Firestore 저장 중복 방지 플래그
  const skipFirestoreSync = useRef(false);

  // ─── Firebase Auth 리스너 + 타임아웃 ───
  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    // 3초 내 Auth 미응답 시 비로그인 처리 → /login 리다이렉트
    const timeout = setTimeout(() => {
      setUser((prev) => (prev === undefined ? null : prev));
    }, 3000);
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  // ─── Firestore 읽기 + 실시간 리스너 (인증 불필요) ───
  useEffect(() => {
    let unsubSettings, unsubPageConfigs, unsubBlogs;
    let dataLoadedSet = false;

    // 5초 안전장치: Firestore 연결이 hang되면 초기 데이터로 진행
    const safetyTimeout = setTimeout(() => {
      if (!dataLoadedSet) {
        console.warn('Firestore 로딩 타임아웃 — 초기 데이터로 진행');
        dataLoadedSet = true;
        setDataLoaded(true);
      }
    }, 5000);

    async function initData() {
      try {
        // 1. Firestore에서 데이터 로드 (읽기만 — 누구나 가능)
        const [fsSettings, fsPageConfigs, fsBlogs] = await Promise.all([
          loadSettings(),
          loadAllPageConfigs(),
          loadAllBlogs(),
        ]);

        // 2. 데이터가 있으면 state에 반영
        if (fsSettings) {
          setSettings(prev => ({ ...prev, ...fsSettings }));
        }
        if (fsPageConfigs && Object.keys(fsPageConfigs).length > 0) {
          setPageConfigs(fsPageConfigs);
        }
        if (fsBlogs && Object.keys(fsBlogs).length > 0) {
          setBlogs(fsBlogs);
        }

        dataLoadedSet = true;
        setDataLoaded(true);

        // 3. 실시간 리스너 연결 (다른 탭/기기 변경 감지)
        unsubSettings = subscribeSettings((data) => {
          if (data) {
            skipFirestoreSync.current = true;
            setSettings(prev => ({ ...prev, ...data }));
            setTimeout(() => { skipFirestoreSync.current = false; }, 100);
          }
        });

        unsubPageConfigs = subscribePageConfigs((data) => {
          if (data && Object.keys(data).length > 0) {
            skipFirestoreSync.current = true;
            setPageConfigs(data);
            setTimeout(() => { skipFirestoreSync.current = false; }, 100);
          }
        });

        unsubBlogs = subscribeBlogs((data) => {
          if (data) {
            skipFirestoreSync.current = true;
            setBlogs(data);
            setTimeout(() => { skipFirestoreSync.current = false; }, 100);
          }
        });
      } catch (err) {
        console.error('Firestore 초기 로드 실패:', err);
        dataLoadedSet = true;
        setDataLoaded(true); // 폴백 데이터로 진행
      }
    }

    initData();

    return () => {
      clearTimeout(safetyTimeout);
      if (unsubSettings) unsubSettings();
      if (unsubPageConfigs) unsubPageConfigs();
      if (unsubBlogs) unsubBlogs();
    };
  }, []);

  // ─── 관리자 로그인 시 초기 데이터 시드 (Firestore가 비어있을 때만) ───
  const seedAttempted = useRef(false);
  useEffect(() => {
    if (!user || !dataLoaded || seedAttempted.current) return;
    seedAttempted.current = true;

    async function seedIfEmpty() {
      try {
        const [fsSettings, fsPageConfigs, fsBlogs] = await Promise.all([
          loadSettings(),
          loadAllPageConfigs(),
          loadAllBlogs(),
        ]);

        const promises = [];
        if (!fsSettings) {
          promises.push(saveSettings(defaultSettings));
        }
        if (!fsPageConfigs || Object.keys(fsPageConfigs).length === 0) {
          promises.push(saveAllPageConfigs(initialPageConfigs));
        }
        if (!fsBlogs || Object.keys(fsBlogs).length === 0) {
          promises.push(saveAllBlogs(initialBlogs));
        }

        if (promises.length > 0) {
          await Promise.all(promises);
          console.log('초기 데이터 시드 완료');
        }
      } catch (err) {
        console.error('초기 데이터 시드 실패:', err);
      }
    }

    seedIfEmpty();
  }, [user, dataLoaded]);

  // ─── settings 변경 시 Firestore + localStorage 동기화 ───
  useEffect(() => {
    if (!dataLoaded || skipFirestoreSync.current) return;
    try { localStorage.setItem('sl_settings', JSON.stringify(settings)); } catch {}
    saveSettings(settings).catch(err => console.error('settings 저장 실패:', err));
  }, [settings, dataLoaded]);

  // ─── pageConfigs 변경 시 Firestore + localStorage 동기화 ───
  useEffect(() => {
    if (!dataLoaded || skipFirestoreSync.current) return;
    try { localStorage.setItem('sl_page_configs', JSON.stringify(pageConfigs)); } catch {}
    saveAllPageConfigs(pageConfigs).catch(err => console.error('pageConfigs 저장 실패:', err));
  }, [pageConfigs, dataLoaded]);

  // ─── blogs 변경 시 Firestore + localStorage 동기화 ───
  useEffect(() => {
    if (!dataLoaded || skipFirestoreSync.current) return;
    try { localStorage.setItem('sl_blogs', JSON.stringify(blogs)); } catch {}
    saveAllBlogs(blogs).catch(err => console.error('blogs 저장 실패:', err));
  }, [blogs, dataLoaded]);

  const [toastMsg, setToastMsg] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOpenPreview = () => setIsPreviewOpen(true);
    document.addEventListener('openMobilePreview', handleOpenPreview);
    return () => document.removeEventListener('openMobilePreview', handleOpenPreview);
  }, []);

  const renderNavBtn = (path, icon, label) => {
    const isActive = location.pathname.startsWith(path);
    return (
      <button
        onClick={() => navigate(path)}
        title={!isSidebarOpen ? label : ''}
        className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-4 justify-start' : 'justify-center px-0'} py-3 rounded-xl transition-all font-medium
          ${isActive ? 'bg-lime-400 text-neutral-950 shadow-lg shadow-lime-400/10' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white border border-transparent'}`}
      >
        <div className="shrink-0"><Icon name={icon} size={20} /></div>
        {isSidebarOpen && <span className="whitespace-nowrap">{label}</span>}
      </button>
    );
  };

  const getViewTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/builder')) return '📦 페이지 빌더';
    if (path.includes('/admin/products')) return '상품 관리';
    if (path.includes('/admin/editor')) return '상세 편집';
    if (path.includes('/admin/blog')) return '블로그';
    if (path.includes('/admin/analytics')) return '분석 통계';
    if (path.includes('/admin/preview')) return '미리보기';
    if (path.includes('/admin/settings')) return '환경 설정';
    return '대시보드';
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login';

  // ─── 인증 로딩 중 (관리자/로그인 페이지만 대기) ───
  if (user === undefined && (isAdminRoute || isLoginRoute)) {
    return <FullScreenLoading />;
  }

  // ─── 로그인 페이지 ───
  if (isLoginRoute) {
    if (user) return <Navigate to="/admin/dashboard" replace />;
    return (
      <Suspense fallback={<FullScreenLoading />}>
        <LoginPage />
      </Suspense>
    );
  }

  // ─── 공개 페이지 ───
  if (!isAdminRoute) {
    if (location.pathname === '/client') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ClientPage />
        </Suspense>
      );
    }

    return (
      <PublicLayout products={products}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/client" replace />} />
            <Route path="/detail/:productId" element={<PublicProductView products={products} blocks={blocks} blogs={blogs} settings={settings} />} />
            <Route path="/blog/:productId" element={<PublicBlogListView products={products} blogs={blogs} settings={settings} />} />
            <Route path="/blogs" element={<AllBlogsPage blogs={blogs} products={products} settings={settings} />} />
            <Route path="/contact" element={<ContactPage settings={settings} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PublicLayout>
    );
  }

  // ─── 관리자 인증 가드 ───
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ─── Firestore 데이터 로딩 중 ───
  if (!dataLoaded) {
    return <FullScreenLoading />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* [좌측] 사이드바 */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 transition-all duration-300 z-40 relative`}>
        <div className={`p-4 md:p-6 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} border-b border-neutral-800 h-[88px] shrink-0`}>
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold text-white flex flex-col gap-1 overflow-hidden whitespace-nowrap">
              <span>Beanute</span>
              <span className="text-lime-400 text-[11px] tracking-widest uppercase">STUDIO-LINK</span>
            </h1>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0">
            <Icon name="Menu" size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {isSidebarOpen ? <div className="text-[10px] font-bold text-neutral-500 mb-4 px-2 tracking-widest uppercase">Menu</div> : <div className="h-6"></div>}

          {renderNavBtn("/admin/dashboard", "LayoutDashboard", "대시보드")}
          {renderNavBtn("/admin/builder", "Package", "페이지 빌더")}
          {renderNavBtn("/admin/analytics", "PieChart", "분석 통계")}

          {isSidebarOpen ? <div className="text-[10px] font-bold text-neutral-500 mt-8 mb-4 px-2 tracking-widest uppercase">System</div> : <div className="h-6 mt-4"></div>}

          {renderNavBtn("/admin/settings", "Settings", "환경 설정")}
        </nav>

        <div className={`p-4 border-t border-neutral-800 bg-neutral-900 shrink-0 space-y-2 ${!isSidebarOpen && 'flex flex-col items-center'}`}>
          <button onClick={() => showToast('서버에 변경사항을 안전하게 배포 중입니다...')} className={`w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl transition-colors ${!isSidebarOpen && 'px-0'}`} title={!isSidebarOpen ? '변경사항 배포' : ''}>
            <Icon name="Rocket" size={18} className="text-lime-400" />
            {isSidebarOpen && <span className="font-bold text-sm whitespace-nowrap">변경사항 배포</span>}
          </button>
          <button onClick={() => window.open('/client', '_blank')} className={`w-full flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white py-3 rounded-xl transition-colors ${!isSidebarOpen && 'px-0'}`} title={!isSidebarOpen ? '고객용 페이지 열기' : ''}>
            <Icon name="ExternalLink" size={18} />
            {isSidebarOpen && <span className="font-medium text-sm whitespace-nowrap">고객용 페이지</span>}
          </button>
          <button onClick={async () => { await logout(); navigate('/login'); }} className={`w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-red-400 py-2 rounded-xl transition-colors text-sm ${!isSidebarOpen && 'px-0'}`} title={!isSidebarOpen ? '로그아웃' : ''}>
            <Icon name="LogOut" size={16} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* [우측] 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-neutral-950">
        <div className={`mx-auto ${location.pathname.includes('/admin/builder') ? 'max-w-full' : 'max-w-6xl'} p-4 md:p-8 min-h-full flex flex-col fade-in`}>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{getViewTitle()}</h2>
              <p className="text-neutral-400 text-sm md:text-base">Beanute Studio 관리자 패널입니다.</p>
            </div>

            {!location.pathname.includes('/admin/analytics') && !location.pathname.includes('/admin/preview') && !location.pathname.includes('/admin/builder') && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-800 border border-neutral-700 hover:bg-lime-400 hover:text-neutral-950 hover:border-lime-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
                >
                  <Icon name="Smartphone" size={18} />
                  <span>모바일 미리보기</span>
                </button>
              </div>
            )}
          </header>

          <div className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardView stats={stats} products={products} blogs={blogs} />} />
                <Route path="/admin/builder" element={<PageBuilderView pageConfigs={pageConfigs} setPageConfigs={setPageConfigs} blogs={blogs} setBlogs={setBlogs} showToast={showToast} settings={settings} />} />
                <Route path="/admin/products" element={<ProductsView products={products} setProducts={setProducts} showToast={showToast} />} />
                <Route path="/admin/editor/:productId" element={<EditorView blocks={blocks} setBlocks={setBlocks} showToast={showToast} />} />
                <Route path="/admin/blog/:productId" element={<BlogView blogs={blogs} setBlogs={setBlogs} showToast={showToast} isPreviewOpen={isPreviewOpen} />} />
                <Route path="/admin/analytics" element={<AnalyticsView />} />
                <Route path="/admin/preview" element={<MainPreview products={products} settings={settings} />} />
                <Route path="/admin/settings" element={<SettingsView settings={settings} setSettings={setSettings} showToast={showToast} pageConfigs={pageConfigs} />} />
              </Routes>
            </Suspense>
          </div>

          <div className="mt-12 pt-6 border-t border-neutral-800 text-center text-neutral-600 text-xs shrink-0">
            © 2026 Beanute Studio Admin System. All rights reserved.
          </div>
        </div>
      </main>

      {/* [오버레이] 모바일 뷰어 드로어 */}
      <Suspense fallback={null}>
        <MobilePreviewDrawer
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          products={products}
          settings={settings}
          currentProductId={location.pathname.split('/').pop() || '1'}
          hideBackdrop={location.pathname.includes('/admin/blog') || location.pathname.includes('/admin/editor')}
        />
      </Suspense>

      {/* [오버레이] 토스트 알림 컴포넌트 */}
      <Toast message={toastMsg} isVisible={isToastVisible} />
    </div>
  );
}
