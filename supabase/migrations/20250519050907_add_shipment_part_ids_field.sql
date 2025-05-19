-- Add a new column to store part IDs as a JSON array
ALTER TABLE shipments ADD COLUMN part_ids jsonb DEFAULT '[]';
