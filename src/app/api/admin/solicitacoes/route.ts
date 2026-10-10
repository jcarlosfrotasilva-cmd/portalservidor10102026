import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { solicitacoes, servers } from "@/db/schema";
import { desc } from "drizzle-orm";

async function verifyAdminToken(token: string) {
  try {
    if (!token || !token.startsWith("ey")) return null;
    return true;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Token necessário" }, { status: 401 });
    if (!(await verifyAdminToken(token))) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const solicitacoesList = await db
      .select({
        id: solicitacoes.id,
        serverId: solicitacoes.serverId,
        tipo: solicitacoes.tipo,
        modulo: solicitacoes.modulo,
        descricao: solicitacoes.descricao,
        situacao: solicitacoes.situacao,
        resposta: solicitacoes.resposta,
        createdAt: solicitacoes.createdAt,
        updatedAt: solicitacoes.updatedAt,
        servidorNome: servers.nome,
        servidorCpf: servers.cpf,
      })
      .from(solicitacoes)
      .innerJoin(servers, eq(solicitacoes.serverId, servers.id))
      .orderBy(desc(solicitacoes.createdAt));

    return NextResponse.json({ solicitacoes: solicitacoesList });
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { eq } from "drizzle-orm";
