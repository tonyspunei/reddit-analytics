"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { AnalyzedPost } from './postAnalyzer';

interface CacheData {
  [subreddit: string]: {
    posts: AnalyzedPost[];
    lastUpdated: number;
  };
}

interface CacheContextType {
  cache: CacheData;
  setCache: (subreddit: string, posts: AnalyzedPost[]) => void;
  getCachedPosts: (subreddit: string) => AnalyzedPost[] | null;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<CacheData>({});

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('redditCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        // Validate cache structure
        if (typeof parsedCache === 'object' && parsedCache !== null) {
          // Convert date strings back to Date objects
          Object.values(parsedCache).forEach((subredditData: any) => {
            if (Array.isArray(subredditData.posts)) {
              subredditData.posts = subredditData.posts.map((post: any) => ({
                ...post,
                createdAt: new Date(post.createdAt)
              }));
            }
          });
          setCache(parsedCache);
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      localStorage.removeItem('redditCache'); // Clear invalid cache
    }
  }, []);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('redditCache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }, [cache]);

  const setCacheForSubreddit = (subreddit: string, posts: AnalyzedPost[]) => {
    setCache(prevCache => ({
      ...prevCache,
      [subreddit]: {
        posts,
        lastUpdated: Date.now()
      }
    }));
  };

  const getCachedPosts = (subreddit: string): AnalyzedPost[] | null => {
    const cachedData = cache[subreddit];
    if (!cachedData) return null;

    // Check if cache is older than 24 hours
    const isExpired = Date.now() - cachedData.lastUpdated > 24 * 60 * 60 * 1000;
    return isExpired ? null : cachedData.posts;
  };

  return (
    <CacheContext.Provider
      value={{
        cache,
        setCache: setCacheForSubreddit,
        getCachedPosts
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
} 