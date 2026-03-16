import React from 'react';
import { motion } from 'framer-motion';

/**
 * 촬영 가이드 섹션
 * 타이틀 + 2컬럼 카드
 * bgColor / borderColor → hex 값 인라인 스타일 적용 (실시간 반영)
 */
export default function ShootingGuide({ guide, onCardClick }) {
  if (!guide) return null;

  return (
    <div className="px-5 pt-8 pb-6">
      <h2 className="text-[17px] font-bold text-black mb-4">
        {guide.title}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {guide.cards.map((card) => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCardClick?.(card)}
            className="rounded-2xl p-4 text-left flex items-center gap-3 transition-shadow hover:shadow-md"
            style={{
              backgroundColor: card.bgColor || '#f0fdf4',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: card.borderColor || '#dcfce7',
            }}
          >
            <span className="text-[28px] shrink-0">{card.emoji}</span>
            <div className="min-w-0" style={{ wordBreak: 'keep-all' }}>
              <p className="text-[13px] font-bold text-neutral-800 leading-tight">
                {card.title}
              </p>
              <p className="text-[13px] font-bold text-neutral-800 leading-tight">
                {card.subtitle}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
