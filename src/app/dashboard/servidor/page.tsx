"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ServidorData {
  id: string;
  name: string;
  cpf: string;
  cargo: string;
  categoria: string;
  nivel: string | null;
  situacao: string;
}

interface ATS {
  id: string;
  tipo: string;
  vigencia: string;
  doe: string | null;
  ato: string | null;
}

interface SextaParte {
  id: string;
  vigencia: string;
  doe: string | null;
  ato: string | null;
}

interface Evolucao {
  id: string;
  tipo: string;
  nivelAnterior: string;
  nivelAtual: string;
  vigencia: string;
  doe: string | null;
}

interface Certidao {
  id: string;
  numero: string;
  ano: number;
  dataInicial: string;
  dataFinal: string;
  saldoInicial: number;
  saldoAtual: number;
}

export default function ServidorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [servidor, setServidor] = useState<ServidorData | null>(null);
  const [atsList, setAtsList] = useState<ATS[]>([]);
  const [sextaParteList, setSextaParteList] = useState<SextaParte[]>([]);
  const [evolucaoList, setEvolucaoList] = useState<Evolucao[]>([]);
  const [certidoesList, setCertidoesList] = useState<Certidao[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("servidor_token");
    const userData = localStorage.getItem("servidor_user");

    if (!token) {
      router.push("/login-servidor");
      return;
    }

    if (userData) {
      setServidor(JSON.parse(userData));
    }

    // Buscar dados do servidor
    fetchServidorDados(token);
  }, [router]);

  const fetchServidorDados = async (token: string) => {
    try {
      const response = await fetch("/api/servidor/dados", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("servidor_token");
          localStorage.removeItem("servidor_user");
          router.push("/login-servidor");
          return;
        }
        throw new Error("Falha ao carregar dados");
      }

      const data = await response.json();
      setServidor(data.servidor);
      setAtsList(data.ats || []);
      setSextaParteList(data.sextaParte || []);
      setEvolucaoList(data.evolucao || []);
      setCertidoesList(data.certidoes || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("servidor_token");
    localStorage.removeItem("servidor_user");
    router.push("/");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Não informado";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
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
              <p className="text-sm uppercase tracking-[0.15em] text-green-800 font-medium">
                Portal do Servidor
              </p>
              <h1 className="text-2xl font-bold text-gray-900">
                Minha Vida Funcional
              </h1>
              {servidor && (
                <p className="text-sm text-gray-600 mt-1">
                  {servidor.name} - {servidor.cargo}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/servidor/solicitacoes/nova"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Solicitação
              </Link>
              <Link
                href="/dashboard/servidor/solicitacoes"
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors"
              >
                Minhas Solicitações
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Informações Cadastrais */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Cadastrais
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {servidor && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem label="Nome" value={servidor.name} />
                <InfoItem label="CPF" value={formatCPF(servidor.cpf)} />
                <InfoItem label="Cargo" value={servidor.cargo} />
                <InfoItem label="Categoria" value={servidor.categoria || "Não informada"} />
                <InfoItem label="Nível" value={servidor.nivel || "Não informado"} />
                <InfoItem label="Situação" value={servidor.situacao} />
              </div>
            )}
          </div>
        </section>

        {/* ATS */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Adicional de Tempo de Serviço (ATS)
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {atsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vigência</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">DOE</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atsList.map((ats) => (
                      <tr key={ats.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">{ats.tipo}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(ats.vigencia)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(ats.doe)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{ats.ato || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum registro de ATS encontrado
              </p>
            )}
          </div>
        </section>

        {/* Sexta-Parte */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sexta-Parte
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {sextaParteList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vigência</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">DOE</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sextaParteList.map((sp) => (
                      <tr key={sp.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(sp.vigencia)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(sp.doe)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{sp.ato || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum registro de Sexta-Parte encontrado
              </p>
            )}
          </div>
        </section>

        {/* Evolução Funcional */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução Funcional
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {evolucaoList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nível Anterior</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nível Atual</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vigência</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">DOE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evolucaoList.map((ev) => (
                      <tr key={ev.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">{ev.tipo}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{ev.nivelAnterior}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{ev.nivelAtual}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(ev.vigencia)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(ev.doe)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum registro de Evolução Funcional encontrado
              </p>
            )}
          </div>
        </section>

        {/* Certidões de Licença-Prêmio */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Certidões de Licença-Prêmio
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {certidoesList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Certidão</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ano</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Período</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Saldo Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certidoesList.map((cert) => (
                      <tr key={cert.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {cert.numero}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{cert.ano}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(cert.dataInicial)} a {formatDate(cert.dataFinal)}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-green-700">
                          {cert.saldoAtual} dias
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma certidão de Licença-Prêmio encontrada
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function formatCPF(cpf: string): string {
  return cpf
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
