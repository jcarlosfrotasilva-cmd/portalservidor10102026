import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

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

    if (!token) {
      return NextResponse.json({ error: "Token necessário" }, { status: 401 });
    }

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Ordenar por nome (alfabética)
    const servidoresList = await db.select().from(servers).orderBy(asc(servers.nome));

    return NextResponse.json({ servidores: servidoresList });
  } catch (error) {
    console.error("Erro ao buscar servidores:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token necessário" }, { status: 401 });
    }

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      cpf,
      rgcin,
      di,
      dtnasc,
      sexo,
      tel,
      email,
      cargo,
      categoria,
      faixa,
      nivel,
      jornada,
      lotacao,
      situacao = "ATIVO",
    } = body;

    if (!nome || !cpf || !cargo) {
      return NextResponse.json({ error: "Nome, CPF e Cargo são obrigatórios" }, { status: 400 });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF inválido. Deve conter 11 dígitos." }, { status: 400 });
    }

    const existing = await db.select().from(servers).where(eq(servers.cpf, cpfLimpo)).limit(1);

    let dtnascStr: string | null = null;
    if (dtnasc && dtnasc.trim() !== "") {
      const parts = dtnasc.replace(/\D/g, "").match(/(\d{2})(\d{2})(\d{4})/);
      if (parts) {
        dtnascStr = `${parts[3]}-${parts[2]}-${parts[1]}`;
      }
    }

    if (existing.length > 0) {
      const updateData: Record<string, any> = {
        nome,
        cargo,
        situacao,
        active: true,
      };

      if (rgcin) updateData.rgcin = rgcin;
      if (di) updateData.di = di;
      if (dtnascStr) updateData.dtnasc = dtnascStr;
      if (sexo) updateData.sexo = sexo;
      if (tel) updateData.tel = tel;
      if (email) updateData.email = email;
      if (categoria) updateData.categoria = categoria;
      if (faixa) updateData.faixa = faixa;
      if (nivel) updateData.nivel = nivel;
      if (jornada) updateData.jornada = jornada;
      if (lotacao) updateData.lotacao = lotacao;

      await db.update(servers).set(updateData).where(eq(servers.cpf, cpfLimpo));

      return NextResponse.json({ updated: true });
    } else {
      const result = await db
        .insert(servers)
        .values({
          nome,
          cpf: cpfLimpo,
          rgcin: rgcin || null,
          di: di || null,
          dtnasc: dtnascStr,
          sexo: sexo || null,
          tel: tel || null,
          email: email || null,
          cargo,
          categoria: categoria || null,
          faixa: faixa || null,
          nivel: nivel || null,
          jornada: jornada || null,
          lotacao: lotacao || null,
          situacao,
          active: true,
        })
        .returning();

      return NextResponse.json({ servidor: result[0] }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Erro ao criar servidor:", error);

    if (error.code === "23505") {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
