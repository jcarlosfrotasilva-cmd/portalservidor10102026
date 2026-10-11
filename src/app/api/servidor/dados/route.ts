import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers, ats, sextaParte, evolucaoFuncional, certidoes, fruicoes, pecunias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verify } from "jsonwebtoken";

async function verifyServidorToken(token: string) {
  try {
    if (!token || !token.startsWith("ey")) {
      return null;
    }
    // Decodificar token para obter CPF
    const decoded: any = verify(token, process.env.JWT_SECRET || "dev-secret-key-change-in-production");
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 });
    }

    const decoded = await verifyServidorToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    console.log("Token decodificado:", decoded);

    // Buscar servidor pelo CPF do token
    const servidorFound = await db
      .select()
      .from(servers)
      .where(eq(servers.cpf, decoded.cpf))
      .limit(1);

    console.log("Servidor encontrado:", servidorFound.length, "CPF:", decoded.cpf);

    if (!servidorFound.length) {
      return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
    }

    const servidor = servidorFound[0];

    console.log("Servidor:", servidor.nome, "ID:", servidor.id);

    // Buscar ATS
    const atsList = await db.select().from(ats).where(eq(ats.serverId, servidor.id));

    // Buscar Sexta-Parte
    const sextaParteList = await db.select().from(sextaParte).where(eq(sextaParte.serverId, servidor.id));

    // Buscar Evolução Funcional
    const evolucaoList = await db.select().from(evolucaoFuncional).where(eq(evolucaoFuncional.serverId, servidor.id));

    // Buscar Certidões
    const certidoesListRaw = await db.select().from(certidoes).where(eq(certidoes.serverId, servidor.id));

    // Calcular saldos das certidões
    const certidoesList = await Promise.all(
      certidoesListRaw.map(async (cert) => {
        const fruicoesList = await db.select().from(fruicoes).where(eq(fruicoes.certiaoId, cert.id));
        const pecuniasList = await db.select().from(pecunias).where(eq(pecunias.certiaoId, cert.id));

        const diasFrui = fruicoesList.filter((f) => !f.cancelada).reduce((sum, f) => sum + f.dias, 0);
        const diasPec = pecuniasList.filter((p) => !p.cancelada).reduce((sum, p) => sum + p.dias, 0);
        const saldoAtual = Math.max(0, cert.saldoInicial - diasFrui - diasPec);

        return { ...cert, saldoAtual };
      })
    );

    return NextResponse.json({
      servidor: {
        id: servidor.id,
        name: servidor.nome,
        cpf: servidor.cpf,
        cargo: servidor.cargo,
        categoria: servidor.categoria,
        nivel: servidor.nivel,
        situacao: servidor.situacao,
      },
      ats: atsList,
      sextaParte: sextaParteList,
      evolucao: evolucaoList,
      certidoes: certidoesList,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do servidor:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
