import React, { useState } from 'react';
import { Icons } from '../../data/links';
import { BlogEditor } from '../views/BlogEditor';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

const EMOJI_OPTIONS = ['📋', '👗', '📸', '💄', '🧘', '👟', '🪪', '👔', '🎨', '📦', '🎬', '💡', '🐾', '👶', '💐'];

export function GuideCardSection({ config, updateConfig, blogs, setBlogs, showToast, activeTab }) {
  const guide = config.guide;
  const [editingCardId, setEditingCardId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const update = (newGuide) => updateConfig('guide', newGuide);

  // 가이드 카드별 블로그 데이터 키
  const blogKey = `guide-${activeTab}`;
  const guideBlogs = blogs[blogKey] || [];

  const addCard = () => {
    const newCard = {
      id: `guide-${Date.now()}`,
      emoji: '📋',
      title: '',
      subtitle: '',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
      blogId: null,
    };
    update({ ...guide, cards: [...guide.cards, newCard] });
    showToast('가이드 카드가 추가되었습니다.');
  };

  const updateCard = (id, fields) => {
    update({ ...guide, cards: guide.cards.map(c => c.id === id ? { ...c, ...fields } : c) });
  };

  const removeCard = (id) => {
    update({ ...guide, cards: guide.cards.filter(c => c.id !== id) });
    showToast('카드가 삭제되었습니다.');
  };

  // 카드에 블로그 콘텐츠 생성/편집
  const handleEditContent = (cardId) => {
    const card = guide.cards.find(c => c.id === cardId);
    if (!card) return;

    // 이미 연결된 블로그가 있으면 편집
    if (card.blogId && guideBlogs.find(b => b.id === card.blogId)) {
      setEditingCardId(cardId);
      setIsEditorOpen(true);
      return;
    }

    // 새 블로그 생성
    const newId = Date.now();
    const newBlog = {
      id: newId,
      title: `${card.title} ${card.subtitle}`.trim() || '가이드 콘텐츠',
      tag: config.header.tabLabel,
      date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1),
      views: 0,
      blocks: [],
    };
    setBlogs(prev => ({
      ...prev,
      [blogKey]: [newBlog, ...(prev[blogKey] || [])],
    }));
    updateCard(cardId, { blogId: newId });
    showToast('가이드 콘텐츠가 생성되었습니다.');
    setTimeout(() => {
      setEditingCardId(cardId);
      setIsEditorOpen(true);
    }, 50);
  };

  const handleSaveBlog = (updatedPost) => {
    const card = guide.cards.find(c => c.id === editingCardId);
    if (!card) return;
    setBlogs(prev => ({
      ...prev,
      [blogKey]: (prev[blogKey] || []).map(b => b.id === card.blogId ? { ...b, ...updatedPost } : b),
    }));
    showToast('콘텐츠가 저장되었습니다.');
    setIsEditorOpen(false);
    setTimeout(() => setEditingCardId(null), 300);
  };

  const getEditingBlog = () => {
    const card = guide.cards.find(c => c.id === editingCardId);
    if (!card?.blogId) return null;
    return guideBlogs.find(b => b.id === card.blogId);
  };

  return (
    <div className="space-y-4">
      {/* Guide Title */}
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">가이드 타이틀</label>
        <input
          value={guide.title}
          onChange={(e) => update({ ...guide, title: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="가족사진 촬영 가이드"
        />
      </div>

      {/* Cards */}
      {guide.cards.map((card, idx) => (
        <div key={card.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 relative group">
          <button onClick={() => removeCard(card.id)} className="absolute top-2 right-2 p-1.5 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
            <Icon name="Trash2" size={14} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-500">카드 {idx + 1}</span>
            {card.blogId && <span className="text-[9px] font-bold bg-lime-400/20 text-lime-400 px-1.5 py-0.5 rounded">콘텐츠 연결됨</span>}
          </div>

          {/* Emoji picker */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 mb-1 block">아이콘</label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => updateCard(card.id, { emoji: e })}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${card.emoji === e ? 'bg-lime-400/20 ring-2 ring-lime-400 scale-110' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                >{e}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-500 mb-1 block">제목</label>
              <input value={card.title} onChange={(e) => updateCard(card.id, { title: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50 transition-colors" placeholder="한눈에 보는 가족사진" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-500 mb-1 block">서브 문구</label>
              <input value={card.subtitle} onChange={(e) => updateCard(card.id, { subtitle: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50 transition-colors" placeholder="A-Z 촬영 가이드" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-500 mb-1 block">배경색 (Hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={card.bgColor} onChange={(e) => updateCard(card.id, { bgColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                <input value={card.bgColor} onChange={(e) => updateCard(card.id, { bgColor: e.target.value })}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-lime-500/50 font-mono" placeholder="#f0fdf4" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-500 mb-1 block">테두리색 (Hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={card.borderColor} onChange={(e) => updateCard(card.id, { borderColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                <input value={card.borderColor} onChange={(e) => updateCard(card.id, { borderColor: e.target.value })}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-lime-500/50 font-mono" placeholder="#dcfce7" />
              </div>
            </div>
          </div>

          {/* Blog content button */}
          <button
            onClick={() => handleEditContent(card.id)}
            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
              card.blogId
                ? 'bg-lime-400/10 border-lime-500/30 text-lime-400 hover:bg-lime-400/20'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-lime-400 hover:border-lime-500/50'
            }`}
          >
            <Icon name={card.blogId ? 'PencilRuler' : 'FileText'} size={14} />
            {card.blogId ? '콘텐츠 편집하기' : '콘텐츠 작성하기'}
          </button>
        </div>
      ))}

      <button onClick={addCard} className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex items-center justify-center gap-2">
        <Icon name="Plus" size={16} /> 가이드 카드 추가
      </button>

      {/* Blog Editor Modal */}
      {isEditorOpen && editingCardId && (
        <div className="fixed inset-0 flex items-end justify-center bg-black/70 backdrop-blur-sm z-[200]">
          <div className="w-full max-w-5xl h-[92vh] bg-neutral-900 border-x border-t border-neutral-800/80 rounded-t-[2rem] shadow-2xl flex flex-col pb-safe">
            <div className="flex justify-center pt-5 pb-3 w-full cursor-pointer hover:bg-neutral-800/30 transition-colors rounded-t-[2rem]" onClick={() => setIsEditorOpen(false)}>
              <div className="w-16 h-1.5 bg-neutral-700/80 rounded-full"></div>
            </div>
            <div className="flex-1 h-full w-full">
              <BlogEditor
                initialData={getEditingBlog()}
                onSave={handleSaveBlog}
                onClose={() => {
                  setIsEditorOpen(false);
                  setTimeout(() => setEditingCardId(null), 300);
                }}
                showToast={showToast}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
