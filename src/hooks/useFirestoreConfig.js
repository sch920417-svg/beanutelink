import { useState, useEffect } from 'react';
import { defaultServiceConfig, defaultServiceProducts, defaultServicePosts } from '../data/serviceData';

/**
 * localStorage에서 pageConfigs + settings를 읽어
 * ServicePage가 기대하는 config 형태로 변환
 */
function buildConfigFromPageConfigs(pageConfigs, settings) {
  const tabEntries = Object.entries(pageConfigs)
    .map(([id, cfg]) => ({ id, label: cfg.meta?.label || id, icon: cfg.meta?.icon || '📦', order: cfg.meta?.order ?? 99 }))
    .sort((a, b) => a.order - b.order);

  const tabs = tabEntries.map(({ id, label }) => ({ id, label }));

  // 탭별 히어로 이미지
  const heroImages = {};
  for (const [tabId, cfg] of Object.entries(pageConfigs)) {
    heroImages[tabId] = cfg.heroImages || [];
  }

  // 탭별 가이드
  const guides = {};
  for (const [tabId, cfg] of Object.entries(pageConfigs)) {
    if (cfg.guide) {
      guides[tabId] = cfg.guide;
    }
  }

  // 스플래시 (첫 탭의 splash 또는 settings 기반)
  const firstTabConfig = pageConfigs[tabEntries[0]?.id];
  const splash = {
    logoText: firstTabConfig?.splash?.logoText || settings?.brandName || 'BEANUTE',
    logoImage: firstTabConfig?.splash?.logoImage || '',
    duration: 1.8,
  };

  return { splash, tabs, heroImages, guides };
}

/**
 * pageConfigs에서 견적 계산용 상품 추출
 */
function buildProductsFromPageConfigs(pageConfigs) {
  const products = [];
  for (const [tabId, cfg] of Object.entries(pageConfigs)) {
    const tabProducts = cfg.quoteBuilder?.products || [];
    for (const p of tabProducts) {
      products.push({ ...p, tabId });
    }
  }
  return products;
}

/**
 * blogs 데이터를 ServicePage가 기대하는 flat posts 배열로 변환
 */
function buildPostsFromBlogs(blogs, pageConfigs) {
  const posts = [];
  if (!blogs || typeof blogs !== 'object') return posts;

  // blogs는 { productId: [blogArray] } 형태
  for (const [productId, blogList] of Object.entries(blogs)) {
    if (!Array.isArray(blogList)) continue;

    // productId로부터 tabId 찾기 (pageConfigs의 quoteBuilder.products에서 매칭)
    let tabId = '';
    for (const [tId, cfg] of Object.entries(pageConfigs)) {
      const tabProducts = cfg.quoteBuilder?.products || [];
      if (tabProducts.some(p => p.id === productId)) {
        tabId = tId;
        break;
      }
    }
    // 매칭 안 되면 productId 자체를 tabId로 사용
    if (!tabId) tabId = productId;

    for (const blog of blogList) {
      posts.push({
        id: blog.id,
        category: blog.category || '',
        title: blog.title || '',
        thumbnail: blog.thumbnail || '',
        tabId,
      });
    }
  }
  return posts;
}

/**
 * 서비스 설정 데이터 Hook
 * localStorage의 pageConfigs + settings를 읽어 실시간 미리보기와 동일한 데이터 제공
 */
export function useServiceConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedPageConfigs = localStorage.getItem('sl_page_configs');
      const storedSettings = localStorage.getItem('sl_settings');

      if (storedPageConfigs) {
        const pageConfigs = JSON.parse(storedPageConfigs);
        const settings = storedSettings ? JSON.parse(storedSettings) : {};
        setConfig(buildConfigFromPageConfigs(pageConfigs, settings));
      } else {
        setConfig(defaultServiceConfig);
      }
    } catch {
      setConfig(defaultServiceConfig);
    }
    setLoading(false);
  }, []);

  return { config, loading, error };
}

/**
 * 서비스 상품 리스트 Hook (견적 계산용)
 * localStorage의 pageConfigs에서 quoteBuilder.products 추출
 */
export function useServiceProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedPageConfigs = localStorage.getItem('sl_page_configs');
      if (storedPageConfigs) {
        const pageConfigs = JSON.parse(storedPageConfigs);
        setProducts(buildProductsFromPageConfigs(pageConfigs));
      } else {
        setProducts(defaultServiceProducts);
      }
    } catch {
      setProducts(defaultServiceProducts);
    }
    setLoading(false);
  }, []);

  return { products, loading, error };
}

/**
 * 서비스 블로그 포스트 Hook
 * localStorage의 blogs + pageConfigs에서 flat posts 배열 생성
 */
export function useServicePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedBlogs = localStorage.getItem('sl_blogs');
      const storedPageConfigs = localStorage.getItem('sl_page_configs');

      if (storedBlogs && storedPageConfigs) {
        const blogs = JSON.parse(storedBlogs);
        const pageConfigs = JSON.parse(storedPageConfigs);
        setPosts(buildPostsFromBlogs(blogs, pageConfigs));
      } else {
        setPosts(defaultServicePosts);
      }
    } catch {
      setPosts(defaultServicePosts);
    }
    setLoading(false);
  }, []);

  return { posts, loading, error };
}
