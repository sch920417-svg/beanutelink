import React, { useState } from 'react';
import { loginWithEmail } from '../../services/auth';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // ID를 이메일 형식으로 변환 (Firebase Auth는 이메일 필수)
      const email = userId.includes('@') ? userId : `${userId}@beanute.com`;
      await loginWithEmail(email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Beanute</h1>
          <p className="text-lime-400 text-xs tracking-widest uppercase font-bold">STUDIO-LINK</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-neutral-950 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '관리자 로그인'}
          </button>
        </form>

        <p className="text-center text-neutral-600 text-xs mt-6">
          &copy; 2026 Beanute Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
