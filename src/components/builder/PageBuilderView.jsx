import React, { useState, useMemo, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../data/links';
import { SECTION_REGISTRY, SECTION_GROUPS, getSectionBadge, TAB_ICON_OPTIONS, createDefaultConfig } from '../../data/pageConfigData';
import { SplashHeaderSection } from './SplashHeaderSection';
import { HeroSliderSection } from './HeroSliderSection';
import { GuideCardSection } from './GuideCardSection';
import { QuoteBuilderSection } from './QuoteBuilderSection';
import { PriceTableSection } from './PriceTableSection';
import { FAQSection } from './FAQSection';
import { BlogMappingSection } from './BlogMappingSection';
import { ReviewSection } from './ReviewSection';
import { VideoSection } from './VideoSection';
import { GallerySection } from './GallerySection';
import { SlideReviewSection } from './SlideReviewSection';
import { BuilderPreview } from './BuilderPreview';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

// 섹션 타입 → 컴포넌트 맵
const SECTION_COMPONENT_MAP = {
  splash: SplashHeaderSection,
  hero: HeroSliderSection,
  guide: GuideCardSection,
  quote: QuoteBuilderSection,
  priceTable: PriceTableSection,
  review: ReviewSection,
  faq: FAQSection,
  blog: BlogMappingSection,
  video: VideoSection,
  gallery: GallerySection,
  slideReview: SlideReviewSection,
};

// 섹션 타입별 추가 props (guide, blog는 blogs/setBlogs/activeTab 필요)
const SECTION_EXTRA_PROPS = {
  guide: true,
  blog: true,
};

// ─── Sortable Item (공통) ─────────────────────────────────
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

// ─── Accordion Item ───────────────────────────────────────
function AccordionItem({ title, icon, isOpen, onToggle, children, badge, enabled, onToggleEnabled, onDelete, dragHandleProps }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${enabled ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-800/50 opacity-50'}`}>
      <div className="flex items-center bg-neutral-900 hover:bg-neutral-800/50 transition-colors">
        {/* 드래그 핸들 */}
        <div {...dragHandleProps} className="px-2 py-4 cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400 transition-colors">
          <Icon name="GripVertical" size={16} />
        </div>

        {/* 클릭 영역 */}
        <button onClick={onToggle} className="flex-1 flex items-center justify-between pr-3 py-4" disabled={!enabled}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <span className="font-bold text-white text-[15px]">{title}</span>
            {badge && <span className="text-[10px] font-bold bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
          <Icon name={isOpen && enabled ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-neutral-500" />
        </button>

        {/* ON/OFF 토글 */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleEnabled(); }}
          className={`mx-3 w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-lime-400' : 'bg-neutral-700'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${enabled ? 'left-5.5' : 'left-0.5'}`} />
        </button>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="mr-3 p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
          title="블록 삭제"
        >
          <Icon name="Trash2" size={14} />
        </button>
      </div>

      {isOpen && enabled && (
        <div className="px-5 py-5 bg-neutral-950/50 border-t border-neutral-800 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Tab Add Modal ────────────────────────────────────────
function TabAddModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');

  const handleAdd = () => {
    if (!name.trim()) return;
    const id = name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36).slice(-4);
    onAdd(id, name.trim(), icon);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-[400px] max-w-[90vw] space-y-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">새 상품 탭 추가</h3>

        <div>
          <label className="text-xs font-bold text-neutral-400 mb-2 block">탭 이름</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="예: 바디프로필"
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-400 mb-2 block">아이콘</label>
          <div className="flex flex-wrap gap-2">
            {TAB_ICON_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  icon === emoji ? 'bg-lime-400/20 border-2 border-lime-400 scale-110' : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-neutral-800 text-neutral-400 font-bold text-sm hover:bg-neutral-700 transition-colors">
            취소
          </button>
          <button onClick={handleAdd} disabled={!name.trim()} className="flex-1 py-3 rounded-xl bg-lime-400 text-neutral-950 font-bold text-sm hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Edit Modal ───────────────────────────────────────
function TabEditModal({ tab, onSave, onDelete, onClose, canDelete }) {
  const [name, setName] = useState(tab.label);
  const [icon, setIcon] = useState(tab.icon);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-[400px] max-w-[90vw] space-y-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">탭 편집</h3>

        <div>
          <label className="text-xs font-bold text-neutral-400 mb-2 block">탭 이름</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-400 mb-2 block">아이콘</label>
          <div className="flex flex-wrap gap-2">
            {TAB_ICON_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  icon === emoji ? 'bg-lime-400/20 border-2 border-lime-400 scale-110' : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {canDelete && (
            <button onClick={() => { onDelete(); onClose(); }} className="py-3 px-4 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors border border-red-500/20">
              삭제
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-neutral-800 text-neutral-400 font-bold text-sm hover:bg-neutral-700 transition-colors">
            취소
          </button>
          <button
            onClick={() => { onSave(name.trim(), icon); onClose(); }}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl bg-lime-400 text-neutral-950 font-bold text-sm hover:bg-lime-300 transition-colors disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Add Popover ──────────────────────────────────
function SectionAddButton({ groupId, existingTypes, onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const availableTypes = Object.entries(SECTION_REGISTRY)
    .filter(([type, meta]) => meta.group === groupId && !existingTypes.includes(type));

  if (availableTypes.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2.5 border-2 border-dashed border-neutral-800 rounded-xl text-neutral-600 hover:text-lime-400 hover:border-lime-500/30 transition-colors text-xs font-bold flex items-center justify-center gap-2"
      >
        <Icon name="Plus" size={14} /> 블록 추가
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 p-2 space-y-1">
            {availableTypes.map(([type, meta]) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left"
              >
                <span className="text-lg">{meta.icon}</span>
                <span className="text-sm font-bold text-white">{meta.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sortable Tab Button ──────────────────────────────────
function SortableTabButton({ id, tab, isActive, onClick, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 flex items-center">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing px-1 text-neutral-600 hover:text-neutral-400">
        <span className="text-[10px]">⠿</span>
      </div>
      <button
        onClick={onClick}
        onDoubleClick={onEdit}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
          isActive
            ? 'bg-lime-400 text-neutral-950 border-lime-400 shadow-lg shadow-lime-400/10'
            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white'
        }`}
      >
        <span className="text-lg">{tab.icon}</span>
        {tab.label}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main PageBuilderView
// ═══════════════════════════════════════════════════════════
export function PageBuilderView({ pageConfigs, setPageConfigs, blogs, setBlogs, showToast, settings = {} }) {
  const [activeTab, setActiveTab] = useState(() => {
    const tabs = Object.entries(pageConfigs)
      .map(([id, cfg]) => ({ id, order: cfg.meta?.order ?? 0 }))
      .sort((a, b) => a.order - b.order);
    return tabs[0]?.id || 'family';
  });

  const [openSections, setOpenSections] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTab, setEditingTab] = useState(null);

  // 탭 목록 (pageConfigs에서 파생)
  const tabs = useMemo(() =>
    Object.entries(pageConfigs)
      .filter(([id]) => id !== 'home')
      .map(([id, cfg]) => ({ id, label: cfg.meta?.label || id, icon: cfg.meta?.icon || '📦', order: cfg.meta?.order ?? 0 }))
      .sort((a, b) => a.order - b.order),
    [pageConfigs]
  );

  const effectiveTab = activeTab;
  const config = pageConfigs[effectiveTab];
  const sections = config?.sections || [];

  // DnD 센서
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ─── Config 업데이트 (기존 섹션 컴포넌트 호환) ───────────
  const updateConfig = useCallback((sectionKey, newValue) => {
    setPageConfigs(prev => ({
      ...prev,
      [effectiveTab]: {
        ...prev[effectiveTab],
        [sectionKey]: typeof newValue === 'function' ? newValue(prev[effectiveTab][sectionKey]) : newValue,
      },
    }));
  }, [effectiveTab, setPageConfigs]);

  // ─── Sections 배열 업데이트 ──────────────────────────────
  const updateSections = useCallback((newSections) => {
    setPageConfigs(prev => ({
      ...prev,
      [effectiveTab]: { ...prev[effectiveTab], sections: newSections },
    }));
  }, [effectiveTab, setPageConfigs]);

  // ─── 섹션 활성화 토글 ───────────────────────────────────
  const toggleSectionEnabled = useCallback((sectionId) => {
    updateSections(sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s));
  }, [sections, updateSections]);

  // ─── 아코디언 토글 ─────────────────────────────────────
  const toggleSection = useCallback((key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─── 섹션 DnD 핸들러 ───────────────────────────────────
  const handleSectionDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      updateSections(arrayMove(sections, oldIndex, newIndex));
    }
  }, [sections, updateSections]);

  // ─── 탭 DnD 핸들러 ─────────────────────────────────────
  const handleTabDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tabs.findIndex(t => t.id === active.id);
    const newIndex = tabs.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(tabs, oldIndex, newIndex);
    setPageConfigs(prev => {
      const next = { ...prev };
      reordered.forEach((tab, i) => {
        next[tab.id] = { ...next[tab.id], meta: { ...next[tab.id].meta, order: i } };
      });
      return next;
    });
  }, [tabs, setPageConfigs]);

  // ─── 탭 추가 ──────────────────────────────────────────
  const handleAddTab = useCallback((id, label, icon) => {
    const maxOrder = Math.max(...tabs.map(t => t.order), -1);
    setPageConfigs(prev => ({
      ...prev,
      [id]: createDefaultConfig(label, id, maxOrder + 1, icon),
    }));
    setActiveTab(id);
    showToast(`"${label}" 탭이 추가되었습니다.`);
  }, [tabs, setPageConfigs, showToast]);

  // ─── 탭 삭제 ──────────────────────────────────────────
  const handleDeleteTab = useCallback((tabId) => {
    if (tabs.length <= 1) { showToast('최소 1개의 탭이 필요합니다.'); return; }
    setPageConfigs(prev => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
    if (effectiveTab === tabId) {
      const remaining = tabs.filter(t => t.id !== tabId);
      setActiveTab(remaining[0]?.id);
    }
    showToast('탭이 삭제되었습니다.');
  }, [tabs, effectiveTab, setPageConfigs, showToast]);

  // ─── 탭 수정 ──────────────────────────────────────────
  const handleUpdateTab = useCallback((tabId, label, icon) => {
    setPageConfigs(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        meta: { ...prev[tabId].meta, label, icon },
        header: { ...prev[tabId].header, tabLabel: label },
      },
    }));
    showToast('탭이 수정되었습니다.');
  }, [setPageConfigs, showToast]);

  // ─── 섹션 추가 ─────────────────────────────────────────
  const handleAddSection = useCallback((type) => {
    const newSection = {
      id: `${effectiveTab}-sec-${type}-${Date.now().toString(36)}`,
      type,
      enabled: true,
    };
    updateSections([...sections, newSection]);
    showToast(`"${SECTION_REGISTRY[type].label}" 블록이 추가되었습니다.`);
  }, [effectiveTab, sections, updateSections, showToast]);

  // ─── 섹션 삭제 ─────────────────────────────────────────
  const handleDeleteSection = useCallback((sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    const label = section ? SECTION_REGISTRY[section.type]?.label : '';
    updateSections(sections.filter(s => s.id !== sectionId));
    showToast(`"${label}" 블록이 삭제되었습니다.`);
  }, [sections, updateSections, showToast]);

  // ─── 섹션 그룹 순서 ────────────────────────────────────
  const groupOrder = config?.sectionGroupOrder || SECTION_GROUPS.map(g => g.id);
  const orderedGroups = useMemo(() =>
    groupOrder
      .map(id => SECTION_GROUPS.find(g => g.id === id))
      .filter(Boolean),
    [groupOrder]
  );

  const handleMoveGroup = useCallback((groupId, direction) => {
    const currentOrder = config?.sectionGroupOrder || SECTION_GROUPS.map(g => g.id);
    const idx = currentOrder.indexOf(groupId);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;
    const newOrder = [...currentOrder];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    updateConfig('sectionGroupOrder', newOrder);
  }, [config, updateConfig]);

  // ─── 그룹별 섹션 분류 ──────────────────────────────────
  const groupedSections = useMemo(() => {
    const groups = {};
    SECTION_GROUPS.forEach(g => { groups[g.id] = []; });

    sections.forEach(section => {
      const meta = SECTION_REGISTRY[section.type];
      if (!meta) return;
      const groupId = meta.group;
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(section);
    });

    return groups;
  }, [sections]);

  const existingTypes = useMemo(() => sections.map(s => s.type), [sections]);

  if (!config) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6 h-[calc(100vh-180px)] min-h-[600px]">
      {/* LEFT: Settings Panel */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        {/* ─── 상품 탭 (동적) ─────────────────────────── */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
          <SortableContext items={tabs.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex gap-1 mb-5 overflow-x-auto pb-1 custom-scrollbar shrink-0 items-center">
              {/* 홈 탭 */}
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 flex-shrink-0 ${
                  activeTab === 'home'
                    ? 'bg-lime-400 text-black border-lime-400'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600'
                }`}
              >
                🏠 홈
              </button>
              {tabs.map(tab => (
                <SortableTabButton
                  key={tab.id}
                  id={tab.id}
                  tab={tab}
                  isActive={activeTab !== 'home' && effectiveTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onEdit={() => setEditingTab(tab)}
                />
              ))}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 border-dashed border-neutral-700 text-neutral-500 hover:border-lime-500/50 hover:text-lime-400 flex-shrink-0"
              >
                <Icon name="Plus" size={16} /> 탭 추가
              </button>
            </div>
          </SortableContext>
        </DndContext>

        {/* ─── 섹션 리스트 (그룹별 + DnD) ──────────── */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1">
              {orderedGroups.map((group, groupIdx) => {
                const groupSections = groupedSections[group.id] || [];
                if (groupSections.length === 0 && !Object.entries(SECTION_REGISTRY).some(([type, meta]) => meta.group === group.id && !existingTypes.includes(type))) {
                  return null;
                }

                return (
                  <div key={group.id}>
                    {/* 그룹 헤더 */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400/60" />
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{group.label}</span>
                      <div className="flex-1 h-px bg-neutral-800/50" />
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleMoveGroup(group.id, 'up')}
                          disabled={groupIdx === 0}
                          className="p-1 rounded-md text-neutral-600 hover:text-lime-400 hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:text-neutral-600 disabled:hover:bg-transparent"
                          title="위로 이동"
                        >
                          <Icon name="ChevronUp" size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveGroup(group.id, 'down')}
                          disabled={groupIdx === orderedGroups.length - 1}
                          className="p-1 rounded-md text-neutral-600 hover:text-lime-400 hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:text-neutral-600 disabled:hover:bg-transparent"
                          title="아래로 이동"
                        >
                          <Icon name="ChevronDown" size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 그룹 내 섹션들 */}
                    <div className="space-y-2">
                      {groupSections.map(section => {
                        const meta = SECTION_REGISTRY[section.type];
                        if (!meta) return null;
                        const SectionComp = SECTION_COMPONENT_MAP[section.type];
                        if (!SectionComp) return null;

                        const needsExtra = SECTION_EXTRA_PROPS[section.type];
                        const extraProps = needsExtra ? { blogs, setBlogs, activeTab: effectiveTab } : {};

                        return (
                          <SortableItem key={section.id} id={section.id}>
                            {({ dragHandleProps }) => (
                              <AccordionItem
                                title={meta.label}
                                icon={meta.icon}
                                isOpen={!!openSections[section.id]}
                                onToggle={() => toggleSection(section.id)}
                                badge={getSectionBadge(section.type, config)}
                                enabled={section.enabled}
                                onToggleEnabled={() => toggleSectionEnabled(section.id)}
                                onDelete={() => handleDeleteSection(section.id)}
                                dragHandleProps={dragHandleProps}
                              >
                                <SectionComp config={config} updateConfig={updateConfig} showToast={showToast} {...extraProps} />
                              </AccordionItem>
                            )}
                          </SortableItem>
                        );
                      })}

                      {/* 블록 추가 버튼 */}
                      <SectionAddButton
                        groupId={group.id}
                        existingTypes={existingTypes}
                        onAdd={handleAddSection}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="hidden xl:flex">
        <BuilderPreview activeTab={activeTab} onTabChange={setActiveTab} config={config} pageConfigs={pageConfigs} blogs={blogs} settings={settings} />
      </div>

      {/* Modals */}
      {showAddModal && (
        <TabAddModal onAdd={handleAddTab} onClose={() => setShowAddModal(false)} />
      )}
      {editingTab && (
        <TabEditModal
          tab={editingTab}
          onSave={(label, icon) => handleUpdateTab(editingTab.id, label, icon)}
          onDelete={() => handleDeleteTab(editingTab.id)}
          onClose={() => setEditingTab(null)}
          canDelete={tabs.length > 1}
        />
      )}
    </div>
  );
}
