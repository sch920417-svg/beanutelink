import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, FileText } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeInOut' } }
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function AllBlogsPage({ blogs = {}, products = [], settings }) {
  const allBlogs = useMemo(() => {
    const productMap = {};
    products.forEach(p => { productMap[p.id] = p.title; });

    const flat = [];
    Object.entries(blogs).forEach(([productId, entries]) => {
      entries.forEach(entry => {
        flat.push({
          ...entry,
          productId,
          productTitle: productMap[productId] || '기타',
        });
      });
    });

    flat.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return flat;
  }, [blogs, products]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="all-blogs"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-neutral-50 flex flex-col items-center selection:bg-neutral-900 selection:text-white"
      >
        <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative font-sans text-neutral-900">
          {/* 헤더 */}
          <div className="bg-gradient-to-b from-neutral-50/50 to-white pt-16 pb-8 px-6 text-center">
            <h1 className="font-extrabold text-2xl tracking-tight text-neutral-900 mb-2">
              {settings?.brandName || '비뉴뜨 스튜디오'}
            </h1>
            <p className="text-neutral-500 text-[13px] font-medium tracking-wide">블로그 & 촬영 후기</p>
          </div>

          {/* 블로그 리스트 */}
          <div className="px-6 py-6 flex-1 bg-white">
            {allBlogs.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-2 gap-4"
              >
                {allBlogs.map((blog) => (
                  <motion.div key={`${blog.productId}-${blog.id}`} variants={itemVariants}>
                    <Link
                      to={`/blog/${blog.productId}`}
                      className="block group flex flex-col h-full"
                    >
                      <div className="aspect-square bg-neutral-100 rounded-[1.5rem] overflow-hidden mb-3 relative shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/[0.02] shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-50 group-hover:scale-[1.05] transition-transform duration-700 ease-[0.22,1,0.36,1]">
                          <Image size={32} className="opacity-50" />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                      </div>
                      <div className="px-1 flex-1 flex flex-col">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-neutral-100/80 text-neutral-500 mb-2 self-start tracking-wide truncate max-w-full">
                          {blog.productTitle}
                        </span>
                        <h3 className="text-[14px] font-bold text-neutral-900 leading-[1.4] group-hover:text-neutral-500 transition-colors tracking-tight line-clamp-2">
                          {blog.title}
                        </h3>
                        <span className="text-[11px] text-neutral-400 mt-1">{blog.date}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                  <FileText size={24} className="text-neutral-300" />
                </div>
                <p className="text-neutral-400 font-medium text-sm">등록된 블로그 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
