const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createCredentials() {
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres.rcolvoivlpcjffghzzmi:JoCa1506Sijklm@aws-1-sa-east-1.pooler.supabase.com:5432/postgres'
  });
  
  try {
    // Criar administrador
    const adminPassword = 'Admin@2024';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    
    await pool.query(
      'INSERT INTO users (email, name, password_hash, role, active, created_at, updated_at) ' +
      'VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ' +
      'ON CONFLICT (email) DO UPDATE SET password_hash = $3, name = $2, active = $5, updated_at = NOW()',
      ['admin@escola.sp.gov.br', 'Administrador Sistema', adminPasswordHash, 'admin', true]
    );
    
    console.log('✅ Administrador criado/atualizado!');
    console.log('   Email: admin@escola.sp.gov.br');
    console.log('   Senha: Admin@2024');
    
    // Criar servidor de teste
    await pool.query(
      'INSERT INTO servers (nome, cpf, cargo, categoria, dtnasc, situacao, active, created_at, updated_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) ' +
      'ON CONFLICT (cpf) DO UPDATE SET nome = $1, cargo = $3, categoria = $4, dtnasc = $5, active = $7, updated_at = NOW()',
      ['Maria Silva Santos', '12345678900', 'PEB I', 'A-EFETIVO', '1985-03-15', 'ATIVO', true]
    );
    
    console.log('');
    console.log('✅ Servidor de teste criado/atualizado!');
    console.log('   Nome: Maria Silva Santos');
    console.log('   CPF: 123.456.789-00');
    console.log('   Data de Nascimento: 15/03/1985');
    console.log('');
    console.log('🔐 CREDENCIAIS DE ACESSO:');
    console.log('');
    console.log('ADMINISTRADOR:');
    console.log('   Email: admin@escola.sp.gov.br');
    console.log('   Senha: Admin@2024');
    console.log('');
    console.log('SERVIDOR:');
    console.log('   CPF: 123.456.789-00');
    console.log('   Data de Nascimento: 15/03/1985');
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

createCredentials();
