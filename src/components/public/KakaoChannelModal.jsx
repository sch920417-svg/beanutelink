import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronRight } from 'lucide-react';
import { trackEvent, EVENT_TYPES } from '../../utils/analytics';

export default function KakaoChannelModal({ isOpen, onClose, products = [], greeting = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />

          {/* 바텀시트 */}
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
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-neutral-900">카카오톡 채팅 상담</h3>
                  <p className="text-[12px] text-neutral-500">{greeting || '상품을 선택해주세요'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <X size={16} className="text-neutral-500" />
              </button>
            </div>

            {/* 상품 목록 */}
            <div className="px-6 pb-6 space-y-3 pb-[env(safe-area-inset-bottom,16px)]">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    if (product.kakaoUrl) {
                      trackEvent(EVENT_TYPES.KAKAO_CLICK, { productTitle: product.title });
                      window.open(product.kakaoUrl, '_blank');
                    }
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-2xl transition-colors group"
                >
                  <span className="font-semibold text-[14px] text-neutral-800">{product.title}</span>
                  <ChevronRight size={18} className="text-neutral-400" />
                </button>
              ))}

              {products.length === 0 && (
                <div className="py-8 text-center text-neutral-400 text-sm">
                  등록된 상품이 없습니다.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
