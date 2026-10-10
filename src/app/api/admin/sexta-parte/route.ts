import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sextaParte, servers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CARGOS_ELEGIVEIS, CATEGORIAS_ELEGIVEIS } from "@/lib/elegibilidade";

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

    const sextaParteList = await db
      .select({
        id: sextaParte.id,
        serverId: sextaParte.serverId,
        vigencia: sextaParte.vigencia,
        doe: sextaParte.doe,
        ato: sextaParte.ato,
        servidorNome: servers.nome,
        servidorCargo: servers.cargo,
        servidorCategoria: servers.categoria,
        servidorCpf: servers.cpf,
      })
      .from(sextaParte)
      .innerJoin(servers, eq(sextaParte.serverId, servers.id))
      .orderBy(desc(sextaParte.vigencia));

    return NextResponse.json({ sextaParte: sextaParteList });
  } catch (error) {
    console.error("Erro ao buscar Sexta-Parte:", error);
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
    const { serverId, vigencia, doe, ato } = body;

    if (!serverId || !vigencia || !doe) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Verificar elegibilidade do servidor
    const servidor = await db.select().from(servers).where(eq(servers.id, serverId)).limit(1);
    if (!servidor.length) {
      return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
    }

    const servidorData = servidor[0];
    
    // Validar elegibilidade usando regras atualizadas
    if (
      !CARGOS_ELEGIVEIS.SEXTA_PARTE.includes(servidorData.cargo) ||
      !CATEGORIAS_ELEGIVEIS.SEXTA_PARTE.includes(servidorData.categoria || "")
    ) {
      return NextResponse.json(
        { 
          error: "Servidor não é elegível para Sexta-Parte",
          detalhe: `Cargo: ${servidorData.cargo} | Categoria: ${servidorData.categoria}`,
          cargosElegiveis: CARGOS_ELEGIVEIS.SEXTA_PARTE,
          categoriasElegiveis: CATEGORIAS_ELEGIVEIS.SEXTA_PARTE,
          regra: "Sexta-Parte: Todos servidores efetivos dos cargos AOE, Secretário, PEB I, PEB II, Diretor nas categorias A-EFETIVO e ACT-F"
        },
        { status: 400 }
      );
    }

    // Criar Sexta-Parte
    const result = await db
      .insert(sextaParte)
      .values({
        serverId,
        vigencia,
        doe,
        ato: ato || null,
      })
      .returning();

    return NextResponse.json({ sextaParte: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar Sexta-Parte:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
