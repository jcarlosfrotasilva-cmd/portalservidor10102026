"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ServidorModal from "@/components/ServidorModal";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  categoria: string;
  situacao: string;
  active: boolean;
  dtnasc: string | null;
  email: string | null;
  tel: string | null;
}

export default function ServidoresPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingServidor, setEditingServidor] = useState<Servidor | null>(null);
  const [token, setToken] = useState<string>("");

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
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          router.push("/login-admin");
          return;
        }
        throw new Error("Falha ao carregar servidores");
      }

      const data = await response.json();
      setServidores(data.servidores);
    } catch (error) {
      console.error("Erro ao buscar servidores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servidor: Servidor) => {
    setEditingServidor(servidor);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    setEditingServidor(null);
    fetchServidores(token);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar este servidor?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/servidores/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao desativar servidor");
      }

      setServidores(servidores.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Erro ao desativar servidor:", error);
      alert("Erro ao desativar servidor. Tente novamente.");
    }
  };

  const filteredServidores = servidores.filter((s) =>
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cpf.includes(searchTerm) ||
    s.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando servidores...</p>
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
                Gerenciamento de Servidores
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Total: {servidores.length} | Ativos: {servidores.filter(s => s.active).length} | Inativos: {servidores.filter(s => !s.active).length}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchServidores(token)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Servidor
              </button>
            </div>
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
              placeholder="Buscar por nome, CPF ou cargo..."
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

        {/* Tabela de Servidores */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nome</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">CPF</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cargo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Situação</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredServidores.length > 0 ? (
                  filteredServidores.map((servidor) => (
                    <tr key={servidor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{servidor.nome}</p>
                          {servidor.email && (
                            <p className="text-sm text-gray-500">{servidor.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {formatCPF(servidor.cpf)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{servidor.cargo}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{servidor.categoria || "-"}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            servidor.active && servidor.situacao === "ATIVO"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {servidor.active && servidor.situacao === "ATIVO" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(servidor)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(servidor.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desativar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      {searchTerm ? "Nenhum servidor encontrado." : "Nenhum servidor cadastrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredServidores.length} de {servidores.length} servidores
        </div>
      </main>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <ServidorModal
          servidor={editingServidor}
          onClose={() => {
            setShowModal(false);
            setEditingServidor(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
