"use client";

import { useState } from "react";
import { SubredditCard } from "@/components/SubredditCard";
import { AddSubredditModal } from "@/components/AddSubredditModal";

interface Subreddit {
  name: string;
  description?: string;
}

// Initial subreddits data
const DEFAULT_SUBREDDITS: Subreddit[] = [
  {
    name: "ollama",
    description: "Open source AI models and chat",
  },
  {
    name: "openai",
    description: "OpenAI and ChatGPT discussions",
  },
];

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>(DEFAULT_SUBREDDITS);

  const handleAddSubreddit = (newSubreddit: Subreddit) => {
    // Check if subreddit already exists
    if (subreddits.some((sub) => sub.name === newSubreddit.name)) {
      alert("This subreddit is already in your list");
      return;
    }

    setSubreddits((prev) => [...prev, newSubreddit]);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reddit Analytics Platform</h1>
        <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard
            key={subreddit.name}
            name={subreddit.name}
            description={subreddit.description}
          />
        ))}
      </div>
    </main>
  );
}
