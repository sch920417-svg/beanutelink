import React, { useState, useCallback, memo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

function getYouTubeEmbedUrl(url) {
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

export function RichTextSection({ config, updateConfig, showToast, sectionId }) {
    const data = config.richTextData?.[sectionId] || { blocks: [] };
    const blocks = data.blocks || [];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const updateData = (newData) => {
        updateConfig('richTextData', {
            ...config.richTextData,
            [sectionId]: newData,
        });
    };

    const updateBlocks = (newBlocks) => {
        updateData({ ...data, blocks: newBlocks });
    };

    const addBlock = (type) => {
        const newBlock = { id: Math.random().toString(36).substring(2, 9), type, align: 'left', content: '' };
        if (type === 'image') newBlock.url = '';
        if (type === 'slider') newBlock.images = [];
        if (type === 'video') newBlock.url = '';
        if (type === 'link') { newBlock.url = ''; newBlock.title = ''; newBlock.desc = ''; }
        if (type === 'beforeAfter') { newBlock.before = ''; newBlock.after = ''; }
        updateBlocks([...blocks, newBlock]);
    };

    const updateBlock = useCallback((id, fields) => {
        updateConfig('richTextData', prev => {
            const currentData = (typeof prev === 'object' && prev !== null) ? prev : config.richTextData || {};
            const sectionData = currentData[sectionId] || { blocks: [] };
            return {
                ...currentData,
                [sectionId]: {
                    ...sectionData,
                    blocks: sectionData.blocks.map(b => b.id === id ? { ...b, ...fields } : b),
                },
            };
        });
    }, [sectionId, config.richTextData, updateConfig]);

    const removeBlock = useCallback((id) => {
        updateConfig('richTextData', prev => {
            const currentData = (typeof prev === 'object' && prev !== null) ? prev : config.richTextData || {};
            const sectionData = currentData[sectionId] || { blocks: [] };
            return {
                ...currentData,
                [sectionId]: {
                    ...sectionData,
                    blocks: sectionData.blocks.filter(b => b.id !== id),
                },
            };
        });
    }, [sectionId, config.richTextData, updateConfig]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = blocks.findIndex(b => b.id === active.id);
            const newIndex = blocks.findIndex(b => b.id === over.id);
            updateBlocks(arrayMove(blocks, oldIndex, newIndex));
        }
    };

    const moveBlock = useCallback((index, direction) => {
        const currentBlocks = config.richTextData?.[sectionId]?.blocks || [];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < currentBlocks.length) {
            updateBlocks(arrayMove(currentBlocks, index, newIndex));
        }
    }, [sectionId, config.richTextData]);

    const handleBlockImageUpload = async (e, blockId, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('이미지 업로드 중...');
        const compressed = await uploadCompressed(file, 'page');
        // Direct update for image uploads
        const currentData = config.richTextData || {};
        const sectionData = currentData[sectionId] || { blocks: [] };
        updateConfig('richTextData', {
            ...currentData,
            [sectionId]: {
                ...sectionData,
                blocks: sectionData.blocks.map(b => b.id === blockId ? { ...b, [fieldName]: compressed } : b),
            },
        });
    };

    const appendFormat = (block, tag) => {
        const current = block.content || '';
        const wrapped = tag === 'bold' ? `**${current}**` : `__${current}__`;
        const currentData = config.richTextData || {};
        const sectionData = currentData[sectionId] || { blocks: [] };
        updateConfig('richTextData', {
            ...currentData,
            [sectionId]: {
                ...sectionData,
                blocks: sectionData.blocks.map(b => b.id === block.id ? { ...b, content: wrapped } : b),
            },
        });
    };

    return (
        <div className="space-y-4">
            {/* Blocks List with DnD */}
            <div className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {blocks.map((block, bIndex) => (
                            <SortableEditorBlock
                                key={block.id}
                                block={block}
                                bIndex={bIndex}
                                updateBlock={(id, fields) => {
                                    const currentData = config.richTextData || {};
                                    const sectionData = currentData[sectionId] || { blocks: [] };
                                    updateConfig('richTextData', {
                                        ...currentData,
                                        [sectionId]: {
                                            ...sectionData,
                                            blocks: sectionData.blocks.map(b => b.id === id ? { ...b, ...fields } : b),
                                        },
                                    });
                                }}
                                removeBlock={(id) => {
                                    const currentData = config.richTextData || {};
                                    const sectionData = currentData[sectionId] || { blocks: [] };
                                    updateConfig('richTextData', {
                                        ...currentData,
                                        [sectionId]: {
                                            ...sectionData,
                                            blocks: sectionData.blocks.filter(b => b.id !== id),
                                        },
                                    });
                                }}
                                moveBlock={moveBlock}
                                handleBlockImageUpload={handleBlockImageUpload}
                                appendFormat={appendFormat}
                                showToast={showToast}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {blocks.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 text-sm border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center">
                        <Icon name="Package" size={28} className="mb-2 opacity-50" />
                        <p>아래에서 블록을 추가하여 자유롭게 콘텐츠를 작성하세요.</p>
                    </div>
                )}
            </div>

            {/* Add Block Toolbar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 border-t border-neutral-800/50 pt-4">
                <button onClick={() => addBlock('h1')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="Type" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">제목 1</span>
                </button>
                <button onClick={() => addBlock('h2')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="Type" size={14} className="mb-1.5 opacity-70 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">제목 2</span>
                </button>
                <button onClick={() => addBlock('text')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="FileText" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">텍스트</span>
                </button>
                <button onClick={() => addBlock('ul')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="GalleryHorizontal" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">글머리기호</span>
                </button>
                <button onClick={() => addBlock('ol')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="GalleryHorizontal" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">번호매기기</span>
                </button>
                <button onClick={() => addBlock('image')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="ImagePlus" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">사진</span>
                </button>
                <button onClick={() => addBlock('slider')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="GalleryHorizontal" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">슬라이드</span>
                </button>
                <button onClick={() => addBlock('video')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="MonitorPlay" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">영상</span>
                </button>
                <button onClick={() => addBlock('quote')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="BookOpen" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">인용구</span>
                </button>
                <button onClick={() => addBlock('callout')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <span className="text-base mb-1.5 h-[16px] flex items-center justify-center group-hover:scale-110 transition-transform">💡</span>
                    <span className="text-[10px] font-bold">콜아웃</span>
                </button>
                <button onClick={() => addBlock('beforeAfter')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="LayoutGrid" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Bef/Aft</span>
                </button>
                <button onClick={() => addBlock('link')} className="py-2.5 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                    <Icon name="Link2" size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">링크</span>
                </button>
            </div>
        </div>
    );
}

// --- Sortable Block Editor Item ---
const SortableEditorBlock = memo(function SortableEditorBlock({ block, bIndex, updateBlock, removeBlock, moveBlock, handleBlockImageUpload, appendFormat, showToast }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.8 : 1 };

    return (
        <div ref={setNodeRef} style={style} className={`relative group bg-neutral-900 rounded-2xl border ${isDragging ? 'border-lime-500 shadow-xl scale-[1.02]' : 'border-neutral-800'} p-4 shadow-sm hover:border-neutral-700 transition-all`}>
            {/* Block Controls */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => moveBlock(bIndex, 'up')} className="p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm hover:bg-neutral-700 hover:text-white text-neutral-400 transition-colors"><Icon name="ChevronUp" size={14} /></button>
                <div {...attributes} {...listeners} className="p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm hover:bg-neutral-700 hover:text-lime-400 text-neutral-400 transition-colors cursor-grab active:cursor-grabbing"><Icon name="GripVertical" size={14} /></div>
                <button onClick={() => moveBlock(bIndex, 'down')} className="p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm hover:bg-neutral-700 hover:text-white text-neutral-400 transition-colors"><Icon name="ChevronDown" size={14} /></button>
            </div>

            <button onClick={() => removeBlock(block.id)} className="absolute top-3 right-3 p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors z-10">
                <Icon name="X" size={16} />
            </button>

            <div className="pr-10 pl-5">
                <span className="text-[10px] font-bold text-neutral-900 bg-lime-400 px-2 py-0.5 rounded uppercase tracking-wider absolute top-3 left-3">{block.type}</span>

                {/* Heading blocks */}
                {(block.type === 'h1' || block.type === 'h2') && (
                    <div className="mt-5 flex flex-col gap-3">
                        <div className="flex gap-1 bg-neutral-950 w-fit p-1 rounded-lg border border-neutral-800">
                            <button onClick={() => updateBlock(block.id, { align: 'left' })} className={`p-1.5 rounded-md transition-colors ${block.align === 'left' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Icon name="AlignLeft" size={14} /></button>
                            <button onClick={() => updateBlock(block.id, { align: 'center' })} className={`p-1.5 rounded-md transition-colors ${block.align === 'center' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Icon name="AlignCenter" size={14} /></button>
                            <button onClick={() => updateBlock(block.id, { align: 'right' })} className={`p-1.5 rounded-md transition-colors ${block.align === 'right' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Icon name="AlignRight" size={14} /></button>
                        </div>
                        <input
                            value={block.content}
                            onChange={e => updateBlock(block.id, { content: e.target.value })}
                            className={`w-full ${block.type === 'h1' ? 'text-2xl' : 'text-xl'} font-bold border-b border-transparent focus:border-lime-500 outline-none text-white bg-transparent transition-colors placeholder-neutral-700 text-${block.align}`}
                            placeholder={`제목 ${block.type === 'h1' ? '1' : '2'} 입력...`}
                        />
                    </div>
                )}

                {/* Text / List blocks */}
                {(block.type === 'text' || block.type === 'ul' || block.type === 'ol') && (
                    <div className="mt-5 flex flex-col gap-3">
                        <div className="flex gap-2 items-center bg-neutral-950 w-fit p-1 rounded-lg border border-neutral-800">
                            <div className="flex gap-1 border-r border-neutral-800 pr-1">
                                <button onClick={() => updateBlock(block.id, { align: 'left' })} className={`p-1.5 rounded-md transition-colors ${block.align === 'left' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Icon name="AlignLeft" size={14} /></button>
                                <button onClick={() => updateBlock(block.id, { align: 'center' })} className={`p-1.5 rounded-md transition-colors ${block.align === 'center' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Icon name="AlignCenter" size={14} /></button>
                                <button onClick={() => updateBlock(block.id, { align: 'right' })} className={`p-1.5 rounded-md transition-colors ${block.align === 'right' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Icon name="AlignRight" size={14} /></button>
                            </div>
                            <div className="flex gap-1 pl-1">
                                <button onClick={() => appendFormat(block, 'bold')} className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors" title="굵게 추가"><Icon name="Bold" size={14} /></button>
                                <button onClick={() => appendFormat(block, 'underline')} className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors" title="밑줄 추가"><Icon name="Underline" size={14} /></button>
                            </div>
                        </div>
                        <textarea
                            value={block.content}
                            onChange={e => updateBlock(block.id, { content: e.target.value })}
                            className={`w-full text-[15px] resize-y min-h-[80px] outline-none border border-neutral-800 focus:border-lime-500/50 rounded-xl p-3 bg-neutral-950 text-neutral-300 placeholder-neutral-700 transition-colors text-${block.align}`}
                            placeholder={block.type === 'text' ? "본문 텍스트 입력..." : "목록 내용 입력... (엔터로 구분)"}
                        />
                    </div>
                )}

                {/* Image block */}
                {block.type === 'image' && (
                    <div className="mt-6 flex flex-col gap-4">
                        {block.url ? (
                            <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-neutral-700 group">
                                <img src={block.url} className="w-full h-auto" alt="Block Img" />
                                <button onClick={() => updateBlock(block.id, { url: '' })} className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><Icon name="Trash2" size={16} /></button>
                            </div>
                        ) : (
                            <label className="w-full max-w-sm h-40 border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors">
                                <Icon name="ImagePlus" size={28} className="mb-2" /><span className="text-sm font-bold">고화질 사진 업로드</span>
                                <input type="file" accept="image/*" className="hidden" onChange={e => handleBlockImageUpload(e, block.id, 'url')} />
                            </label>
                        )}
                        <input value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value })} className="text-sm w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none text-center text-neutral-300 placeholder-neutral-700 focus:border-lime-500/50 transition-colors" placeholder="(선택) 이미지 캡션 입력" />
                    </div>
                )}

                {/* Slider block */}
                {block.type === 'slider' && (
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {(block.images || []).map((imgUrl, idx) => (
                                <div key={idx} className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-neutral-700 group">
                                    <img src={imgUrl} className="w-full h-full object-cover" alt={`slide-${idx}`} />
                                    <span className="absolute top-1 left-1 text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">{idx + 1}</span>
                                    <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-0.5">
                                            {idx > 0 && (
                                                <button onClick={() => { const ni = [...block.images]; [ni[idx], ni[idx-1]] = [ni[idx-1], ni[idx]]; updateBlock(block.id, { images: ni }); }} className="p-1 bg-black/60 rounded text-white hover:bg-lime-500 transition-colors"><Icon name="ChevronLeft" size={12} /></button>
                                            )}
                                            {idx < (block.images || []).length - 1 && (
                                                <button onClick={() => { const ni = [...block.images]; [ni[idx], ni[idx+1]] = [ni[idx+1], ni[idx]]; updateBlock(block.id, { images: ni }); }} className="p-1 bg-black/60 rounded text-white hover:bg-lime-500 transition-colors"><Icon name="ChevronRight" size={12} /></button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newImages = [...block.images];
                                                newImages.splice(idx, 1);
                                                updateBlock(block.id, { images: newImages });
                                            }}
                                            className="p-1 bg-black/60 rounded text-white hover:bg-red-500 transition-colors"
                                        >
                                            <Icon name="Trash2" size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label className="w-32 h-32 flex-shrink-0 border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors">
                                <Icon name="Plus" size={24} className="mb-1" /><span className="text-xs font-bold">사진 추가</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                                    const files = Array.from(e.target.files);
                                    if (files.length === 0) return;
                                    showToast('이미지 업로드 중...');
                                    const compressedUrls = await Promise.all(files.map(f => uploadCompressed(f, 'page')));
                                    updateBlock(block.id, { images: [...(block.images || []), ...compressedUrls] });
                                }} />
                            </label>
                        </div>
                    </div>
                )}

                {/* Video block */}
                {block.type === 'video' && (
                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-lime-500/50 transition-all">
                            <Icon name="MonitorPlay" size={16} className="text-neutral-500" />
                            <input
                                value={block.url || ''}
                                onChange={e => updateBlock(block.id, { url: e.target.value })}
                                className="w-full text-sm bg-transparent outline-none text-neutral-200 placeholder-neutral-600 font-medium"
                                placeholder="유튜브 URL 입력 (예: https://youtu.be/xxx)"
                            />
                        </div>
                        {block.url && (() => {
                            const embedUrl = getYouTubeEmbedUrl(block.url);
                            return embedUrl ? (
                                <div className="w-full aspect-video rounded-xl overflow-hidden">
                                    <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video preview" />
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500">
                                    <span className="text-sm">유효한 유튜브 URL을 입력하세요</span>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Quote block */}
                {block.type === 'quote' && (
                    <div className="mt-6">
                        <div className="flex gap-4 p-5 rounded-2xl bg-neutral-950 border-l-4 border-lime-400/80 shadow-inner">
                            <Icon name="BookOpen" size={24} className="text-lime-400/50 flex-shrink-0 mt-1" />
                            <div className="flex-1 flex flex-col gap-2">
                                <textarea
                                    value={block.content || ''}
                                    onChange={e => updateBlock(block.id, { content: e.target.value })}
                                    className="w-full text-lg font-bold resize-y min-h-[60px] outline-none bg-transparent text-white placeholder-neutral-700 transition-colors leading-relaxed"
                                    placeholder="인용구 텍스트 입력..."
                                />
                                <input
                                    value={block.author || ''}
                                    onChange={e => updateBlock(block.id, { author: e.target.value })}
                                    className="w-full text-sm font-bold bg-transparent outline-none text-neutral-400 placeholder-neutral-700 mt-1"
                                    placeholder="- 출처 또는 작가명 입력"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Callout block */}
                {block.type === 'callout' && (
                    <div className="mt-6">
                        <div className="flex gap-4 p-5 rounded-2xl bg-lime-400/10 border border-lime-400/20 shadow-inner">
                            <span className="text-2xl flex-shrink-0 pt-0.5">💡</span>
                            <textarea
                                value={block.content || ''}
                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                className="w-full text-[15px] font-medium resize-y min-h-[50px] outline-none bg-transparent text-lime-100 placeholder-lime-400/40 transition-colors leading-relaxed mt-1"
                                placeholder="중요한 알림이나 안내 문구 입력..."
                            />
                        </div>
                    </div>
                )}

                {/* Before/After block */}
                {block.type === 'beforeAfter' && (
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-neutral-500 pl-1 uppercase tracking-wider">Before</span>
                                {block.before ? (
                                    <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden border border-neutral-700 group">
                                        <img src={block.before} className="w-full h-full object-cover" alt="Before" />
                                        <button onClick={() => updateBlock(block.id, { before: '' })} className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><Icon name="Trash2" size={16} /></button>
                                    </div>
                                ) : (
                                    <label className="w-full aspect-square md:aspect-video border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors">
                                        <Icon name="ImagePlus" size={24} className="mb-2" /><span className="text-xs font-bold">비포 사진 업로드</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleBlockImageUpload(e, block.id, 'before')} />
                                    </label>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-lime-500/80 pl-1 uppercase tracking-wider">After</span>
                                {block.after ? (
                                    <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden border border-lime-500/30 group">
                                        <img src={block.after} className="w-full h-full object-cover" alt="After" />
                                        <button onClick={() => updateBlock(block.id, { after: '' })} className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><Icon name="Trash2" size={16} /></button>
                                    </div>
                                ) : (
                                    <label className="w-full aspect-square md:aspect-video border-2 border-dashed border-lime-500/30 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-lime-900/20 text-lime-500/70 hover:text-lime-400 hover:border-lime-400 transition-colors bg-lime-400/5">
                                        <Icon name="ImagePlus" size={24} className="mb-2" /><span className="text-xs font-bold">애프터 사진 업로드</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleBlockImageUpload(e, block.id, 'after')} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Link block */}
                {block.type === 'link' && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                            {block.image ? (
                                <div className="relative w-full h-full rounded-xl overflow-hidden border border-neutral-700 group bg-neutral-950">
                                    <img src={block.image} className="w-full h-full object-cover" alt="Link Thumbnail" />
                                    <button onClick={() => updateBlock(block.id, { image: '' })} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><Icon name="Trash2" size={14} /></button>
                                </div>
                            ) : (
                                <label className="w-full h-full border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors">
                                    <Icon name="ImagePlus" size={24} className="mb-2" /><span className="text-[11px] font-bold text-center leading-tight">1:1 비율<br />사진 업로드</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleBlockImageUpload(e, block.id, 'image')} />
                                </label>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col gap-3 justify-center">
                            <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus-within:border-lime-500/50 transition-all">
                                <Icon name="Link2" size={16} className="text-neutral-500 flex-shrink-0" />
                                <input
                                    value={block.url || ''}
                                    onChange={e => updateBlock(block.id, { url: e.target.value })}
                                    className="w-full text-sm bg-transparent outline-none text-neutral-200 placeholder-neutral-600 font-medium"
                                    placeholder="연결할 타겟 URL (https://...)"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    value={block.title || ''}
                                    onChange={e => updateBlock(block.id, { title: e.target.value })}
                                    className="w-full sm:w-1/2 text-sm p-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none text-neutral-200 placeholder-neutral-600 focus:border-lime-500/50 transition-colors font-bold"
                                    placeholder="링크 제목"
                                />
                                <input
                                    value={block.desc || ''}
                                    onChange={e => updateBlock(block.id, { desc: e.target.value })}
                                    className="flex-1 text-sm p-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none text-neutral-200 placeholder-neutral-600 focus:border-lime-500/50 transition-colors"
                                    placeholder="짧은 설명 문구 (선택)"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
