# AI Journal

A minimal journaling app with AI reflections built with Next.js, Supabase, and GPT-4-turbo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor and run the SQL in `supabase/schema.sql` to create the tables and RLS policies
   - Go to Authentication > Providers and enable "Anonymous" sign-in
   - Copy your project URL and anon key from Settings > API

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add the environment variables in Vercel's project settings
4. Deploy

## Architecture

- **Frontend**: Next.js App Router with React
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase Postgres with RLS
- **Auth**: Supabase Auth (anonymous for single user)
- **AI**: OpenAI GPT-4-turbo (server-side only)

## Data Model

- **Entries**: Groups of blocks belonging to a user
- **Blocks**: Individual pieces of content in a timeline
  - `block_type`: 'human' or 'ai'
  - `content`: The actual text/JSON
  - `order_index`: Position in the timeline
# Journalling-App
