"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EvolucaoModal from "@/components/EvolucaoModal";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  nivel: string | null;
}

interface Evolucao {
  id: string;
  serverId: string;
  servidor: Servidor;
  tipo: string;
  nivelAnterior: string;
  nivelAtual: string;
  vigencia: string;
  doe: string | null;
  ato: string | null;
  ultimo: boolean;
  proximaPrevisao: string | null;
}

export default function EvolucaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [evolucaoList, setEvolucaoList] = useState<Evolucao[]>([]);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      router.push("/login-admin");
      return;
    }
    setToken(adminToken);
    fetchData(adminToken);
  }, [router]);

  const fetchData = async (authToken: string) => {
    try {
      const [evolucaoRes, servidoresRes] = await Promise.all([
        fetch("/api/admin/evolucao", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("/api/admin/servidores/elegiveis-evolucao", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (evolucaoRes.ok) {
        const data = await evolucaoRes.json();
        setEvolucaoList(data.evolucao);
      }

      if (servidoresRes.ok) {
        const data = await servidoresRes.json();
        setServidores(data.servidores);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchData(token);
  };

  const filteredEvolucao = evolucaoList.filter((ev) =>
    ev.servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.servidor.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Evolução Funcional...</p>
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
                Evolução Funcional
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Cargos elegíveis: PEB I, PEB II, Diretor de Escola
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Evolução
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por servidor, cargo ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Total de Evoluções</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{evolucaoList.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Servidores com Evolução</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {new Set(evolucaoList.map((e) => e.serverId)).size}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Nível VIII Alcançado</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {evolucaoList.filter((e) => e.nivelAtual === "VIII").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Últimas Evoluções</p>
            <p className="text-3xl font-bold text-amber-700 mt-2">
              {evolucaoList.filter((e) => e.ultimo).length}
            </p>
          </div>
        </div>

        {/* Tabela de Evolução */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Servidor</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cargo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nível</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vigência</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">DOE</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Próxima</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvolucao.length > 0 ? (
                  filteredEvolucao.map((ev) => (
                    <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{ev.servidor.nome}</p>
                        <p className="text-sm text-gray-500">{formatCPF(ev.servidor.cpf)}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{ev.servidor.cargo}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {ev.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {ev.nivelAnterior} → {ev.nivelAtual}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{formatDate(ev.vigencia)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{formatDate(ev.doe)}</td>
                      <td className="py-4 px-6 text-sm">
                        {ev.proximaPrevisao ? (
                          <span className="text-blue-600">{formatDate(ev.proximaPrevisao)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      {searchTerm ? "Nenhuma evolução encontrada." : "Nenhum registro de Evolução Funcional cadastrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredEvolucao.length} de {evolucaoList.length} registros
        </div>
      </main>

      {/* Modal de Cadastro */}
      {showModal && (
        <EvolucaoModal
          servidores={servidores}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
