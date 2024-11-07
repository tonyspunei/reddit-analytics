"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SubredditPageProps {
  params: {
    subreddit: string;
  };
}

export default function SubredditPage({ params }: SubredditPageProps) {
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
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Top Posts content coming soon...
          </div>
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