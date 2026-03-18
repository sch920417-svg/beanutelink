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
        <div key={table.id} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-neutral-500 mb-1 block">테이블 이름</label>
            <input
              type="text"
              value={table.name || ''}
              onChange={(e) => updateTable(table.id, { name: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-lime-500/50"
            />
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
    </div>
  );
}
