"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SolicitacaoModal from "@/components/SolicitacaoModal";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
}

interface Solicitacao {
  id: string;
  serverId: string;
  servidor: Servidor;
  tipo: string;
  modulo: string;
  descricao: string;
  situacao: string;
  resposta: string | null;
  respondidoPor: string | null;
  respondidoEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SolicitacoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("todas");
  const [showModal, setShowModal] = useState(false);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      router.push("/login-admin");
      return;
    }
    setToken(adminToken);
    fetchSolicitacoes(adminToken);
  }, [router]);

  const fetchSolicitacoes = async (authToken: string) => {
    try {
      const response = await fetch("/api/admin/solicitacoes", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data.solicitacoes);
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (id: string) => {
    setSelecionadaId(id);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    setSelecionadaId(null);
    fetchSolicitacoes(token);
  };

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    const matchTerm = s.servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.servidor.cpf.includes(searchTerm) ||
                      s.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSituacao = filtroSituacao === "todas" || s.situacao === filtroSituacao;
    return matchTerm && matchSituacao;
  });

  const estatisticas = {
    total: solicitacoes.length,
    recebidas: solicitacoes.filter((s) => s.situacao === "recebida").length,
    emAnalise: solicitacoes.filter((s) => s.situacao === "em_analise").length,
    respondidas: solicitacoes.filter((s) => s.situacao === "respondida").length,
  };

  const formatData = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCorSituacao = (situacao: string) => {
    const cores = {
      recebida: "bg-blue-100 text-blue-700",
      em_analise: "bg-yellow-100 text-yellow-700",
      aguardando_info: "bg-orange-100 text-orange-700",
      respondida: "bg-green-100 text-green-700",
      encerrada: "bg-gray-100 text-gray-700",
    };
    return cores[situacao as keyof typeof cores] || "bg-gray-100 text-gray-700";
  };

  const getNomeSituacao = (situacao: string) => {
    const nomes = {
      recebida: "Recebida",
      em_analise: "Em Análise",
      aguardando_info: "Aguardando Info",
      respondida: "Respondida",
      encerrada: "Encerrada",
    };
    return nomes[situacao as keyof typeof nomes] || situacao;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando solicitações...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/admin" className="text-sm text-green-700 hover:text-green-800 font-medium inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao painel
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Solicitações e Contestações</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estatisticas.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Recebidas</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">{estatisticas.recebidas}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Em Análise</p>
            <p className="text-3xl font-bold text-yellow-700 mt-2">{estatisticas.emAnalise}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Respondidas</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{estatisticas.respondidas}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por servidor ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            >
              <option value="todas">Todas as situações</option>
              <option value="recebida">Recebidas</option>
              <option value="em_analise">Em Análise</option>
              <option value="aguardando_info">Aguardando Info</option>
              <option value="respondida">Respondidas</option>
              <option value="encerrada">Encerradas</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Servidor</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Módulo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Descrição</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Situação</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Data</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoesFiltradas.length > 0 ? (
                  solicitacoesFiltradas.map((solicitacao) => (
                    <tr key={solicitacao.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{solicitacao.servidor.nome}</p>
                        <p className="text-sm text-gray-500">{solicitacao.servidor.cpf}</p>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className="capitalize">{solicitacao.tipo}</span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className="capitalize">{solicitacao.modulo.replace("_", " ")}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 max-w-md">
                        <p className="truncate">{solicitacao.descricao}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCorSituacao(solicitacao.situacao)}`}>
                          {getNomeSituacao(solicitacao.situacao)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatData(solicitacao.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        {solicitacao.situacao !== "respondida" && solicitacao.situacao !== "encerrada" && (
                          <button
                            onClick={() => handleResponder(solicitacao.id)}
                            className="text-green-700 hover:text-green-900 font-medium text-sm"
                          >
                           Responder
                          </button>
                        )}
                        {solicitacao.situacao === "respondida" && (
                          <button
                            onClick={() => handleResponder(solicitacao.id)}
                            className="text-blue-700 hover:text-blue-900 font-medium text-sm"
                          >
                            Ver Resposta
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      {searchTerm || filtroSituacao !== "todas" ? "Nenhuma solicitação encontrada." : "Nenhuma solicitação cadastrada."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {solicitacoesFiltradas.length} de {solicitacoes.length} solicitações
        </div>
      </main>

      {/* Modal de Resposta */}
      {showModal && selecionadaId && (
        <SolicitacaoModal
          solicitacaoId={selecionadaId}
          onClose={() => {
            setShowModal(false);
            setSelecionadaId(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
