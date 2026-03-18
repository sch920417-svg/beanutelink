// ─── 스튜디오 링크 분석 유틸리티 ───
// localStorage + Firestore 동기화 이벤트 추적 & 집계
import { saveAnalyticsEvent } from '../services/firestore';

const STORAGE_KEY = 'sl_analytics';
const SESSION_KEY = 'sl_session';
const LOCATION_KEY = 'sl_location';
const PURPOSE_KEY = 'sl_visit_purpose';
const MAX_EVENTS = 10000;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

// ─── IP 기반 지역 감지 ───
let locationPromise = null;

function getVisitorLocation() {
  // 캐싱된 지역 정보가 있으면 바로 반환
  try {
    const cached = sessionStorage.getItem(LOCATION_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* 무시 */ }
  return null;
}

export function initLocationDetection() {
  if (locationPromise) return locationPromise;
  const cached = getVisitorLocation();
  if (cached) {
    locationPromise = Promise.resolve(cached);
    return locationPromise;
  }
  locationPromise = fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      const location = {
        region: data.region || '알 수 없음',
        city: data.city || '알 수 없음',
      };
      try { sessionStorage.setItem(LOCATION_KEY, JSON.stringify(location)); } catch { /* 무시 */ }
      return location;
    })
    .catch(() => {
      const fallback = { region: '알 수 없음', city: '알 수 없음' };
      try { sessionStorage.setItem(LOCATION_KEY, JSON.stringify(fallback)); } catch { /* 무시 */ }
      return fallback;
    });
  return locationPromise;
}

// ─── 이벤트 타입 상수 ───
export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  BLOG_VIEW: 'blog_view',
  SERVICE_PAGE: 'service_page',
  TAB_CHANGE: 'tab_change',
  SEGMENT_CHANGE: 'segment_change',
  PRODUCT_SELECT: 'product_select',
  QUOTE_INTERACT: 'quote_interact',
  CTA_CLICK: 'cta_click',
  FAQ_TOGGLE: 'faq_toggle',
  REVIEW_INTERACT: 'review_interact',
  QUOTE_VIEW: 'quote_view',
  QUOTE_COMPLETE: 'quote_complete',
  KAKAO_CLICK: 'kakao_click',
  PHONE_CLICK: 'phone_click',
  VISIT_PURPOSE: 'visit_purpose',
};

// ─── 세션 관리 ───
function getSessionId() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (Date.now() - session.lastActivity < SESSION_TIMEOUT) {
        session.lastActivity = Date.now();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session.id;
      }
    }
    const newSession = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      lastActivity: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession.id;
  } catch {
    return `s_${Date.now()}`;
  }
}

