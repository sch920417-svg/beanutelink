import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, MapPin } from 'lucide-react';
import { trackEvent, EVENT_TYPES } from '../../utils/analytics';

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeInOut' } }
};

export default function ContactPage({ settings }) {
  const phone = settings?.phone || '';
  const brandName = settings?.brandName || '비뉴뜨 스튜디오';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="contact"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-neutral-50 flex flex-col items-center selection:bg-neutral-900 selection:text-white"
      >
        <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative font-sans text-neutral-900">
          {/* 헤더 */}
          <div className="bg-gradient-to-b from-neutral-50/50 to-white pt-16 pb-8 px-6 text-center">
            <h1 className="font-extrabold text-2xl tracking-tight text-neutral-900 mb-2">{brandName}</h1>
            <p className="text-neutral-500 text-[13px] font-medium tracking-wide">전화 문의 안내</p>
          </div>

          {/* 문의 안내 카드 */}
          <div className="px-6 py-8 flex-1 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-neutral-50 rounded-[2rem] p-8 text-center border border-neutral-100"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                <Phone size={28} className="text-white" />
              </div>

              <h2 className="font-bold text-xl text-neutral-900 mb-2">전화로 문의하기</h2>
              <p className="text-neutral-500 text-[13px] leading-relaxed mb-8">
                촬영 예약 및 상담은 전화로 편하게 문의해주세요.<br />
                친절하게 안내해드리겠습니다.
              </p>

              {phone ? (
                <a
                  href={`tel:${phone}`}
                  onClick={() => trackEvent(EVENT_TYPES.PHONE_CLICK, { phone })}
                  className="inline-flex items-center justify-center gap-3 w-full bg-neutral-900 hover:bg-neutral-800 text-white py-4 rounded-2xl font-bold text-[16px] transition-colors active:scale-[0.97] shadow-lg"
                >
                  <Phone size={20} />
                  <span>{phone}</span>
                </a>
              ) : (
                <div className="py-4 text-neutral-400 text-sm">
                  전화번호가 아직 등록되지 않았습니다.
                </div>
              )}
            </motion.div>

            {/* 안내 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full mt-6 space-y-4"
            >
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-neutral-500" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-neutral-900">상담 시간</p>
                  <p className="text-[12px] text-neutral-500">평일 10:00 - 18:00 (주말/공휴일 휴무)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-neutral-500" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-neutral-900">스튜디오 위치</p>
                  <p className="text-[12px] text-neutral-500">상세 위치는 예약 시 안내드립니다.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
