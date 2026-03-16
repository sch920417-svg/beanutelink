/**
 * Firestore REST API 직접 호출 래퍼
 * Firebase SDK의 setDoc이 hang되는 문제를 우회하기 위해
 * fetch()로 REST API에 직접 요청
 */
import { auth } from '../firebase';

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── JS → Firestore REST 타입 변환 ─────────────────────────

function toFirestoreValue(val) {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue),
      },
    };
  }
  if (typeof val === 'object') {
    return {
      mapValue: {
        fields: toFirestoreFields(val),
      },
    };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      fields[key] = toFirestoreValue(val);
    }
  }
  return fields;
}

// ─── REST API 쓰기 ──────────────────────────────────────────

/**
 * Firestore 문서 쓰기 (setDoc 대체)
 * @param {string} collectionId - 컬렉션 이름 (예: 'pageConfigs')
 * @param {string} docId - 문서 ID (예: 'tab-1')
 * @param {object} data - 저장할 데이터
 */
export async function restSetDoc(collectionId, docId, data) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  }

  const token = await user.getIdToken();
  const url = `${BASE_URL}/${collectionId}/${docId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const errMsg = errBody.error?.message || `HTTP ${res.status}`;

    if (res.status === 403 || res.status === 401) {
      throw new Error(`권한 없음 (${res.status}): Firebase Console → Firestore → 규칙 탭에서 보안 규칙을 확인해주세요.`);
    }
    if (res.status === 400) {
      throw new Error(`데이터 형식 오류 (400): ${errMsg}`);
    }
    throw new Error(`Firestore 오류 (${res.status}): ${errMsg}`);
  }

  return await res.json();
}

/**
 * Firestore 연결 테스트
 */
export async function testConnection() {
  await restSetDoc('_ping', 'test', { t: Date.now() });
}