// ─── 저장소 ───
function readEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEvents(events) {
  try {
    // 오래된 이벤트부터 삭제
    if (events.length > MAX_EVENTS) {
      events = events.slice(events.length - MAX_EVENTS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // storage full — 절반 제거 후 재시도
    try {
      events = events.slice(Math.floor(events.length / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch { /* 무시 */ }
  }
}

// ─── 이벤트 기록 ───
export function trackEvent(type, data = {}) {
  const now = new Date();
  // 캐싱된 지역 정보 병합 (비동기 완료 전이면 null)
  const location = getVisitorLocation();
  if (location) {
    data = { ...data, region: location.region, city: location.city };
  }
  const event = {
    id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    timestamp: now.getTime(),
    date: now.toISOString().slice(0, 10),
    sessionId: getSessionId(),
    data,
  };
  const events = readEvents();
  events.push(event);
  writeEvents(events);
  // Firestore에 비동기 동기화 (실패해도 무시 — localStorage가 폴백)
  saveAnalyticsEvent(event).catch(() => {});
  return event;
}

// ─── 방문 목적 ───
export function setVisitPurpose(tabId, productTitle) {
  try {
    sessionStorage.setItem(PURPOSE_KEY, JSON.stringify({ tabId, productTitle }));
  } catch { /* 무시 */ }
  trackEvent(EVENT_TYPES.VISIT_PURPOSE, { tabId, productTitle });
}

export function getVisitPurpose() {
  try {
    const raw = sessionStorage.getItem(PURPOSE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── 이벤트 조회 ───
export function getEvents({ type, dateFrom, dateTo } = {}) {
  let events = readEvents();
  if (type) events = events.filter(e => e.type === type);
  if (dateFrom) events = events.filter(e => e.date >= dateFrom);
  if (dateTo) events = events.filter(e => e.date <= dateTo);
  return events;
}

// ─── 데이터 초기화 ───
export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── JSON 내보내기 (Firebase 마이그레이션용) ───
export function exportEvents() {
  return localStorage.getItem(STORAGE_KEY) || '[]';
}

// ─── 날짜 유틸 ───
export function getDateRange(period, customRange = null) {
  if (customRange) return customRange;
  return { dateFrom: getDateFrom(period), dateTo: getDateTo(period) };
}

function getDateFrom(period) {
  const now = new Date();
  switch (period) {
    case 'today':
      return now.toISOString().slice(0, 10);
    case 'yesterday': {
      now.setDate(now.getDate() - 1);
      return now.toISOString().slice(0, 10);
    }
    case 'week':
      now.setDate(now.getDate() - 7);
      return now.toISOString().slice(0, 10);
    case 'twoWeeks':
      now.setDate(now.getDate() - 14);
      return now.toISOString().slice(0, 10);
    case 'month':
    default:
      now.setMonth(now.getMonth() - 1);
      return now.toISOString().slice(0, 10);
  }
}

function getDateTo(period) {
  if (period === 'yesterday') {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return now.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function getPrevPeriodRange(period) {
  const now = new Date();
  let dateTo, dateFrom;
  switch (period) {
    case 'today':
      now.setDate(now.getDate() - 1);
      dateTo = now.toISOString().slice(0, 10);
      dateFrom = dateTo;
      break;
    case 'yesterday':
      now.setDate(now.getDate() - 2);
      dateTo = now.toISOString().slice(0, 10);
      dateFrom = dateTo;
      break;
    case 'week':
      now.setDate(now.getDate() - 7);
      dateTo = now.toISOString().slice(0, 10);
      now.setDate(now.getDate() - 7);
      dateFrom = now.toISOString().slice(0, 10);
      break;
    case 'twoWeeks':
      now.setDate(now.getDate() - 14);
      dateTo = now.toISOString().slice(0, 10);
      now.setDate(now.getDate() - 14);
      dateFrom = now.toISOString().slice(0, 10);
      break;
    case 'month':
    default:
      now.setMonth(now.getMonth() - 1);
      dateTo = now.toISOString().slice(0, 10);
      now.setMonth(now.getMonth() - 1);
      dateFrom = now.toISOString().slice(0, 10);
      break;
  }
  return { dateFrom, dateTo };
}

// ─── 집계 통계 ───
// externalEvents가 주어지면 해당 이벤트로 집계 (Firestore 데이터 사용 시)
export function getStats(period = 'month', customRange = null, externalEvents = null) {
  const dateFrom = customRange ? customRange.dateFrom : getDateFrom(period);
  const dateTo = customRange ? customRange.dateTo : getDateTo(period);
  const events = externalEvents || getEvents({ dateFrom, dateTo });

  // 세션별 방문 목적 매핑
  const sessionPurposeMap = {};
  events.filter(e => e.type === EVENT_TYPES.VISIT_PURPOSE).forEach(e => {
    sessionPurposeMap[e.sessionId] = e.data?.productTitle;
  });

  // 퍼널
  const pageViews = events.filter(e =>
    e.type === EVENT_TYPES.PAGE_VIEW || e.type === EVENT_TYPES.SERVICE_PAGE
  );
  const allQuoteCompletes = events.filter(e => e.type === EVENT_TYPES.QUOTE_COMPLETE);
  // 모든 견적 완료를 카운트 (방문 목적과 무관하게 집계)
  const quoteCompletes = allQuoteCompletes;
  const ctaClicks = events.filter(e =>
    e.type === EVENT_TYPES.CTA_CLICK || e.type === EVENT_TYPES.KAKAO_CLICK
  );
  const phoneClicks = events.filter(e => e.type === EVENT_TYPES.PHONE_CLICK);

  // 세션 기반 고유 카운트
  const uniquePageSessions = new Set(pageViews.map(e => e.sessionId)).size;
  const uniqueQuoteCompleteSessions = new Set(quoteCompletes.map(e => e.sessionId)).size;
  const uniqueCTASessions = new Set(ctaClicks.map(e => e.sessionId)).size;
  const uniquePhoneSessions = new Set(phoneClicks.map(e => e.sessionId)).size;

  const funnel = {
    pageViews: uniquePageSessions,
    quoteCompletes: uniqueQuoteCompleteSessions,
    ctaClicks: uniqueCTASessions,
    phoneClicks: uniquePhoneSessions,
    conversionRate1: uniquePageSessions > 0
      ? ((uniqueQuoteCompleteSessions / uniquePageSessions) * 100).toFixed(1)
      : '0.0',
    conversionRate2: uniqueQuoteCompleteSessions > 0
      ? ((uniqueCTASessions / uniqueQuoteCompleteSessions) * 100).toFixed(1)
      : '0.0',
    overallRate: uniquePageSessions > 0
      ? ((uniqueCTASessions / uniquePageSessions) * 100).toFixed(1)
      : '0.0',
  };

  // 상품 선택 비율 (전체 순위)
  const productSelectEvents = events.filter(e => e.type === EVENT_TYPES.PRODUCT_SELECT);
  const productCounts = {};
  productSelectEvents.forEach(e => {
    const title = e.data?.productTitle || '알 수 없음';
    productCounts[title] = (productCounts[title] || 0) + 1;
  });
  const totalProductSelects = productSelectEvents.length;
  const productRatios = Object.entries(productCounts)
    .map(([title, count]) => ({
      title,
      count,
      percentage: totalProductSelects > 0
        ? Math.round((count / totalProductSelects) * 100)
        : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 일별 추이
  const dailyMap = {};
  events.forEach(e => {
    if (!dailyMap[e.date]) {
      dailyMap[e.date] = { date: e.date, pageViews: 0, productViews: 0, ctaClicks: 0, phoneClicks: 0 };
    }
    if (e.type === EVENT_TYPES.PAGE_VIEW || e.type === EVENT_TYPES.SERVICE_PAGE) {
      dailyMap[e.date].pageViews++;
    }
    if (e.type === EVENT_TYPES.PRODUCT_VIEW || e.type === EVENT_TYPES.PRODUCT_SELECT) {
      dailyMap[e.date].productViews++;
    }
    if (e.type === EVENT_TYPES.CTA_CLICK || e.type === EVENT_TYPES.KAKAO_CLICK) {
      dailyMap[e.date].ctaClicks++;
    }
    if (e.type === EVENT_TYPES.PHONE_CLICK) {
      dailyMap[e.date].phoneClicks++;
    }
  });
  const dailyCounts = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // FAQ 인기
  const faqEvents = events.filter(e => e.type === EVENT_TYPES.FAQ_TOGGLE && e.data?.action === 'open');
  const faqCounts = {};
  faqEvents.forEach(e => {
    const q = e.data?.question || '알 수 없음';
    faqCounts[q] = (faqCounts[q] || 0) + 1;
  });
  const faqEngagement = Object.entries(faqCounts)
    .map(([question, openCount]) => ({ question, openCount }))
    .sort((a, b) => b.openCount - a.openCount);

  // 견적 인사이트 (개편) — quoteCompletes는 이미 목적 기반 필터링됨
  const quoteViewEvents = events.filter(e => e.type === EVENT_TYPES.QUOTE_VIEW);
  const quoteCompleteEvents = quoteCompletes;

  // 상품별 견적계산기 조회 횟수
  const quoteViewByProduct = {};
  quoteViewEvents.forEach(e => {
    const title = e.data?.productTitle || e.data?.tab || '알 수 없음';
    quoteViewByProduct[title] = (quoteViewByProduct[title] || 0) + 1;
  });

  // 상품별 견적 완료 횟수
  const quoteCompleteByProduct = {};
  quoteCompleteEvents.forEach(e => {
    const title = e.data?.productTitle || '알 수 없음';
    quoteCompleteByProduct[title] = (quoteCompleteByProduct[title] || 0) + 1;
  });

  const quoteProductStats = Object.keys({ ...quoteViewByProduct, ...quoteCompleteByProduct }).map(title => ({
    title,
    views: quoteViewByProduct[title] || 0,
    completes: quoteCompleteByProduct[title] || 0,
    conversionRate: quoteViewByProduct[title] > 0
      ? ((quoteCompleteByProduct[title] || 0) / quoteViewByProduct[title] * 100).toFixed(1)
      : '0.0',
  })).sort((a, b) => b.views - a.views);

  // 일자별 견적 데이터 (상품별 선택 옵션 상세)
  const quoteDetailEvents = events.filter(e =>
    e.type === EVENT_TYPES.QUOTE_COMPLETE
  );
  const quoteDetails = quoteDetailEvents.map(e => ({
    date: e.date,
    timestamp: e.timestamp,
    productTitle: e.data?.productTitle || '알 수 없음',
    dateType: e.data?.dateType || '-',
    people: e.data?.people || '-',
    pets: e.data?.pets || '-',
    totalCost: e.data?.totalCost || '-',
  })).sort((a, b) => b.timestamp - a.timestamp);

  // 블로그 조회수 순위 (상품별)
  const blogViewEvents = events.filter(e => e.type === EVENT_TYPES.BLOG_VIEW);
  const blogByProduct = {};
  blogViewEvents.forEach(e => {
    const productTitle = e.data?.productTitle || '기타';
    if (!blogByProduct[productTitle]) blogByProduct[productTitle] = {};
    const blogTitle = e.data?.blogTitle || `블로그 #${e.data?.productId || '?'}`;
    blogByProduct[productTitle][blogTitle] = (blogByProduct[productTitle][blogTitle] || 0) + 1;
  });
  const blogRankings = {};
  Object.entries(blogByProduct).forEach(([productTitle, blogs]) => {
    blogRankings[productTitle] = Object.entries(blogs)
      .map(([blogTitle, count]) => ({ blogTitle, count }))
      .sort((a, b) => b.count - a.count);
  });

  // 전화문의 일별 카운트
  const phoneDailyCounts = {};
  phoneClicks.forEach(e => {
    phoneDailyCounts[e.date] = (phoneDailyCounts[e.date] || 0) + 1;
  });
  const phoneDailyList = Object.entries(phoneDailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // 지역별 통계
  const regionMap = {};
  events.forEach(e => {
    const region = e.data?.region;
    if (!region || region === '알 수 없음') return;
    if (!regionMap[region]) {
      regionMap[region] = { visits: new Set(), quoteCompletes: new Set(), ctaClicks: new Set(), cities: {} };
    }
    const r = regionMap[region];
    const city = e.data?.city || '기타';
    if (!r.cities[city]) r.cities[city] = new Set();

    if (e.type === EVENT_TYPES.PAGE_VIEW || e.type === EVENT_TYPES.SERVICE_PAGE) {
      r.visits.add(e.sessionId);
      r.cities[city].add(e.sessionId);
    }
    if (e.type === EVENT_TYPES.QUOTE_COMPLETE) {
      r.quoteCompletes.add(e.sessionId);
    }
    if (e.type === EVENT_TYPES.CTA_CLICK || e.type === EVENT_TYPES.KAKAO_CLICK) {
      r.ctaClicks.add(e.sessionId);
    }
  });
  const regionStats = Object.entries(regionMap)
    .map(([region, data]) => ({
      region,
      visits: data.visits.size,
      quoteCompletes: data.quoteCompletes.size,
      ctaClicks: data.ctaClicks.size,
      cities: Object.entries(data.cities)
        .map(([city, sessions]) => ({ city, visits: sessions.size }))
        .sort((a, b) => b.visits - a.visits),
    }))
    .sort((a, b) => b.visits - a.visits);

  const quoteInsights = {
    topProduct: productRatios[0]?.title || '-',
    avgPeopleCount: (() => {
      const peopleEvents = events.filter(e => e.type === EVENT_TYPES.QUOTE_INTERACT && e.data?.field === 'people');
      return peopleEvents.length > 0
        ? (peopleEvents.reduce((sum, e) => sum + (Number(e.data?.value) || 0), 0) / peopleEvents.length).toFixed(1)
        : '0';
    })(),
  };

  // 최근 활동 (유지 — 내부용)
  const recentEvents = [...events].reverse().slice(0, 20).map(e => ({
    ...e,
    label: getEventLabel(e),
    timeAgo: getTimeAgo(e.timestamp),
  }));

  // 이전 기간 대비 (externalEvents 사용 시 스킵 — Firestore에서 별도 처리 필요)
  const prev = (customRange || externalEvents) ? null : getPrevPeriodRange(period);
  let summary;
  if (prev) {
    const prevEvents = getEvents({ dateFrom: prev.dateFrom, dateTo: prev.dateTo });
    const prevPageViews = new Set(
      prevEvents.filter(e => e.type === EVENT_TYPES.PAGE_VIEW || e.type === EVENT_TYPES.SERVICE_PAGE).map(e => e.sessionId)
    ).size;
    const prevQuoteCompletes = new Set(
      prevEvents.filter(e => e.type === EVENT_TYPES.QUOTE_COMPLETE).map(e => e.sessionId)
    ).size;
    const prevCTAClicks = new Set(
      prevEvents.filter(e => e.type === EVENT_TYPES.CTA_CLICK || e.type === EVENT_TYPES.KAKAO_CLICK).map(e => e.sessionId)
    ).size;

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : null;
      const change = Math.round(((current - previous) / previous) * 100);
      return change > 0 ? `+${change}%` : `${change}%`;
    };

    summary = {
      pageViewChange: calcChange(uniquePageSessions, prevPageViews),
      quoteCompleteChange: calcChange(uniqueQuoteCompleteSessions, prevQuoteCompletes),
      ctaChange: calcChange(uniqueCTASessions, prevCTAClicks),
    };
  } else {
    summary = {
      pageViewChange: null,
      quoteCompleteChange: null,
      ctaChange: null,
    };
  }

  // 방문 목적 분포
  const purposeEvents = events.filter(e => e.type === EVENT_TYPES.VISIT_PURPOSE);
  const purposeCounts = {};
  purposeEvents.forEach(e => {
    const title = e.data?.productTitle || '알 수 없음';
    purposeCounts[title] = (purposeCounts[title] || 0) + 1;
  });
  const totalPurpose = purposeEvents.length;
  const purposeStats = Object.entries(purposeCounts)
    .map(([productTitle, count]) => ({
      productTitle,
      count,
      percentage: totalPurpose > 0 ? Math.round((count / totalPurpose) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    funnel,
    productRatios,
    dailyCounts,
    faqEngagement,
    quoteInsights,
    quoteProductStats,
    quoteDetails,
    blogRankings,
    phoneDailyList,
    regionStats,
    purposeStats,
    recentEvents,
    summary,
  };
}

// ─── 이벤트 라벨 (한국어) ───
function getEventLabel(event) {
  const d = event.data || {};
  switch (event.type) {
    case EVENT_TYPES.PAGE_VIEW:
      return `페이지 방문 (${d.page || '/'})`;
    case EVENT_TYPES.PRODUCT_VIEW:
      return `상품 조회: ${d.productTitle || d.productId}`;
    case EVENT_TYPES.BLOG_VIEW:
      return `블로그 조회: ${d.blogTitle || d.productId}`;
    case EVENT_TYPES.SERVICE_PAGE:
      return `서비스 페이지 진입`;
    case EVENT_TYPES.TAB_CHANGE:
      return `탭 전환: ${d.fromTab} → ${d.toTab}`;
    case EVENT_TYPES.SEGMENT_CHANGE:
      return `세그먼트 변경: ${d.segment}`;
    case EVENT_TYPES.PRODUCT_SELECT:
      return `상품 선택: ${d.productTitle}`;
    case EVENT_TYPES.QUOTE_INTERACT:
      return `견적 옵션: ${d.field} = ${d.value}`;
    case EVENT_TYPES.CTA_CLICK:
      return `상담 신청 (${d.productTitle})`;
    case EVENT_TYPES.FAQ_TOGGLE:
      return `FAQ ${d.action === 'open' ? '열기' : '닫기'}: ${(d.question || '').slice(0, 20)}...`;
    case EVENT_TYPES.REVIEW_INTERACT:
      return `리뷰 ${d.action === 'lightbox' ? '상세보기' : '슬라이드'}`;
    case EVENT_TYPES.QUOTE_VIEW:
      return `견적계산기 조회: ${d.productTitle || d.tab}`;
    case EVENT_TYPES.QUOTE_COMPLETE:
      return `견적 완료: ${d.productTitle} (${d.totalCost?.toLocaleString?.() || d.totalCost}원)`;
    case EVENT_TYPES.KAKAO_CLICK:
      return `카카오톡 상담: ${d.productTitle || ''}`;
    case EVENT_TYPES.PHONE_CLICK:
      return `전화 문의`;
    case EVENT_TYPES.VISIT_PURPOSE:
      return `방문 목적: ${d.productTitle || ''}`;
    default:
      return event.type;
  }
}

// ─── 시간 경과 표시 ───
function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '방금 전';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
