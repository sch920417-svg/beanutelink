import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useAnimation, useTransform, useMotionTemplate } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

/**
 * ABLY 스타일 자석 스냅 히어로 슬라이더
 * 컨테이너 폭 기준으로 패딩을 동적 계산하여
 * 중앙 슬라이드 정렬 + 좌우 대칭 peek 보장
 */

const SLIDE_SIZE = 320;
const GAP = 8;
const SNAP_UNIT = SLIDE_SIZE + GAP; // 328px

// 스케일 축소 시 안쪽으로 밀어서 양옆 peek 보장
const SIDE_SCALE = 0.6;
const INWARD_OFFSET = SLIDE_SIZE * (1 - SIDE_SCALE) / 2; // 64px

// ─── 개별 슬라이드 ─────────────────────────────────────────────
function SlideItem({ img, index, dragX }) {
  const centerX = -index * SNAP_UNIT;

  const scale = useTransform(
    dragX,
    [centerX - SNAP_UNIT, centerX, centerX + SNAP_UNIT],
    [SIDE_SCALE, 1.0, SIDE_SCALE]
  );

  const slideX = useTransform(
    dragX,
    [centerX - SNAP_UNIT, centerX, centerX + SNAP_UNIT],
    [INWARD_OFFSET, 0, -INWARD_OFFSET]
  );

  const opacity = useTransform(
    dragX,
    [centerX - SNAP_UNIT, centerX, centerX + SNAP_UNIT],
    [0.6, 1.0, 0.6]
  );

  const borderRadius = useTransform(
    dragX,
    [centerX - SNAP_UNIT, centerX, centerX + SNAP_UNIT],
    [20, 16, 20]
  );

  return (
    <motion.div
      className="shrink-0 overflow-hidden bg-neutral-100"
      style={{
        width: SLIDE_SIZE,
        height: SLIDE_SIZE,
        scale,
        x: slideX,
        opacity,
        borderRadius,
        willChange: 'transform, opacity',
      }}
    >
      {img.url ? (
        <img
          src={img.url}
          alt={img.alt || ''}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
          <div className="text-center space-y-2">
            <ImageIcon size={36} className="mx-auto text-neutral-300" />
            <p className="text-neutral-400 text-xs font-medium">
              {img.alt || '배너 이미지'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── 메인 슬라이더 ─────────────────────────────────────────────
export default function HeroSlider({ images = [], lockScroll = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(430);
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const isDragging = useRef(false);

  const totalSlides = images.length;

  // 컨테이너 폭 측정 → 동적 패딩 계산
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setContainerWidth(el.offsetWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 패딩 = (컨테이너 - 슬라이드) / 2 → 완벽 가운데 정렬
  const padding = Math.max(0, (containerWidth - SLIDE_SIZE) / 2);

  const snapTo = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      setCurrentIndex(clamped);
      controls.start({
        x: -clamped * SNAP_UNIT,
        transition: { type: 'spring', stiffness: 400, damping: 35 },
      });
    },
    [totalSlides, controls]
  );

  const handleDragEnd = useCallback(
    (_, info) => {
      isDragging.current = false;
      const { offset, velocity } = info;
      let nextIndex = currentIndex;

      if (Math.abs(velocity.x) > 300) {
        nextIndex = velocity.x < 0 ? currentIndex + 1 : currentIndex - 1;
      } else if (Math.abs(offset.x) > SLIDE_SIZE / 4) {
        nextIndex = offset.x < 0 ? currentIndex + 1 : currentIndex - 1;
      }

      snapTo(nextIndex);
    },
    [currentIndex, snapTo]
  );

  // 빈 이미지
  if (totalSlides === 0) {
    return (
      <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center text-neutral-300">
        <ImageIcon size={48} />
      </div>
    );
  }

  const dragLeft = -(totalSlides - 1) * SNAP_UNIT;

  return (
    <div ref={containerRef} className="relative w-full select-none" style={{ marginTop: 20, marginBottom: 20 }}>
      <div className="overflow-hidden" style={{ touchAction: lockScroll ? 'none' : 'pan-y' }}>
        <motion.div
          className="flex items-center"
          style={{
            x,
            paddingLeft: padding,
            paddingRight: padding,
            gap: GAP,
          }}
          drag="x"
          dragConstraints={{ left: dragLeft, right: 0 }}
          dragElastic={0.15}
          onDragStart={() => { isDragging.current = true; }}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {images.map((img, idx) => (
            <SlideItem
              key={img.id || idx}
              img={img}
              index={idx}
              dragX={x}
            />
          ))}
        </motion.div>
      </div>

      {/* 캡슐형 페이지 인디케이터 — 우측 하단 */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 right-5 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full tabular-nums">
          {currentIndex + 1} | {totalSlides}
        </div>
      )}
    </div>
  );
}
