import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * 이미지를 Firebase Storage에 업로드하고 다운로드 URL을 반환
 * @param {string} storagePath - 'images/hero/family/photo1.jpg'
 * @param {File|Blob} file - 업로드할 파일
 * @returns {Promise<string>} 다운로드 URL
 */
export async function uploadImage(storagePath, file) {
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Base64 데이터 URL을 Blob으로 변환 후 업로드
 * @param {string} storagePath
 * @param {string} dataUrl - 'data:image/jpeg;base64,...'
 * @returns {Promise<string>} 다운로드 URL
 */
export async function uploadBase64Image(storagePath, dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return uploadImage(storagePath, blob);
}

/**
 * Firebase Storage에서 파일 삭제
 * @param {string} storagePath
 */
export async function deleteImage(storagePath) {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (e) {
    // 파일이 없으면 무시
    if (e.code !== 'storage/object-not-found') throw e;
  }
}

/**
 * File 객체를 압축 후 Storage에 업로드
 * @param {File} file
 * @param {string} storagePath
 * @param {number} maxSize - 최대 픽셀 (기본 1200)
 * @param {number} quality - JPEG 품질 (기본 0.8)
 * @returns {Promise<string>} 다운로드 URL
 */
/**
 * 카테고리별 고유 Storage 경로 생성
 */
function generatePath(category) {
  return `images/${category}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
}

/**
 * File 객체를 압축 후 Storage에 업로드 (카테고리만 넘기면 경로 자동 생성)
 */
export async function uploadCompressed(file, category) {
  return compressAndUpload(file, generatePath(category));
}

/**
 * 영상 파일을 Firebase Storage에 업로드
 * @param {Blob|File} file - 영상 파일 (압축 후 Blob)
 * @param {string} category - 탭 ID (예: 'family')
 * @returns {Promise<string>} 다운로드 URL
 */
export async function uploadVideo(file, category) {
  const path = `videos/${category}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp4`;
  return uploadImage(path, file); // uploadImage는 범용 업로드 함수
}

export async function compressAndUpload(file, storagePath, maxSize = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          async (blob) => {
            try {
              const url = await uploadImage(storagePath, blob);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
