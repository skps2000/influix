🧠 INFLUIX – COPILOT (CLAUDE OPUS 4.5) OPTIMIZED PROJECT PROMPT
0. EXECUTION CONTEXT (VERY IMPORTANT)

You are Claude Opus 4.5, operating inside VSCode GitHub Copilot.

This means:

You can see the project file structure

You generate code incrementally

You are expected to follow existing patterns

You must not hallucinate files that do not exist

You must propose file creation explicitly when needed

Your job is not to explain.
Your job is to build InfluiX correctly, step by step.

1. ABSOLUTE RULES (DO NOT BREAK)

Ignore all existing code. Treat this repository as a clean slate

Never generate partial or pseudo code

Prefer real implementation over abstraction

If something is unclear, make a reasonable engineering decision

Always think “how will this scale in 6–12 months?”

Keep code readable by humans, not just machines

When adding a new feature:

Update types

Update API

Update UI if relevant

2. WHAT INFLUIX IS (SHORT, CLEAR)

InfluiX is an AI-native influence intelligence platform.

It helps users:

Understand why content works

Detect patterns in short-form media

Convert AI insight into human thinking

InfluiX is:

Insight-first

Calm, minimal, intelligent

Built for long-term expansion

This is not a dashboard-only app.
This is a thinking system.

3. TECH STACK (FIXED)
Frontend

Vite

React

TypeScript

Tailwind CSS

Client-side routing

Component-driven design

Backend

Node.js

TypeScript

REST API

Service-layer architecture

Database

PostgreSQL

AI

OpenAI-compatible interface (abstracted)

Prompt versioning

JSON-structured outputs

4. PROJECT STRUCTURE (MANDATORY)

Create and follow this structure:

/apps
  /web        # Frontend
  /api        # Backend API
/packages
  /ui         # Shared UI components
  /types      # Shared types
  /ai         # AI prompts & inference logic
  /config     # Shared config


If you add a new folder, explain why briefly.

5. CORE PRODUCT PHILOSOPHY (IMPORTANT FOR AI OUTPUTS)

When generating UI, logic, or AI prompts:

Less UI, more meaning

Fewer metrics, stronger interpretation

AI should explain “why”, not just “what”

The user should feel smarter, not overwhelmed

6. FEATURES TO BUILD (V1, IN ORDER)
6.1 Authentication

Email-based auth

JWT or session (decide and implement)

User profile

6.2 Dashboard

The dashboard must:

Show what matters today

Contain AI-generated insight blocks

Avoid useless charts

6.3 Content Intelligence

Store content metadata

AI analysis:

Hook type

Tone

Narrative structure

Engagement logic

AI explains:

Why it works

How to adapt it

6.4 AI Insight Engine

Prompt templates stored as code

Versioned prompts

Deterministic output (JSON schema enforced)

6.5 Notes / Thinking Layer

User-written notes

Linked to AI insights

Designed as a thinking extension, not a memo app

7. UI PAGES (REQUIRED)

Implement real layouts for:

/login

/onboarding

/dashboard

/content

/insights

/notes

/settings

Design rules:

Dark-mode first

Minimal

Typographic hierarchy

Reusable components

8. DATA MODELS (MINIMUM REQUIRED)

You must define and implement:

User

Workspace

Content

Insight

Note

AI Prompt

All models must:

Have clear ownership

Be future-proofed for expansion

9. AI PROMPT ENGINE (CRITICAL)

When designing AI prompts:

Separate:

System intent

Analysis instruction

Output schema

Output must be valid JSON

Never rely on free-form text output

Example output shape:

{
  "summary": "...",
  "why_it_works": ["..."],
  "patterns": ["..."],
  "reuse_strategy": "..."
}

10. HOW TO WORK (IMPORTANT FOR COPILOT)

When starting:

Explain high-level architecture (brief)

Scaffold folders

Implement backend foundation

Implement frontend foundation

Connect AI layer

Polish UX incrementally

When unsure:

Make a decision

Document it in code comments or README

11. CODE STYLE GUIDELINES

Type-safe everywhere

Meaningful variable names

No excessive comments

No magic strings

Reusable utilities over duplication

12. FINAL GOAL

InfluiX should feel like:

“This product understands how modern creators and teams think.”

It should be:

Calm

Smart

Expandable

AI-native

13. START COMMAND

Begin now by:

Creating the folder structure

Initializing the frontend and backend

Explaining key architectural choices briefly

Writing real, usable code

END OF PROMPT