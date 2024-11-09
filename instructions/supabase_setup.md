# Project Details - Integration with Supabase

## Table of Contents

- [Project Overview](#project-overview)
- [Current Architecture](#current-architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Limitations of Current Approach](#limitations-of-current-approach)
- [Proposed Solution](#proposed-solution)
- [Integration with Supabase](#integration-with-supabase)
  - [Database Schema](#database-schema)
  - [Data Flow](#data-flow)
- [Code Modifications](#code-modifications)
  - [Backend Changes](#backend-changes)
  - [Frontend Changes](#frontend-changes)
- [Implementation Plan](#implementation-plan)
- [Notes for Backend Developer](#notes-for-backend-developer)

## Project Overview

The Reddit Analytics Platform is a web application that allows users to:

- Discover and analyze Reddit content from various subreddits
- View top posts from the past 24 hours
- Analyze themes within subreddit posts using OpenAI's API
- Add new subreddits to monitor and analyze

### Technologies Used

- **Frontend:**
  - Next.js 14
  - Shadcn UI Components
  - Tailwind CSS
  - Lucide Icons
  - TypeScript
  - React

- **Backend:**
  - Snoowrap (Reddit API Library)
  - OpenAI API for post analysis

## Current Architecture

### Current File Structur
reddit-analytics
├── README.md
├── app
│   ├── api
│   │   └── reddit
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── r
│       └── [subreddit]
├── components
│   ├── AddSubredditModal.tsx
│   ├── PostsTable.tsx
│   ├── Providers.tsx
│   ├── SubredditCard.tsx
│   ├── ThemeAnalysis.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       └── tabs.tsx
├── components.json
├── instructions
│   └── instructions.md
├── lib
│   ├── cacheContext.tsx
│   ├── postAnalyzer.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json

### Frontend

- Pages:
  - `app/page.tsx`: Home page displaying subreddit cards and an "Add Reddit" modal
  - `app/r/[subreddit]/page.tsx`: Dynamic route for subreddit pages with "Top Posts" and "Themes" tabs

- Components:
  - `SubredditCard`: Displays information about a subreddit
  - `AddSubredditModal`: Allows users to add new subreddits
  - `PostsTable`: Displays posts in a sortable table
  - `ThemeAnalysis`: Displays categorized themes and posts

### Backend

- **Data Fetching:** When a user visits a subreddit detail page, the application:
  - Uses `RedditFetcher` (in `lib/utils.ts`) to fetch posts from the Reddit API using Snoowrap
  - Uses `PostAnalyzer` (in `lib/postAnalyzer.ts`) to analyze posts using the OpenAI API

- **State Management:** The fetched and analyzed data is stored temporarily in a client-side cache (`lib/cacheContext.tsx`) to prevent refetching during the same session

## Limitations of Current Approach

- **Inefficient Data Fetching:**
  - Data is fetched from Reddit and analyzed by OpenAI every time a user opens a subreddit page
  - Leads to unnecessary API calls, increased latency, and higher costs

- **Scalability Issues:**
  - Not optimal for scaling as the number of users or subreddits increases
  - Puts a heavy load on both Reddit and OpenAI APIs

- **Data Persistence:**
  - No server-side persistence of data
  - Analysis results are not stored for future use

## Proposed Solution

Integrate **Supabase** as a backend service to store Reddit posts data and AI analysis results. Implement caching logic to fetch new data only if the last update was more than 24 hours ago.

### Benefits

- **Performance Improvement:** Reduce API calls by storing and reusing data
- **Cost Reduction:** Minimize OpenAI API usage by reusing analysis results
- **Scalability:** Enable the application to handle more users and subreddits efficiently
- **Data Persistence:** Maintain a historical record of posts and analyses

## Integration with Supabase

### Database Schema

#### Tables

1. **Subreddits**
   - `id` (UUID, Primary Key)
   - `name` (Text, Unique)
   - `description` (Text)
   - `last_updated` (Timestamp)

2. **Posts**
   - `id` (Text, Primary Key) - Reddit post ID
   - `subreddit_id` (UUID, Foreign Key to Subreddits)
   - `title` (Text)
   - `content` (Text)
   - `score` (Integer)
   - `num_comments` (Integer)
   - `created_at` (Timestamp)
   - `url` (Text)
   - `retrieved_at` (Timestamp) - When the post was fetched from Reddit

3. **PostAnalyses**
   - `id` (UUID, Primary Key)
   - `post_id` (Text, Foreign Key to Posts)
   - `solution_requests` (Boolean)
   - `pain_and_anger` (Boolean)
   - `advice_requests` (Boolean)
   - `money_talk` (Boolean)
   - `analyzed_at` (Timestamp)

### Data Flow

1. **User Interaction:**
   - User selects a subreddit to view

2. **Data Retrieval Process:**
   - Check if the subreddit exists in the `Subreddits` table
     - If not, add it with `last_updated` set to `null`
   - Check `last_updated` for the subreddit
     - If `last_updated` is less than 24 hours ago, fetch data from Supabase
     - If more than 24 hours ago, proceed to fetch from Reddit API

3. **Fetching and Saving Data:**
   - **Fetch Posts:**
     - Use `RedditFetcher` to fetch posts from Reddit
     - Upsert posts into the `Posts` table
   - **Analyze Posts:**
     - Use `PostAnalyzer` to analyze posts with OpenAI API
     - Upsert analysis results into the `PostAnalyses` table
   - **Update `last_updated`:**
     - Update the `Subreddits` table with the current timestamp

4. **Data Display:**
   - Retrieve posts and analysis results from Supabase
   - Display data in the frontend as per existing UI components

## Code Modifications

### Backend Changes

Implement server-side API routes to interact with Supabase.

1. **Create Supabase Client:**
   - Initialize a Supabase client in a shared utility file (e.g., `lib/supabaseClient.ts`)

2. **Modify API Routes:**
   - Update `app/api/reddit/route.ts` to handle data fetching and storage logic
   - Implement the logic to:
     - Check `last_updated`
     - Fetch and store data in Supabase if needed
     - Retrieve data from Supabase for the frontend

3. **Data Fetching Logic:**
   - **Check Subreddit:**
     - Verify if the subreddit exists
     - If not, insert it into the `Subreddits` table
   - **Check `last_updated`:**
     - If outdated, fetch new posts and analyses, and update the `last_updated` field
   - **Fetch Posts:**
     - Use `RedditFetcher` to get new posts
     - Upsert posts into `Posts` table
   - **Analyze Posts:**
     - Use `PostAnalyzer` to analyze new posts
     - Upsert analyses into `PostAnalyses` table
   - **Update `last_updated`:**
     - Set to the current timestamp after successful fetch and analysis

### Frontend Changes

1. **Modify Data Fetching:**
   - Update components to fetch data from the updated API endpoints
   - Remove direct calls to `RedditFetcher` and `PostAnalyzer` from client-side code

2. **Cache Handling:**
   - Adjust or remove client-side caching (`lib/cacheContext.tsx`) as data is now cached server-side

3. **Error Handling:**
   - Update error handling to accommodate potential backend failures or delays

## Implementation Plan

1. **Set Up Supabase Project:**
   - Create a new Supabase project
   - Set up authentication and secure access

2. **Define Database Schema:**
   - Use Supabase's SQL editor to create the tables as per the schema defined

3. **Implement Supabase Client:**
   - Initialize Supabase client in `lib/supabaseClient.ts`:

   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

4. **Update API Route:**
   - Modify `app/api/reddit/route.ts` to include:
     - Fetching data from Supabase
     - Logic to determine if fresh data is needed
     - Fetching new data and updating Supabase

5. **Backend Logic:**
   - **Fetch Data Function:**
     - Check `last_updated`
     - Fetch posts from Reddit
     - Analyze posts with OpenAI
     - Store data in Supabase
   - **Upserting Data:**
     - Use Supabase's `upsert` functionality to insert or update records

6. **Update Frontend Components:**
   - Modify components like `SubredditPage` to fetch data from the updated API route

7. **Environment Variables:**
   - Update `.env.local` with:
     - Supabase URL and Anon Key
     - Ensure Reddit and OpenAI API keys are set

8. **Testing:**
   - Test the entire flow:
     - Adding a new subreddit
     - Viewing the subreddit page
     - Ensuring data is fetched from Supabase

9. **Error Handling and Logging:**
   - Implement error logging for debugging
   - Provide meaningful error messages to the frontend

## Notes for Backend Developer

### Supabase Configuration

- Ensure that all environment variables are correctly set
- Use server-side environment variables for sensitive keys (`SUPABASE_SERVICE_ROLE_KEY`)

### Security Considerations

- Do not expose service role keys or any sensitive information to the client-side
- Use RLS (Row Level Security) policies if needed

### API Rate Limits

- Be cautious of Reddit and OpenAI API rate limits
- Implement exponential backoff or queuing mechanisms if necessary

### Timeouts and Retries

- Handle potential timeouts from API calls
- Implement retries with limits

### Data Consistency

- Ensure that the data in Supabase remains consistent
- Handle cases where data fetching or analysis fails mid-process

### Scalability

- Consider the potential need for background jobs or cron tasks if the application scales

### Documentation

- Document any new functions or modules created
- Maintain code readability and comment where necessary

## Additional Considerations

### Future Enhancements

- Implement background jobs to periodically refresh data
- Add user authentication and personalization
- Expand the database schema for additional analytics

### Monitoring and Logging

- Set up monitoring tools to track API usage and performance
- Log errors and important events for troubleshooting

### Collaboration

- Coordinate with frontend developers to ensure seamless integration
- Keep communication channels open for feedback and issues

---

By following this guide, the backend developer should have a clear understanding of how to integrate Supabase into the existing project structure. The focus is on efficient data fetching, storage, and retrieval to enhance performance and scalability.