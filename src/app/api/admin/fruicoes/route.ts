import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fruicoes, certidoes } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const fruicoesList = await db.select().from(fruicoes);
    return NextResponse.json({ fruicoes: fruicoesList });
  } catch (error) {
    console.error("Erro ao buscar fruições:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Token necessário" }, { status: 401 });
    if (!(await verifyAdminToken(token))) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await request.json();
    const { certiaoId, serverId, dias, dataInicio, dataFim, dataAutorizacao } = body;

    if (!certiaoId || !serverId || !dias || !dataInicio || !dataFim) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Verificar saldo da certidão
    const certidao = await db.select().from(certidoes).where(eq(certidoes.id, certiaoId)).limit(1);
    if (!certidao.length) {
      return NextResponse.json({ error: "Certidão não encontrada" }, { status: 404 });
    }

    const fruicoesList = await db.select().from(fruicoes).where(eq(fruicoes.certiaoId, certiaoId));
    const pecuniasList = await db.select().from(pecunias).where(eq(pecunias.certiaoId, certiaoId));
    
    const diasFrui = fruicoesList.filter((f) => !f.cancelada).reduce((sum, f) => sum + f.dias, 0);
    const diasPec = pecuniasList.filter((p) => !p.cancelada).reduce((sum, p) => sum + p.dias, 0);
    const saldoAtual = certidao[0].saldoInicial - diasFrui - diasPec;

    if (dias > saldoAtual) {
      return NextResponse.json({ error: `Saldo insuficiente. Disponível: ${saldoAtual} dias` }, { status: 400 });
    }

    const novoSaldo = saldoAtual - dias;

    const result = await db
      .insert(fruicoes)
      .values({
        certiaoId,
        serverId,
        dias,
        dataInicio,
        dataFim,
        dataAutorizacao: dataAutorizacao || null,
        saldoAnterior: saldoAtual,
        saldoAtual: novoSaldo,
      })
      .returning();

    return NextResponse.json({ fruicao: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fruição:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { pecunias } from "@/db/schema";
