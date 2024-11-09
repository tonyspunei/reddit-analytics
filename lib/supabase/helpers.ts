import { Database } from './database.types';
import { AnalyzedPost, PostCategory } from '@/lib/postAnalyzer';
import { RedditPost } from '@/lib/utils';

export type SubredditRow = Database['public']['Tables']['subreddits']['Row'];
export type PostRow = Database['public']['Tables']['posts']['Row'];
export type PostAnalysisRow = Database['public']['Tables']['post_analyses']['Row'];

export type PostWithAnalysis = PostRow & {
  post_analyses: PostAnalysisRow[];
};

// Transform Supabase post format to component format
export function transformPost(post: PostWithAnalysis): AnalyzedPost {
  const analysis = post.post_analyses?.[0] ?? null; // Handle possible undefined post_analyses
  
  return {
    id: post.id,
    title: post.title,
    content: post.content || '',
    url: post.url,
    score: post.score,
    numComments: post.num_comments,
    createdAt: new Date(post.created_at),
    categories: {
      solutionRequests: analysis?.solution_requests ?? false,
      painAndAnger: analysis?.pain_and_anger ?? false,
      adviceRequests: analysis?.advice_requests ?? false,
      moneyTalk: analysis?.money_talk ?? false
    }
  };
}

// Transform array of Supabase posts
export function transformPosts(posts: PostWithAnalysis[] | null | undefined): AnalyzedPost[] {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  return posts.map(transformPost);
}

export function isPostWithAnalysis(post: any): post is PostWithAnalysis {
  return post && 
    typeof post.id === 'string' && 
    Array.isArray(post.post_analyses);
} 