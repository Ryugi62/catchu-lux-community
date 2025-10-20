import { useEffect, useMemo, useState } from 'react';
import { listenToLatestPosts } from '../features/posts/api';
import type { Post } from '../features/posts/types';

export const usePostsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToLatestPosts((incoming) => {
      setPosts(incoming);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (brandFilter && post.brand !== brandFilter) {
        return false;
      }
      if (categoryFilter && post.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [posts, brandFilter, categoryFilter]);

  return {
    posts: filteredPosts,
    isLoading,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilter: Boolean(brandFilter || categoryFilter),
    clearFilters: () => {
      setBrandFilter(null);
      setCategoryFilter(null);
    },
  };
};
