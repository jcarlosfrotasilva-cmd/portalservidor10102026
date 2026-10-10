import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CARGOS_ELEGIVEIS } from "@/lib/elegibilidade";

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

    // Buscar todos os servidores ativos
    const todosServidores = await db
      .select({
        id: servers.id,
        nome: servers.nome,
        cpf: servers.cpf,
        cargo: servers.cargo,
        nivel: servers.nivel,
      })
      .from(servers)
      .where(eq(servers.active, true));

    // Filtrar usando regras centralizadas - Apenas PEB I, PEB II, Diretor
    // Secretário de Escola NÃO é elegível
    const servidoresElegiveis = todosServidores.filter(
      (s) => s.cargo && CARGOS_ELEGIVEIS.EVOLUCAO_FUNCIONAL.includes(s.cargo)
    );

    return NextResponse.json({ servidores: servidoresElegiveis });
  } catch (error) {
    console.error("Erro ao buscar servidores elegíveis:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
