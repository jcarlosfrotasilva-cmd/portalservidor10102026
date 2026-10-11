import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sign } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, dataNasc } = body;

    console.log("Login attempt - CPF:", cpf, "Data:", dataNasc);

    if (!cpf || !dataNasc) {
      return NextResponse.json(
        { error: "CPF e data de nascimento são obrigatórios" },
        { status: 400 }
      );
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    const dataNascLimpa = dataNasc.replace(/\D/g, "");

    console.log("Normalized - CPF:", cpfLimpo, "Data:", dataNascLimpa);

    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: "CPF inválido. Deve conter 11 dígitos." },
        { status: 400 }
      );
    }

    if (dataNascLimpa.length !== 8) {
      return NextResponse.json(
        { error: "Data de nascimento inválida. Use 8 dígitos (DDMMAAAA)." },
        { status: 400 }
      );
    }

    const serverFound = await db
      .select()
      .from(servers)
      .where(eq(servers.cpf, cpfLimpo))
      .limit(1);

    console.log("Server found:", serverFound.length);

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

    if (!server.dtnasc) {
      return NextResponse.json(
        { error: "Data de nascimento não cadastrada. Entre em contato com a administração." },
        { status: 401 }
      );
    }

    // Converter data do banco (YYYY-MM-DD) para DDMMAAAA
    const dataNascStr = server.dtnasc.toString();
    const partes = dataNascStr.split("-");
    
    console.log("Database date:", dataNascStr, "Parts:", partes);

    if (partes.length !== 3) {
      return NextResponse.json(
        { error: "Formato de data inválido no banco de dados" },
        { status: 500 }
      );
    }

    const [ano, mes, dia] = partes;
    const dataNascBanco = `${dia}${mes}${ano}`;
    
    console.log("Converted date:", dataNascBanco, "Input:", dataNascLimpa, "Match:", dataNascLimpa === dataNascBanco);

    if (dataNascLimpa !== dataNascBanco) {
      return NextResponse.json(
        { error: `Credenciais inválidas. Data esperada: ${dataNascBanco}, Recebida: ${dataNascLimpa}` },
        { status: 401 }
      );
    }

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
