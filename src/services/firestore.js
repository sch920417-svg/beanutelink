import { db } from '../firebase';
import {
  doc, getDoc, getDocs, addDoc,
  collection, onSnapshot, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore';
import { restSetDoc, testConnection } from './firestoreRest';

// ─── 연결 테스트 ─────────────────────────────────────────────
export { testConnection as testFirestoreWrite };

// ─── Settings ────────────────────────────────────────────────
export async function saveSettings(settings) {
  await restSetDoc('settings', 'main', settings);
}

export async function loadSettings() {
  const snap = await getDoc(doc(db, 'settings', 'main'));
  return snap.exists() ? snap.data() : null;
}

export function subscribeSettings(callback) {
  return onSnapshot(doc(db, 'settings', 'main'), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ─── Page Configs ────────────────────────────────────────────
export async function savePageConfig(tabId, config) {
  await restSetDoc('pageConfigs', tabId, config);
}

export async function saveAllPageConfigs(pageConfigs) {
  for (const [tabId, config] of Object.entries(pageConfigs)) {
    await restSetDoc('pageConfigs', tabId, config);
  }
}

export async function deletePageConfig(tabId) {
  await deleteDoc(doc(db, 'pageConfigs', tabId));
}

export async function loadAllPageConfigs() {
  const snap = await getDocs(collection(db, 'pageConfigs'));
  const configs = {};
  snap.forEach((d) => { configs[d.id] = d.data(); });
  return Object.keys(configs).length > 0 ? configs : null;
}

export function subscribePageConfigs(callback) {
  return onSnapshot(collection(db, 'pageConfigs'), (snap) => {
    const configs = {};
    snap.forEach((d) => { configs[d.id] = d.data(); });
    callback(configs);
  });
}

// ─── Blogs ───────────────────────────────────────────────────
export async function saveBlogs(productId, blogs) {
  await restSetDoc('blogs', productId, { posts: blogs });
}

export async function saveAllBlogs(allBlogs) {
  for (const [productId, posts] of Object.entries(allBlogs)) {
    await restSetDoc('blogs', productId, { posts });
  }
}

export async function loadAllBlogs() {
  const snap = await getDocs(collection(db, 'blogs'));
  const blogs = {};
  snap.forEach((d) => { blogs[d.id] = d.data().posts || []; });
  return Object.keys(blogs).length > 0 ? blogs : null;
}

export function subscribeBlogs(callback) {
  return onSnapshot(collection(db, 'blogs'), (snap) => {
    const blogs = {};
    snap.forEach((d) => { blogs[d.id] = d.data().posts || []; });
    callback(blogs);
  });
}

// ─── Analytics Events ───────────────────────────────────────
const ANALYTICS_COLLECTION = 'analytics_events';

/**
 * 분석 이벤트를 Firestore에 저장 (비인증 사용자도 가능)
 * Firestore 보안 규칙에서 analytics_events 컬렉션에 create 허용 필요
 */
export async function saveAnalyticsEvent(event) {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), event);
  } catch (err) {
    // Firestore 저장 실패 시 무시 (localStorage 폴백이 이미 있음)
    console.warn('분석 이벤트 Firestore 저장 실패:', err.message);
  }
}

/**
 * Firestore에서 기간별 분석 이벤트 조회
 */
export async function loadAnalyticsEvents(dateFrom, dateTo) {
  try {
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      where('date', '>=', dateFrom),
      where('date', '<=', dateTo),
      orderBy('date', 'desc'),
    );
    const snap = await getDocs(q);
    const events = [];
    snap.forEach((d) => events.push(d.data()));
    return events;
  } catch (err) {
    console.warn('분석 이벤트 Firestore 조회 실패:', err.message);
    return [];
  }
}

/**
 * Firestore 분석 이벤트 실시간 구독
 */
export function subscribeAnalyticsEvents(dateFrom, dateTo, callback) {
  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    where('date', '>=', dateFrom),
    where('date', '<=', dateTo),
    orderBy('date', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const events = [];
    snap.forEach((d) => events.push(d.data()));
    callback(events);
  }, (err) => {
    console.warn('분석 이벤트 구독 실패:', err.message);
    callback([]);
  });
}
