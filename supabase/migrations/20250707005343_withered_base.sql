/*
  # Add missing tables for territories and group members

  1. New Tables
    - `territories` - Stores territory information
      - `id` (text, primary key)
      - `nome` (text) - Territory name
      - `responsavel` (text) - Responsible person
      - `status` (text) - Territory status
      - `ultimaVisita` (text) - Last visit date
      - `proximaVisita` (text) - Next visit date
      - `descricao` (text) - Territory description
      - `observacoes` (text) - Territory observations
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp

    - `group_members` - Stores group member relationships
      - `id` (text, primary key)
      - `name` (text) - Member name
      - `groupName` (text) - Group name
      - `role` (text) - Member role in group
      - `isActive` (boolean) - Whether member is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (matching existing pattern)

  3. Triggers
    - Add update triggers for both tables using existing function
*/

-- Create territories table
CREATE TABLE IF NOT EXISTS territories (
  id text PRIMARY KEY,
  nome text DEFAULT '',
  responsavel text DEFAULT '',
  status text DEFAULT '',
  "ultimaVisita" text DEFAULT '',
  "proximaVisita" text DEFAULT '',
  descricao text DEFAULT '',
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id text PRIMARY KEY,
  name text DEFAULT '',
  "groupName" text DEFAULT '',
  role text DEFAULT '',
  "isActive" boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Add policies for public access (matching existing pattern)
CREATE POLICY "Allow all operations on territories"
  ON territories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on group_members"
  ON group_members
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add update triggers using existing function
CREATE TRIGGER update_territories_updated_at 
  BEFORE UPDATE ON territories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at 
  BEFORE UPDATE ON group_members 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();