/*
# VibeCloud AI Study Buddy - Database Schema

1. New Tables
- `quiz_questions`: Original, scenario-based AZ-900 practice questions (NOT real exam questions).
  - id (uuid, PK)
  - topic (text): The AZ-900 domain (e.g., "Cloud Concepts", "Core Services", "Security", "Pricing")
  - subtopic (text): More specific area within the topic
  - difficulty (text): "beginner", "intermediate", "advanced"
  - question_text (text): The full question text
  - options (jsonb): Array of 4 answer choices
  - correct_index (int): Index of correct answer in options array
  - explanation (text): Detailed explanation of why the answer is correct
  - african_analogy (text): A relatable African-context analogy
  - region (text): Which African region the analogy references ("east", "west", "south", "general")
  - created_at (timestamptz)

- `study_topics`: Structured study content for each AZ-900 domain.
  - id (uuid, PK)
  - title (text): Topic title
  - category (text): Main category
  - summary (text): Brief summary
  - content (jsonb): Array of sections, each with heading and body text
  - key_terms (jsonb): Array of {term, definition} objects
  - african_analogy (text): African-context analogy
  - region (text): African region reference
  - icon_name (text): Lucide icon name for display
  - order_index (int): Display ordering

- `flashcards`: Review cards for key terms and concepts.
  - id (uuid, PK)
  - topic (text): Associated topic
  - front (text): Question/term on front
  - back (text): Answer/definition on back
  - african_analogy (text): African-context analogy
  - difficulty (text): "beginner", "intermediate", "advanced"
  - created_at (timestamptz)

- `user_progress`: Tracks quiz and exam results for progress visualization.
  - id (uuid, PK)
  - session_id (text): Anonymous browser session identifier (localStorage-based)
  - mode (text): "quiz" or "exam"
  - topic (text): Topic studied (or "all" for mock exam)
  - score (int): Number correct
  - total (int): Total questions
  - answers (jsonb): Array of {question_id, selected_index, correct} objects
  - duration_seconds (int): Time taken
  - created_at (timestamptz)

- `user_studies`: Tracks which study topics have been reviewed.
  - id (uuid, PK)
  - session_id (text): Anonymous browser session identifier
  - topic_id (uuid, references study_topics)
  - studied_at (timestamptz)

2. Security
- All tables: Enable RLS.
- This is a no-auth single-tenant study tool. All data is shared/public.
- Grant CRUD to anon + authenticated on all tables.
- Policies allow all access (USING true) since there is no user isolation — this is intentional for a public study tool.
*/

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  subtopic text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_index int NOT NULL,
  explanation text NOT NULL,
  african_analogy text,
  region text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_questions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_quiz" ON quiz_questions;
CREATE POLICY "anon_select_quiz" ON quiz_questions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quiz" ON quiz_questions;
CREATE POLICY "anon_insert_quiz" ON quiz_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quiz" ON quiz_questions;
CREATE POLICY "anon_update_quiz" ON quiz_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quiz" ON quiz_questions;
CREATE POLICY "anon_delete_quiz" ON quiz_questions FOR DELETE TO anon, authenticated USING (true);

-- Study Topics
CREATE TABLE IF NOT EXISTS study_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  summary text NOT NULL,
  content jsonb NOT NULL,
  key_terms jsonb NOT NULL DEFAULT '[]',
  african_analogy text,
  region text DEFAULT 'general',
  icon_name text NOT NULL DEFAULT 'Cloud',
  order_index int NOT NULL DEFAULT 0
);

ALTER TABLE study_topics ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_topics TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_study" ON study_topics;
CREATE POLICY "anon_select_study" ON study_topics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_study" ON study_topics;
CREATE POLICY "anon_insert_study" ON study_topics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_study" ON study_topics;
CREATE POLICY "anon_update_study" ON study_topics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_study" ON study_topics;
CREATE POLICY "anon_delete_study" ON study_topics FOR DELETE TO anon, authenticated USING (true);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  african_analogy text,
  difficulty text NOT NULL DEFAULT 'beginner',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON flashcards TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_flashcards" ON flashcards;
CREATE POLICY "anon_select_flashcards" ON flashcards FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_flashcards" ON flashcards;
CREATE POLICY "anon_insert_flashcards" ON flashcards FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_flashcards" ON flashcards;
CREATE POLICY "anon_update_flashcards" ON flashcards FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_flashcards" ON flashcards;
CREATE POLICY "anon_delete_flashcards" ON flashcards FOR DELETE TO anon, authenticated USING (true);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  mode text NOT NULL,
  topic text NOT NULL,
  score int NOT NULL,
  total int NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]',
  duration_seconds int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_progress TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_progress" ON user_progress;
CREATE POLICY "anon_select_progress" ON user_progress FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_progress" ON user_progress;
CREATE POLICY "anon_insert_progress" ON user_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_progress" ON user_progress;
CREATE POLICY "anon_update_progress" ON user_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_progress" ON user_progress;
CREATE POLICY "anon_delete_progress" ON user_progress FOR DELETE TO anon, authenticated USING (true);

-- User Studies (tracks which topics have been reviewed)
CREATE TABLE IF NOT EXISTS user_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  topic_id uuid REFERENCES study_topics(id) ON DELETE CASCADE,
  studied_at timestamptz DEFAULT now()
);

ALTER TABLE user_studies ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_studies TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_studies" ON user_studies;
CREATE POLICY "anon_select_studies" ON user_studies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_studies" ON user_studies;
CREATE POLICY "anon_insert_studies" ON user_studies FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_studies" ON user_studies;
CREATE POLICY "anon_update_studies" ON user_studies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_studies" ON user_studies;
CREATE POLICY "anon_delete_studies" ON user_studies FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions(topic);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic);
CREATE INDEX IF NOT EXISTS idx_user_progress_session ON user_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_user_studies_session ON user_studies(session_id);
