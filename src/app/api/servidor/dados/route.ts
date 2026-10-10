import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers, ats, sextaParte, evolucaoFuncional, certidoes, fruicoes, pecunias } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyServidorToken(token: string) {
  try {
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

    const isValid = await verifyServidorToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Obter CPF do token (em produção, decodificar JWT)
    // Aqui estamos simulando - na prática, o token seria decodificado
    // Para teste, vamos buscar todos os servidores e retornar o primeiro
    // Em produção, o token deve conter o ID do servidor

    // Buscar servidor e seus registros
    const allServers = await db.select().from(servers);
    
    if (!allServers.length) {
      return NextResponse.json(
        { error: "Servidor não encontrado" },
        { status: 404 }
      );
    }

    // Para teste, retornamos o primeiro servidor ativo
    // Em produção, usar o ID do token
    const servidor = allServers[0];

    // Buscar ATS
    const atsList = await db
      .select()
      .from(ats)
      .where(eq(ats.serverId, servidor.id));

    // Buscar Sexta-Parte
    const sextaParteList = await db
      .select()
      .from(sextaParte)
      .where(eq(sextaParte.serverId, servidor.id));

    // Buscar Evolução Funcional
    const evolucaoList = await db
      .select()
      .from(evolucaoFuncional)
      .where(eq(evolucaoFuncional.serverId, servidor.id));

    // Buscar Certidões com saldos calculados
    const certidoesListRaw = await db
      .select()
      .from(certidoes)
      .where(eq(certidoes.serverId, servidor.id));

    // Calcular saldos das certidões
    const certidoesList = await Promise.all(
      certidoesListRaw.map(async (cert) => {
        const fruicoesList = await db
          .select()
          .from(fruicoes)
          .where(
            eq(fruicoes.certiaoId, cert.id)
          );
        
        const pecuniasList = await db
          .select()
          .from(pecunias)
          .where(
            eq(pecunias.certiaoId, cert.id)
          );

        const diasFrui = fruicoesList
          .filter((f) => !f.cancelada)
          .reduce((sum, f) => sum + f.dias, 0);
        
        const diasPec = pecuniasList
          .filter((p) => !p.cancelada)
          .reduce((sum, p) => sum + p.dias, 0);

        const saldoAtual = cert.saldoInicial - diasFrui - diasPec;

        return {
          ...cert,
          saldoAtual: Math.max(0, saldoAtual),
        };
      })
    );

    return NextResponse.json({
      servidor: {
        id: servidor.id,
        name: servidor.nome,
        cpf: servidor.cpf,
        cargo: servidor.cargo,
        categoria: servidor.categoria,
        nivel: servidor.nivel,
        situacao: servidor.situacao,
      },
      ats: atsList,
      sextaParte: sextaParteList,
      evolucao: evolucaoList,
      certidoes: certidoesList,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
