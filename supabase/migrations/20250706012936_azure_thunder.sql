/*
  # Fix meetings table schema

  1. Table Updates
    - Add missing columns to `meetings` table:
      - `canticoFinal` (text) - Final song field
      - `numeroCanticoFinal` (text) - Final song number
      - `responsavelCanticoMeio` (text) - Mid-meeting song responsible person
      - Other meeting-related fields that may be missing

  2. Security
    - Maintain existing RLS policies on `meetings` table

  3. Notes
    - Uses IF NOT EXISTS checks to prevent errors if columns already exist
    - Ensures all meeting fields are properly stored in the database
*/

-- Add missing columns to meetings table if they don't exist
DO $$
BEGIN
  -- Check and add canticoFinal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'canticoFinal'
  ) THEN
    ALTER TABLE meetings ADD COLUMN canticoFinal text;
  END IF;

  -- Check and add numeroCanticoFinal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'numeroCanticoFinal'
  ) THEN
    ALTER TABLE meetings ADD COLUMN numeroCanticoFinal text;
  END IF;

  -- Check and add responsavelCanticoMeio column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'responsavelCanticoMeio'
  ) THEN
    ALTER TABLE meetings ADD COLUMN responsavelCanticoMeio text;
  END IF;

  -- Check and add other potentially missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'comentariosIniciais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN comentariosIniciais text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'comentariosFinais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN comentariosFinais text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'temaTesouro'
  ) THEN
    ALTER TABLE meetings ADD COLUMN temaTesouro text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'designadoTesouro'
  ) THEN
    ALTER TABLE meetings ADD COLUMN designadoTesouro text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'joiasEspirituais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN joiasEspirituais text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'leituraBiblia'
  ) THEN
    ALTER TABLE meetings ADD COLUMN leituraBiblia text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'canticoMeio'
  ) THEN
    ALTER TABLE meetings ADD COLUMN canticoMeio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'ministerio'
  ) THEN
    ALTER TABLE meetings ADD COLUMN ministerio jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'necessidadesLocais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN necessidadesLocais jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'estudoBiblico'
  ) THEN
    ALTER TABLE meetings ADD COLUMN estudoBiblico text;
  END IF;

END $$;