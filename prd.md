1. Overview

Project Name: AI Journal
Purpose:
A private, minimal journaling app built to experiment with AI integration. The app allows freeform journaling and uses GPT-4-turbo to generate reflections and follow-up questions after the user completes an entry.

Target User:
Single user (you). No authentication. Not public-facing.

Non-Goals:

No social features

No multi-user support

No advanced analytics

No mobile app (web only)

2. Core User Experience
Primary User Flow

User opens the app

Sees a clean, distraction-free journaling interface

Writes freely in a large text area

Clicks “Done”

App sends journal text to GPT-4-turbo

GPT returns:

Thoughtful reflection

2 follow-up questions

Journal entry + AI output are displayed together

Entry is saved for later reference

3. UI / UX Requirements
Design Principles

Minimal

Calm

No clutter

Optimized for writing

Screens
A. Journaling Screen

Large multiline text area (auto-expanding)

“Done” button (disabled if empty)

No toolbars, no formatting controls

B. Reflection Screen (Same Page, Split View)

Original journal entry (read-only)

AI Reflection section

“Questions to Go Deeper” section (2 questions)

Optional: “Start New Entry” button

4. AI Functionality
Model

GPT-4-turbo

Prompt Strategy (Single Call)

System Prompt (example intent):

You are a thoughtful journaling assistant. Reflect deeply but concisely on the user’s journal entry. Avoid being preachy or prescriptive.

User Prompt Structure:

Raw journal text

Instructions:

Provide a short reflection (3–5 sentences)

Provide exactly 2 open-ended follow-up questions

Tone: calm, introspective, non-judgmental

Output Format (Structured)
{
  "reflection": "string",
  "questions": ["string", "string"]
}

5. Data & Storage
What is Stored

Journal text

AI reflection

AI questions

Timestamp

Storage Options

Chosen Approach (Recommended):

Lightweight database (SQLite / Postgres via Vercel storage)

Simple schema:

id

journal_text

reflection

questions (array or JSON)

created_at

Reasoning:

Enables review of past entries

Minimal overhead

Good learning surface

6. Backend Architecture
Stack (Recommended)

Frontend: Next.js (App Router)

Backend: Serverless API routes

Hosting: Vercel

AI Calls: Server-side only

Secrets: Vercel environment variables

Flow

Frontend submits journal text

API route:

Calls OpenAI GPT-4-turbo

Parses structured response

Stores result

API returns reflection + questions

UI updates

7. Security & Scope Controls

No auth

No user accounts

App assumed private

API key never exposed client-side

No prompt logging beyond saved entries

8. Deployment

Vercel deployment

Environment variables:

OPENAI_API_KEY

No custom domains required

Single environment (no staging needed)

9. Testing Strategy
Manual Testing Only (V1)

Each feature must be testable in isolation.

Journal submission works

Empty submission blocked

AI response returns correctly

Data persists after refresh

App works after redeploy

10. Chunked Build Plan (Sequential & Testable)
Chunk 1 — Base UI

✅ Build journaling page

Text area

Done button

Local state only

Exit criteria:
You can write text and click Done (no AI yet).

Chunk 2 — API + GPT Integration

✅ Server-side API route

Accept journal text

Call GPT-4-turbo

Return structured response

Exit criteria:
You can see reflection + questions logged or returned.

Chunk 3 — UI Rendering of AI Output

✅ Split-view layout

Show journal

Show reflection

Show questions

Exit criteria:
UI updates correctly after Done.

Chunk 4 — Persistence Layer

✅ Database integration

Save entries

Fetch latest entry

Exit criteria:
Refresh page → entry still exists.

Chunk 5 — Polish

✅ UX refinements

Loading states

Disabled states

Error handling

Exit criteria:
Feels smooth and intentional.

11. Future Extensions (Explicitly Out of Scope)

Follow-up question answering loops

Tagging or sentiment tracking

Search

Multi-day summaries

Auth

12. Success Criteria

You enjoy writing in it

AI feedback feels helpful, not generic

You understand how frontend ↔ backend ↔ GPT work together

You can confidently extend the system