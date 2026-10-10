import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { evolucaoFuncional, servers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CARGOS_ELEGIVEIS, getRegrasEvolucao } from "@/lib/elegibilidade";

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

    const evolucaoList = await db
      .select({
        id: evolucaoFuncional.id,
        serverId: evolucaoFuncional.serverId,
        tipo: evolucaoFuncional.tipo,
        nivelAnterior: evolucaoFuncional.nivelAnterior,
        nivelAtual: evolucaoFuncional.nivelAtual,
        vigencia: evolucaoFuncional.vigencia,
        doe: evolucaoFuncional.doe,
        ato: evolucaoFuncional.ato,
        ultimo: evolucaoFuncional.ultimo,
        proximaPrevisao: evolucaoFuncional.proximaPrevisao,
        servidorNome: servers.nome,
        servidorCargo: servers.cargo,
        servidorCpf: servers.cpf,
      })
      .from(evolucaoFuncional)
      .innerJoin(servers, eq(evolucaoFuncional.serverId, servers.id))
      .orderBy(desc(evolucaoFuncional.vigencia));

    return NextResponse.json({ evolucao: evolucaoList });
  } catch (error) {
    console.error("Erro ao buscar Evolução:", error);
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
    const { serverId, tipo, nivelAnterior, nivelAtual, vigencia, doe, ato, ultimo } = body;

    if (!serverId || !tipo || !nivelAnterior || !nivelAtual || !vigencia || !doe) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Verificar elegibilidade do servidor
    const servidor = await db.select().from(servers).where(eq(servers.id, serverId)).limit(1);
    if (!servidor.length) {
      return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
    }

    const servidorData = servidor[0];

    // Validar elegibilidade usando regras centralizadas
    if (!CARGOS_ELEGIVEIS.EVOLUCAO_FUNCIONAL.includes(servidorData.cargo)) {
      return NextResponse.json(
        {
          error: "Servidor não é elegível para Evolução Funcional",
          detalhe: `Cargo: ${servidorData.cargo}`,
          cargosElegiveis: CARGOS_ELEGIVEIS.EVOLUCAO_FUNCIONAL,
          aviso: "Secretário de Escola NÃO é elegível para Evolução Funcional"
        },
        { status: 400 }
      );
    }

    // Calcular próxima previsão se for o último
    let proximaPrevisao: string | null = null;
    if (ultimo) {
      // Usar interstício da regra de evolução
      const regras = getRegrasEvolucao(servidorData.cargo);
      const regra = regras.find((r) => r.nivelAtual === nivelAnterior);
      const anos = regra ? regra.intersticioAnos : 5; // Padrão 5 anos
      const vigenciaDate = new Date(vigencia);
      const proxima = new Date(vigenciaDate.getTime() + anos * 365 * 24 * 60 * 60 * 1000);
      proximaPrevisao = proxima.toISOString().split("T")[0];
    }

    // Criar Evolução
    const result = await db
      .insert(evolucaoFuncional)
      .values({
        serverId,
        tipo,
        nivelAnterior,
        nivelAtual,
        vigencia,
        doe,
        ato: ato || null,
        ultimo,
        proximaPrevisao,
      })
      .returning();

    // Atualizar nível do servidor
    await db
      .update(servers)
      .set({ nivel: nivelAtual })
      .where(eq(servers.id, serverId));

    return NextResponse.json({ evolucao: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar Evolução:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
