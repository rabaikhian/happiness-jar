-- Database Schema for "Happiness Jar" (กระปุกพลังบวก)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  color VARCHAR(50) DEFAULT 'yellow', -- yellow, mint, peach, lavender, blue
  category VARCHAR(100), -- #Gratitude, #Hope, #Comfort, #DailyJoy
  likes_count INT DEFAULT 0,
  hugs_count INT DEFAULT 0,
  sparkles_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  flag_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_approved_created ON notes(is_approved, created_at DESC) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_reports_note_id ON reports(note_id);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies for notes table

-- Anyone can read approved notes that haven't been excessively flagged (threshold < 3)
CREATE POLICY "Allow public read of approved notes" ON notes
  FOR SELECT
  USING (is_approved = TRUE AND flag_count < 3);

-- Anyone can insert a new note (anonymous posting)
CREATE POLICY "Allow public insert of notes" ON notes
  FOR INSERT
  WITH CHECK (TRUE);

-- 4. Define RLS Policies for reports table

-- Anyone can insert a report (anonymous reporting)
CREATE POLICY "Allow public insert of reports" ON reports
  FOR INSERT
  WITH CHECK (TRUE);

-- Only admins/service role can view reports (default restrict)
CREATE POLICY "Restrict read of reports" ON reports
  FOR SELECT
  USING (FALSE);

-- 5. Safe RPC Functions (Bypassing direct table updates for reactions/reporting)

-- Function to increment reaction counts securely
CREATE OR REPLACE FUNCTION increment_reaction(note_id UUID, reaction_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF reaction_type = 'likes' THEN
    UPDATE notes SET likes_count = likes_count + 1 WHERE id = note_id;
  ELSIF reaction_type = 'hugs' THEN
    UPDATE notes SET hugs_count = hugs_count + 1 WHERE id = note_id;
  ELSIF reaction_type = 'sparkles' THEN
    UPDATE notes SET sparkles_count = sparkles_count + 1 WHERE id = note_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a report and automatically update flag counts
CREATE OR REPLACE FUNCTION report_note(n_id UUID, report_reason TEXT)
RETURNS VOID AS $$
BEGIN
  -- Insert report entry
  INSERT INTO reports (note_id, reason) VALUES (n_id, report_reason);
  
  -- Increment flag count
  UPDATE notes SET flag_count = flag_count + 1 WHERE id = n_id;
  
  -- Automatically flag as unapproved if it reaches 3 or more flags
  UPDATE notes SET is_approved = FALSE WHERE id = n_id AND flag_count >= 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
