import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 스플래시 화면 (4번 시안)
 * 순백색 배경 + BEANUTE 로고 중앙 + Fade-out
 */
export default function SplashScreen({ logoText = 'BEANUTE', onComplete }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onAnimationComplete={onComplete}
      >
        <motion.h1
          className="text-[32px] font-black tracking-tight text-black select-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {logoText}
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
}
