-- ============================================
-- SCHEMA COMPLETO PARA SUPABASE
-- Portal de Vantagens dos Servidores
-- EE Profª Marlene Frattini — Matão/SP
-- ============================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- USUÁRIOS DO SISTEMA
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf VARCHAR(11) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'servidor')),
  server_id UUID REFERENCES servers(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- SERVIDORES
CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  rgcin VARCHAR(20),
  di VARCHAR(20),
  dtnasc DATE,
  sexo VARCHAR(10),
  tel VARCHAR(20),
  email VARCHAR(255),
  cargo VARCHAR(100) NOT NULL,
  categoria VARCHAR(50),
  faixa VARCHAR(50),
  nivel VARCHAR(10),
  jornada VARCHAR(50),
  lotacao VARCHAR(255),
  situacao VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ATS - ADICIONAL DE TEMPO DE SERVIÇO
CREATE TABLE ats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  vigencia DATE NOT NULL,
  doe DATE,
  ato VARCHAR(255),
  ultimo BOOLEAN NOT NULL DEFAULT false,
  proxima_previsao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEXTA-PARTE
CREATE TABLE sexta_parte (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  vigencia DATE NOT NULL,
  doe DATE,
  ato VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EVOLUÇÃO FUNCIONAL
CREATE TABLE evolucao_funcional (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  nivel_anterior VARCHAR(10) NOT NULL,
  nivel_atual VARCHAR(10) NOT NULL,
  vigencia DATE NOT NULL,
  doe DATE,
  ato VARCHAR(255),
  ultimo BOOLEAN NOT NULL DEFAULT false,
  proxima_previsao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CERTIDÕES DE LICENÇA-PRÊMIO
CREATE TABLE certidoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  ano INTEGER NOT NULL,
  data_inicial DATE NOT NULL,
  data_final DATE NOT NULL,
  doe DATE,
  ato VARCHAR(255),
  saldo_inicial INTEGER NOT NULL DEFAULT 90,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FRUIÇÃO DE LICENÇA-PRÊMIO
CREATE TABLE fruicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certiao_id UUID NOT NULL REFERENCES certidoes(id) ON DELETE CASCADE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  dias INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_autorizacao DATE NOT NULL,
  saldo_anterior INTEGER NOT NULL,
  saldo_atual INTEGER NOT NULL,
  cancelada BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PECÚNIA DE LICENÇA-PRÊMIO
CREATE TABLE pecunias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certiao_id UUID NOT NULL REFERENCES certidoes(id) ON DELETE CASCADE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  dias INTEGER NOT NULL DEFAULT 30,
  ano INTEGER NOT NULL,
  data_autorizacao DATE,
  identificador VARCHAR(255),
  saldo_anterior INTEGER NOT NULL,
  saldo_atual INTEGER NOT NULL,
  cancelada BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOLICITAÇÕES DOS SERVIDORES (NOVO MÓDULO)
CREATE TABLE solicitacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('duvida', 'correcao', 'contestacao', 'outra')),
  modulo VARCHAR(50) NOT NULL CHECK (modulo IN ('ats', 'sexta_parte', 'evolucao_funcional', 'licenca_premio', 'cadastro', 'outro')),
  descricao TEXT NOT NULL,
  situacao VARCHAR(50) NOT NULL DEFAULT 'recebida' CHECK (situacao IN ('recebida', 'em_analise', 'aguardando_info', 'respondida', 'encerrada')),
  resposta TEXT,
  respondido_por UUID REFERENCES users(id),
  respondido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUDITORIA
CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  server_id UUID REFERENCES servers(id),
  acao VARCHAR(50) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  registro_id UUID,
  detalhes TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_servers_cpf ON servers(cpf);
CREATE INDEX idx_servers_cargo ON servers(cargo);
CREATE INDEX idx_servers_categoria ON servers(categoria);
CREATE INDEX idx_servers_active ON servers(active);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_ats_server_id ON ats(server_id);
CREATE INDEX idx_sexta_parte_server_id ON sexta_parte(server_id);
CREATE INDEX idx_evolucao_server_id ON evolucao_funcional(server_id);
CREATE INDEX idx_certidoes_server_id ON certidoes(server_id);
CREATE INDEX idx_fruicoes_certiao_id ON fruicoes(certiao_id);
CREATE INDEX idx_pecunias_certiao_id ON pecunias(certiao_id);
CREATE INDEX idx_solicitacoes_server_id ON solicitacoes(server_id);
CREATE INDEX idx_solicitacoes_situacao ON solicitacoes(situacao);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - SUPABASE
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sexta_parte ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucao_funcional ENABLE ROW LEVEL SECURITY;
ALTER TABLE certidoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fruicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecunias ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para servidores (apenas leitura para servidores autenticados)
CREATE POLICY "Servidores podem ver apenas seus próprios dados"
  ON servers FOR SELECT
  USING (auth.uid() IN (SELECT server_id FROM users WHERE role = 'servidor'));

CREATE POLICY "Administradores podem ver todos os servidores"
  ON servers FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Políticas para solicitações
CREATE POLICY "Servidores podem ver apenas suas próprias solicitações"
  ON solicitacoes FOR SELECT
  USING (
    auth.uid() IN (SELECT server_id FROM users WHERE role = 'servidor')
    AND server_id = auth.uid()
  );

CREATE POLICY "Administradores podem ver todas as solicitações"
  ON solicitacoes FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Servidores podem criar solicitações"
  ON solicitacoes FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT server_id FROM users WHERE role = 'servidor')
    AND server_id = auth.uid()
  );

CREATE POLICY "Administradores podem responder solicitações"
  ON solicitacoes FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ============================================
-- FUNÇÕES DE UTILIDADE
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_updated_at BEFORE UPDATE ON ats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sexta_parte_updated_at BEFORE UPDATE ON sexta_parte
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evolucao_updated_at BEFORE UPDATE ON evolucao_funcional
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certidoes_updated_at BEFORE UPDATE ON certidoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fruicoes_updated_at BEFORE UPDATE ON fruicoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pecunias_updated_at BEFORE UPDATE ON pecunias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitacoes_updated_at BEFORE UPDATE ON solicitacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USUÁRIO ADMINISTRADOR INICIAL
-- ============================================
-- Nota: O hash da senha 'Admin@2024' deve ser gerado com bcrypt
-- Este é um hash de exemplo - gere um novo em produção

-- INSERT INTO users (email, name, password_hash, role, active, created_at, updated_at)
-- VALUES ('admin@escola.sp.gov.br', 'Administrador Sistema', '$2b$12$YOUR_HASHED_PASSWORD_HERE', 'admin', true, NOW(), NOW());
