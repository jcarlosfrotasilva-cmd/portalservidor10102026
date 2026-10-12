import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servers } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdminToken(token: string) {
  try {
    if (!token || !token.startsWith("ey")) return null;
    return true;
  } catch {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    
    console.log("PUT request - ID:", id, "Body:", JSON.stringify(body, null, 2));

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
      situacao,
      active,
    } = body;

    // Verificar se servidor existe
    const existing = await db.select().from(servers).where(eq(servers.id, id)).limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Servidor não encontrado" }, { status: 404 });
    }

    const existingServer = existing[0];

    // Normalizar CPF
    let cpfLimpo: string | null = null;
    if (cpf && typeof cpf === "string" && cpf.trim() !== "") {
      cpfLimpo = cpf.replace(/\D/g, "");
      
      if (cpfLimpo.length !== 11) {
        return NextResponse.json({ error: "CPF inválido. Deve conter 11 dígitos." }, { status: 400 });
      }

      // Verificar duplicidade
      if (cpfLimpo !== existingServer.cpf) {
        const duplicate = await db.select().from(servers).where(eq(servers.cpf, cpfLimpo)).limit(1);
        if (duplicate.length > 0) {
          return NextResponse.json({ error: "CPF já cadastrado para outro servidor" }, { status: 409 });
        }
      }
    }

    // Normalizar data de nascimento
    let dtnascStr: string | null = null;
    if (dtnasc && typeof dtnasc === "string" && dtnasc.trim() !== "") {
      const parts = dtnasc.replace(/\D/g, "").match(/(\d{2})(\d{2})(\d{4})/);
      if (parts) {
        dtnascStr = `${parts[3]}-${parts[2]}-${parts[1]}`;
      }
    }

    // Construir objeto de atualização - SEMPRE FORÇAR active: true
    const updateData: Record<string, any> = {
      nome: nome ?? existingServer.nome,
      cpf: cpfLimpo ?? existingServer.cpf,
      cargo: cargo ?? existingServer.cargo,
      situacao: situacao ?? "ATIVO",
      active: true, // SEMPRE ATIVO
    };

    // Campos opcionais
    if (rgcin !== undefined) updateData.rgcin = rgcin;
    if (di !== undefined) updateData.di = di;
    if (dtnascStr !== undefined) updateData.dtnasc = dtnascStr;
    if (sexo !== undefined) updateData.sexo = sexo;
    if (tel !== undefined) updateData.tel = tel;
    if (email !== undefined) updateData.email = email;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (faixa !== undefined) updateData.faixa = faixa;
    if (nivel !== undefined) updateData.nivel = nivel;
    if (jornada !== undefined) updateData.jornada = jornada;
    if (lotacao !== undefined) updateData.lotacao = lotacao;

    console.log("Update data:", JSON.stringify(updateData, null, 2));

    // Atualizar servidor
    const result = await db
      .update(servers)
      .set(updateData)
      .where(eq(servers.id, id))
      .returning();

    console.log("Update result:", JSON.stringify(result, null, 2));

    return NextResponse.json({ servidor: result[0], success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar servidor:", error);

    if (error.code === "23505") {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
    }

    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Desativar servidor
    await db.update(servers).set({ active: false }).where(eq(servers.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar servidor:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
