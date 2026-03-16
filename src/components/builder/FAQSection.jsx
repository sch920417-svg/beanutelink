import React from 'react';
import { Icons } from '../../data/links';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function FAQSection({ config, updateConfig, showToast }) {
  const faq = config.faq;

  const update = (newFaq) => updateConfig('faq', newFaq);

  const addItem = () => {
    const newItem = { id: `faq-${Date.now()}`, question: '', answer: '' };
    update({ ...faq, items: [...faq.items, newItem] });
    showToast('FAQ 항목이 추가되었습니다.');
  };

  const updateItem = (id, fields) => {
    update({ ...faq, items: faq.items.map(item => item.id === id ? { ...item, ...fields } : item) });
  };

  const removeItem = (id) => {
    update({ ...faq, items: faq.items.filter(item => item.id !== id) });
    showToast('FAQ 항목이 삭제되었습니다.');
  };

  const moveItem = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faq.items.length) return;
    const newItems = [...faq.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    update({ ...faq, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">섹션 타이틀</label>
        <input
          value={faq.title}
          onChange={(e) => update({ ...faq, title: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="자주 묻는 질문"
        />
      </div>

      <div className="space-y-2">
        {faq.items.map((item, idx) => (
          <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2 relative group">
            {/* Controls */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {idx > 0 && <button onClick={() => moveItem(idx, 'up')} className="p-1 text-neutral-500 hover:text-white"><Icon name="ChevronUp" size={12} /></button>}
              {idx < faq.items.length - 1 && <button onClick={() => moveItem(idx, 'down')} className="p-1 text-neutral-500 hover:text-white"><Icon name="ChevronDown" size={12} /></button>}
              <button onClick={() => removeItem(item.id)} className="p-1 text-neutral-500 hover:text-red-400"><Icon name="Trash2" size={12} /></button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold text-xs">Q.</span>
              <input
                value={item.question}
                onChange={(e) => updateItem(item.id, { question: e.target.value })}
                className="flex-1 bg-transparent text-white text-sm font-bold outline-none placeholder-neutral-600"
                placeholder="질문을 입력하세요"
              />
            </div>

            <textarea
              value={item.answer}
              onChange={(e) => updateItem(item.id, { answer: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm outline-none focus:border-lime-500/50 resize-none min-h-[50px] transition-colors"
              placeholder="답변을 입력하세요"
            />
          </div>
        ))}
      </div>

      <button onClick={addItem} className="w-full py-2.5 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex items-center justify-center gap-2">
        <Icon name="Plus" size={14} /> FAQ 추가
      </button>
    </div>
  );
}
