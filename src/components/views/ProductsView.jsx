import React, { useState } from 'react';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

export function ProductsView({ products, setProducts, showToast }) {
    const [editingProduct, setEditingProduct] = useState(null);

    const handleAddProduct = () => {
        const newProduct = {
            id: Date.now(),
            title: '새로운 촬영 상품',
            desc: '상품에 대한 자세한 설명을 입력해주세요.',
            bg: 'bg-neutral-800',
            ratio: '16:9',
            image: null
        };
        setProducts([...products, newProduct]);
        showToast('새 상품이 등록되었습니다.');
    };

    const handleDeleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
        showToast('해당 상품이 삭제되었습니다.');
    };

    const handleSaveEdit = (editedProduct) => {
        setProducts(products.map(p => p.id === editedProduct.id ? editedProduct : p));
        setEditingProduct(null);
        showToast('상품 정보가 성공적으로 수정되었습니다.');
    };

    return (
        <div className="space-y-6 slide-in-from-bottom-4">
            <div className="flex justify-between items-center bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">등록된 상품 카테고리</h3>
                    <p className="text-sm text-neutral-400">스튜디오에서 제공하는 전체 촬영 상품을 관리합니다.</p>
                </div>
                <button onClick={handleAddProduct} className="bg-lime-400 text-neutral-950 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-lime-500 transition-colors">
                    <Icon name="Plus" size={18} /> 새 상품 추가
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-neutral-700 transition-all flex flex-col">
                        <div className={`${p.ratio === '1:1' ? 'aspect-square' : p.ratio === '4:5' ? 'aspect-[4/5]' : 'aspect-video'} ${p.bg} flex items-center justify-center relative shrink-0 overflow-hidden`}>
                            {p.image ? (
                                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <Icon name="Image" size={32} className="text-neutral-700" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                <button onClick={() => setEditingProduct(p)} className="p-3 bg-neutral-900/90 rounded-full text-white hover:text-lime-400 shadow-lg"><Icon name="Settings" size={20} /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-neutral-900/90 rounded-full text-white hover:text-red-400 shadow-lg"><Icon name="Trash2" size={20} /></button>
                            </div>
                        </div>
                        <div className="p-5 flex-1">
                            <h4 className="text-lg font-bold text-white mb-2">{p.title}</h4>
                            <p className="text-sm text-neutral-400 line-clamp-3">{p.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 상품 편집 모달 */}
            {editingProduct && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-white">상품 상세 편집</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-neutral-400 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-neutral-400 uppercase">썸네일 비율 (미리보기 연동)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: '16:9 (기본)', value: '16:9' },
                                        { label: '1:1 (정방형)', value: '1:1' },
                                        { label: '4:5 (세로형)', value: '4:5' }
                                    ].map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => setEditingProduct({ ...editingProduct, ratio: r.value })}
                                            className={`py-3 rounded-xl border text-sm font-medium transition-colors ${editingProduct.ratio === r.value || (!editingProduct.ratio && r.value === '16:9') ? 'bg-lime-400 text-neutral-950 border-lime-400' : 'bg-neutral-950 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:border-neutral-500'}`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-neutral-400 uppercase">썸네일 이미지 (자동 최적화)</label>
                                <input type="file" id="product-img-upload" accept="image/*" className="hidden" onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        showToast('이미지 압축 및 최적화 중...');
                                        const url = await uploadCompressed(e.target.files[0], 'products');
                                        setEditingProduct({ ...editingProduct, image: url });
                                        showToast('고화질 썸네일이 적용되었습니다.');
                                    }
                                }} />
                                <label htmlFor="product-img-upload" className={`bg-neutral-950 border border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-lime-400 cursor-pointer transition-all duration-300 overflow-hidden
                  ${editingProduct.ratio === '1:1' ? 'aspect-square w-1/2 mx-auto' : editingProduct.ratio === '4:5' ? 'aspect-[4/5] w-1/2 mx-auto' : 'aspect-video w-full'}
                `}>
                                    {editingProduct.image ? (
                                        <img src={editingProduct.image} className="w-full h-full object-cover" alt="Product" />
                                    ) : (
                                        <><Icon name="Image" size={32} /><span className="text-xs font-medium">클릭하여 이미지 변경 (최대 10MB)</span></>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-400 uppercase">상품명</label>
                                <input type="text" value={editingProduct.title} onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-400 uppercase">상품 설명</label>
                                <textarea rows="4" value={editingProduct.desc} onChange={e => setEditingProduct({ ...editingProduct, desc: e.target.value })} className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors resize-none custom-scrollbar"></textarea>
                            </div>
                        </div>

                        <div className="p-6 border-t border-neutral-800 flex justify-end gap-3 bg-neutral-950 shrink-0">
                            <button onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl font-medium text-neutral-400 hover:text-white transition-colors">취소</button>
                            <button onClick={() => handleSaveEdit(editingProduct)} className="bg-lime-400 text-neutral-950 px-5 py-2.5 rounded-xl font-bold hover:bg-lime-500 transition-colors">변경사항 저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
