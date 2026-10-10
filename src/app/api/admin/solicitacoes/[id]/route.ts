import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { solicitacoes } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdminToken(token: string) {
  try {
    if (!token || !token.startsWith("ey")) return null;
    return true;
  } catch {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Token necessário" }, { status: 401 });
    if (!(await verifyAdminToken(token))) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { resposta, situacao } = body;

    if (!situacao) {
      return NextResponse.json({ error: "Situação é obrigatória" }, { status: 400 });
    }

    // Atualizar solicitação
    const result = await db
      .update(solicitacoes)
      .set({
        resposta: resposta !== undefined ? resposta : null,
        situacao,
        respondidoEm: resposta || situacao !== "recebida" ? new Date() : null,
      })
      .where(eq(solicitacoes.id, id))
      .returning();

    return NextResponse.json({ solicitacao: result[0] });
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
