import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons, BLOCK_TYPES } from '../../data/links';
import { compressImage } from '../../utils';

const SortableBlockItem = ({ id, b, bType, setEditingBlock, handleDeleteBlock }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.8 : 1 };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-4 p-4 bg-neutral-950 border ${isDragging ? 'border-lime-500 shadow-2xl scale-105' : 'border-neutral-800'} rounded-xl group hover:border-neutral-700 transition-colors relative`}>
            <button {...attributes} {...listeners} className="text-neutral-600 hover:text-white cursor-grab active:cursor-grabbing"><Icon name="GripVertical" size={20} /></button>
            <div className="flex-1 flex items-center gap-4">
                <span className={`w-10 h-10 rounded-lg ${bType.color} flex items-center justify-center ${bType.iconColor} shadow-inner`}>
                    <Icon name={b.icon} size={18} />
                </span>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">{bType.label}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{b.title}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setEditingBlock(b)} className="p-2 text-neutral-400 hover:text-lime-400 rounded-lg hover:bg-neutral-900 transition-colors"><Icon name="Settings" size={18} /></button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => handleDeleteBlock(b.id)} className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition-colors"><Icon name="Trash2" size={18} /></button>
            </div>
        </div>
    );
};

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

export function EditorView({ blocks, setBlocks, showToast }) {
    const { productId } = useParams();
    const navigate = useNavigate();
    const currentProductId = productId || '1';

    // Get blocks for current product, or empty array if none
    const currentBlocks = blocks[currentProductId] || [];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = currentBlocks.findIndex(b => b.id === active.id);
            const newIndex = currentBlocks.findIndex(b => b.id === over.id);
            const newOrder = arrayMove(currentBlocks, oldIndex, newIndex);
            setBlocks({
                ...blocks,
                [currentProductId]: newOrder
            });
            showToast('블록 순서가 변경되었습니다.');
        }
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);

    const handleAddBlockType = (typeObj) => {
        const newBlock = {
            id: Date.now(),
            type: typeObj.id,
            title: `새로운 ${typeObj.label}`,
            icon: typeObj.icon,
            content: '',
            url: '',
            image: null
        };

        setBlocks({
            ...blocks,
            [currentProductId]: [...currentBlocks, newBlock]
        });

        setIsAddModalOpen(false);
        showToast(`${typeObj.label} 블록이 추가되었습니다.`);
    };

    const handleDeleteBlock = (id) => {
        setBlocks({
            ...blocks,
            [currentProductId]: currentBlocks.filter(b => b.id !== id)
        });
        showToast('블록이 삭제되었습니다.');
    };

    const handleSaveBlock = () => {
        setBlocks({
            ...blocks,
            [currentProductId]: currentBlocks.map(b => b.id === editingBlock.id ? editingBlock : b)
        });
        setEditingBlock(null);
        showToast('블록 설정이 저장되었습니다.');
    };

    const renderBlockSettingsForm = () => {
        if (!editingBlock) return null;

        const handleChange = (key, val) => setEditingBlock({ ...editingBlock, [key]: val });

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase">블록 식별 타이틀</label>
                    <input type="text" value={editingBlock.title} onChange={e => handleChange('title', e.target.value)} className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors" />
                </div>

                {/* 타입별 동적 폼 */}
                {(editingBlock.type === 'image' || editingBlock.type === 'slide' || editingBlock.type === 'collection') && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase">이미지 업로드 (자동 압축)</label>
                        <input type="file" id="block-img-upload" accept="image/*" className="hidden" onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                                showToast('이미지 처리중...');
                                const compressed = await compressImage(e.target.files[0]);
                                handleChange('image', compressed);
                            }
                        }} />
                        <label htmlFor="block-img-upload" className="bg-neutral-950 border border-neutral-700 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-lime-400 cursor-pointer overflow-hidden transition-all">
                            {editingBlock.image ? (
                                <img src={editingBlock.image} className="w-full h-full object-cover" alt="Block image" />
                            ) : (
                                <><Icon name="Image" size={32} /><span className="text-xs font-medium">클릭하여 이미지 업로드</span></>
                            )}
                        </label>
                    </div>
                )}

                {(editingBlock.type === 'text' || editingBlock.type === 'schedule') && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase">상세 내용</label>
                        <textarea rows="4" value={editingBlock.content || ''} onChange={e => handleChange('content', e.target.value)} placeholder="내용을 입력하세요." className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors resize-none"></textarea>
                    </div>
                )}

                {(editingBlock.type === 'link' || editingBlock.type === 'video') && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase">연결할 URL</label>
                        <input type="text" value={editingBlock.url || ''} onChange={e => handleChange('url', e.target.value)} placeholder="https://" className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors" />
                    </div>
                )}

                {(editingBlock.type === 'divider') && (
                    <div className="space-y-2 text-sm text-neutral-400">
                        구분선은 설정할 내용이 없습니다. 화면에 자동으로 선이 표시됩니다.
                    </div>
                )}

                {(editingBlock.type === 'diary') && (
                    <div className="space-y-2 text-sm text-neutral-400">
                        블로그/일기 데이터가 자동으로 연동되어 노출됩니다.
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 slide-in-from-bottom-4 flex flex-col items-center">
            {/* 상단 탭 */}
            <div className="w-full max-w-3xl flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                <button
                    onClick={() => navigate('/admin/editor/1')}
                    className={`px-6 py-2.5 font-bold rounded-xl border whitespace-nowrap transition-colors ${currentProductId === '1' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-transparent hover:bg-neutral-900 text-neutral-400 border-transparent font-medium'}`}
                >아이덴티티 포트레이트</button>
                <button
                    onClick={() => navigate('/admin/editor/2')}
                    className={`px-6 py-2.5 font-bold rounded-xl border whitespace-nowrap transition-colors ${currentProductId === '2' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-transparent hover:bg-neutral-900 text-neutral-400 border-transparent font-medium'}`}
                >헤리티지 패밀리</button>
                <button
                    onClick={() => navigate('/admin/editor/3')}
                    className={`px-6 py-2.5 font-bold rounded-xl border whitespace-nowrap transition-colors ${currentProductId === '3' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-transparent hover:bg-neutral-900 text-neutral-400 border-transparent font-medium'}`}
                >시즈널 커플 스냅</button>
            </div>

            {/* 1열 리스트 영역 */}
            <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">페이지 레이아웃 편집</h3>
                        <p className="text-sm text-neutral-400">블록을 추가하고 순서를 관리하세요.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors border border-neutral-700 shadow-sm">
                        <Icon name="Plus" size={16} /> 블록 추가
                    </button>
                </div>

                <div className="space-y-3">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={currentBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {currentBlocks.map(b => {
                                const bType = BLOCK_TYPES.find(t => t.id === b.type) || BLOCK_TYPES[0];
                                return <SortableBlockItem key={b.id} id={b.id} b={b} bType={bType} setEditingBlock={setEditingBlock} handleDeleteBlock={handleDeleteBlock} />;
                            })}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* [모달] 9가지 블록 선택 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-[500px] overflow-hidden shadow-2xl slide-in-from-bottom-4">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">블록 선택하기</h3>
                                <p className="text-sm text-neutral-400">콘텐츠 타입을 선택하세요.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors"><Icon name="X" size={24} /></button>
                        </div>
                        <div className="p-8 grid grid-cols-3 gap-6">
                            {BLOCK_TYPES.map(typeObj => (
                                <button key={typeObj.id} onClick={() => handleAddBlockType(typeObj)} className="flex flex-col items-center gap-3 group">
                                    <div className={`w-16 h-16 rounded-2xl ${typeObj.color} flex items-center justify-center ${typeObj.iconColor} shadow-lg group-hover:scale-105 group-active:scale-95 transition-all`}>
                                        <Icon name={typeObj.icon} size={28} />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">{typeObj.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* [모달] 선택된 블록 세부 설정 */}
            {editingBlock && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                                    <Icon name={editingBlock.icon} size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-white">블록 상세 설정</h3>
                            </div>
                            <button onClick={() => setEditingBlock(null)} className="text-neutral-400 hover:text-white transition-colors"><Icon name="X" size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {renderBlockSettingsForm()}
                        </div>
                        <div className="p-6 border-t border-neutral-800 flex justify-end gap-3 shrink-0 bg-neutral-950">
                            <button onClick={() => setEditingBlock(null)} className="px-5 py-2.5 rounded-xl font-medium text-neutral-400 hover:text-white transition-colors">취소</button>
                            <button onClick={handleSaveBlock} className="bg-lime-400 text-neutral-950 px-5 py-2.5 rounded-xl font-bold hover:bg-lime-500 transition-colors">변경사항 저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
