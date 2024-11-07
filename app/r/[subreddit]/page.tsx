"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RedditPost } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { PostsTable } from '@/components/PostsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function fetchSubredditPosts(subreddit: string) {
  const response = await fetch(`/api/reddit?subreddit=${subreddit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

interface SubredditPageProps {
  params: {
    subreddit: string;
  };
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSubredditPosts(params.subreddit);
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
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

      <Tabs defaultValue="posts" className="space-y-4">
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
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Themes content coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
} 