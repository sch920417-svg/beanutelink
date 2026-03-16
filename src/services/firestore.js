import { db } from '../firebase';
import {
  doc, setDoc, getDoc, getDocs,
  collection, onSnapshot, deleteDoc,
} from 'firebase/firestore';

// ─── Settings ────────────────────────────────────────────────
export async function saveSettings(settings) {
  await setDoc(doc(db, 'settings', 'main'), settings, { merge: true });
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
  await setDoc(doc(db, 'pageConfigs', tabId), config);
}

export async function saveAllPageConfigs(pageConfigs) {
  const promises = Object.entries(pageConfigs).map(([tabId, config]) =>
    setDoc(doc(db, 'pageConfigs', tabId), config)
  );
  await Promise.all(promises);
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
  await setDoc(doc(db, 'blogs', productId), { posts: blogs });
}

export async function saveAllBlogs(allBlogs) {
  const promises = Object.entries(allBlogs).map(([productId, posts]) =>
    setDoc(doc(db, 'blogs', productId), { posts })
  );
  await Promise.all(promises);
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
