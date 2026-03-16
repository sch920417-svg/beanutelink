import React, { useState, useEffect, useCallback, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons, BLOCK_TYPES } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

// Common Icon Renderer
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

// Tag Colors matching the provided requirements but suited for dark theme accents
const TAG_COLORS = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", 
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-pink-500", "bg-neutral-600"
];

// --- Tag Editor Component ---
function TagEditor({ tags = [], onChange }) {
    // tags 배열의 원소들이 문자열 기반이라면, 마운트 시 최초에만 랜덤 id를 부여하도록 초기 상태 설정
    // 외부에서 tags Props가 완전히 교체될 때 컴포넌트 key를 초기화하여 재마운트 시키는 방식을 상위에서 취할 것이므로 useEffect는 제거합니다.
    const [normalizedTags] = useState(() => 
        tags.map(t => typeof t === 'string' ? { id: Math.random().toString(36).substring(2, 9), text: t, color: TAG_COLORS[0] } : t)
    );

    const [newTagText, setNewTagText] = useState("");
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  
    const handleAdd = () => {
        if (!newTagText.trim()) return;
        const newTag = { id: Math.random().toString(36).substring(2, 9), text: newTagText.trim(), color: selectedColor };
        onChange([...normalizedTags, newTag]);
        setNewTagText("");
    };
  
    const handleRemove = (id) => {
        onChange(normalizedTags.filter(t => t.id !== id));
    };
  
    return (
        <div className="flex flex-col gap-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl w-full">
            <div className="flex flex-wrap gap-2 mb-1 min-h-[32px] items-center">
                {normalizedTags.map(t => (
                    <span key={t.id} className={`${t.color} text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm`}>
                        {t.text}
                        <button onClick={() => handleRemove(t.id)} className="hover:bg-black/30 rounded-full p-0.5 transition-colors"><Icon name="X" size={12} /></button>
                    </span>
                ))}
                {normalizedTags.length === 0 && <span className="text-[12px] text-neutral-500 font-medium">추가된 태그가 없습니다.</span>}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 focus-within:border-lime-500/50 transition-colors">
                <input 
                    value={newTagText} 
                    onChange={e => setNewTagText(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="태그명 입력" 
                    className="text-xs p-1.5 bg-transparent outline-none flex-1 font-bold min-w-[120px] text-white placeholder-neutral-600" 
                />
                <div className="flex items-center gap-1.5 flex-wrap sm:border-l border-neutral-800 sm:pl-3">
                    {TAG_COLORS.slice(0, 9).map(c => (
                        <button 
                            key={c} 
                            onClick={() => setSelectedColor(c)} 
                            className={`w-4 h-4 rounded-full ${c} border-2 ${selectedColor === c ? 'border-white scale-125 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'} transition-all`} 
                        />
                    ))}
                </div>
                <button onClick={handleAdd} className="bg-neutral-800 text-white text-[11px] px-4 py-2 rounded-lg font-bold hover:bg-neutral-700 hover:text-lime-400 transition-colors whitespace-nowrap w-full sm:w-auto ml-auto sm:ml-2">
                    추가
                </button>
            </div>
        </div>
    );
}

// --- Main Editor Component ---
export function BlogEditor({ initialData, onSave, onClose, showToast }) {
    // Local state for the post being edited
    const [post, setPost] = useState({
        title: initialData?.title || '',
        link: initialData?.link || '',
        date: initialData?.date || new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1),
        tags: initialData?.tags || [],
        thumbnail: initialData?.thumbnail || '',
        blocks: initialData?.blocks || []
    });

    // Dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );


    const updatePost = (fields) => {
        setPost(prev => ({ ...prev, ...fields }));
    };

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('이미지 업로드 중...');
        const compressed = await uploadCompressed(file, 'blog');
        updatePost({ [fieldName]: compressed });
    };

    const handleSave = () => {
        if (!post.title.trim()) {
            showToast('블로그 제목을 입력해주세요.');
            return;
        }
        onSave(post);
    };

    // --- Block Manipulation Functions ---
    const addBlock = (type) => {
        const newBlock = { id: Math.random().toString(36).substring(2, 9), type, align: 'left', content: '' };
        if (type === 'image') newBlock.url = '';
        if (type === 'slider') newBlock.images = [];
        if (type === 'video') { newBlock.url = ''; }
        if (type === 'link') { newBlock.url = ''; newBlock.title = ''; newBlock.desc = ''; }
        if (type === 'beforeAfter') { newBlock.before = ''; newBlock.after = ''; }
        
        setPost(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    };

    const updateBlock = useCallback((id, fields) => {
        setPost(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, ...fields } : b)
        }));
    }, []);

    const removeBlock = useCallback((id) => {
        setPost(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== id)
        }));
    }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setPost(prev => {
                const oldIndex = prev.blocks.findIndex(b => b.id === active.id);
                const newIndex = prev.blocks.findIndex(b => b.id === over.id);
                return { ...prev, blocks: arrayMove(prev.blocks, oldIndex, newIndex) };
            });
        }
    };

    const moveBlock = useCallback((index, direction) => {
        setPost(prev => {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex >= 0 && newIndex < prev.blocks.length) {
                return { ...prev, blocks: arrayMove(prev.blocks, index, newIndex) };
            }
            return prev;
        });
    }, []);

    const handleBlockImageUpload = async (e, blockId, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('블록 이미지 업로드 중...');
        const compressed = await uploadCompressed(file, 'blog');
        updateBlock(blockId, { [fieldName]: compressed });
    };

    const appendFormat = (block, tag) => {
        const current = block.content || '';
        const wrapped = tag === 'bold' ? `**${current}**` : `__${current}__`;
        updateBlock(block.id, { content: wrapped });
    };

    return (
        <div className="w-full flex flex-col h-full bg-neutral-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 h-[70px] border-b border-neutral-800 flex items-center justify-between px-6 sm:px-8 bg-neutral-900/95 backdrop-blur z-20">
                <div className="flex items-center gap-3">
                    <Icon name="FileText" size={20} className="text-lime-400" />
                    <span className="font-extrabold text-white text-[16px] sm:text-xl truncate max-w-[200px] sm:max-w-md">{post.title || "새로운 블로그 글"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSave} className="flex items-center gap-2 text-sm font-bold bg-lime-400 text-neutral-950 px-5 py-2.5 rounded-xl hover:bg-lime-500 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                        <Icon name="Save" size={16} /> 저장 및 닫기
                    </button>
                    <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-neutral-700">
                        <Icon name="X" size={20} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 custom-scrollbar relative">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* Meta Data Section (Existing Code) */}
                    <div className="flex flex-col sm:flex-row gap-6 bg-neutral-950/40 p-6 rounded-3xl border border-neutral-800/60 shadow-inner">
                        <div className="w-full sm:w-40 h-40 bg-neutral-950 rounded-2xl flex-shrink-0 relative overflow-hidden border border-neutral-800 group shadow-md">
                            {post.thumbnail ? (
                                <>
                                    <img src={post.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                                        <Icon name="Camera" size={24} className="mb-2" />
                                        <span className="text-xs font-bold">변경하기</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'thumbnail')} />
                                    </label>
                                    <button onClick={(e) => { e.preventDefault(); updatePost({ thumbnail: '' }); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Icon name="Trash2" size={14} />
                                    </button>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-neutral-500 hover:text-lime-400 hover:bg-lime-400/5 transition-colors">
                                    <Icon name="ImagePlus" size={32} className="mb-3 opacity-60 ml-2" />
                                    <span className="text-xs font-bold tracking-wider">썸네일 등록</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'thumbnail')} />
                                </label>
                            )}
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-neutral-500 w-12 tracking-wider">제목</span>
                                <input value={post.title} onChange={(e) => updatePost({ title: e.target.value })} className="flex-1 font-extrabold text-white bg-transparent outline-none text-xl sm:text-2xl border-b border-neutral-800 focus:border-lime-500 pb-2 transition-colors placeholder-neutral-700" placeholder="블로그 제목을 입력하세요" />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-[11px] font-bold text-neutral-500 w-12 tracking-wider">외부링크</span>
                                    <div className="flex-1 flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-lime-500/50 focus-within:ring-1 focus-within:ring-lime-500/20 transition-all">
                                        <Icon name="Link2" size={14} className="text-neutral-500 mr-2" />
                                        <input value={post.link} onChange={(e) => updatePost({ link: e.target.value })} className="w-full text-sm bg-transparent outline-none text-neutral-200 placeholder-neutral-600 font-medium" placeholder="(선택) 외부 원문 링크 URL" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-1/3">
                                    <span className="text-[11px] font-bold text-neutral-500 w-8 sm:w-auto tracking-wider">작성일</span>
                                    <div className="flex-1 flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-lime-500/50 transition-all">
                                        <Icon name="Calendar" size={14} className="text-neutral-500 mr-2" />
                                        <input value={post.date} onChange={(e) => updatePost({ date: e.target.value })} className="w-full text-sm bg-transparent outline-none text-neutral-200 placeholder-neutral-600 font-medium" placeholder="YYYY.MM.DD." />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 mt-2">
                                <span className="text-[11px] font-bold text-neutral-500 w-12 pt-3 tracking-wider">태그</span>
                                <TagEditor tags={post.tags} onChange={(newTags) => updatePost({ tags: newTags })} />
                            </div>
                        </div>
                    </div>

                    {/* Block Editor Section */}
                    <div className="bg-neutral-950/40 p-6 rounded-3xl border border-neutral-800/60 shadow-inner">
                        <div className="flex items-center gap-2 mb-6">
                            <Icon name="LayoutDashboard" size={20} className="text-lime-400" />
                            <h3 className="font-bold text-white text-lg tracking-tight">본문 블록 에디터</h3>
                        </div>

                        {/* Blocks List Area with DnD */}
                        <div className="space-y-4 mb-8">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={post.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                    {post.blocks.map((block, bIndex) => (
                                        <SortableEditorBlock
                                           key={block.id}
                                           block={block}
                                           bIndex={bIndex}
                                           updateBlock={updateBlock}
                                           removeBlock={removeBlock}
                                           moveBlock={moveBlock}
                                           handleBlockImageUpload={handleBlockImageUpload}
                                                                                      appendFormat={appendFormat}
                                           showToast={showToast}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            
                            {post.blocks.length === 0 && (
                                <div className="text-center py-10 text-neutral-500 text-sm border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center">
                                    <Icon name="Package" size={32} className="mb-2 opacity-50" />
                                    <p>아래에서 블록을 추가하여 본문 내용을 작성해보세요.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Block Menu Toolbar */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 border-t border-neutral-800/50 pt-6">
                            <button onClick={() => addBlock('h1')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="Type" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">제목 1</span>
                            </button>
                            <button onClick={() => addBlock('h2')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="Type" size={16} className="mb-2 opacity-70 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">제목 2</span>
                            </button>
                            <button onClick={() => addBlock('text')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="FileText" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">텍스트</span>
                            </button>
                            <button onClick={() => addBlock('ul')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="GalleryHorizontal" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">글머리기호</span>
                            </button>
                            <button onClick={() => addBlock('ol')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="GalleryHorizontal" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">번호매기기</span>
                            </button>
                            <button onClick={() => addBlock('image')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="ImagePlus" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">사진</span>
                            </button>
                            <button onClick={() => addBlock('slider')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="GalleryHorizontal" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">슬라이드</span>
                            </button>
                            <button onClick={() => addBlock('video')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="MonitorPlay" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">영상</span>
                            </button>
                            <button onClick={() => addBlock('quote')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="BookOpen" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">인용구</span>
                            </button>
                            <button onClick={() => addBlock('callout')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <span className="text-lg mb-2 h-[18px] flex items-center justify-center group-hover:scale-110 transition-transform">💡</span>
                                <span className="text-[11px] font-bold">콜아웃</span>
                            </button>
                            <button onClick={() => addBlock('beforeAfter')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="LayoutGrid" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">Bef/Aft</span>
                            </button>
                            <button onClick={() => addBlock('link')} className="py-3 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-lime-500/30 transition-colors text-neutral-400 hover:text-white group">
                                <Icon name="Link2" size={18} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold">링크</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- List Sorting Item Component ---
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
                
                {/* Specific Handlers per type */}
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
                {block.type === 'slider' && (
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {(block.images || []).map((imgUrl, idx) => (
                                <div key={idx} className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-neutral-700 group">
                                    <img src={imgUrl} className="w-full h-full object-cover" alt={`slide-${idx}`} />
                                    <button 
                                        onClick={() => {
                                            const newImages = [...block.images];
                                            newImages.splice(idx, 1);
                                            updateBlock(block.id, { images: newImages });
                                        }} 
                                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Icon name="Trash2" size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="w-32 h-32 flex-shrink-0 border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-lime-400 hover:border-lime-500/50 transition-colors">
                                <Icon name="Plus" size={24} className="mb-1" /><span className="text-xs font-bold">사진 추가</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                                    const files = Array.from(e.target.files);
                                    if(files.length === 0) return;
                                    showToast ? showToast('이미지 업로드 중...') : console.log('이미지 업로드 중...');
                                    const compressedPromises = files.map(f => uploadCompressed(f, 'blog'));
                                    const compressedUrls = await Promise.all(compressedPromises);
                                    updateBlock(block.id, { images: [...(block.images || []), ...compressedUrls] });
                                }} />
                            </label>
                        </div>
                    </div>
                )}
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
                {block.type === 'beforeAfter' && (
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-neutral-500 pl-1 uppercase tracking-wider">Before</span>
                                {block.before ? (
                                    <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden border border-neutral-700 group">
                                        <img src={block.before} className="w-full h-full object-cover" alt="Before Image" />
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
                                        <img src={block.after} className="w-full h-full object-cover" alt="After Image" />
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
                                    <Icon name="ImagePlus" size={24} className="mb-2" /><span className="text-[11px] font-bold text-center leading-tight">1:1 비율<br/>사진 업로드</span>
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

