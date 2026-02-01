# Implementation Plan - Organic Chemistry AI Tutor Integration

## Goal
Integrate the features of the provided Python/Flask AI Tutor (Curriculum, Progress Tracking, AI Chat) into the existing `organica.html` game, migrating the backend logic to Supabase and Client-side JavaScript.

## User Review Required
> [!IMPORTANT]
> The original code uses OpenAI (GPT-4) for the AI Tutor. To make this work in the browser, we need an API Key. I will add a configuration placeholder in the code where you can insert your key. P.S: Ideally, this should be a backend function (Edge Function) to hide the key, but for this "Client-Side" integration, it will be in the JS code (insecure for production, but functional for this prototype).

## Proposed Changes

### Database (Supabase)
#### [NEW] `supabase/schema.sql`
- Create tables inspired by `models.py`:
  - `chemistry_topics`: Stores content structure.
  - `user_progress`: Tracks completion and scores.
  - `chat_sessions`: Stores AI tutor history.
  - `student_profiles`: Extended user data (Gamification).

### Content
#### [NEW] `organic-content.js`
- Port `OrganicChemistryCurriculum` class from Python to a static JavaScript object/module.
- Contains "Petroleum", "Hydrocarbons", "Nomenclature" modules.

### Frontend Logic
#### [NEW] `organic-tutor.js`
- **Auth**: Check Supabase session.
- **Progress**: Fetch/Update `user_progress` table.
- **AI**: Implement `ChemistryAITutor` class in JS (calls OpenAI API).
- **Dashboard**: Render the "Stats", "Recommended Modules", and "Chat" UI.

#### [MODIFY] `organica-game.js`
- Update `addXP` function to sync with Supabase `student_profiles` instead of just `localStorage`.

### UI / UX
#### [MODIFY] `organica.html`
- Add a main navigation: "🎮 Jogos" vs "📚 Estudo & Tutor".
- Embed the "Student Dashboard" layout (Charts, Cards, Chat) into the "Estudo" section.
- Add `<script>` references to new JS files.

#### [MODIFY] `organica-styles.css`
- Add Dashboard styles (Cards, Progress Rings, Chat) from the provided template.

## Verification Plan

### Automated Tests
- None (Visual/Interactive JS project).

### Manual Verification
1.  **Database**: Verify tables are created in Supabase (I will provide the SQL).
2.  **Dashboard**: Open `organica.html`, click "Estudo & Tutor".
3.  **Curriculum**: Click on a topic (e.g., "Petróleo") and verify content loads.
4.  **AI Chat**: Send a message "O que são alcanos?" and verify response (needs API Key).
5.  **Gamification**: Win a game in "Jogos" and see XP update in the "Dashboard".
