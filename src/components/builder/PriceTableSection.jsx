import React, { useRef, useState } from 'react';
import { uploadCompressed } from '../../services/storage';

export function PriceTableSection({ config, updateConfig, showToast }) {
  const products = config.quoteBuilder.products;
  const additionalOptions = config.quoteBuilder.additionalOptions;
  const priceTable = config.priceTable || {};
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const updatePriceTable = (fields) => {
    updateConfig('priceTable', { ...priceTable, ...fields });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadCompressed(file, 'priceTable');
      updatePriceTable({ image: url });
      showToast('가격표 이미지가 업로드되었습니다.');
    } catch (err) {
      console.error('가격표 이미지 업로드 실패:', err);
      showToast('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    updatePriceTable({ image: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('가격표 이미지가 삭제되었습니다.');
  };

  // 이미지 업로드 UI (공통)
  const ImageUploadBlock = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-base">🖼️</span> 가격표 이미지
        </h4>
      </div>
      <p className="text-[11px] text-neutral-500 mb-2">가격표를 직접 디자인한 이미지를 업로드하면 고객 페이지에 표시됩니다.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {uploading ? (
        <div className="w-full py-6 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-neutral-500 border-t-lime-400 rounded-full animate-spin" />
          <span className="text-xs text-neutral-400">업로드 중...</span>
        </div>
      ) : priceTable.image ? (
        <div className="space-y-2">
          <div className="rounded-xl overflow-hidden border border-neutral-800 w-full max-w-[200px]">
            <img src={priceTable.image} alt="가격표 미리보기" className="w-full h-auto" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-neutral-400 hover:text-lime-400 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 transition-colors"
            >
              이미지 변경
            </button>
            <button
              onClick={removeImage}
              className="text-xs font-bold text-neutral-400 hover:text-red-400 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-6 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex flex-col items-center justify-center gap-2"
        >
          <span className="text-2xl">📷</span>
          <span>클릭하여 이미지 업로드</span>
          <span className="text-[10px] text-neutral-600 font-normal">PNG, JPG, WEBP 지원</span>
        </button>
      )}
    </div>
  );

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <ImageUploadBlock />
        <div className="text-center py-4 text-neutral-500 text-sm">
          <p>견적 계산기 섹션에서 상품을 먼저 추가해주세요.</p>
          <p className="text-xs mt-1 text-neutral-600">상품 데이터 기반으로 가격표가 자동 생성됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ImageUploadBlock />

      <p className="text-xs text-neutral-500">견적 계산기에 등록된 상품 정보를 기반으로 고객에게 보여지는 가격표입니다.</p>

      {/* Preview Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-900">
              <th className="text-left px-4 py-3 text-neutral-400 font-bold text-xs border-b border-neutral-800">항목</th>
              {products.map(p => (
                <th key={p.id} className="text-center px-4 py-3 text-white font-bold text-xs border-b border-neutral-800">{p.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-800/50">
              <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">기준인원</td>
              {products.map(p => <td key={p.id} className="text-center px-4 py-2.5 text-white text-xs">{p.basePeople}인</td>)}
            </tr>
            <tr className="border-b border-neutral-800/50">
              <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">주중/평일</td>
              {products.map(p => <td key={p.id} className="text-center px-4 py-2.5 text-white text-xs">{p.weekdayPrice.toLocaleString()}원</td>)}
            </tr>
            <tr className="border-b border-neutral-800/50">
              <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">주말/공휴일</td>
              {products.map(p => <td key={p.id} className="text-center px-4 py-2.5 text-white text-xs">{p.weekendPrice.toLocaleString()}원</td>)}
            </tr>
            <tr className="border-b border-neutral-800/50">
              <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">보정본</td>
              {products.map(p => <td key={p.id} className="text-center px-4 py-2.5 text-white text-xs">{p.retouchedPhotos}장</td>)}
            </tr>
            <tr className="border-b border-neutral-800/50">
              <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">액자</td>
              {products.map(p => <td key={p.id} className="text-center px-4 py-2.5 text-white text-xs">{p.frame || '-'}</td>)}
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">고화질 원본</td>
              {products.map(p => <td key={p.id} className="text-center px-4 py-2.5 text-lime-400 text-xs font-medium">{p.originalIncluded ? '무료' : '-'}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Options Preview */}
      {additionalOptions.length > 0 && (
        <div className="mt-3">
          <h5 className="text-xs font-bold text-neutral-400 mb-2">옵션</h5>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-sm">
              <tbody>
                {additionalOptions.map((opt, idx) => (
                  <tr key={opt.id} className={idx < additionalOptions.length - 1 ? 'border-b border-neutral-800/50' : ''}>
                    <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium w-1/3">{opt.label}</td>
                    <td className="px-4 py-2.5 text-white text-xs">{opt.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-neutral-600 italic">※ 가격표 데이터는 견적 계산기 섹션의 상품 정보와 연동됩니다.</p>
    </div>
  );
}
