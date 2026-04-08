import React, { useState } from 'react';
import { Icons } from '../../data/links';
import { BlogEditor } from '../views/BlogEditor';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

// Map tab IDs to blog product IDs
const TAB_TO_BLOG_KEY = {
  family: 'family',
  profile: 'profile',
  pilates: 'pilates',
  'id-photo': 'id-photo',
};

function SortableBlogRow({ id, blog, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center bg-neutral-900 border rounded-xl px-2 py-3 group transition-colors ${
        isDragging ? 'border-lime-500 shadow-lg' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="px-1.5 cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400 transition-colors"
      >
        <Icon name="GripVertical" size={14} />
      </div>
      <div className="flex-1 min-w-0 ml-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">{blog.tag}</span>
          <span className="text-[10px] text-neutral-600">{blog.date}</span>
        </div>
        <p className="text-sm font-bold text-white truncate">{blog.title || '(제목 없음)'}</p>
      </div>
      <div className="flex items-center gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 text-neutral-400 hover:text-lime-400 transition-colors"
        >
          <Icon name="PencilRuler" size={14} />
        </button>
        <button
          onClick={onDelete}
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
        >
          <Icon name="Trash2" size={14} />
        </button>
      </div>
    </div>
  );
}

export function BlogMappingSection({ config, updateConfig, blogs, setBlogs, showToast, activeTab }) {
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const blogKey = TAB_TO_BLOG_KEY[activeTab] || activeTab;
  const currentBlogs = blogs[blogKey] || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = currentBlogs.findIndex(b => b.id === active.id);
    const newIndex = currentBlogs.findIndex(b => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(currentBlogs, oldIndex, newIndex);
    setBlogs(prev => ({
      ...prev,
      [blogKey]: newOrder,
    }));
  };

  const handleAddBlog = () => {
    const newId = Date.now();
    const newBlog = {
      id: newId,
      title: '',
      tag: config.header.tabLabel,
      date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1),
      views: 0,
      blocks: [],
    };
    setBlogs(prev => ({
      ...prev,
      [blogKey]: [newBlog, ...(prev[blogKey] || [])],
    }));
    showToast('새 블로그 게시글이 생성되었습니다.');
    setTimeout(() => {
      setEditingBlogId(newId);
      setIsEditorOpen(true);
    }, 50);
  };

  const handleDeleteBlog = (id) => {
    setBlogs(prev => ({
      ...prev,
      [blogKey]: (prev[blogKey] || []).filter(b => b.id !== id),
    }));
    showToast('게시글이 삭제되었습니다.');
  };

  const handleSaveBlog = (updatedPost) => {
    setBlogs(prev => ({
      ...prev,
      [blogKey]: (prev[blogKey] || []).map(b => b.id === editingBlogId ? { ...b, ...updatedPost } : b),
    }));
    showToast('게시물이 저장되었습니다.');
    setIsEditorOpen(false);
    setTimeout(() => setEditingBlogId(null), 300);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-1.5 block">카테고리 필터</label>
        <input
          value={config.blogMapping.categoryFilter}
          onChange={(e) => updateConfig('blogMapping', { ...config.blogMapping, categoryFilter: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="가족사진"
        />
        <p className="text-[11px] text-neutral-600 mt-1">이 상품 페이지 하단에 노출될 블로그 카테고리입니다.</p>
      </div>

      {/* Blog List — Drag & Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={currentBlogs.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {currentBlogs.map(blog => (
              <SortableBlogRow
                key={blog.id}
                id={blog.id}
                blog={blog}
                onEdit={() => { setEditingBlogId(blog.id); setIsEditorOpen(true); }}
                onDelete={() => handleDeleteBlog(blog.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button onClick={handleAddBlog} className="w-full py-2.5 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors font-bold text-sm flex items-center justify-center gap-2">
        <Icon name="FileText" size={14} /> 새 콘텐츠 작성
      </button>

      {/* Blog Editor Full-screen Overlay */}
      {isEditorOpen && editingBlogId && (
        <div className="fixed inset-0 z-[9999] bg-neutral-950 flex flex-col">
          <BlogEditor
            initialData={currentBlogs.find(b => b.id === editingBlogId)}
            onSave={handleSaveBlog}
            onClose={() => {
              setIsEditorOpen(false);
              setTimeout(() => setEditingBlogId(null), 300);
            }}
            showToast={showToast}
          />
        </div>
      )}
    </div>
  );
}
