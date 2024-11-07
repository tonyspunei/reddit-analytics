# Reddit Analytics Platform - Product Requirements Document (PRD)

## Project Overview
We are building a Reddit Analytics Platform where users can:
- Discover and analyze Reddit content from various subreddits
- View top posts and analyze themes within subreddit posts
- Add new subreddits to monitor and analyze

The platform utilizes Next.js 14, Shadcn UI components, Tailwind CSS, and Lucide Icons for the frontend, and leverages Snoowrap for Reddit API interactions and OpenAI's API for post analysis.

## Table of Contents
- [Core Functionalities](#core-functionalities)
- [Technical Requirements](#technical-requirements)
- [File Structure](#file-structure)
- [Detailed Implementation Guide](#detailed-implementation-guide)
  - [Fetching Reddit Posts with Snoowrap](#fetching-reddit-posts-with-snoowrap)
  - [Analyzing Posts with OpenAI](#analyzing-posts-with-openai)
- [Appendix](#appendix)
  - [Example Code Snippets](#example-code-snippets)
  - [Example Output](#example-output)

## Core Functionalities

### 1. Subreddit Management

#### View Available Subreddits
- Users can see a list of available subreddits displayed as cards
- Common subreddits like "ollama" and "openai" are pre-added

#### Add New Subreddits
- Users can click on an "Add Reddit" button to open a modal
- In the modal, users can paste a Reddit URL to add a new subreddit
- Upon adding, a new subreddit card is displayed on the home page

### 2. Subreddit Detail Page

#### Navigation
- Clicking on a subreddit card navigates to the subreddit detail page
- The page includes two tabs: "Top Posts" and "Themes"

### 3. Fetching Reddit Posts - "Top Posts" Tab

#### Data Retrieval
- Fetch Reddit posts from the past 24 hours using Snoowrap
- Each post includes:
  - Title
  - Score
  - Content
  - URL
  - Creation Time (created_utc)
  - Number of Comments (num_comments)

#### Display
- Posts are displayed in a table component
- The table is sortable based on the score

### 4. Analyzing Reddit Posts - "Themes" Tab

#### Post Analysis
- Each post is sent to OpenAI for analysis using structured output
- Posts are categorized into:
  - Solution Requests: Seeking solutions for problems
  - Pain & Anger: Expressing pain or anger
  - Advice Requests: Seeking advice
  - Money Talk: Discussing spending money

#### Concurrent Processing
- The analysis runs concurrently for faster processing

#### Display
- Categories are displayed as cards with:
  - Title
  - Description
  - Number of Posts in the Category
- Clicking on a category card opens a side panel showing all posts under that category

### 5. Dynamic Category Management

#### Add New Categories
- Users can add new categories (cards)
- Adding a new category triggers re-analysis of posts to include the new category

## Technical Requirements

### Frontend Technologies
- Next.js 14
- Shadcn UI Components
- Tailwind CSS
- Lucide Icons

### Backend and APIs
- Snoowrap (Reddit API Library)
- OpenAI API for post analysis

### Languages and Frameworks
- TypeScript
- React

## File Structure
The project aims for minimal file usage while maintaining clarity and functionality.

```
reddit-analytics
├── app
│   ├── layout.tsx
│   ├── page.tsx
│   └── r
│       └── [subreddit]
│           └── page.tsx
├── lib
│   └── utils.ts
├── styles
│   └── globals.css
├── next.config.js
├── package.json
└── tsconfig.json
```

### File Breakdown

#### app/layout.tsx
- Root layout of the application
- Includes global components like headers, footers, and context providers
- Imports global styles

#### app/page.tsx
- Home page displaying subreddit cards
- Contains the "Add Reddit" modal component

#### app/r/[subreddit]/page.tsx
- Dynamic route for subreddit pages
- Implements "Top Posts" and "Themes" tabs
- Contains components for displaying posts and themes

#### lib/utils.ts
- Utility functions and classes
- RedditFetcher: Fetches posts using Snoowrap
- PostAnalyzer: Analyzes posts using OpenAI's API
- Any additional shared utility functions

#### styles/globals.css
- Global CSS styles
- Includes Tailwind CSS directives and custom styles

#### next.config.js
- Next.js configuration file
- Custom configurations as needed

#### package.json
- Project dependencies and scripts
- Includes dependencies like Next.js, Tailwind CSS, Snoowrap, OpenAI SDK, etc.

#### tsconfig.json
- TypeScript configuration
- Compiler options and path aliases

## Detailed Implementation Guide

### Fetching Reddit Posts with Snoowrap

#### Overview
Use the Snoowrap library to interact with the Reddit API and fetch posts from specified subreddits within the past 24 hours.

#### Steps

##### Setup Snoowrap Configuration
- Obtain Reddit API credentials:
  - userAgent
  - clientId
  - clientSecret
  - username
  - password
- Store credentials securely, preferably using environment variables

##### Implement RedditFetcher Class in lib/utils.ts

###### Constructor
- Validates the configuration
- Initializes the Snoowrap client

###### Methods
- `getRecentUserPosts(subreddit: string, options = { hours: 24 }): Promise<RedditPost[]>`
  - Fetches posts from the specified subreddit within the given time frame
  - Utilizes pagination to fetch batches of posts
  - Filters posts based on the creation time

###### Data Model
```typescript
interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}
```

##### Important Notes
- Error Handling
  - Implement robust error handling to catch and display meaningful errors
- Rate Limiting
  - Be mindful of Reddit's API rate limits
- Environment Variables
  - Use a .env file to store sensitive information securely

##### Example Code Snippet
Refer to the Appendix for detailed code.

### Analyzing Posts with OpenAI

#### Overview
Use the OpenAI API to analyze Reddit posts and categorize them into predefined themes.

#### Steps

##### Setup OpenAI Configuration
- Obtain an OpenAI API key
- Store the API key securely using environment variables

##### Define Categories Using Zod Schema
- Utilize the zod library to define a schema for the categories
- Categories:
  - solutionRequests
  - painAndAnger
  - adviceRequests
  - moneyTalk
- Each category is a boolean indicating the presence of that theme in the post

##### Implement PostAnalyzer Class in lib/utils.ts

###### Constructor
- Initializes the OpenAI client

###### Methods
- `analyzePost(post: RedditPost): Promise<PostCategoryAnalysis>`
  - Sends the post to OpenAI for analysis
  - Parses the structured output using the Zod schema
- `analyzePosts(posts: RedditPost[]): Promise<PostCategoryAnalysis[]>`
  - Processes multiple posts concurrently for efficiency

###### Data Model
```typescript
interface PostCategoryAnalysis {
  solutionRequests: boolean;
  painAndAnger: boolean;
  adviceRequests: boolean;
  moneyTalk: boolean;
}
```

##### Important Notes
- Concurrency
  - Analyze multiple posts concurrently to improve performance
- Structured Output
  - Use structured output to get consistent and parsable responses from OpenAI
- Error Handling
  - Handle API errors gracefully and provide fallback mechanisms if needed

##### Example Code Snippet
Refer to the Appendix for detailed code.

## Appendix

### Example Code Snippets

#### Fetching Reddit Posts - Code Example
```typescript
// lib/utils.ts

import snoowrap from 'snoowrap';

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}

interface RedditClientConfig {
  userAgent: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export class RedditFetcher {
  private reddit: snoowrap;
  private static readonly POST_FETCH_LIMIT = 100;
  private static readonly HOURS_THRESHOLD = 24;

  constructor(config: RedditClientConfig) {
    this.validateConfig(config);
    this.reddit = new snoowrap(config);
  }

  private validateConfig(config: RedditClientConfig): void {
    const requiredFields = ['userAgent', 'clientId', 'clientSecret', 'username', 'password'];
    const missingFields = requiredFields.filter(field => !config[field as keyof RedditClientConfig]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }
  }

  async getRecentUserPosts(subreddit: string, options = { hours: RedditFetcher.HOURS_THRESHOLD }): Promise<RedditPost[]> {
    if (!subreddit?.trim()) {
      throw new Error('Subreddit name is required');
    }

    try {
      const timeThreshold = new Date(Date.now() - options.hours * 60 * 60 * 1000);
      
      const posts = await this.fetchPostsBatch(subreddit, timeThreshold);
      
      console.log(`Found ${posts.length} posts from last ${options.hours}h in r/${subreddit}`);
      return posts;

    } catch (error) {
      this.handleError('fetch Reddit posts', error);
    }
  }

  private async fetchPostsBatch(subreddit: string, timeThreshold: Date): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];
    let lastPost: snoowrap.Submission | null = null;

    while (true) {
      const options = {
        limit: RedditFetcher.POST_FETCH_LIMIT,
        ...(lastPost && { after: lastPost.name })
      };

      const batch = await this.reddit.getSubreddit(subreddit).getNew(options);
      
      if (!batch.length) break;

      const recentPosts = this.processPostBatch(batch, timeThreshold);
      posts.push(...recentPosts);

      // Stop if we've gone past our time threshold
      const oldestInBatch = new Date(batch[batch.length - 1].created_utc * 1000);
      if (oldestInBatch < timeThreshold) break;

      lastPost = batch[batch.length - 1];
    }

    return posts;
  }

  private processPostBatch(posts: snoowrap.Submission[], timeThreshold: Date): RedditPost[] {
    return posts
      .filter(post => new Date(post.created_utc * 1000) > timeThreshold)
      .map(post => ({
        title: post.title,
        content: post.selftext || '',
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000),
        url: post.url
      }));
  }

  private handleError(operation: string, error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error during ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${errorMessage}`);
  }
}
```

#### Analyzing Posts with OpenAI - Code Example
```typescript
// lib/utils.ts (continued)

import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const PostCategorySchema = z.object({
  solutionRequests: z
    .boolean()
    .describe('Posts where people are seeking solutions for problems'),
  painAndAnger: z
    .boolean()
    .describe('Posts where people are expressing pains or anger'),
  adviceRequests: z
    .boolean()
    .describe('Posts where people are seeking advice'),
  moneyTalk: z
    .boolean()
    .describe('Posts where people are talking about spending money'),
});

type PostCategoryAnalysis = z.infer<typeof PostCategorySchema>;

export class PostAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  private getCategoryDescriptions(): string {
    return Object.entries(PostCategorySchema.shape)
      .map(([key, value]) => `- ${key}: ${(value as z.ZodBoolean)._def.description}`)
      .join('\n');
  }

  async analyzePost(post: RedditPost): Promise<PostCategoryAnalysis> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Analyze the Reddit post and categorize it into the following categories:\n${this.getCategoryDescriptions()}`
          },
          {
            role: "user",
            content: `Title: ${post.title}\nContent: ${post.content}`
          }
        ],
        response_format: zodResponseFormat(PostCategorySchema, "categories")
      });

      const content = completion.choices[0].message.content;
      const parsedContent = JSON.parse(content || '{}');
      return PostCategorySchema.parse(parsedContent);
    } catch (error) {
      console.error('Error analyzing post:', error);
      throw new Error('Failed to analyze post');
    }
  }

  async analyzePosts(posts: RedditPost[]): Promise<PostCategoryAnalysis[]> {
    const batchSize = 5;
    const results: PostCategoryAnalysis[] = [];

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const batchPromises = batch.map(post => this.analyzePost(post));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}
```

### Example Output
```json
{
  "solutionRequests": true,
  "painAndAnger": false,
  "adviceRequests": false,
  "moneyTalk": false
}
```

### Additional Details

#### User Interface Components

##### Subreddit Cards
- Display subreddit name and basic info
- Include an icon or image representing the subreddit

##### Add Reddit Modal
- Input field for Reddit URL
- Validation to ensure the URL corresponds to a subreddit
- Success and error messages upon submission

##### Tabs on Subreddit Page
- Top Posts Tab
  - Table displaying posts with sortable columns
  - Pagination if necessary
- Themes Tab
  - Cards representing each category
  - Count of posts in each category
  - Side panel that appears when a category card is clicked

##### Category Side Panel
- Lists all posts under the selected category
- Allows users to view post details

#### Data Flow

##### User Interaction
- User selects or adds a subreddit

##### Data Fetching
- RedditFetcher retrieves posts from the subreddit

##### Data Analysis
- PostAnalyzer analyzes each post
- Results are categorized and stored

##### Data Display
- Posts and themes are displayed in the UI
- Users can interact with the data through the UI components

#### Performance Considerations

##### Caching
- Implement caching strategies to avoid redundant data fetching and analysis

##### Pagination and Lazy Loading
- For large datasets, implement pagination or lazy loading to improve UI performance

#### Error Handling and User Feedback
- Provide clear error messages to users when operations fail
- Use try-catch blocks in asynchronous operations
- Display loading indicators during data fetching and analysis

#### Security Considerations

##### API Keys
- Store API keys securely using environment variables
- Do not expose sensitive information in the frontend code

##### Input Validation
- Validate user inputs, especially when adding new subreddits
- Sanitize data to prevent security vulnerabilities

#### Future Enhancements

##### User Authentication
- Implement user accounts to save preferences and data

##### Additional Analytics
- Expand analysis to include sentiment analysis, keyword extraction, etc.

##### Mobile Responsiveness
- Ensure the UI is responsive and works well on mobile devices