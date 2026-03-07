/*
  # Fix meetings table schema completely

  1. Schema Updates
    - Ensure all required columns exist in the meetings table
    - Fix any inconsistencies in column definitions
    - Add proper default values for all fields
    - Ensure JSONB fields are properly initialized

  2. Security
    - Maintain existing RLS policies
    - No data loss - only adds missing columns

  3. Notes
    - This migration ensures complete schema consistency
    - All meeting fields from the application are properly mapped
*/

-- First, ensure the meetings table exists with basic structure
CREATE TABLE IF NOT EXISTS meetings (
  id text PRIMARY KEY,
  date text NOT NULL,
  type text NOT NULL CHECK (type IN ('meio-semana', 'fim-semana')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add all required columns with proper defaults
DO $$
BEGIN
  -- Basic meeting fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'presidente') THEN
    ALTER TABLE meetings ADD COLUMN presidente text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'status') THEN
    ALTER TABLE meetings ADD COLUMN status text DEFAULT 'Rascunho';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'audioVideo') THEN
    ALTER TABLE meetings ADD COLUMN "audioVideo" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'indicador') THEN
    ALTER TABLE meetings ADD COLUMN indicador text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'indicadorPalco') THEN
    ALTER TABLE meetings ADD COLUMN "indicadorPalco" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'microfoneVolante') THEN
    ALTER TABLE meetings ADD COLUMN "microfoneVolante" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'limpeza') THEN
    ALTER TABLE meetings ADD COLUMN limpeza text DEFAULT '';
  END IF;

  -- Meio-semana specific text fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'presidencia') THEN
    ALTER TABLE meetings ADD COLUMN presidencia text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'canticoInicial') THEN
    ALTER TABLE meetings ADD COLUMN "canticoInicial" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'oracao') THEN
    ALTER TABLE meetings ADD COLUMN oracao text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'comentariosIniciais') THEN
    ALTER TABLE meetings ADD COLUMN "comentariosIniciais" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'temaTesouro') THEN
    ALTER TABLE meetings ADD COLUMN "temaTesouro" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'designadoTesouro') THEN
    ALTER TABLE meetings ADD COLUMN "designadoTesouro" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'joiasEspirituais') THEN
    ALTER TABLE meetings ADD COLUMN "joiasEspirituais" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'leituraBiblia') THEN
    ALTER TABLE meetings ADD COLUMN "leituraBiblia" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'canticoMeio') THEN
    ALTER TABLE meetings ADD COLUMN "canticoMeio" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'responsavelCanticoMeio') THEN
    ALTER TABLE meetings ADD COLUMN "responsavelCanticoMeio" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'comentariosFinais') THEN
    ALTER TABLE meetings ADD COLUMN "comentariosFinais" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'canticoFinal') THEN
    ALTER TABLE meetings ADD COLUMN "canticoFinal" text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'numeroCanticoFinal') THEN
    ALTER TABLE meetings ADD COLUMN "numeroCanticoFinal" text DEFAULT '';
  END IF;

  -- JSONB fields for complex data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'ministerio') THEN
    ALTER TABLE meetings ADD COLUMN ministerio jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'necessidadesLocais') THEN
    ALTER TABLE meetings ADD COLUMN "necessidadesLocais" jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'estudoBiblico') THEN
    ALTER TABLE meetings ADD COLUMN "estudoBiblico" jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'discursoPublico') THEN
    ALTER TABLE meetings ADD COLUMN "discursoPublico" jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'sentinela') THEN
    ALTER TABLE meetings ADD COLUMN sentinela jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they exist
DROP POLICY IF EXISTS "Allow all operations on meetings" ON meetings;
CREATE POLICY "Allow all operations on meetings"
  ON meetings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure the update trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at 
  BEFORE UPDATE ON meetings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update any existing NULL values to empty strings for text fields
UPDATE meetings SET 
  presidente = COALESCE(presidente, ''),
  status = COALESCE(status, 'Rascunho'),
  "audioVideo" = COALESCE("audioVideo", ''),
  indicador = COALESCE(indicador, ''),
  "indicadorPalco" = COALESCE("indicadorPalco", ''),
  "microfoneVolante" = COALESCE("microfoneVolante", ''),
  limpeza = COALESCE(limpeza, ''),
  presidencia = COALESCE(presidencia, ''),
  "canticoInicial" = COALESCE("canticoInicial", ''),
  oracao = COALESCE(oracao, ''),
  "comentariosIniciais" = COALESCE("comentariosIniciais", ''),
  "temaTesouro" = COALESCE("temaTesouro", ''),
  "designadoTesouro" = COALESCE("designadoTesouro", ''),
  "joiasEspirituais" = COALESCE("joiasEspirituais", ''),
  "leituraBiblia" = COALESCE("leituraBiblia", ''),
  "canticoMeio" = COALESCE("canticoMeio", ''),
  "responsavelCanticoMeio" = COALESCE("responsavelCanticoMeio", ''),
  "comentariosFinais" = COALESCE("comentariosFinais", ''),
  "canticoFinal" = COALESCE("canticoFinal", ''),
  "numeroCanticoFinal" = COALESCE("numeroCanticoFinal", '');

-- Update any existing NULL values to proper defaults for JSONB fields
UPDATE meetings SET 
  ministerio = COALESCE(ministerio, '[]'::jsonb),
  "necessidadesLocais" = COALESCE("necessidadesLocais", '{}'::jsonb),
  "estudoBiblico" = COALESCE("estudoBiblico", '{}'::jsonb),
  "discursoPublico" = COALESCE("discursoPublico", '{}'::jsonb),
  sentinela = COALESCE(sentinela, '{}'::jsonb);