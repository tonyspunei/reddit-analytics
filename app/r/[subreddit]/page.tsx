"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { PostsTable } from "@/components/PostsTable";
import { ThemeAnalysis } from "@/components/ThemeAnalysis";
import { AnalyzedPost } from "@/lib/postAnalyzer";
import { Button } from "@/components/ui/button";
import { PostWithAnalysis } from "@/lib/supabase/helpers";

interface SubredditPageProps {
  params: {
    subreddit: string;
  };
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const [posts, setPosts] = useState<PostWithAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  const fetchPosts = async (forceFetch = false) => {
    try {
      const response = await fetch(`/api/reddit?subreddit=${params.subreddit}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPosts();
  }, [params.subreddit]);

  const handleRefetch = () => {
    setIsRefetching(true);
    fetchPosts(true);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/" 
            className="flex items-center text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subreddits
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefetch}
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
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
            <PostsTable posts={posts} />
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
          ) : posts.length > 0 ? (
            <ThemeAnalysis posts={posts} />
          ) : (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No posts available.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
} 