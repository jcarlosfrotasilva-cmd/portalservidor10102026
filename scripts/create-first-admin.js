/**
 * Script para criar o primeiro administrador do sistema
 * 
 * Uso: node scripts/create-first-admin.js
 * 
 * Este script cria um usuário administrador com as credenciais:
 * Email: admin@escola.sp.gov.br
 * Senha: Admin@2024
 * 
 * ALTERE AS CREDENCIAIS APÓS O PRIMEIRO ACESSO!
 */

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function createFirstAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  });

  try {
    const client = await pool.connect();

    const email = "admin@escola.sp.gov.br";
    const password = "Admin@2024";
    const name = "Administrador Sistema";

    // Verificar se já existe admin
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      console.log("✅ Administrador já existe!");
      console.log(`   Email: ${email}`);
      console.log(`   Senha: ${password}`);
      client.release();
      return;
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar administrador
    const result = await client.query(
      `INSERT INTO users (email, name, password_hash, role, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, name, role`,
      [email.toLowerCase(), name, passwordHash, "admin", true]
    );

    const admin = result.rows[0];

    console.log("✅ Administrador criado com sucesso!");
    console.log("");
    console.log("📋 Credenciais de acesso:");
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log("");
    console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro acesso!");

    client.release();
  } catch (error) {
    console.error("❌ Erro ao criar administrador:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createFirstAdmin();
