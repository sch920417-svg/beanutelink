import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Firestore: WebSocket 대신 HTTP long polling 사용
// setDoc이 hang되는 문제 방지 (WebSocket 연결 불안정 환경 대응)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
