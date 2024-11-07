import snoowrap from "snoowrap";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RedditPost {
  id: string;
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}

export class RedditFetcher {
  private reddit: snoowrap;
  private static readonly POST_FETCH_LIMIT = 500;

  constructor() {
    // Validate environment variables with more detailed error messages
    const requiredEnvVars = {
      REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT,
      REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
      REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
      REDDIT_USERNAME: process.env.REDDIT_USERNAME,
      REDDIT_PASSWORD: process.env.REDDIT_PASSWORD,
    };

    // Check for missing environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please create a .env file in your project root with the following variables:\n' +
        'REDDIT_USER_AGENT="your-app-name:v1.0.0 (by /u/your-username)"\n' +
        'REDDIT_CLIENT_ID="your-client-id"\n' +
        'REDDIT_CLIENT_SECRET="your-client-secret"\n' +
        'REDDIT_USERNAME="your-reddit-username"\n' +
        'REDDIT_PASSWORD="your-reddit-password"\n\n' +
        'You can get these credentials at https://www.reddit.com/prefs/apps'
      );
    }

    try {
      // Initialize snoowrap with validated environment variables
      this.reddit = new snoowrap({
        userAgent: requiredEnvVars.REDDIT_USER_AGENT!,
        clientId: requiredEnvVars.REDDIT_CLIENT_ID!,
        clientSecret: requiredEnvVars.REDDIT_CLIENT_SECRET!,
        username: requiredEnvVars.REDDIT_USERNAME!,
        password: requiredEnvVars.REDDIT_PASSWORD!,
      });
    } catch (error) {
      console.error('Error initializing snoowrap:', error);
      throw new Error('Failed to initialize Reddit API client. Check your credentials.');
    }
  }

  // Convert to a static method that can be called server-side
  static async getTopPosts(subreddit: string, timeframe: number = 24): Promise<RedditPost[]> {
    // Create a new instance for each request
    const fetcher = new RedditFetcher();
    
    try {
      const timeThreshold = new Date(Date.now() - timeframe * 60 * 60 * 1000);
      
      const posts = await fetcher.reddit
        .getSubreddit(subreddit)
        .getNew({ limit: RedditFetcher.POST_FETCH_LIMIT });

      return posts
        .filter(post => new Date(post.created_utc * 1000) > timeThreshold)
        .map(post => ({
          id: post.id,
          title: post.title,
          content: post.selftext || '',
          score: post.score,
          numComments: post.num_comments,
          createdAt: new Date(post.created_utc * 1000),
          url: post.url,
        }))
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      throw new Error('Failed to fetch Reddit posts');
    }
  }
}
