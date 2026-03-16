import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * 공통 헤더 (1번 시안)
 * - 'BEANUTE' 로고 좌측 정렬
 * - Sticky 탭 바: 동적 탭 리스트 + 검정 하단 인디케이터
 */
export default function ServiceHeader({ tabs = [], activeTab, onTabChange }) {
  const tabRefs = useRef({});
  const containerRef = useRef(null);

  // 활성 탭으로 스크롤
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el && containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="sticky top-0 z-50 bg-white">
      {/* 로고 */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-[22px] font-black tracking-tight text-black select-none">
          BEANUTE
        </h1>
      </div>

      {/* 탭 바 */}
      <div
        ref={containerRef}
        className="flex items-end gap-6 px-5 overflow-x-auto scrollbar-hide relative"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              onClick={() => onTabChange(tab.id)}
              className={`relative pb-3 whitespace-nowrap text-[15px] font-semibold transition-colors duration-200 shrink-0 ${
                isActive ? 'text-black' : 'text-neutral-400'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 탭 하단 구분선 */}
      <div className="h-[1px] bg-neutral-100" />
    </div>
  );
}
