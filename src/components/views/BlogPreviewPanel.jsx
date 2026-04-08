import React from 'react';
import { Icons } from '../../data/links';
import { renderBlock } from '../builder/blogBlockRenderer';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

export function BlogPreviewPanel({ post }) {
    return (
        <div className="w-full h-full flex flex-col bg-neutral-950 border-l border-neutral-800">
            {/* Header */}
            <div className="shrink-0 px-5 py-4 border-b border-neutral-800 flex items-center gap-2 bg-neutral-900">
                <Icon name="Eye" size={18} className="text-lime-400" />
                <span className="font-bold text-white text-sm">실시간 미리보기</span>
            </div>

            {/* Preview Content - simulates actual blog page */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="max-w-full">
                    {/* Header Image (original ratio) */}
                    {(post.headerImage || post.thumbnail) ? (
                        <div className="w-full overflow-hidden">
                            <img src={post.headerImage || post.thumbnail} alt={post.title} className="w-full h-auto" />
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-neutral-100 flex items-center justify-center">
                            <Icon name="Image" size={48} className="text-neutral-300" />
                        </div>
                    )}

                    <div className="px-6 py-6 space-y-4">
                        {/* Tags & Date */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {post.tags && post.tags.length > 0 ? (
                                post.tags.map(t => (
                                    <span key={t.id} className={`${t.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                                        {t.text}
                                    </span>
                                ))
                            ) : post.tag ? (
                                <span className="text-[11px] font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">{post.tag}</span>
                            ) : null}
                            {post.date && (
                                <span className="text-[11px] text-neutral-400">{post.date}</span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-[22px] font-bold text-black leading-snug">
                            {post.title || '제목 없음'}
                        </h1>

                        {/* Divider */}
                        <div className="border-t border-neutral-200 my-2" />

                        {/* Blocks */}
                        {(post.blocks || []).length > 0 ? (
                            <div className="space-y-4">
                                {post.blocks.map((block, idx) => renderBlock(block, idx))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <Icon name="FileText" size={36} className="text-neutral-300 mx-auto mb-3" />
                                <p className="text-neutral-400 text-[13px]">아직 본문 내용이 없습니다.</p>
                                <p className="text-neutral-300 text-[11px] mt-1">왼쪽 에디터에서 콘텐츠를 작성해주세요.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
