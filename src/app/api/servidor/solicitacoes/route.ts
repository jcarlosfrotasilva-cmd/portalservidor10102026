import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { solicitacoes, servers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function verifyServidorToken(token: string) {
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
    if (!(await verifyServidorToken(token))) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    // Obter serverId do token (simplificado - em produção, decodificar JWT)
    // Para teste, pegar todas as solicitações
    const solicitacoesList = await db
      .select({
        id: solicitacoes.id,
        tipo: solicitacoes.tipo,
        modulo: solicitacoes.modulo,
        descricao: solicitacoes.descricao,
        situacao: solicitacoes.situacao,
        resposta: solicitacoes.resposta,
        createdAt: solicitacoes.createdAt,
        updatedAt: solicitacoes.updatedAt,
      })
      .from(solicitacoes)
      .orderBy(desc(solicitacoes.createdAt));

    return NextResponse.json({ solicitacoes: solicitacoesList });
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Token necessário" }, { status: 401 });
    if (!(await verifyServidorToken(token))) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await request.json();
    const { tipo, modulo, descricao } = body;

    if (!tipo || !modulo || !descricao) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Obter serverId do token (simplificado)
    // Para teste, pegar primeiro servidor
    const serversList = await db.select({ id: servers.id }).from(servers).limit(1);
    if (!serversList.length) {
      return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
    }

    const serverId = serversList[0].id;

    // Criar solicitação
    const result = await db
      .insert(solicitacoes)
      .values({
        serverId,
        tipo,
        modulo,
        descricao,
        situacao: "recebida",
      })
      .returning();

    return NextResponse.json({ solicitacao: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
