"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PostsTable } from "@/components/PostsTable";
import { ThemeAnalysis } from "@/components/ThemeAnalysis";
import { RedditPost } from "@/lib/utils";
import { AnalyzedPost } from "@/lib/postAnalyzer";

interface SubredditPageProps {
  params: {
    subreddit: string;
  };
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const [analyzedPosts, setAnalyzedPosts] = useState<AnalyzedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch analyzed posts for both tabs
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `/api/reddit?subreddit=${params.subreddit}&analyze=true`
        );
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setAnalyzedPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [params.subreddit]);

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <Link 
          href="/" 
          className="flex items-center text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subreddits
        </Link>
        <h1 className="text-4xl font-bold">r/{params.subreddit}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {isLoading ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Loading posts...
            </div>
          ) : error ? (
            <div className="rounded-lg border p-8 text-center text-red-500">
              {error}
            </div>
          ) : (
            <PostsTable posts={analyzedPosts} />
          )}
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          {isLoading ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Loading posts...
            </div>
          ) : error ? (
            <div className="rounded-lg border p-8 text-center text-red-500">
              {error}
            </div>
          ) : analyzedPosts.length > 0 ? (
            <ThemeAnalysis posts={analyzedPosts} />
          ) : (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No analyzed posts available.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
} 