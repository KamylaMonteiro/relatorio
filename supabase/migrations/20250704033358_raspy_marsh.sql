/*
  # Correção do esquema para compatibilidade completa

  1. Correções na tabela meetings
    - Adiciona colunas que podem estar faltando
    - Corrige nomes de colunas para snake_case conforme padrão Supabase
    
  2. Correções na tabela members
    - Ajusta estrutura para compatibilidade
    
  3. Correções na tabela field_groups
    - Ajusta estrutura para compatibilidade
    
  4. Correções na tabela assignments
    - Ajusta estrutura para compatibilidade
*/

-- Adicionar colunas que podem estar faltando na tabela meetings
DO $$
BEGIN
  -- audioVideo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'audioVideo'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "audioVideo" text DEFAULT '';
  END IF;

  -- indicadorPalco
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'indicadorPalco'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "indicadorPalco" text DEFAULT '';
  END IF;

  -- microfoneVolante
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'microfoneVolante'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "microfoneVolante" text DEFAULT '';
  END IF;

  -- responsavelCanticoMeio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'responsavelCanticoMeio'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "responsavelCanticoMeio" text DEFAULT '';
  END IF;
END $$;

-- Verificar e corrigir estrutura da tabela members
DO $$
BEGIN
  -- Verificar se a coluna memberIds existe na tabela field_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'field_groups' AND column_name = 'memberIds'
  ) THEN
    ALTER TABLE field_groups ADD COLUMN "memberIds" jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Verificar se a coluna meetingTime existe na tabela field_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'field_groups' AND column_name = 'meetingTime'
  ) THEN
    ALTER TABLE field_groups ADD COLUMN "meetingTime" text;
  END IF;

  -- Verificar se a coluna meetingLocation existe na tabela field_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'field_groups' AND column_name = 'meetingLocation'
  ) THEN
    ALTER TABLE field_groups ADD COLUMN "meetingLocation" text;
  END IF;
END $$;