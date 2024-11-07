import { RedditFetcher } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');
  const timeframe = searchParams.get('timeframe');

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  try {
    const posts = await RedditFetcher.getTopPosts(
      subreddit, 
      timeframe ? parseInt(timeframe) : 24
    );
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' }, 
      { status: 500 }
    );
  }
}
