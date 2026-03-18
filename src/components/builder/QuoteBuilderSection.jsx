import React, { useState } from 'react';
import { Icons } from '../../data/links';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

const EVENT_EMOJI_OPTIONS = ['🎉', '🎁', '🎊', '🏷️', '💝', '⭐', '🔥', '💐', '🎀', '✨', '🌟', '📢', '💫', '🎈', '💸'];

export function QuoteBuilderSection({ config, updateConfig, showToast }) {
  const qb = config.quoteBuilder;
  const [expandedProduct, setExpandedProduct] = useState(null);

  const update = (newQb) => updateConfig('quoteBuilder', newQb);

  // ─── Products ───
  const addProduct = () => {
    const newP = {
      id: `prod-${Date.now()}`, title: '', subtitle: '', basePeople: 1,
      weekdayPrice: 0, weekendPrice: 0, retouchedPhotos: 0, frame: '',
      originalIncluded: true, eventNote: '',
    };
    update({ ...qb, products: [...qb.products, newP] });
    setExpandedProduct(newP.id);
    showToast('촬영 상품이 추가되었습니다.');
  };

  const updateProduct = (id, fields) => {
    update({ ...qb, products: qb.products.map(p => p.id === id ? { ...p, ...fields } : p) });
  };

  const removeProduct = (id) => {
    update({ ...qb, products: qb.products.filter(p => p.id !== id) });
    showToast('상품이 삭제되었습니다.');
  };

  // ─── Additional Options ───
  const addAdditionalOption = () => {
    update({ ...qb, additionalOptions: [...qb.additionalOptions, { id: `ao-${Date.now()}`, label: '', price: '' }] });
  };

  const updateAdditionalOption = (id, fields) => {
    update({ ...qb, additionalOptions: qb.additionalOptions.map(o => o.id === id ? { ...o, ...fields } : o) });
  };

  const removeAdditionalOption = (id) => {
    update({ ...qb, additionalOptions: qb.additionalOptions.filter(o => o.id !== id) });
  };

  // ─── Quote Fields Visibility + Order ───
  const FIELD_META = {
    people: { label: '인원 선택', icon: '👥', description: '총 인원 드롭다운 표시' },
    pets: { label: '반려동물', icon: '🐾', description: '반려동물 수 선택 표시' },
    retouchedPhotos: { label: '보정본', icon: '📷', description: '견적서에 보정본 장수 표시' },
    frame: { label: '액자 정보', icon: '🖼️', description: '견적서에 액자 정보 표시' },
    originalPhoto: { label: '고화질 원본', icon: '📸', description: '견적서에 원본 제공 표시' },
  };

  const DEFAULT_FIELDS = [
    { key: 'people', enabled: true },
    { key: 'pets', enabled: true },
    { key: 'retouchedPhotos', enabled: true },
    { key: 'frame', enabled: true },
    { key: 'originalPhoto', enabled: true },
  ];

  // 기존 객체 형태 → 배열로 마이그레이션
  const quoteFields = Array.isArray(qb.quoteFields)
    ? qb.quoteFields
    : DEFAULT_FIELDS.map(f => ({
        key: f.key,
        enabled: qb.quoteFields?.[f.key] ?? f.enabled,
      }));

  const updateFields = (newFields) => {
    update({ ...qb, quoteFields: newFields });
  };

  const toggleField = (key) => {
    updateFields(quoteFields.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const moveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= quoteFields.length) return;
    const arr = [...quoteFields];
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    updateFields(arr);
  };

  return (
    <div className="space-y-6">
      {/* ─── QUOTE FIELDS VISIBILITY ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-base">🎛️</span> 견적서 항목 표시 설정
          </h4>
        </div>
        <p className="text-[11px] text-neutral-500 mb-3">고객 견적서에서 표시할 항목을 ON/OFF하고, 화살표로 순서를 변경할 수 있습니다.</p>

        <div className="space-y-1.5">
          {quoteFields.map((field, idx) => {
            const meta = FIELD_META[field.key];
            if (!meta) return null;
            return (
              <div
                key={field.key}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                  field.enabled
                    ? 'bg-lime-400/10 border-lime-500/30'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                {/* 순서 번호 */}
                <span className="text-[10px] font-bold text-neutral-600 w-4 text-center">{idx + 1}</span>

                {/* 위/아래 화살표 */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveField(idx, -1)}
                    disabled={idx === 0}
                    className="text-neutral-500 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <Icon name="ChevronUp" size={14} />
                  </button>
                  <button
                    onClick={() => moveField(idx, 1)}
                    disabled={idx === quoteFields.length - 1}
                    className="text-neutral-500 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <Icon name="ChevronDown" size={14} />
                  </button>
                </div>

                {/* 아이콘 + 라벨 */}
                <span className="text-lg">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${field.enabled ? 'text-lime-400' : 'text-neutral-500'}`}>
                      {meta.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      field.enabled ? 'bg-lime-400/20 text-lime-400' : 'bg-neutral-800 text-neutral-600'
                    }`}>
                      {field.enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-600 mt-0.5 truncate">{meta.description}</p>
                </div>

                {/* ON/OFF 토글 */}
                <button
                  onClick={() => toggleField(field.key)}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    field.enabled ? 'bg-lime-500' : 'bg-neutral-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    field.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SURCHARGE SETTINGS ─── */}
      {(quoteFields.some(f => f.key === 'people' && f.enabled) || quoteFields.some(f => f.key === 'pets' && f.enabled)) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-base">💲</span> 추가 요금 설정
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {quoteFields.some(f => f.key === 'people' && f.enabled) && (
              <div>
                <label className="text-[11px] font-bold text-neutral-500 mb-1 block">인원 추가 (1인당)</label>
                <input type="number" value={qb.extraPersonCost || 0}
                  onChange={(e) => update({ ...qb, extraPersonCost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
              </div>
            )}
            {quoteFields.some(f => f.key === 'pets' && f.enabled) && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 mb-1 block">반려동물 무료 (마리)</label>
                  <input type="number" value={qb.petFreeCount || 0}
                    onChange={(e) => update({ ...qb, petFreeCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 mb-1 block">반려동물 추가 (1마리)</label>
                  <input type="number" value={qb.petExtraCost || 0}
                    onChange={(e) => update({ ...qb, petExtraCost: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── PRODUCTS ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-base">📷</span> 촬영 상품
          </h4>
          <span className="text-[11px] text-neutral-500">{qb.products.length}개</span>
        </div>

        <div className="space-y-2">
          {qb.products.map((product) => (
            <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              {/* Product Header */}
              <button
                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{product.title || '새 상품'}</span>
                  <span className="text-xs text-neutral-500">{product.subtitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span onClick={(e) => { e.stopPropagation(); removeProduct(product.id); }} className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer">
                    <Icon name="Trash2" size={14} />
                  </span>
                  <Icon name={expandedProduct === product.id ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-neutral-500" />
                </div>
              </button>

              {/* Product Detail */}
              {expandedProduct === product.id && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">상품명</label>
                      <input value={product.title} onChange={(e) => updateProduct(product.id, { title: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" placeholder="가족사진" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">부제</label>
                      <input value={product.subtitle} onChange={(e) => updateProduct(product.id, { subtitle: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" placeholder="3인 이상" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">기준인원</label>
                      <input type="number" value={product.basePeople} onChange={(e) => updateProduct(product.id, { basePeople: parseInt(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">주중가 (원)</label>
                      <input type="number" value={product.weekdayPrice} onChange={(e) => updateProduct(product.id, { weekdayPrice: parseInt(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">주말가 (원)</label>
                      <input type="number" value={product.weekendPrice} onChange={(e) => updateProduct(product.id, { weekendPrice: parseInt(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
                    </div>
                  </div>
                  {/* 인원 설정 */}
                  {quoteFields.people && (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400">👥 인원 설정</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.fixedPeople ?? (product.basePeople <= 2)}
                          onChange={(e) => updateProduct(product.id, { fixedPeople: e.target.checked })}
                          className="rounded border-neutral-700 bg-neutral-950 text-lime-500 focus:ring-lime-500"
                        />
                        <span className="text-xs text-neutral-400">인원 고정 (선택 불가)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">시작 인원</label>
                          <input
                            type="number"
                            value={product.minPeople ?? product.basePeople ?? 1}
                            onChange={(e) => updateProduct(product.id, { minPeople: parseInt(e.target.value) || 1 })}
                            disabled={product.fixedPeople ?? (product.basePeople <= 2)}
                            className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-lime-500/50 ${
                              (product.fixedPeople ?? (product.basePeople <= 2)) ? 'text-neutral-600 opacity-50' : 'text-white'
                            }`}
                            min={1}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">최대 인원</label>
                          <input
                            type="number"
                            value={product.maxPeople ?? 30}
                            onChange={(e) => updateProduct(product.id, { maxPeople: parseInt(e.target.value) || 1 })}
                            disabled={product.fixedPeople ?? (product.basePeople <= 2)}
                            className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-lime-500/50 ${
                              (product.fixedPeople ?? (product.basePeople <= 2)) ? 'text-neutral-600 opacity-50' : 'text-white'
                            }`}
                            min={product.minPeople ?? product.basePeople ?? 1}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">추가비용 (1인)</label>
                          <input
                            type="number"
                            value={product.extraPersonCost ?? qb.extraPersonCost ?? 0}
                            onChange={(e) => updateProduct(product.id, { extraPersonCost: parseInt(e.target.value) || 0 })}
                            disabled={product.fixedPeople ?? (product.basePeople <= 2)}
                            className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-lime-500/50 ${
                              (product.fixedPeople ?? (product.basePeople <= 2)) ? 'text-neutral-600 opacity-50' : 'text-white'
                            }`}
                            min={0}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-600">
                        {(product.fixedPeople ?? (product.basePeople <= 2))
                          ? `인원이 ${product.basePeople || 1}인으로 고정됩니다.`
                          : `${product.minPeople ?? product.basePeople ?? 1}인 ~ ${product.maxPeople ?? 30}인 선택 가능 · 기준 ${product.basePeople}인 초과 시 1인당 ${(product.extraPersonCost ?? qb.extraPersonCost ?? 0).toLocaleString()}원 추가`
                        }
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">보정본</label>
                      <input type="number" value={product.retouchedPhotos} onChange={(e) => updateProduct(product.id, { retouchedPhotos: parseInt(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-neutral-500 mb-1 block">액자 사이즈</label>
                      <input value={product.frame} onChange={(e) => updateProduct(product.id, { frame: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" placeholder="16R(약 40x50cm)" />
                    </div>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-400">🎉 이벤트 블록</span>
                      <button
                        onClick={() => updateProduct(product.id, { showEvent: !(product.showEvent ?? false) })}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded transition-colors ${
                          (product.showEvent ?? false)
                            ? 'bg-lime-400/20 text-lime-400'
                            : 'bg-neutral-800 text-neutral-600'
                        }`}
                      >
                        {(product.showEvent ?? false) ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-600">ON이면 견적서 하단에 이벤트 안내가 노출됩니다.</p>
                    {(product.showEvent ?? false) && (
                      <div className="space-y-3">
                        {/* 아이콘 선택 */}
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">아이콘</label>
                          <div className="flex gap-1.5 flex-wrap">
                            {EVENT_EMOJI_OPTIONS.map(e => (
                              <button key={e} onClick={() => updateProduct(product.id, { eventEmoji: e })}
                                className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${(product.eventEmoji || '🎉') === e ? 'bg-lime-400/20 ring-2 ring-lime-400 scale-110' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                              >{e}</button>
                            ))}
                          </div>
                        </div>

                        {/* 제목 */}
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">제목</label>
                          <input value={product.eventTitle || ''} onChange={(e) => updateProduct(product.id, { eventTitle: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" placeholder="이벤트 안내" />
                        </div>

                        {/* 내용 */}
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">내용</label>
                          <textarea value={product.eventNote || ''} onChange={(e) => updateProduct(product.id, { eventNote: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50 resize-none min-h-[60px]" placeholder="마케팅 활용 동의 고객님께..." />
                        </div>

                        {/* 배경색 & 테두리색 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-neutral-500 mb-1 block">배경색 (Hex)</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={product.eventBgColor || '#fffbeb'} onChange={(e) => updateProduct(product.id, { eventBgColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                              <input value={product.eventBgColor || '#fffbeb'} onChange={(e) => updateProduct(product.id, { eventBgColor: e.target.value })}
                                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-lime-500/50 font-mono" placeholder="#fffbeb" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-neutral-500 mb-1 block">테두리색 (Hex)</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={product.eventBorderColor || '#fef3c7'} onChange={(e) => updateProduct(product.id, { eventBorderColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                              <input value={product.eventBorderColor || '#fef3c7'} onChange={(e) => updateProduct(product.id, { eventBorderColor: e.target.value })}
                                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-lime-500/50 font-mono" placeholder="#fef3c7" />
                            </div>
                          </div>
                        </div>

                        {/* 글자색 */}
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">글자색 (Hex)</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={product.eventTextColor || '#92400e'} onChange={(e) => updateProduct(product.id, { eventTextColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                            <input value={product.eventTextColor || '#92400e'} onChange={(e) => updateProduct(product.id, { eventTextColor: e.target.value })}
                              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-lime-500/50 font-mono" placeholder="#92400e" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={product.originalIncluded} onChange={(e) => updateProduct(product.id, { originalIncluded: e.target.checked })}
                      className="rounded border-neutral-700 bg-neutral-950 text-lime-500 focus:ring-lime-500" />
                    <span className="text-xs text-neutral-400">고화질 원본 무료 제공</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addProduct} className="w-full mt-2 py-2.5 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex items-center justify-center gap-2">
          <Icon name="Plus" size={14} /> 촬영 상품 추가
        </button>
      </div>

      {/* ─── ADDITIONAL OPTIONS ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-base">📦</span> 추가 옵션 (가격표 하단)
          </h4>
        </div>

        <div className="space-y-2">
          {qb.additionalOptions.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <input value={opt.label} onChange={(e) => updateAdditionalOption(opt.id, { label: e.target.value })}
                className="flex-1 bg-transparent text-white text-sm outline-none" placeholder="인원 추가" />
              <input value={opt.price} onChange={(e) => updateAdditionalOption(opt.id, { price: e.target.value })}
                className="w-36 bg-transparent text-lime-400 text-sm outline-none text-right font-medium" placeholder="22,000원(1인)" />
              <button onClick={() => removeAdditionalOption(opt.id)} className="p-1 text-neutral-500 hover:text-red-400 transition-colors">
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addAdditionalOption} className="w-full mt-2 py-2 text-xs font-bold text-neutral-400 hover:text-lime-400 border border-dashed border-neutral-800 rounded-lg hover:border-lime-500/50 transition-colors">
          + 옵션 추가
        </button>
      </div>

      {/* ─── CTA & DISCLAIMER ─── */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div>
          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">CTA 버튼 문구</label>
          <input value={qb.ctaText} onChange={(e) => update({ ...qb, ctaText: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" placeholder="카카오톡 채팅 상담하기 →" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">카카오톡 링크</label>
          <input value={qb.ctaUrl} onChange={(e) => update({ ...qb, ctaUrl: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50" placeholder="https://pf.kakao.com/..." />
        </div>
        <div>
          <label className="text-[11px] font-bold text-neutral-500 mb-1 block">하단 안내 문구</label>
          <input value={qb.disclaimer} onChange={(e) => update({ ...qb, disclaimer: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 text-sm outline-none focus:border-lime-500/50" placeholder="해당 견적 이외에 추가비용은..." />
        </div>
      </div>
    </div>
  );
}
