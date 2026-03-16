import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../data/links';
import { BlogEditor } from './BlogEditor';

const SortableBlogItem = ({ id, b, handleDeleteBlog }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.8 : 1 };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners} 
            onClick={(e) => {
                if (isDragging) return;
                e.preventDefault();
                e.stopPropagation();
                
                document.dispatchEvent(new CustomEvent('openBlogEditor', { detail: b.id }));
                document.dispatchEvent(new Event('openMobilePreview'));
            }} 
            className={`bg-neutral-900 border ${isDragging ? 'border-lime-500 shadow-2xl scale-105' : 'border-neutral-800'} rounded-2xl overflow-hidden hover:border-lime-500/50 transition-all cursor-pointer flex flex-col relative group`}
        >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2" onPointerDown={e => e.stopPropagation()}>
                <button onClick={(e) => handleDeleteBlog(e, b.id)} className="p-2 bg-neutral-950/80 rounded-full text-neutral-400 hover:text-red-400 shadow-lg cursor-pointer transition-colors">
                    <Icon name="Trash2" size={16} />
                </button>
            </div>
            <div className="absolute top-3 left-3 bg-neutral-950/80 rounded-full p-2 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Icon name="GripVertical" size={16} />
            </div>
            <div className="aspect-square bg-neutral-800 flex items-center justify-center">
                <Icon name="Image" size={32} className="text-neutral-700" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between pointer-events-none">
                <div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-neutral-950 text-neutral-400 mb-3 inline-block">{b.tag}</span>
                    <h4 className="text-lg font-bold text-white mb-2 leading-tight">{b.title}</h4>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-neutral-500 mt-4 border-t border-neutral-800 pt-4">
                    <span>{b.date}</span>
                    <span className="flex items-center gap-1">조회수 {b.views}</span>
                </div>
            </div>
        </div>
    );
};

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

export function BlogView({ blogs, setBlogs, showToast, isPreviewOpen }) {
    const { productId } = useParams();
    const navigate = useNavigate();
    const currentProductId = productId || '1';

    // Get blogs for current product, or empty array if none
    const currentBlogs = blogs[currentProductId] || [];
    
    // State to track which blog is currently being edited in the modal
    const [editingBlogId, setEditingBlogId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Listen for custom event from SortableBlogItem to set the active editor blog
    React.useEffect(() => {
        const handleOpenEditor = (e) => {
            setEditingBlogId(e.detail);
            setIsModalOpen(true);
        };
        document.addEventListener('openBlogEditor', handleOpenEditor);
        return () => document.removeEventListener('openBlogEditor', handleOpenEditor);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = currentBlogs.findIndex(b => b.id === active.id);
            const newIndex = currentBlogs.findIndex(b => b.id === over.id);
            const newOrder = arrayMove(currentBlogs, oldIndex, newIndex);
            setBlogs({
                ...blogs,
                [currentProductId]: newOrder
            });
            showToast('블로그 순서가 변경되었습니다.');
        }
    };

    const handleAddBlog = () => {
        const newId = Date.now();
        const newBlog = {
            id: newId,
            title: '',
            tag: currentProductId === '1' ? '아이덴티티 포트레이트' : currentProductId === '2' ? '헤리티지 패밀리' : '시즈널 커플 스냅',
            date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1),
            views: 0,
            blocks: []
        };

        setBlogs({
            ...blogs,
            [currentProductId]: [newBlog, ...currentBlogs]
        });
        showToast('새 블로그 게시글이 생성되었습니다.');
        
        setTimeout(() => {
            setEditingBlogId(newId);
            setIsModalOpen(true);
            document.dispatchEvent(new Event('openMobilePreview'));
        }, 50);
    };

    const handleDeleteBlog = (e, id) => {
        e.stopPropagation();
        setBlogs({
            ...blogs,
            [currentProductId]: currentBlogs.filter(b => b.id !== id)
        });
        showToast('게시글이 삭제되었습니다.');
    };

    const handleSaveBlog = (updatedPost) => {
        setBlogs(prev => ({
            ...prev,
            [currentProductId]: prev[currentProductId].map(b => b.id === editingBlogId ? { ...b, ...updatedPost } : b)
        }));
        showToast('게시물이 저장되었습니다.');
        setIsModalOpen(false);
        
        // Reset after animation
        setTimeout(() => setEditingBlogId(null), 300);
    };

    return (
        <div className="space-y-6 slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
                    <button
                        onClick={() => navigate('/admin/blog/1')}
                        className={`px-5 py-2 font-bold rounded-lg border text-sm whitespace-nowrap transition-colors ${currentProductId === '1' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-transparent hover:bg-neutral-800 text-neutral-400 border-transparent font-medium'}`}
                    >아이덴티티 포트레이트</button>
                    <button
                        onClick={() => navigate('/admin/blog/2')}
                        className={`px-5 py-2 font-bold rounded-lg border text-sm whitespace-nowrap transition-colors ${currentProductId === '2' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-transparent hover:bg-neutral-800 text-neutral-400 border-transparent font-medium'}`}
                    >헤리티지 패밀리</button>
                    <button
                        onClick={() => navigate('/admin/blog/3')}
                        className={`px-5 py-2 font-bold rounded-lg border text-sm whitespace-nowrap transition-colors ${currentProductId === '3' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-transparent hover:bg-neutral-800 text-neutral-400 border-transparent font-medium'}`}
                    >시즈널 커플 스냅</button>
                </div>
                <button onClick={handleAddBlog} className="w-full sm:w-auto bg-lime-400 text-neutral-950 px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-lime-500 transition-colors shrink-0">
                    <Icon name="FileText" size={16} /> 새 콘텐츠 작성
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SortableContext items={currentBlogs.map(b => b.id)} strategy={rectSortingStrategy}>
                        {currentBlogs.map(b => (
                            <SortableBlogItem key={b.id} id={b.id} b={b} handleDeleteBlog={handleDeleteBlog} />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>

            {/* Admin Blog Settings Modal (Expanded for Editor) */}
            {isModalOpen && (
                <div className={`fixed inset-0 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200 z-50 ${isPreviewOpen ? 'md:pr-[400px]' : ''}`}>
                    <div className="w-full max-w-5xl h-[92vh] bg-neutral-900 border-x border-t border-neutral-800/80 rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-400 pb-safe">
                        {/* Drag Handle Area */}
                        <div className="flex justify-center pt-5 pb-3 w-full cursor-pointer hover:bg-neutral-800/30 transition-colors rounded-t-[2rem] sm:rounded-t-[2.5rem]" onClick={() => setIsModalOpen(false)}>
                            <div className="w-16 h-1.5 bg-neutral-700/80 rounded-full"></div>
                        </div>
                        
                        {/* Modal Content - Blog Editor Mounting Point */}
                        {editingBlogId ? (
                            <div className="flex-1 h-full w-full">
                                <BlogEditor 
                                    initialData={currentBlogs.find(b => b.id === editingBlogId)} 
                                    onSave={handleSaveBlog}
                                    onClose={() => {
                                        setIsModalOpen(false);
                                        setTimeout(() => setEditingBlogId(null), 300);
                                    }}
                                    showToast={showToast}
                                />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-12 pt-2 custom-scrollbar">
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Icon name="Loader2" size={48} className="text-lime-500 animate-spin mb-4" />
                                    <h4 className="text-lg font-bold text-neutral-300">에디터 로딩 중...</h4>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
