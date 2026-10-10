import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers, ats, sextaParte, evolucaoFuncional, certidoes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Middleware simples de verificação de token
async function verifyAdminToken(token: string) {
  try {
    // Em produção, usar JWT verification adequado
    // Aqui apenas verificamos se o token existe
    if (!token || !token.startsWith("ey")) {
      return null;
    }
    return true;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação necessário" },
        { status: 401 }
      );
    }

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Buscar estatísticas
    const allServers = await db.select().from(servers);
    const totalATS = await db.select().from(ats);
    const totalSextaParte = await db.select().from(sextaParte);
    const totalEvolucao = await db.select().from(evolucaoFuncional);
    const totalCertidoes = await db.select().from(certidoes);

    // Calcular por cargo
    const porCargo: Record<string, number> = {};
    for (const server of allServers) {
      const cargo = server.cargo || "Outros";
      porCargo[cargo] = (porCargo[cargo] || 0) + 1;
    }

    // Calcular por categoria
    const porCategoria: Record<string, number> = {};
    for (const server of allServers) {
      const categoria = server.categoria || "Não informada";
      porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
    }

    // Calcular ativos e inativos
    const ativos = allServers.filter((s) => s.active && s.situacao === "ATIVO").length;
    const inativos = allServers.length - ativos;

    const stats = {
      totalServidores: allServers.length,
      ativos,
      inativos,
      porCargo,
      porCategoria,
      totalATS: totalATS.length,
      totalSextaParte: totalSextaParte.length,
      totalEvolucao: totalEvolucao.length,
      totalCertidoes: totalCertidoes.length,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
