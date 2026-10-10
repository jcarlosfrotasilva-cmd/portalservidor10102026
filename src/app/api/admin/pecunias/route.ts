import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pecunias, certidoes } from "@/db/schema";
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

    const pecuniasList = await db.select().from(pecunias);
    return NextResponse.json({ pecunias: pecuniasList });
  } catch (error) {
    console.error("Erro ao buscar pecúnias:", error);
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
    const { certiaoId, serverId, dias, ano, dataAutorizacao } = body;

    if (!certiaoId || !serverId || !ano) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    const diasPecunias = dias || 30;

    const certidao = await db.select().from(certidoes).where(eq(certidoes.id, certiaoId)).limit(1);
    if (!certidao.length) {
      return NextResponse.json({ error: "Certidão não encontrada" }, { status: 404 });
    }

    const fruicoesList = await db.select().from(fruicoes).where(eq(fruicoes.certiaoId, certiaoId));
    const pecuniasList = await db.select().from(pecunias).where(eq(pecunias.certiaoId, certiaoId));
    
    const diasFrui = fruicoesList.filter((f) => !f.cancelada).reduce((sum, f) => sum + f.dias, 0);
    const diasPec = pecuniasList.filter((p) => !p.cancelada).reduce((sum, p) => sum + p.dias, 0);
    const saldoAtual = certidao[0].saldoInicial - diasFrui - diasPec;

    if (diasPecunias > saldoAtual) {
      return NextResponse.json({ error: `Saldo insuficiente. Disponível: ${saldoAtual} dias` }, { status: 400 });
    }

    const novoSaldo = saldoAtual - diasPecunias;

    const result = await db
      .insert(pecunias)
      .values({
        certiaoId,
        serverId,
        dias: diasPecunias,
        ano,
        dataAutorizacao: dataAutorizacao || null,
        saldoAnterior: saldoAtual,
        saldoAtual: novoSaldo,
      })
      .returning();

    return NextResponse.json({ pecunia: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pecúnia:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { fruicoes } from "@/db/schema";
