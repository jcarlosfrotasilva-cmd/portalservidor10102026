"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SextaParteModal from "@/components/SextaParteModal";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  categoria: string;
}

interface SextaParte {
  id: string;
  serverId: string;
  servidor: Servidor;
  vigencia: string;
  doe: string | null;
  ato: string | null;
}

export default function SextaPartePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sextaParteList, setSextaParteList] = useState<SextaParte[]>([]);
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
      const [sextaParteRes, servidoresRes] = await Promise.all([
        fetch("/api/admin/sexta-parte", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("/api/admin/servidores", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (sextaParteRes.ok) {
        const data = await sextaParteRes.json();
        setSextaParteList(data.sextaParte);
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

  const filteredSextaParte = sextaParteList.filter((sp) =>
    sp.servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.servidor.cargo.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600">Carregando Sexta-Parte...</p>
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
                Sexta-Parte
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Registro
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
              placeholder="Buscar por servidor ou cargo..."
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Total de Registros</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{sextaParteList.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Servidores com Sexta-Parte</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {new Set(sextaParteList.map((s) => s.serverId)).size}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Previsão Média (20 anos)</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {sextaParteList.filter((s) => s.vigencia).length}
            </p>
          </div>
        </div>

        {/* Tabela de Sexta-Parte */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Servidor</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cargo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vigência</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">DOE</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ato</th>
                </tr>
              </thead>
              <tbody>
                {filteredSextaParte.length > 0 ? (
                  filteredSextaParte.map((sp) => (
                    <tr key={sp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{sp.servidor.nome}</p>
                        <p className="text-sm text-gray-500">{formatCPF(sp.servidor.cpf)}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{sp.servidor.cargo}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">{formatDate(sp.vigencia)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{formatDate(sp.doe)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{sp.ato || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      {searchTerm ? "Nenhum registro encontrado." : "Nenhum registro de Sexta-Parte cadastrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredSextaParte.length} de {sextaParteList.length} registros
        </div>
      </main>

      {/* Modal de Cadastro */}
      {showModal && (
        <SextaParteModal
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
