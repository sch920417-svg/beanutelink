import React from 'react';

export function FramePriceSection({ config, updateConfig, showToast }) {
  const fp = config.framePrice || {};
  const tables = fp.tables || [];

  const updateFramePrice = (fields) => {
    updateConfig('framePrice', { ...fp, ...fields });
  };

  const updateTable = (tableId, fields) => {
    updateFramePrice({
      tables: tables.map(t => t.id === tableId ? { ...t, ...fields } : t),
    });
  };

  const updateRow = (tableId, rowIndex, fields) => {
    updateFramePrice({
      tables: tables.map(t =>
        t.id === tableId
          ? { ...t, rows: t.rows.map((r, i) => i === rowIndex ? { ...r, ...fields } : r) }
          : t
      ),
    });
  };

  const addRow = (tableId) => {
    updateFramePrice({
      tables: tables.map(t =>
        t.id === tableId
          ? { ...t, rows: [...t.rows, { size: '', cm: '', price: 0 }] }
          : t
      ),
    });
  };

  const removeRow = (tableId, rowIndex) => {
    updateFramePrice({
      tables: tables.map(t =>
        t.id === tableId
          ? { ...t, rows: t.rows.filter((_, i) => i !== rowIndex) }
          : t
      ),
    });
  };

  const addTable = () => {
    const newId = `table_${Date.now()}`;
    updateFramePrice({
      tables: [...tables, { id: newId, name: '새 테이블', rows: [{ size: '', cm: '', price: 0 }] }],
    });
  };

  const removeTable = (tableId) => {
    updateFramePrice({
      tables: tables.filter(t => t.id !== tableId),
    });
  };

  return (
    <div className="space-y-5">
      {/* 제목 */}
      <div>
        <label className="text-[11px] font-bold text-neutral-500 mb-1 block">섹션 제목</label>
        <input
          type="text"
          value={fp.title || ''}
          onChange={(e) => updateFramePrice({ title: e.target.value })}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50"
        />
      </div>

      {/* 안내 문구 */}
      <div>
        <label className="text-[11px] font-bold text-neutral-500 mb-1 block">안내 문구</label>
        <input
          type="text"
          value={fp.notice || ''}
          onChange={(e) => updateFramePrice({ notice: e.target.value })}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50"
        />
      </div>

      {/* 테이블별 편집 */}
      {tables.map((table) => (
        <div key={table.id} className="space-y-3 relative">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-neutral-500 mb-1 block">테이블 이름</label>
              <input
                type="text"
                value={table.name || ''}
                onChange={(e) => updateTable(table.id, { name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50"
              />
            </div>
            <button
              onClick={() => removeTable(table.id)}
              className="shrink-0 mb-0.5 w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-800 text-neutral-500 hover:text-red-400 hover:border-red-400/30 transition-colors"
              title="테이블 삭제"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-900">
                  <th className="text-left px-3 py-2 text-neutral-400 font-bold text-xs border-b border-neutral-800">R 규격</th>
                  <th className="text-left px-3 py-2 text-neutral-400 font-bold text-xs border-b border-neutral-800">cm 사이즈</th>
                  <th className="text-right px-3 py-2 text-neutral-400 font-bold text-xs border-b border-neutral-800">가격 (원)</th>
                  <th className="w-8 border-b border-neutral-800"></th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-neutral-800/50 last:border-0">
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={row.size}
                        onChange={(e) => updateRow(table.id, idx, { size: e.target.value })}
                        className="w-full bg-transparent text-white text-xs outline-none"
                        placeholder="5R"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={row.cm}
                        onChange={(e) => updateRow(table.id, idx, { cm: e.target.value })}
                        className="w-full bg-transparent text-white text-xs outline-none"
                        placeholder="약 13x18 cm"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateRow(table.id, idx, { price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-white text-xs outline-none text-right"
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <button
                        onClick={() => removeRow(table.id, idx)}
                        className="text-neutral-600 hover:text-red-400 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => addRow(table.id)}
            className="text-xs font-bold text-neutral-500 hover:text-lime-400 transition-colors"
          >
            + 행 추가
          </button>
        </div>
      ))}

      {/* 테이블 추가 */}
      <button
        onClick={addTable}
        className="w-full py-2.5 rounded-xl border border-dashed border-neutral-700 text-neutral-500 hover:text-lime-400 hover:border-lime-400/30 transition-colors text-xs font-bold"
      >
        + 테이블 추가
      </button>
    </div>
  );
}
