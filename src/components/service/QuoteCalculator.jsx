import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimation, useTransform, useMotionTemplate } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Star, Image as ImageIcon, X } from 'lucide-react';
import { defaultPriceConfig, defaultFaqs, defaultReviewImages } from '../../data/serviceData';
import { trackEvent, EVENT_TYPES } from '../../utils/analytics';

const DATE_TYPES = { WEEKDAY: 'weekday', WEEKEND: 'weekend' };

// ─── 라디오 카드 ─────────────────────────────────────────────
function RadioCard({ selected, onClick, title, description }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex w-full flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-black bg-neutral-50'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span className={`text-[15px] font-bold ${selected ? 'text-black' : 'text-neutral-700'}`}>
          {title}
        </span>
        {selected && <div className="h-2 w-2 rounded-full bg-black" />}
      </div>
      {description && (
        <p className="mt-1 text-[13px] font-medium text-neutral-400">{description}</p>
      )}
    </motion.button>
  );
}

// ─── 커스텀 셀렉트 ───────────────────────────────────────────
function SelectField({ value, onChange, options, label, highlight }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-bold text-neutral-500 mb-2">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(options.some((o) => typeof o.value === 'number') ? Number(val) : val);
          }}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-10 text-[15px] font-medium shadow-sm transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20 text-neutral-800 ${
            highlight ? 'border-red-300 ring-1 ring-red-200' : 'border-neutral-200'
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ─── FAQ 아이템 ──────────────────────────────────────────────
function FaqItem({ faq, index, isOpen, onToggle }) {
  return (
    <div
      className={`rounded-2xl border transition-colors ${
        isOpen ? 'border-black bg-neutral-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 text-left flex justify-between items-center gap-3"
      >
        <span
          className={`text-[14px] font-bold leading-snug ${
            isOpen ? 'text-black' : 'text-neutral-700'
          }`}
        >
          <span className="text-neutral-400 mr-1.5 font-black">Q.</span>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-neutral-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-[13px] text-neutral-500 whitespace-pre-line leading-relaxed border-t border-neutral-100 pt-3">
              <span className="text-neutral-300 font-bold mr-1.5">A.</span>
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 리뷰 라이트박스 (확대 보기 + 좌우 네비게이션) ─────────────
function ReviewLightbox({ images, currentIndex, onClose, onNavigate }) {
  const img = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <motion.div
      key="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm touch-none"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 text-white transition-colors bg-black/50 hover:bg-black/80 rounded-full z-[10]"
        onClick={onClose}
      >
        <X className="w-7 h-7" />
      </button>

      {/* 왼쪽 화살표 — 항상 표시, 비활성 시 반투명 */}
      <button
        className={`absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full z-[10] backdrop-blur-sm transition-colors ${
          hasPrev ? 'bg-white/20 text-white hover:bg-white/40' : 'bg-white/5 text-white/20'
        }`}
        onClick={(e) => { e.stopPropagation(); if (hasPrev) onNavigate(currentIndex - 1); }}
      >
        <ChevronLeft className="w-9 h-9" />
      </button>

      <motion.img
        key={`lightbox-img-${currentIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        src={img?.url}
        alt={img?.alt || '리뷰'}
        className="max-w-full max-h-[85vh] object-contain relative z-[5]"
        onClick={(e) => e.stopPropagation()}
      />

      {/* 오른쪽 화살표 — 항상 표시, 비활성 시 반투명 */}
      <button
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full z-[10] backdrop-blur-sm transition-colors ${
          hasNext ? 'bg-white/20 text-white hover:bg-white/40' : 'bg-white/5 text-white/20'
        }`}
        onClick={(e) => { e.stopPropagation(); if (hasNext) onNavigate(currentIndex + 1); }}
      >
        <ChevronRight className="w-9 h-9" />
      </button>
    </motion.div>
  );
}

// ─── 리뷰 슬라이더 (absolute 포지셔닝, 3:4 비율) ─────────────
function ReviewSection({ images = [], lockScroll = false }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className={`relative h-[460px] w-full flex items-center justify-center ${lockScroll ? 'touch-none' : ''}`}>
        {images.map((img, i) => {
          const offset = i - activeSlide;
          if (Math.abs(offset) > 2) return null;

          return (
            <motion.div
              key={`review-slide-${img.id || i}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.x < -50 && activeSlide < images.length - 1) {
                  setActiveSlide(prev => prev + 1);
                  trackEvent(EVENT_TYPES.REVIEW_INTERACT, { action: 'slide', slideIndex: activeSlide + 1 });
                }
                if (info.offset.x > 50 && activeSlide > 0) {
                  setActiveSlide(prev => prev - 1);
                  trackEvent(EVENT_TYPES.REVIEW_INTERACT, { action: 'slide', slideIndex: activeSlide - 1 });
                }
              }}
              initial={false}
              animate={{
                x: `calc(${offset * 105}%)`,
                scale: offset === 0 ? 1.1 : 0.9,
                opacity: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.5 : 0,
                filter: offset === 0 ? 'blur(0px)' : 'blur(2px)',
                zIndex: offset === 0 ? 10 : 5,
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              onClick={() => {
                if (offset === 0) {
                  setLightboxIndex(i);
                  trackEvent(EVENT_TYPES.REVIEW_INTERACT, { action: 'lightbox', slideIndex: i });
                } else {
                  setActiveSlide(i);
                }
              }}
              className={`absolute w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl cursor-pointer ${offset === 0 ? 'ring-2 ring-white/50' : ''}`}
            >
              {img.url ? (
                <img src={img.url} alt={img.alt || '리뷰'} className="w-full h-full object-cover pointer-events-none bg-neutral-50" draggable={false} />
              ) : (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ImageIcon size={28} className="mx-auto text-neutral-300" />
                    <p className="text-neutral-400 text-[11px] font-medium">{img.alt || '리뷰 이미지'}</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex justify-center gap-2 mt-6">
        {images.map((_, i) => (
          <div
            key={`dot-${i}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeSlide ? 'w-5 bg-neutral-800' : 'w-1.5 bg-neutral-200'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-[11px] text-neutral-400 mt-4 px-4 font-medium">
        사진을 넘겨보거나 중앙 사진을 클릭하여 확대해보세요.
      </p>

      {/* 라이트박스 */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <ReviewLightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(idx) => setLightboxIndex(idx)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── 메인 견적 계산기 (config-driven) ────────────────────────
export default function QuoteCalculator({ products = [], config = null, activeTab = '' }) {
  const quoteViewTracked = useRef(false);
  const quoteCompleteTracked = useRef(false);

  // config가 있으면 config 데이터 사용, 없으면 기본 데이터 폴백
  const qb = config?.quoteBuilder;
  const configProducts = qb?.products || [];
  // quoteFields: 배열이면 그대로, 객체(레거시)면 배열로 변환
  const DEFAULT_FIELD_ORDER = ['people', 'pets', 'retouchedPhotos', 'frame', 'originalPhoto'];
  const rawQuoteFields = qb?.quoteFields;
  const quoteFields = Array.isArray(rawQuoteFields)
    ? rawQuoteFields
    : DEFAULT_FIELD_ORDER.map(key => ({ key, enabled: rawQuoteFields?.[key] ?? (key === 'retouchedPhotos') }));
  const isFieldEnabled = (key) => quoteFields.some(f => f.key === key && f.enabled);
  const globalExtraPersonCost = qb?.extraPersonCost || 22000;
  const petFreeCount = qb?.petFreeCount ?? 1;
  const petExtraCost = qb?.petExtraCost || 22000;
  const faqs = config?.faq?.items || defaultFaqs;
  const reviewImages = config?.reviews?.items?.map((r, i) => ({ id: r.id || i, url: r.image || '', alt: r.text || '리뷰' })) || defaultReviewImages;
  const ctaText = qb?.ctaText || defaultPriceConfig.consultationText;
  const ctaUrl = qb?.ctaUrl || defaultPriceConfig.consultationLink;
  const disclaimer = qb?.disclaimer || defaultPriceConfig.bottomNoticeText;
  const priceTableImage = config?.priceTable?.image || defaultPriceConfig.priceTableImage;

  // 상품 목록이 있으면 config 기반, 없으면 하드코딩 폴백
  const useConfigMode = configProducts.length > 0;

  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [dateType, setDateType] = useState(DATE_TYPES.WEEKDAY);
  const [peopleCount, setPeopleCount] = useState(0);
  const [petCount, setPetCount] = useState(-1);
  const [openFaq, setOpenFaq] = useState(null);

  // 견적계산기 조회 이벤트 (마운트 시 1회)
  useEffect(() => {
    if (!quoteViewTracked.current && configProducts.length > 0) {
      quoteViewTracked.current = true;
      trackEvent(EVENT_TYPES.QUOTE_VIEW, { productTitle: configProducts[0]?.title || '', tab: activeTab });
    }
  }, [configProducts, activeTab]);

  const handleProductChange = (idx) => {
    setSelectedProductIdx(idx);
    setPeopleCount(0);
    setPetCount(-1);
    quoteCompleteTracked.current = false; // 상품 변경 시 리셋
    const product = configProducts[idx];
    if (product) {
      trackEvent(EVENT_TYPES.PRODUCT_SELECT, { productTitle: product.title, tab: activeTab });
    }
  };

  const selectedProduct = useConfigMode ? configProducts[selectedProductIdx] : null;
  const basePeople = selectedProduct?.basePeople || 4;

  // 인원 고정 여부 & 시작/최대 인원 & 추가비용 (상품별 설정)
  const isFixedPeople = selectedProduct?.fixedPeople ?? (basePeople <= 2);
  const minPeople = selectedProduct?.minPeople ?? basePeople;
  const maxPeople = selectedProduct?.maxPeople ?? 30;
  const extraPersonCost = selectedProduct?.extraPersonCost ?? globalExtraPersonCost;

  // 인원 옵션
  const peopleOptions = useMemo(() => {
    if (!selectedProduct || isFixedPeople) {
      return [
        { value: 0, label: '인원 확인' },
        { value: basePeople || 1, label: `${basePeople || 1}인 (고정)` },
      ];
    }
    const start = Math.min(minPeople, basePeople);
    const count = Math.max(1, maxPeople - start + 1);
    const opts = Array.from({ length: count }, (_, i) => ({
      value: i + start,
      label: `${i + start}인`,
    }));
    return [{ value: 0, label: '인원 선택' }, ...opts];
  }, [selectedProduct, basePeople, minPeople, isFixedPeople, maxPeople]);

  // 반려동물 옵션
  const petOptions = [
    { value: -1, label: '반려동물 선택' },
    { value: 0, label: '없음' },
    { value: 1, label: '1마리' },
    { value: 2, label: '2마리' },
  ];

  // 실시간 가격 계산
  const totalCost = useMemo(() => {
    if (!selectedProduct) return 0;

    // 인원 선택이 필요한데 안 한 경우
    if (isFieldEnabled('people') && peopleCount === 0) return 0;
    // 반려동물 선택이 필요한데 안 한 경우
    if (isFieldEnabled('pets') && petCount === -1) return 0;

    let cost = dateType === DATE_TYPES.WEEKDAY ? selectedProduct.weekdayPrice : selectedProduct.weekendPrice;

    // 추가 인원 비용
    if (isFieldEnabled('people') && peopleCount > basePeople && extraPersonCost > 0) {
      cost += (peopleCount - basePeople) * extraPersonCost;
    }

    // 반려동물 추가 비용
    if (isFieldEnabled('pets') && petCount > petFreeCount && petExtraCost > 0) {
      cost += (petCount - petFreeCount) * petExtraCost;
    }

    return cost;
  }, [selectedProduct, dateType, peopleCount, petCount, quoteFields, basePeople, extraPersonCost, petFreeCount, petExtraCost]);

  const formatCurrency = (amount) => new Intl.NumberFormat('ko-KR').format(amount);

  const extraPeopleCount = isFieldEnabled('people') && selectedProduct && peopleCount > basePeople
    ? peopleCount - basePeople
    : 0;

  // 모든 필수 선택이 완료되었는지
  const allSelected = useMemo(() => {
    if (!isFieldEnabled('people') && !isFieldEnabled('pets')) return true;
    if (isFieldEnabled('people') && peopleCount === 0) return false;
    if (isFieldEnabled('pets') && petCount === -1) return false;
    return true;
  }, [quoteFields, peopleCount, petCount]);

  // 견적 완료 이벤트 (모든 선택 완료 → 견적 금액 표시 시)
  useEffect(() => {
    if (totalCost > 0 && allSelected && !quoteCompleteTracked.current) {
      quoteCompleteTracked.current = true;
      trackEvent(EVENT_TYPES.QUOTE_COMPLETE, {
        productTitle: selectedProduct?.title,
        totalCost,
        dateType,
        people: peopleCount,
        pets: petCount,
      });
    }
  }, [totalCost, allSelected, selectedProduct, dateType, peopleCount, petCount]);

  // ─── 폴백 모드 (config 없음) ───
  if (!useConfigMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="px-5 pt-2 pb-8 space-y-5"
      >
        <section className="bg-neutral-50 rounded-3xl p-5 text-center">
          <p className="text-neutral-500 text-sm">관리자 패널에서 상품을 추가해주세요.</p>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="px-5 pt-2 pb-8 space-y-5"
    >
      {/* ── 1. 촬영 상품 선택 ── */}
      <section className="bg-neutral-50 rounded-3xl p-5">
        <h3 className="text-[15px] font-bold text-black mb-4">촬영 상품 선택</h3>
        <div className="space-y-3">
          {configProducts.map((product, idx) => (
            <RadioCard
              key={product.id}
              title={product.title}
              description={product.subtitle}
              selected={selectedProductIdx === idx}
              onClick={() => handleProductChange(idx)}
            />
          ))}
        </div>
      </section>

      {/* ── 2. 희망 일정 ── */}
      <section className="bg-neutral-50 rounded-3xl p-5">
        <h3 className="text-[15px] font-bold text-black mb-4">희망 일정</h3>
        <div className="grid grid-cols-2 gap-3">
          <RadioCard
            title="주중 / 평일"
            description="월요일 - 금요일"
            selected={dateType === DATE_TYPES.WEEKDAY}
            onClick={() => { setDateType(DATE_TYPES.WEEKDAY); trackEvent(EVENT_TYPES.QUOTE_INTERACT, { field: 'dateType', value: 'weekday' }); }}
          />
          <RadioCard
            title="주말 / 공휴일"
            description="토, 일, 공휴일"
            selected={dateType === DATE_TYPES.WEEKEND}
            onClick={() => { setDateType(DATE_TYPES.WEEKEND); trackEvent(EVENT_TYPES.QUOTE_INTERACT, { field: 'dateType', value: 'weekend' }); }}
          />
        </div>
      </section>

      {/* ── 3. 총 인원 & 반려동물 (조건부 표시) ── */}
      {(isFieldEnabled('people') || isFieldEnabled('pets')) && (
        <section className="bg-neutral-50 rounded-3xl p-5">
          <h3 className="text-[15px] font-bold text-black mb-4">
            {isFieldEnabled('people') && isFieldEnabled('pets')
              ? '총 인원 & 반려동물'
              : isFieldEnabled('people')
                ? '총 인원'
                : '반려동물'}
          </h3>
          <div className={`grid gap-3 ${isFieldEnabled('people') && isFieldEnabled('pets') ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {isFieldEnabled('people') && (
              <SelectField
                value={peopleCount}
                onChange={(val) => { setPeopleCount(val); trackEvent(EVENT_TYPES.QUOTE_INTERACT, { field: 'people', value: val }); }}
                options={peopleOptions}
                label="총 인원"
                highlight={peopleCount === 0}
              />
            )}
            {isFieldEnabled('pets') && (
              <SelectField
                value={petCount}
                onChange={(val) => { setPetCount(val); trackEvent(EVENT_TYPES.QUOTE_INTERACT, { field: 'pet', value: val }); }}
                options={petOptions}
                label="반려동물"
                highlight={petCount === -1}
              />
            )}
          </div>
        </section>
      )}

      {/* ── 4. 다크 모드 견적서 카드 ── */}
      <section className="bg-neutral-900 text-white rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-400 mb-5 block">
            견적서
          </span>

          {/* 선택 요약 */}
          <div className="space-y-3.5 border-b border-white/10 pb-5 mb-5 text-[13px]">
            <div className="flex justify-between items-center text-neutral-300">
              <span>상품</span>
              <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-md">
                {selectedProduct?.title || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>일정</span>
              <span className="font-semibold text-white">
                {dateType === DATE_TYPES.WEEKDAY ? '주중/평일' : '주말/공휴일'}
              </span>
            </div>

            {/* 동적 순서 항목 렌더링 */}
            {quoteFields.filter(f => f.enabled).map(field => {
              switch (field.key) {
                case 'people':
                  return (
                    <div key="people" className="flex justify-between items-center text-neutral-300">
                      <span>인원</span>
                      <span className="font-semibold text-white">
                        {peopleCount === 0 ? (
                          <span className="text-amber-400 animate-pulse text-[12px]">선택 대기중</span>
                        ) : (
                          `${peopleCount}명`
                        )}
                      </span>
                    </div>
                  );
                case 'pets':
                  return (
                    <div key="pets" className="flex justify-between items-center text-neutral-300">
                      <span>반려동물</span>
                      <span className="font-semibold text-white">
                        {petCount === -1 ? (
                          <span className="text-amber-400 animate-pulse text-[12px]">선택 대기중</span>
                        ) : petCount === 0 ? (
                          '없음'
                        ) : (
                          `${petCount}마리`
                        )}
                      </span>
                    </div>
                  );
                case 'retouchedPhotos':
                  return selectedProduct?.retouchedPhotos ? (
                    <div key="retouchedPhotos" className="flex justify-between items-center text-neutral-300">
                      <span>보정본</span>
                      <span className="font-semibold text-white">{selectedProduct.retouchedPhotos}장</span>
                    </div>
                  ) : null;
                case 'frame':
                  return selectedProduct?.frame && totalCost > 0 ? (
                    <div key="frame" className="flex justify-between items-center text-neutral-300">
                      <span>액자</span>
                      <span className="font-semibold text-white text-right text-[12px]">
                        {selectedProduct.frame}
                      </span>
                    </div>
                  ) : null;
                case 'originalPhoto':
                  return selectedProduct?.originalIncluded && totalCost > 0 ? (
                    <div key="originalPhoto" className="flex justify-between items-center">
                      <span className="font-semibold text-amber-400 underline underline-offset-2 decoration-amber-400/50">
                        고화질 원본
                      </span>
                      <span className="font-bold text-amber-400">무료</span>
                    </div>
                  ) : null;
                default:
                  return null;
              }
            })}
          </div>

          {/* 추가 비용 내역 */}
          {totalCost > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 space-y-2.5"
            >
              {extraPeopleCount > 0 || (isFieldEnabled('pets') && petCount > petFreeCount) ? (
                <>
                  {isFieldEnabled('pets') && petCount > petFreeCount && (
                    <div className="bg-white/5 rounded-xl p-3.5 flex justify-between items-center text-[13px] border border-white/5">
                      <span className="text-amber-400 font-medium">
                        반려동물 추가 ({petCount - petFreeCount}마리)
                      </span>
                      <span className="text-amber-400 font-bold">
                        + {formatCurrency((petCount - petFreeCount) * petExtraCost)}원
                      </span>
                    </div>
                  )}
                  {extraPeopleCount > 0 && (
                    <div className="bg-white/5 rounded-xl p-3.5 flex flex-col gap-2 text-[13px] border border-white/5">
                      <div className="flex justify-between items-center text-neutral-300">
                        <span>기본 인원 ({basePeople}인)</span>
                        <span>포함</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-400">
                        <span className="font-medium">
                          추가 인원 ({extraPeopleCount}명)
                        </span>
                        <span className="font-bold">
                          + {formatCurrency(extraPeopleCount * extraPersonCost)}원
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/5 rounded-xl p-3.5 flex justify-center items-center text-[13px] text-neutral-400 border border-white/5">
                  추가금이 없습니다.
                </div>
              )}
            </motion.div>
          )}

          {/* 견적 금액 */}
          <div className="space-y-1 mb-5">
            <div className="text-neutral-400 text-[12px] font-medium">견적 금액</div>
            <AnimatePresence mode="wait">
              {totalCost === 0 ? (
                <motion.div
                  key="wait"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[14px] font-bold text-amber-400 py-2"
                >
                  {!allSelected
                    ? '모든 항목을 선택해주세요.'
                    : `${formatCurrency(dateType === DATE_TYPES.WEEKDAY ? selectedProduct.weekdayPrice : selectedProduct.weekendPrice)} 원`}
                </motion.div>
              ) : (
                <motion.div
                  key="price"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[32px] font-bold text-white tracking-tight pt-1"
                >
                  {formatCurrency(totalCost)}{' '}
                  <span className="text-[16px] text-neutral-400 font-medium">원</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA 버튼 */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={ctaUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent(EVENT_TYPES.CTA_CLICK, { ctaUrl, productTitle: selectedProduct?.title, totalCost })}
            className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-[14px] hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>

          <div className="mt-3 w-full text-center bg-white/5 py-2 rounded-lg">
            <p className="text-[11px] text-neutral-400 font-medium">
              {disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4.5 이벤트 블록 ── */}
      {selectedProduct?.showEvent && selectedProduct?.eventNote && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            backgroundColor: selectedProduct.eventBgColor || '#fffbeb',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: selectedProduct.eventBorderColor || '#fef3c7',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-[22px] shrink-0">{selectedProduct.eventEmoji || '🎉'}</span>
            <div>
              <h3
                className="text-[14px] font-bold mb-1.5"
                style={{ color: selectedProduct.eventTextColor || '#92400e' }}
              >
                {selectedProduct.eventTitle || '이벤트 안내'}
              </h3>
              <p
                className="text-[13px] leading-relaxed whitespace-pre-line"
                style={{ color: selectedProduct.eventTextColor || '#92400e', opacity: 0.85 }}
              >
                {selectedProduct.eventNote}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── 5. 촬영 상품 가격표 (이미지) ── */}
      <section className="bg-neutral-50 rounded-3xl p-5 overflow-hidden">
        <h3 className="text-[15px] font-bold text-black mb-4">촬영 상품 가격표</h3>
        {priceTableImage ? (
          <img
            src={priceTableImage}
            alt="촬영 상품 가격표"
            className="w-full h-auto rounded-2xl"
          />
        ) : (
          <div className="w-full aspect-square bg-neutral-200 rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <ImageIcon size={32} className="mx-auto text-neutral-300" />
              <p className="text-neutral-400 text-[12px] font-medium">
                가격표 이미지를 등록해주세요
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── 6. 고객 리뷰 슬라이더 ── */}
      <section className="bg-neutral-50 rounded-3xl py-5 overflow-hidden">
        <h3 className="text-[15px] font-bold text-black mb-4 px-5">고객 리뷰</h3>
        {reviewImages.length > 0 ? (
          <ReviewSection images={reviewImages} lockScroll={config?.reviews?.lockScroll ?? false} />
        ) : (
          <ReviewSection
            images={[
              { id: 1, url: '', alt: '리뷰 1' },
              { id: 2, url: '', alt: '리뷰 2' },
              { id: 3, url: '', alt: '리뷰 3' },
            ]}
          />
        )}
      </section>

      {/* ── 7. 자주 묻는 질문 (FAQ) ── */}
      {faqs && faqs.length > 0 && (
        <section className="bg-neutral-50 rounded-3xl p-5">
          <h3 className="text-[15px] font-bold text-black mb-4">자주 묻는 질문</h3>
          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.id || i}
                faq={faq}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => {
                  const willOpen = openFaq !== i;
                  trackEvent(EVENT_TYPES.FAQ_TOGGLE, { question: faq.question, action: willOpen ? 'open' : 'close' });
                  setOpenFaq(willOpen ? i : null);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 8. 액자 가격표 ── */}
      {config?.framePrice?.tables?.length > 0 && (
        <section className="bg-neutral-50 rounded-3xl p-5">
          <h3 className="text-[15px] font-bold text-black mb-3">{config.framePrice.title || '액자 가격표 참고'}</h3>

          {config.framePrice.notice && (
            <div className="bg-neutral-900 rounded-xl px-4 py-3 mb-5">
              <p className="text-[12px] text-white font-medium text-center">{config.framePrice.notice}</p>
            </div>
          )}

          <div className="space-y-6">
            {config.framePrice.tables.map((table) => {
              // 현재 선택된 상품의 기본 제공 사이즈 추출 (예: '16R(약 40x50cm)' → '16R')
              const productFrameSize = selectedProduct?.frame?.match(/(\d+R)/)?.[1] || '';

              return (
                <div key={table.id}>
                  <h4 className="text-[13px] font-bold text-neutral-800 mb-2.5">{table.name}</h4>
                  <div className="overflow-hidden rounded-xl border border-neutral-200">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="text-left px-3.5 py-2.5 text-neutral-500 font-bold">R 규격</th>
                          <th className="text-left px-3.5 py-2.5 text-neutral-500 font-bold">약 cm 사이즈</th>
                          <th className="text-right px-3.5 py-2.5 text-neutral-500 font-bold">가격</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, idx) => {
                          const rowSize = row.size?.match(/(\d+R)/)?.[1] || row.size;
                          const isDefault = productFrameSize && rowSize === productFrameSize;
                          return (
                            <tr
                              key={idx}
                              className={`border-t border-neutral-100 ${isDefault ? 'bg-red-50/50' : ''}`}
                            >
                              <td className={`px-3.5 py-2.5 font-bold ${isDefault ? 'text-red-500' : 'text-neutral-800'}`}>
                                {row.size}
                                {isDefault && <span className="ml-1 text-[10px] font-medium">(기본 제공)</span>}
                              </td>
                              <td className={`px-3.5 py-2.5 ${isDefault ? 'text-red-500' : 'text-neutral-500'}`}>
                                {row.cm}
                              </td>
                              <td className={`px-3.5 py-2.5 text-right font-bold ${isDefault ? 'text-red-500' : 'text-neutral-800'}`}>
                                {row.price?.toLocaleString()}원
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
