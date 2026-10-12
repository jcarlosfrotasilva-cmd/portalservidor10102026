"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  rgcin: string | null;
  cargo: string;
  categoria: string | null;
  nivel: string | null;
  situacao: string;
  active: boolean;
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [filtro, setFiltro] = useState<"geral" | "cargo" | "categoria">("geral");
  const [filtroValor, setFiltroValor] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      router.push("/login-admin");
      return;
    }
    setToken(adminToken);
    fetchServidores(adminToken);
  }, [router]);

  const fetchServidores = async (authToken: string) => {
    try {
      const response = await fetch("/api/admin/servidores", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setServidores(data.servidores || []);
      }
    } catch (error) {
      console.error("Erro ao buscar servidores:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargosUnicos = Array.from(new Set(servidores.map((s) => s.cargo))).sort();
  const categoriasUnicas = Array.from(new Set(servidores.map((s) => s.categoria || "Não informada"))).sort();

  const servidoresFiltrados = servidores.filter((s) => {
    if (!s.active) return false;

    if (filtro === "geral") {
      return true;
    }

    if (filtro === "cargo" && filtroValor) {
      return s.cargo === filtroValor;
    }

    if (filtro === "categoria" && filtroValor) {
      return (s.categoria || "Não informada") === filtroValor;
    }

    return true;
  }).sort((a, b) => a.nome.localeCompare(b.nome));

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Cabeçalho - Não impresso */}
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/admin"
                className="text-sm text-green-700 hover:text-green-800 font-medium inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao painel
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Relatórios de Servidores
              </h1>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Relatório
            </button>
          </div>
        </div>
      </header>

      {/* Cabeçalho de Impressão - Profissional */}
      <div className="print:block hidden max-w-7xl mx-auto px-6 py-4 mb-6">
        <div className="text-center border-b-2 border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">EE Profª Marlene Frattini</h1>
          <p className="text-sm text-gray-600 mt-1">Relatório de Servidores</p>
          <p className="text-xs text-gray-500 mt-2">Gerado em: {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8 print:p-0">
        {/* Filtros - Não impresso */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros do Relatório</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
              <select
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value as any);
                  setFiltroValor("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              >
                <option value="geral">Geral (Todos)</option>
                <option value="cargo">Por Cargo</option>
                <option value="categoria">Por Categoria</option>
              </select>
            </div>

            {filtro === "cargo" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                <select
                  value={filtroValor}
                  onChange={(e) => setFiltroValor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                >
                  <option value="">Selecione um cargo</option>
                  {cargosUnicos.map((cargo) => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>
            )}

            {filtro === "categoria" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={filtroValor}
                  onChange={(e) => setFiltroValor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasUnicas.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <div className="bg-blue-50 p-4 rounded-lg flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Total:</strong> {servidoresFiltrados.length} servidores
                </p>
                {filtro === "geral" && (
                  <p className="text-xs text-blue-600 mt-1">
                    Todos os servidores ativos em ordem alfabética
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Relatório */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {filtro === "geral" && "Relatório Geral - Todos os Servidores"}
              {filtro === "cargo" && filtroValor && `Relatório por Cargo - ${filtroValor}`}
              {filtro === "categoria" && filtroValor && `Relatório por Categoria - ${filtroValor}`}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nome</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">RG/CIN</th>
                  {filtro !== "geral" && (
                    <>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">CPF</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cargo</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Categoria</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {servidoresFiltrados.length > 0 ? (
                  servidoresFiltrados.map((servidor, index) => (
                    <tr key={servidor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{servidor.nome}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{servidor.rgcin || "-"}</td>
                      {filtro !== "geral" && (
                        <>
                          <td className="py-4 px-6 text-sm text-gray-700">{formatCPF(servidor.cpf)}</td>
                          <td className="py-4 px-6 text-sm text-gray-700">{servidor.cargo}</td>
                          <td className="py-4 px-6 text-sm text-gray-700">{servidor.categoria || "-"}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={filtro === "geral" ? 3 : 6} className="py-12 text-center text-gray-500">
                      Nenhum servidor encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé do Relatório */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Gerado em: {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}</p>
          <p>Total de servidores ativos: {servidoresFiltrados.length} de {servidores.filter(s => s.active).length}</p>
        </div>
      </main>
    </div>
  );
}

function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Adicionar estilos de impressão
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @media print {
      .print\\:hidden { display: none !important; }
      .print\\:block { display: block !important; }
      .print\\:p-0 { padding: 0 !important; }
      body { background: white !important; }
      .shadow-card { box-shadow: none !important; border: 1px solid #ddd !important; }
      button { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}
