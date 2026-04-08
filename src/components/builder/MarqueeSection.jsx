import React from 'react';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

const createDefaultRow = () => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  direction: 'left',
  speed: 30,
  height: 60,
  logos: [],
});

export function MarqueeSection({ config, updateConfig, showToast, sectionId }) {
  const data = config.marqueeData?.[sectionId] || { title: '', rows: [createDefaultRow()] };
  const { title, rows } = data;

  const update = (newData) => {
    updateConfig('marqueeData', {
      ...(config.marqueeData || {}),
      [sectionId]: { ...data, ...newData },
    });
  };

  const updateRow = (rowId, changes) => {
    update({ rows: rows.map(r => r.id === rowId ? { ...r, ...changes } : r) });
  };

  const addRow = () => {
    if (rows.length >= 3) { showToast('최대 3줄까지 추가할 수 있습니다.'); return; }
    update({ rows: [...rows, createDefaultRow()] });
  };

  const deleteRow = (rowId) => {
    if (rows.length <= 1) { showToast('최소 1줄은 필요합니다.'); return; }
    update({ rows: rows.filter(r => r.id !== rowId) });
  };

  const addLogos = async (rowId, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    showToast('로고 업로드 중...');
    const row = rows.find(r => r.id === rowId);
    const newLogos = [];
    for (const file of files) {
      const url = await uploadCompressed(file, 'marquee');
      newLogos.push({
        id: `logo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url,
        alt: file.name.replace(/\.[^.]+$/, ''),
      });
    }
    updateRow(rowId, { logos: [...(row?.logos || []), ...newLogos] });
    showToast(`${newLogos.length}개 로고 추가 완료`);
  };

  const deleteLogo = (rowId, logoId) => {
    const row = rows.find(r => r.id === rowId);
    updateRow(rowId, { logos: (row?.logos || []).filter(l => l.id !== logoId) });
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">제목 (선택)</label>
        <input
          value={title}
          onChange={(e) => update({ title: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="우리와 함께한 로펌"
        />
      </div>

      {/* 줄 목록 */}
      {rows.map((row, idx) => (
        <div key={row.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300">{idx + 1}번째 줄</span>
            <button
              onClick={() => deleteRow(row.id)}
              className="text-neutral-500 hover:text-red-400 transition-colors"
            >
              <Icon name="Trash2" size={14} />
            </button>
          </div>

          {/* 방향 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-500 w-10 shrink-0">방향</span>
            <div className="flex gap-1">
              {['left', 'right'].map(dir => (
                <button
                  key={dir}
                  onClick={() => updateRow(row.id, { direction: dir })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    row.direction === dir
                      ? 'bg-lime-400 text-black'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {dir === 'left' ? '← 왼쪽' : '오른쪽 →'}
                </button>
              ))}
            </div>
          </div>

          {/* 속도 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-500 w-10 shrink-0">속도</span>
            <input
              type="range"
              min={10} max={60} step={5}
              value={row.speed}
              onChange={(e) => updateRow(row.id, { speed: Number(e.target.value) })}
              className="flex-1 accent-lime-400"
            />
            <span className="text-[11px] text-neutral-400 w-10 text-right">{row.speed}초</span>
          </div>

          {/* 높이 */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-500 w-10 shrink-0">높이</span>
            <input
              type="range"
              min={30} max={120} step={5}
              value={row.height}
              onChange={(e) => updateRow(row.id, { height: Number(e.target.value) })}
              className="flex-1 accent-lime-400"
            />
            <span className="text-[11px] text-neutral-400 w-10 text-right">{row.height}px</span>
          </div>

          {/* 로고 목록 */}
          <div className="flex flex-wrap gap-2">
            {(row.logos || []).map(logo => (
              <div key={logo.id} className="relative group w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={logo.url} alt={logo.alt} className="max-w-full max-h-full object-contain p-1" />
                <button
                  onClick={() => deleteLogo(row.id, logo.id)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="X" size={10} className="text-white" />
                </button>
              </div>
            ))}
            <label className="w-16 h-16 border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-lime-500/50 transition-colors">
              <Icon name="Plus" size={16} className="text-neutral-500" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addLogos(row.id, e)}
              />
            </label>
          </div>
        </div>
      ))}

      {/* 줄 추가 */}
      {rows.length < 3 && (
        <button
          onClick={addRow}
          className="w-full py-2.5 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex items-center justify-center gap-2"
        >
          <Icon name="Plus" size={14} /> 줄 추가 ({rows.length}/3)
        </button>
      )}
    </div>
  );
}
