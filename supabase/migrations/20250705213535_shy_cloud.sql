/*
  # Adicionar todos os campos de reunião para sincronização completa

  1. Mudanças
    - Adiciona todos os campos específicos de reuniões de meio de semana
    - Adiciona todos os campos específicos de reuniões de fim de semana
    - Garante que todos os campos sejam sincronizados entre dispositivos
  
  2. Segurança
    - Usa lógica condicional para adicionar colunas apenas se não existirem
    - Não há risco de perda de dados
*/

-- Adicionar campos específicos para reuniões de meio de semana
DO $$
BEGIN
  -- presidencia
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'presidencia'
  ) THEN
    ALTER TABLE meetings ADD COLUMN presidencia text DEFAULT '';
  END IF;

  -- canticoInicial
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'canticoInicial'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "canticoInicial" text DEFAULT '';
  END IF;

  -- oracao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'oracao'
  ) THEN
    ALTER TABLE meetings ADD COLUMN oracao text DEFAULT '';
  END IF;

  -- comentariosIniciais
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'comentariosIniciais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "comentariosIniciais" text DEFAULT '';
  END IF;

  -- temaTesouro
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'temaTesouro'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "temaTesouro" text DEFAULT '';
  END IF;

  -- designadoTesouro
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'designadoTesouro'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "designadoTesouro" text DEFAULT '';
  END IF;

  -- joiasEspirituais
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'joiasEspirituais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "joiasEspirituais" text DEFAULT '';
  END IF;

  -- leituraBiblia
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'leituraBiblia'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "leituraBiblia" text DEFAULT '';
  END IF;

  -- canticoMeio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'canticoMeio'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "canticoMeio" text DEFAULT '';
  END IF;

  -- comentariosFinais
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'comentariosFinais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "comentariosFinais" text DEFAULT '';
  END IF;

  -- canticoFinal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'canticoFinal'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "canticoFinal" text DEFAULT '';
  END IF;

  -- numeroCanticoFinal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'numeroCanticoFinal'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "numeroCanticoFinal" text DEFAULT '';
  END IF;
END $$;

-- Verificar se as colunas JSONB já existem, se não, adicioná-las
DO $$
BEGIN
  -- ministerio (já existe como jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'ministerio'
  ) THEN
    ALTER TABLE meetings ADD COLUMN ministerio jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- necessidadesLocais (já existe como jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'necessidadesLocais'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "necessidadesLocais" jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- estudoBiblico (já existe como jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'estudoBiblico'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "estudoBiblico" jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- discursoPublico (já existe como jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'discursoPublico'
  ) THEN
    ALTER TABLE meetings ADD COLUMN "discursoPublico" jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- sentinela (já existe como jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'sentinela'
  ) THEN
    ALTER TABLE meetings ADD COLUMN sentinela jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;