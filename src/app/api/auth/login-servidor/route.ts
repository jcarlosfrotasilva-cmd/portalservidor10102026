import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sign } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, dataNasc } = body;

    // Validar entrada
    if (!cpf || !dataNasc) {
      return NextResponse.json(
        { error: "CPF e data de nascimento são obrigatórios" },
        { status: 400 }
      );
    }

    // Normalizar CPF (já deve estar sem formatação)
    const cpfLimpo = cpf.replace(/\D/g, "");
    
    // Normalizar data de nascimento (remover barras, formato DDMMAAAA)
    const dataNascLimpa = dataNasc.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: "CPF inválido" },
        { status: 400 }
      );
    }

    if (dataNascLimpa.length !== 8) {
      return NextResponse.json(
        { error: "Data de nascimento inválida" },
        { status: 400 }
      );
    }

    // Buscar servidor pelo CPF
    const serverFound = await db
      .select()
      .from(servers)
      .where(eq(servers.cpf, cpfLimpo))
      .limit(1);

    if (!serverFound.length) {
      return NextResponse.json(
        { error: "Servidor não encontrado" },
        { status: 401 }
      );
    }

    const server = serverFound[0];

    if (!server.active) {
      return NextResponse.json(
        { error: "Servidor inativo. Entre em contato com a administração." },
        { status: 403 }
      );
    }

    // Verificar data de nascimento
    if (!server.dtnasc) {
      return NextResponse.json(
        { error: "Data de nascimento não cadastrada. Entre em contato com a administração." },
        { status: 401 }
      );
    }

    // Formatar data do banco para comparação (YYYY-MM-DD -> DDMMAAAA)
    // server.dtnasc é do tipo Date ou string no formato YYYY-MM-DD
    const dataNascStr = server.dtnasc.toString();
    const partes = dataNascStr.split("-");
    if (partes.length !== 3) {
      return NextResponse.json(
        { error: "Formato de data inválido no banco de dados" },
        { status: 500 }
      );
    }
    const [ano, mes, dia] = partes;
    const dataNascBanco = `${dia}${mes}${ano}`;
    
    if (dataNascLimpa !== dataNascBanco) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Criar token JWT
    const token = sign(
      {
        id: server.id,
        cpf: server.cpf,
        role: "servidor",
        name: server.nome,
      },
      process.env.JWT_SECRET || "dev-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: server.id,
        name: server.nome,
        cpf: server.cpf,
        role: "servidor",
      },
    });
  } catch (error) {
    console.error("Erro no login do servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
