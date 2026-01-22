-- Create blocks table for journal entries
-- Each entry is a timeline of ordered blocks (human or ai)

CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('human', 'ai')),
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_entry_order UNIQUE (entry_id, order_index)
);

-- Create entries table to group blocks
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE blocks ADD CONSTRAINT fk_entry_id FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_blocks_entry_id ON blocks(entry_id);
CREATE INDEX IF NOT EXISTS idx_blocks_order ON blocks(entry_id, order_index);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own entries
CREATE POLICY "Users can view their own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only see blocks from their own entries
CREATE POLICY "Users can view their own blocks"
  ON blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = blocks.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own blocks"
  ON blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = blocks.entry_id
      AND entries.user_id = auth.uid()
    )
  );
