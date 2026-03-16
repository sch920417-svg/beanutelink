import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Clock } from 'lucide-react';
import { trackEvent, EVENT_TYPES } from '../../utils/analytics';

/**
 * 전화 문의 팝업 (바텀시트)
 * - 전화번호 표시 + 연결 버튼
 * - 운영시간 안내
 */
export default function PhoneCallModal({ isOpen, onClose, phone = '', businessHours = '', studioName = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-[2rem] z-[61] shadow-2xl"
          >
            {/* 핸들 바 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-neutral-300" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-neutral-900">전화 문의</h3>
                  <p className="text-[12px] text-neutral-500">{studioName || '스튜디오'} 대표번호</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <X size={16} className="text-neutral-500" />
              </button>
            </div>

            {/* 내용 */}
            <div className="px-6 pb-6 space-y-4 pb-[env(safe-area-inset-bottom,16px)]">
              {/* 전화번호 */}
              <div className="bg-neutral-50 rounded-2xl p-5 text-center">
                <p className="text-[13px] text-neutral-500 mb-2">대표 상담 전화번호</p>
                <p className="text-[24px] font-bold text-neutral-900 tracking-wide">
                  {phone || '전화번호 미등록'}
                </p>
              </div>

              {/* 운영시간 */}
              {businessHours && (
                <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4">
                  <Clock size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-blue-900 mb-1">운영시간 안내</p>
                    <p className="text-[13px] text-blue-700 whitespace-pre-line leading-relaxed">{businessHours}</p>
                  </div>
                </div>
              )}

              {/* 전화 연결 버튼 */}
              {phone && (
                <a
                  href={`tel:${phone.replace(/-/g, '')}`}
                  onClick={() => trackEvent(EVENT_TYPES.PHONE_CLICK, { phone })}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Phone size={18} />
                  <span>전화 연결하기</span>
                </a>
              )}

              {!phone && (
                <div className="text-center py-3 text-neutral-400 text-[13px]">
                  관리자가 전화번호를 등록하면 전화 연결이 가능합니다.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
