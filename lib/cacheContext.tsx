"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AnalyzedPost } from './postAnalyzer';

interface CacheState {
  posts: {
    [subreddit: string]: {
      data: AnalyzedPost[];
      timestamp: number;
    };
  };
}

type CacheAction = 
  | { type: 'SET_POSTS'; subreddit: string; posts: AnalyzedPost[] }
  | { type: 'CLEAR_POSTS'; subreddit: string }
  | { type: 'CLEAR_OLD_CACHE' }
  | { type: 'HYDRATE'; state: CacheState };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'reddit-analytics-cache';

const CacheContext = createContext<{
  state: CacheState;
  dispatch: React.Dispatch<CacheAction>;
} | null>(null);

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  let newState: CacheState;

  switch (action.type) {
    case 'SET_POSTS':
      newState = {
        ...state,
        posts: {
          ...state.posts,
          [action.subreddit]: {
            data: action.posts,
            timestamp: Date.now(),
          },
        },
      };
      break;

    case 'CLEAR_POSTS':
      const { [action.subreddit]: _, ...remainingPosts } = state.posts;
      newState = {
        ...state,
        posts: remainingPosts,
      };
      break;

    case 'CLEAR_OLD_CACHE':
      const now = Date.now();
      const validPosts = Object.entries(state.posts).reduce(
        (acc, [subreddit, cache]) => {
          if (now - cache.timestamp < CACHE_DURATION) {
            acc[subreddit] = cache;
          }
          return acc;
        },
        {} as CacheState['posts']
      );
      newState = {
        ...state,
        posts: validPosts,
      };
      break;

    case 'HYDRATE':
      newState = action.state;
      break;

    default:
      return state;
  }

  // Persist to localStorage after every action
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  return newState;
}

function getInitialState(): CacheState {
  if (typeof window !== 'undefined') {
    const savedCache = localStorage.getItem(STORAGE_KEY);
    if (savedCache) {
      try {
        const parsed = JSON.parse(savedCache);
        // Convert ISO date strings back to Date objects
        Object.values(parsed.posts).forEach((cache: any) => {
          cache.data.forEach((post: any) => {
            post.createdAt = new Date(post.createdAt);
          });
        });
        return parsed;
      } catch (error) {
        console.error('Error parsing cache from localStorage:', error);
      }
    }
  }
  return { posts: {} };
}

export function CacheProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cacheReducer, null, getInitialState);

  // Clean old cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEAR_OLD_CACHE' });
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <CacheContext.Provider value={{ state, dispatch }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
} 