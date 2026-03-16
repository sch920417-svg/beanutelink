import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';

/**
 * 블로그 리스트 섹션 (3번 시안)
 * - '총 N개' 카운트
 * - 좌측 썸네일 + 카테고리(회색) + 제목(Bold) + 우측 화살표
 */
export default function BlogList({ posts = [], onPostClick }) {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="px-5 pt-2 pb-8"
    >
      {/* 카운트 */}
      <p className="text-[14px] font-semibold text-neutral-500 mb-4">
        총 {posts.length}개
      </p>

      {/* 리스트 */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        {posts.map((post) => (
          <motion.button
            key={post.id}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPostClick?.(post)}
            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white hover:bg-neutral-50 transition-colors group text-left"
          >
            {/* 썸네일 */}
            <div className="w-[72px] h-[72px] rounded-xl bg-neutral-100 overflow-hidden shrink-0">
              {post.thumbnail ? (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-neutral-400 mb-1">
                {post.category}
              </p>
              <p className="text-[14px] font-bold text-black leading-snug line-clamp-2">
                {post.title}
              </p>
            </div>

            {/* 화살표 */}
            <ChevronRight
              size={18}
              className="text-neutral-300 shrink-0 group-hover:text-neutral-500 transition-colors"
            />
          </motion.button>
        ))}
      </motion.div>

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-neutral-400 text-[14px] font-medium">
            등록된 블로그 게시글이 없습니다.
          </p>
        </div>
      )}
    </motion.div>
  );
}
