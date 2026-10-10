"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Solicitacao {
  id: string;
  tipo: string;
  modulo: string;
  descricao: string;
  situacao: string;
  resposta: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ServidorSolicitacoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("servidor_token");
    if (!token) {
      router.push("/login-servidor");
      return;
    }
    fetchSolicitacoes(token);
  }, [router]);

  const fetchSolicitacoes = async (authToken: string) => {
    try {
      const response = await fetch("/api/servidor/solicitacoes", {
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

  const formatData = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      aguardando_info: "Aguardando Informação",
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
          <p className="text-gray-600">Carregando...</p>
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
              <Link href="/dashboard/servidor" className="text-sm text-green-700 hover:text-green-800 font-medium inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao meu painel
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Minhas Solicitações</h1>
            </div>
            <Link
              href="/dashboard/servidor/solicitacoes/nova"
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Solicitação
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Módulo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Descrição</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Situação</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Data</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.length > 0 ? (
                  solicitacoes.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm capitalize">{s.tipo}</td>
                      <td className="py-4 px-6 text-sm capitalize">{s.modulo.replace("_", " ")}</td>
                      <td className="py-4 px-6 text-sm text-gray-700 max-w-md">
                        <p className="truncate">{s.descricao}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCorSituacao(s.situacao)}`}>
                          {getNomeSituacao(s.situacao)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatData(s.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Você ainda não tem solicitações.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Respostas */}
        {solicitacoes.some((s) => s.resposta) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Respostas da Administração</h2>
            <div className="space-y-4">
              {solicitacoes
                .filter((s) => s.resposta)
                .map((s) => (
                  <div key={s.id} className="bg-white rounded-xl shadow-card p-6 border-l-4 border-green-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{s.tipo} - {s.modulo.replace("_", " ")}</p>
                        <p className="text-sm text-gray-500">{formatData(s.updatedAt || s.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCorSituacao(s.situacao)}`}>
                        {getNomeSituacao(s.situacao)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{s.resposta}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
