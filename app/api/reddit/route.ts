import { RedditFetcher } from '@/lib/utils';
import { PostAnalyzer } from '@/lib/postAnalyzer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');
  const timeframe = searchParams.get('timeframe');
  const analyze = searchParams.get('analyze') === 'true';

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  try {
    const posts = await RedditFetcher.getTopPosts(
      subreddit, 
      timeframe ? parseInt(timeframe) : 24
    );

    if (analyze) {
      const analyzer = new PostAnalyzer();
      const analyzedPosts = await analyzer.analyzePosts(posts);
      return NextResponse.json(analyzedPosts);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
