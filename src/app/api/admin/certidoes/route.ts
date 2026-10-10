import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { certidoes, servers, fruicoes, pecunias } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

    const certidoesList = await db
      .select({
        id: certidoes.id,
        serverId: certidoes.serverId,
        numero: certidoes.numero,
        ano: certidoes.ano,
        dataInicial: certidoes.dataInicial,
        dataFinal: certidoes.dataFinal,
        doe: certidoes.doe,
        saldoInicial: certidoes.saldoInicial,
        servidorNome: servers.nome,
        servidorCpf: servers.cpf,
      })
      .from(certidoes)
      .innerJoin(servers, eq(certidoes.serverId, servers.id))
      .orderBy(desc(certidoes.ano));

    // Calcular saldos
    const certidoesComSaldo = await Promise.all(
      certidoesList.map(async (cert) => {
        const fruicoesList = await db.select().from(fruicoes).where(eq(fruicoes.certiaoId, cert.id));
        const pecuniasList = await db.select().from(pecunias).where(eq(pecunias.certiaoId, cert.id));
        
        const diasFrui = fruicoesList.filter((f) => !f.cancelada).reduce((sum, f) => sum + f.dias, 0);
        const diasPec = pecuniasList.filter((p) => !p.cancelada).reduce((sum, p) => sum + p.dias, 0);
        const saldoAtual = Math.max(0, cert.saldoInicial - diasFrui - diasPec);

        return { ...cert, saldoAtual, fruicoes: fruicoesList, pecunias: pecuniasList };
      })
    );

    return NextResponse.json({ certidoes: certidoesComSaldo });
  } catch (error) {
    console.error("Erro ao buscar certidões:", error);
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
    const { serverId, numero, ano, dataInicial, dataFinal, doe, ato } = body;

    if (!serverId || !numero || !ano || !dataInicial || !dataFinal) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    const result = await db
      .insert(certidoes)
      .values({
        serverId,
        numero,
        ano,
        dataInicial,
        dataFinal,
        doe: doe || null,
        ato: ato || null,
        saldoInicial: 90,
      })
      .returning();

    return NextResponse.json({ certidao: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar certidão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
