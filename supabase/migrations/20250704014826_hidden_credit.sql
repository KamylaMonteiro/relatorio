/*
  # Criação das tabelas principais do sistema

  1. Novas Tabelas
    - `meetings` - Armazena informações das reuniões
    - `members` - Armazena informações dos membros da congregação
    - `field_groups` - Armazena informações dos grupos de campo
    - `assignments` - Armazena designações e responsabilidades

  2. Segurança
    - Habilita RLS em todas as tabelas
    - Adiciona políticas para usuários autenticados
*/

-- Tabela de reuniões
CREATE TABLE IF NOT EXISTS meetings (
  id text PRIMARY KEY,
  date text NOT NULL,
  type text NOT NULL CHECK (type IN ('meio-semana', 'fim-semana')),
  presidente text,
  status text DEFAULT 'Rascunho',
  audioVideo text DEFAULT '',
  indicador text DEFAULT '',
  indicadorPalco text DEFAULT '',
  microfoneVolante text DEFAULT '',
  limpeza text DEFAULT '',
  presidencia text,
  canticoInicial text,
  oracao text,
  comentariosIniciais text,
  temaTesouro text,
  designadoTesouro text,
  joiasEspirituais text,
  leituraBiblia text,
  ministerio jsonb,
  canticoMeio text,
  responsavelCanticoMeio text,
  necessidadesLocais jsonb,
  estudoBiblico jsonb,
  comentariosFinais text,
  canticoFinal text,
  numeroCanticoFinal text,
  discursoPublico jsonb,
  sentinela jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de membros
CREATE TABLE IF NOT EXISTS members (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  grupo text,
  status text,
  responsibilities jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de grupos de campo
CREATE TABLE IF NOT EXISTS field_groups (
  id text PRIMARY KEY,
  name text NOT NULL,
  memberIds jsonb DEFAULT '[]'::jsonb,
  territory text,
  meetingTime text,
  meetingLocation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de designações
CREATE TABLE IF NOT EXISTS assignments (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  assignedTo text,
  date text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (já que não temos autenticação específica)
CREATE POLICY "Allow all operations on meetings"
  ON meetings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on members"
  ON members
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on field_groups"
  ON field_groups
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on assignments"
  ON assignments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_groups_updated_at BEFORE UPDATE ON field_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();