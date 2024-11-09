export interface Database {
  public: {
    Tables: {
      subreddits: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          last_updated: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          last_updated?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          last_updated?: string | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          subreddit_id: string;
          title: string;
          content: string | null;
          score: number;
          num_comments: number;
          created_at: string;
          url: string;
          retrieved_at: string;
        };
        Insert: {
          id: string;
          subreddit_id: string;
          title: string;
          content?: string | null;
          score: number;
          num_comments: number;
          created_at?: string;
          url: string;
          retrieved_at?: string;
        };
        Update: {
          id?: string;
          subreddit_id?: string;
          title?: string;
          content?: string | null;
          score?: number;
          num_comments?: number;
          created_at?: string;
          url?: string;
          retrieved_at?: string;
        };
      };
      post_analyses: {
        Row: {
          id: string;
          post_id: string;
          solution_requests: boolean;
          pain_and_anger: boolean;
          advice_requests: boolean;
          money_talk: boolean;
          analyzed_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          solution_requests: boolean;
          pain_and_anger: boolean;
          advice_requests: boolean;
          money_talk: boolean;
          analyzed_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          solution_requests?: boolean;
          pain_and_anger?: boolean;
          advice_requests?: boolean;
          money_talk?: boolean;
          analyzed_at?: string;
        };
      };
    };
  };
} 