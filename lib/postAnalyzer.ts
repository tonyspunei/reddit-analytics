import OpenAI from "openai";
import { RedditPost } from "./utils";

export interface PostCategory {
  solutionRequests: boolean;
  painAndAnger: boolean;
  adviceRequests: boolean;
  moneyTalk: boolean;
}

export interface AnalyzedPost extends RedditPost {
  categories: PostCategory;
}

export class PostAnalyzer {
  private openai: OpenAI;
  private static readonly BATCH_SIZE = 5; // Process 5 posts at a time

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY environment variable. Please add it to your .env file."
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  private async analyzePost(post: RedditPost): Promise<PostCategory> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Analyze the Reddit post and categorize it into the following categories. Return a JSON object with boolean values:
            - solutionRequests: Posts seeking solutions for problems
            - painAndAnger: Posts expressing pains or anger
            - adviceRequests: Posts seeking advice
            - moneyTalk: Posts discussing spending money`
          },
          {
            role: "user",
            content: `Title: ${post.title}\nContent: ${post.content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content || '{"solutionRequests":false,"painAndAnger":false,"adviceRequests":false,"moneyTalk":false}');
    } catch (error) {
      console.error('Error analyzing post:', error);
      // Return default categories if analysis fails
      return {
        solutionRequests: false,
        painAndAnger: false,
        adviceRequests: false,
        moneyTalk: false
      };
    }
  }

  async analyzePosts(posts: RedditPost[]): Promise<AnalyzedPost[]> {
    const analyzedPosts: AnalyzedPost[] = [];

    // Process posts in batches
    for (let i = 0; i < posts.length; i += PostAnalyzer.BATCH_SIZE) {
      const batch = posts.slice(i, i + PostAnalyzer.BATCH_SIZE);
      const batchPromises = batch.map(async (post) => {
        const categories = await this.analyzePost(post);
        return {
          ...post,
          categories
        };
      });

      const batchResults = await Promise.all(batchPromises);
      analyzedPosts.push(...batchResults);
    }

    return analyzedPosts;
  }
} 