import React from 'react';
import { motion } from 'framer-motion';

/**
 * 세그먼트 컨트롤러 — 하나의 컨테이너 안에서 활성 배경이 슬라이딩
 * 선택: 검정bg + 흰글 / 비선택: 투명bg + 회색글
 */
export default function SegmentedControl({ activeSegment, onSegmentChange }) {
  const segments = [
    { id: 'quote', label: '견적 계산하기' },
    { id: 'blog', label: '블로그 보기' },
  ];

  const activeIndex = segments.findIndex((s) => s.id === activeSegment);

  return (
    <div className="flex justify-center py-5">
      <div className="relative flex items-center bg-white border border-neutral-200 rounded-full p-1" style={{ width: 280 }}>
        {/* 슬라이딩 활성 배경 */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-black"
          initial={false}
          animate={{
            left: `calc(${(activeIndex * 100) / segments.length}% + 4px)`,
            width: `calc(${100 / segments.length}% - 8px)`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

        {segments.map((seg) => {
          const isActive = activeSegment === seg.id;
          return (
            <button
              key={seg.id}
              onClick={() => onSegmentChange(seg.id)}
              className="relative z-10 flex-1 py-2.5 text-[14px] font-semibold text-center transition-colors duration-200"
              style={{
                color: isActive ? '#ffffff' : '#a3a3a3',
              }}
            >
              {seg.label}
              {seg.id === 'blog' && !isActive && (
                <span
                  className="absolute top-1 right-1.5 bg-red-500 text-white text-[8px] font-bold w-[14px] h-[14px] rounded-full animate-pulse flex items-center justify-center"
                  style={{ transform: 'rotate(-12deg)' }}
                >
                  N
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
