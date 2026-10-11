import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ats, servers } from "@/db/schema";
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

    const atsList = await db
      .select({
        id: ats.id,
        serverId: ats.serverId,
        tipo: ats.tipo,
        vigencia: ats.vigencia,
        doe: ats.doe,
        ato: ats.ato,
        ultimo: ats.ultimo,
        proximaPrevisao: ats.proximaPrevisao,
        servidorNome: servers.nome,
        servidorCargo: servers.cargo,
        servidorCategoria: servers.categoria,
        servidorCpf: servers.cpf,
      })
      .from(ats)
      .innerJoin(servers, eq(ats.serverId, servers.id))
      .orderBy(desc(ats.vigencia));

    return NextResponse.json({ ats: atsList });
  } catch (error) {
    console.error("Erro ao buscar ATS:", error);
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
    const { serverId, tipo, vigencia, doe, ato, ultimo } = body;

    if (!serverId || !tipo || !vigencia || !doe) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Verificar se servidor existe (sem validar elegibilidade)
    const servidor = await db.select().from(servers).where(eq(servers.id, serverId)).limit(1);
    if (!servidor.length) {
      return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
    }

    // Calcular próxima previsão se for o último
    let proximaPrevisao: string | null = null;
    if (ultimo) {
      const vigenciaDate = new Date(vigencia);
      const proxima = new Date(vigenciaDate.getTime() + 1825 * 24 * 60 * 60 * 1000);
      proximaPrevisao = proxima.toISOString().split("T")[0];
    }

    // Criar ATS - SEM RESTRIÇÕES DE ELEGIBILIDADE
    const result = await db
      .insert(ats)
      .values({
        serverId,
        tipo,
        vigencia,
        doe,
        ato: ato || null,
        ultimo,
        proximaPrevisao,
      })
      .returning();

    return NextResponse.json({ ats: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar ATS:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
