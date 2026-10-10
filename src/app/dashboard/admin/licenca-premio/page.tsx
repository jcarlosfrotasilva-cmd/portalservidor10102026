"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CertidaoModal from "@/components/CertidaoModal";
import FruicaoModal from "@/components/FruicaoModal";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
}

interface Certidao {
  id: string;
  serverId: string;
  servidor: Servidor;
  numero: string;
  ano: number;
  dataInicial: string;
  dataFinal: string;
  doe: string | null;
  saldoInicial: number;
  saldoAtual: number;
  fruicoes: any[];
  pecunias: any[];
}

interface Fruicao {
  id: string;
  serverId: string;
  servidor: Servidor;
  certiaoNumero: string;
  dias: number;
  dataInicio: string;
  dataFim: string;
  dataAutorizacao: string;
  modalidade: "FRUICAO";
}

interface Pecunia {
  id: string;
  serverId: string;
  servidor: Servidor;
  certiaoNumero: string;
  dias: number;
  ano: number;
  dataAutorizacao: string | null;
  modalidade: "PECUNIA";
}

export default function LicencaPremioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certidoes, setCertidoes] = useState<Certidao[]>([]);
  const [fruicoes, setFruicoes] = useState<Fruicao[]>([]);
  const [pecunias, setPecunias] = useState<Pecunia[]>([]);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCertidaoModal, setShowCertidaoModal] = useState(false);
  const [showFruicaoModal, setShowFruicaoModal] = useState(false);
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
      const [certidoesRes, fruicoesRes, pecuniasRes, servidoresRes] = await Promise.all([
        fetch("/api/admin/certidoes", { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch("/api/admin/fruicoes", { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch("/api/admin/pecunias", { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch("/api/admin/servidores", { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);

      if (certidoesRes.ok) {
        const data = await certidoesRes.json();
        setCertidoes(data.certidoes);
      }

      if (fruicoesRes.ok) {
        const data = await fruicoesRes.json();
        setFruicoes(data.fruicoes);
      }

      if (pecuniasRes.ok) {
        const data = await pecuniasRes.json();
        setPecunias(data.pecunias);
      }

      if (servidoresRes.ok) {
        const data = await servidoresRes.json();
        setServidores(data.servidores.filter((s: any) => s.active));
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setShowCertidaoModal(false);
    setShowFruicaoModal(false);
    fetchData(token);
  };

  const allMovimentacoes = [...fruicoes, ...pecunias].sort(
    (a, b) => {
      const dateA = "dataInicio" in a ? a.dataInicio : a.dataAutorizacao || "";
      const dateB = "dataInicio" in b ? b.dataInicio : b.dataAutorizacao || "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
  );

  const filteredCertidoes = certidoes.filter((c) =>
    c.servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovimentacoes = allMovimentacoes.filter((m) =>
    m.servidor.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600">Carregando Licença-Prêmio...</p>
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
                Licença-Prêmio
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFruicaoModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Nova Fruição/Pecúnia
              </button>
              <button
                onClick={() => setShowCertidaoModal(true)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nova Certidão
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
              placeholder="Buscar por servidor ou certidão..."
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
            <p className="text-sm text-gray-600">Total de Certidões</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{certidoes.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Dias de Fruição</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {fruicoes.reduce((sum, f) => sum + f.dias, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Dias de Pecúnia</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {pecunias.reduce((sum, p) => sum + p.dias, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <p className="text-sm text-gray-600">Saldo Total Disponível</p>
            <p className="text-3xl font-bold text-amber-700 mt-2">
              {certidoes.reduce((sum, c) => sum + c.saldoAtual, 0)} dias
            </p>
          </div>
        </div>

        {/* Certidões */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certidões de Licença-Prêmio</h2>
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Servidor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Certidão</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Período</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Saldo Inicial</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Dias Usados</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Saldo Atual</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertidoes.length > 0 ? (
                    filteredCertidoes.map((cert) => {
                      const diasUsados = (cert.fruicoes || []).filter((f: any) => !f.cancelada).reduce((sum: number, f: any) => sum + f.dias, 0) +
                                        (cert.pecunias || []).filter((p: any) => !p.cancelada).reduce((sum: number, p: any) => sum + p.dias, 0);
                      return (
                        <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">{cert.servidor.nome}</p>
                            <p className="text-sm text-gray-500">{formatCPF(cert.servidor.cpf)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">{cert.numero}</p>
                            <p className="text-sm text-gray-500">{cert.ano}</p>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {formatDate(cert.dataInicial)} a {formatDate(cert.dataFinal)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">{cert.saldoInicial} dias</td>
                          <td className="py-4 px-6 text-sm text-red-600">{diasUsados} dias</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              cert.saldoAtual > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}>
                              {cert.saldoAtual} dias
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        {searchTerm ? "Nenhuma certidão encontrada." : "Nenhuma certidão cadastrada."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Fruição e Pecúnia */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Movimentações (Fruição e Pecúnia)</h2>
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Servidor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Modalidade</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Certidão</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Dias</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Período/Ano</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Autorização</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovimentacoes.length > 0 ? (
                    filteredMovimentacoes.map((mov) => (
                      <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-900">{mov.servidor.nome}</p>
                          <p className="text-sm text-gray-500">{formatCPF(mov.servidor.cpf)}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            mov.modalidade === "FRUICAO" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {mov.modalidade === "FRUICAO" ? "Fruição" : "Pecúnia"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{mov.certiaoNumero}</td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">{mov.dias} dias</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {mov.modalidade === "FRUICAO" 
                            ? `${formatDate(mov.dataInicio)} a ${formatDate(mov.dataFim)}`
                            : `${mov.ano}`
                          }
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(mov.dataAutorizacao)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        {searchTerm ? "Nenhuma movimentação encontrada." : "Nenhuma fruição ou pecúnia cadastrada."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modais */}
      {showCertidaoModal && (
        <CertidaoModal
          servidores={servidores}
          onClose={() => setShowCertidaoModal(false)}
          onSave={handleSave}
        />
      )}
      {showFruicaoModal && (
        <FruicaoModal
          servidores={servidores}
          certidoes={certidoes}
          onClose={() => setShowFruicaoModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
