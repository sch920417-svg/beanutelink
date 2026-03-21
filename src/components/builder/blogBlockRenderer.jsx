import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  let match = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  match = url.match(/(?:youtu\.be\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  match = url.match(/(?:youtube\.com\/embed\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  match = url.match(/(?:youtube\.com\/shorts\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

// ─── 슬라이더 블록 (카드형 캐러셀 — 스와이프 + 버튼) ──────────
export function SliderBlock({ block }) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const images = block.images || [];
  if (images.length === 0) return null;

  const goPrev = () => setSliderIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  const goNext = () => setSliderIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));

  const slidePercent = 85;
  const gapPx = 8;

  const onTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, swiping: false };
  };
  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    if (!touchRef.current.swiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      touchRef.current.swiping = true;
    }
    if (touchRef.current.swiping) {
      e.preventDefault();
    }
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const onMouseDown = (e) => {
    touchRef.current = { startX: e.clientX, startY: e.clientY, swiping: true };
  };
  const onMouseUp = (e) => {
    if (!touchRef.current.swiping) return;
    const dx = e.clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchRef.current.swiping = false;
  };

  return (
    <div className="relative w-full group">
      <div
        className="overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { touchRef.current.swiping = false; }}
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing select-none"
          style={{ gap: `${gapPx}px` }}
          animate={{ x: `calc(${(100 - slidePercent) / 2}% - ${sliderIndex} * (${slidePercent}% + ${gapPx}px))` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {images.map((img, i) => (
            <div key={i} style={{ width: `${slidePercent}%`, flexShrink: 0 }} className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <img src={img} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} alt="" />
            </div>
          ))}
        </motion.div>
      </div>

      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goNext} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === sliderIndex ? 'w-4 bg-neutral-800' : 'w-1.5 bg-neutral-300'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Before/After 비교 뷰어 (드래그 슬라이더) ─────────────────
export function BeforeAfterBlock({ block }) {
  const [pos, setPos] = useState(50);
  if (!block.before || !block.after) return null;

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl shadow-sm select-none group touch-none bg-neutral-100">
      <img src={block.after} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="After" />
      <img src={block.before} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} alt="Before" />

      <div className="absolute top-0 bottom-0 w-[3px] bg-white flex items-center justify-center pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10" style={{ left: `calc(${pos}% - 1.5px)` }}>
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-neutral-200 text-neutral-500">
          <ChevronLeft className="w-4 h-4 -mr-0.5" /><ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <input
        type="range" min="0" max="100" value={pos}
        onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize m-0 p-0 z-20 touch-pan-x"
      />

      <div className="absolute top-3 left-3 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm pointer-events-none z-10">Before</div>
      <div className="absolute top-3 right-3 bg-blue-600/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm pointer-events-none z-10">After</div>
    </div>
  );
}

// ─── 인라인 마크다운 파서 (**bold**, __underline__, 중첩 지원) ──────
let _mdKey = 0;
export function parseInlineMarkdown(text) {
  if (!text) return text;
  const regex = /(\*\*(.+?)\*\*|__(.+?)__)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={_mdKey++}>{parseInlineMarkdown(match[2])}</strong>);
    } else if (match[3]) {
      parts.push(<u key={_mdKey++}>{parseInlineMarkdown(match[3])}</u>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex === 0) return text;
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// ─── 공유 블록 렌더러 ──────
export function renderBlock(block, idx) {
  switch (block.type) {
    case 'h1':
      return <h1 key={idx} className={`text-xl font-bold text-black mt-4 text-${block.align || 'left'}`}>{parseInlineMarkdown(block.content)}</h1>;
    case 'h2':
      return <h2 key={idx} className={`text-lg font-bold text-black mt-3 text-${block.align || 'left'}`}>{parseInlineMarkdown(block.content)}</h2>;
    case 'text':
      return <p key={idx} className={`text-[14px] text-neutral-700 leading-relaxed whitespace-pre-line text-${block.align || 'left'}`}>{parseInlineMarkdown(block.content)}</p>;
    case 'image':
      return block.url ? (
        <div key={idx} className="rounded-xl overflow-hidden">
          <img src={block.url} alt={block.caption || ''} className="w-full h-auto" />
          {block.caption && <p className="text-center text-[12px] text-neutral-400 mt-1.5">{block.caption}</p>}
        </div>
      ) : null;
    case 'quote':
      return (
        <div key={idx} className="border-l-4 border-black pl-4 py-2">
          <p className="text-[14px] font-bold text-neutral-800 italic">{parseInlineMarkdown(block.content)}</p>
          {block.author && <p className="text-[12px] text-neutral-400 mt-1">{block.author}</p>}
        </div>
      );
    case 'callout':
      return (
        <div key={idx} className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
          <span className="text-xl">💡</span>
          <p className="text-[14px] text-neutral-700 leading-relaxed">{parseInlineMarkdown(block.content)}</p>
        </div>
      );
    case 'ul':
      return (
        <ul key={idx} className="space-y-1.5 ml-1">
          {(block.content || '').split('\n').filter(Boolean).map((item, i) => (
            <li key={i} className="text-[14px] text-neutral-700 flex items-start gap-2">
              <span className="text-neutral-400 mt-1.5 text-[8px]">●</span>{parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className="space-y-1.5 ml-1">
          {(block.content || '').split('\n').filter(Boolean).map((item, i) => (
            <li key={i} className="text-[14px] text-neutral-700 flex items-start gap-2">
              <span className="text-neutral-400 font-bold text-[13px] w-5 shrink-0">{i + 1}.</span>{parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
    case 'slider':
      return <SliderBlock key={idx} block={block} />;
    case 'beforeAfter':
      return <BeforeAfterBlock key={idx} block={block} />;
    case 'link':
      return (
        <div key={idx} className={`text-${block.align || 'left'}`}>
          <a href={block.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-3 bg-white border border-neutral-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/50 rounded-2xl transition-all group text-left">
            {block.image && (
              <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-100">
                <img src={block.image} className="w-full h-full object-cover" alt="" />
              </div>
            )}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span className="font-bold text-[14px] text-neutral-800 group-hover:text-blue-700 line-clamp-1">{block.title || block.url}</span>
              {block.desc && <span className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{block.desc}</span>}
              <span className="text-[10px] text-neutral-300 line-clamp-1 mt-0.5">{block.url}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 flex-shrink-0 mr-1" />
          </a>
        </div>
      );
    case 'video':
      if (block.url) {
        if (block.videoType === 'upload') {
          return (
            <div key={idx} className="rounded-xl overflow-hidden">
              <video src={block.url} className="w-full" autoPlay muted loop playsInline />
            </div>
          );
        }
        const embedUrl = getYouTubeEmbedUrl(block.url);
        if (embedUrl) {
          return (
            <div key={idx} className="aspect-video rounded-xl overflow-hidden">
              <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />
            </div>
          );
        }
        return (
          <div key={idx} className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 border border-neutral-200">
            <span className="text-sm">영상: {block.url}</span>
          </div>
        );
      }
      return null;
    default:
      return null;
  }
}
