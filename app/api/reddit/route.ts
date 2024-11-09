import { supabaseAdmin } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';
import { RedditFetcher } from '@/lib/utils';
import { PostAnalyzer } from '@/lib/postAnalyzer';
import { transformPosts } from '@/lib/supabase/helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subredditName = searchParams.get('subreddit');

    if (!subredditName) {
      return NextResponse.json(
        { error: 'Subreddit name is required' },
        { status: 400 }
      );
    }

    // Check if subreddit exists and when it was last updated
    let { data: subreddit, error: subredditError } = await supabaseAdmin
      .from('subreddits')
      .select('*')
      .eq('name', subredditName)
      .single();

    if (subredditError && subredditError.code !== 'PGRST116') {
      throw subredditError;
    }

    const now = new Date();
    const shouldFetchNewData = !subreddit?.last_updated || 
      (new Date(subreddit.last_updated).getTime() + 24 * 60 * 60 * 1000) < now.getTime();

    if (!shouldFetchNewData && subreddit) {
      // Fetch existing data from Supabase
      const { data: posts, error: postsError } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          post_analyses (*)
        `)
        .eq('subreddit_id', subreddit.id)
        .order('score', { ascending: false });

      if (postsError) throw postsError;
      
      return NextResponse.json({ 
        posts: posts ? transformPosts(posts) : [] 
      });
    }

    // If subreddit doesn't exist, create it
    if (!subreddit) {
      const { data: newSubreddit, error: createError } = await supabaseAdmin
        .from('subreddits')
        .insert([
          { 
            name: subredditName,
            last_updated: null
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      
      if (newSubreddit) {
        subreddit = newSubreddit;
      }
    }

    // Fetch new data from Reddit
    const redditPosts = await RedditFetcher.getTopPosts(subredditName);

    // Process each post
    for (const post of redditPosts) {
      // Insert post
      const { data: insertedPost, error: postError } = await supabaseAdmin
        .from('posts')
        .upsert({
          id: post.id,
          subreddit_id: subreddit.id,
          title: post.title,
          content: post.content || null,
          score: post.score,
          num_comments: post.numComments,
          created_at: post.createdAt.toISOString(),
          url: post.url,
          retrieved_at: now.toISOString()
        })
        .select()
        .single();

      if (postError) throw postError;

      // Analyze post and store analysis
      const analyzer = new PostAnalyzer();
      const [analyzedPost] = await analyzer.analyzePosts([post]);
      
      const { error: analysisError } = await supabaseAdmin
        .from('post_analyses')
        .upsert({
          post_id: post.id,
          solution_requests: analyzedPost.categories.solutionRequests,
          pain_and_anger: analyzedPost.categories.painAndAnger,
          advice_requests: analyzedPost.categories.adviceRequests,
          money_talk: analyzedPost.categories.moneyTalk,
          analyzed_at: now.toISOString()
        }, {
          onConflict: 'post_id',
          ignoreDuplicates: true
        });

      if (analysisError) throw analysisError;
    }

    // Update subreddit last_updated timestamp
    const { error: updateError } = await supabaseAdmin
      .from('subreddits')
      .update({ last_updated: now.toISOString() })
      .eq('id', subreddit.id);

    if (updateError) throw updateError;

    // Fetch the newly stored data
    const { data: posts, error: finalFetchError } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        post_analyses (*)
      `)
      .eq('subreddit_id', subreddit.id)
      .order('score', { ascending: false });

    if (finalFetchError) throw finalFetchError;

    return NextResponse.json({ 
      posts: posts ? transformPosts(posts) : [] 
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
