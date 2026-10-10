"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  totalServidores: number;
  ativos: number;
  inativos: number;
  porCargo: Record<string, number>;
  porCategoria: Record<string, number>;
  totalATS: number;
  totalSextaParte: number;
  totalEvolucao: number;
  totalCertidoes: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");

    if (!token) {
      router.push("/login-admin");
      return;
    }

    if (userData) {
      setAdmin(JSON.parse(userData));
    }

    // Buscar estatísticas
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          router.push("/login-admin");
          return;
        }
        throw new Error("Falha ao carregar estatísticas");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
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
                Painel Administrativo
              </h1>
              {admin && (
                <p className="text-sm text-gray-600 mt-1">
                  Bem-vindo, {admin.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-green-700 hover:text-green-800 font-medium"
              >
                Voltar ao início
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Indicadores Gerais */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Indicadores Gerais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total de Servidores"
              value={stats?.totalServidores || 0}
              color="green"
            />
            <StatCard
              title="Ativos"
              value={stats?.ativos || 0}
              color="blue"
            />
            <StatCard
              title="Inativos"
              value={stats?.inativos || 0}
              color="gray"
            />
            <StatCard
              title="Certidões"
              value={stats?.totalCertidoes || 0}
              color="purple"
            />
          </div>
        </section>

        {/* Distribuição por Cargo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Servidores por Cargo
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {stats && Object.entries(stats.porCargo).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.porCargo).map(([cargo, quantidade]) => (
                  <div key={cargo} className="flex items-center justify-between">
                    <span className="text-gray-700">{cargo}</span>
                    <span className="font-semibold text-gray-900">{quantidade}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum dado disponível
              </p>
            )}
          </div>
        </section>

        {/* Distribuição por Categoria */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Servidores por Categoria
          </h2>
          <div className="bg-white rounded-xl shadow-card p-6">
            {stats && Object.entries(stats.porCategoria).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.porCategoria).map(([categoria, quantidade]) => (
                  <div key={categoria} className="flex items-center justify-between">
                    <span className="text-gray-700">{categoria}</span>
                    <span className="font-semibold text-gray-900">{quantidade}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum dado disponível
              </p>
            )}
          </div>
        </section>

        {/* Registros de Vantagens */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Registros de Vantagens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Registros ATS"
              value={stats?.totalATS || 0}
              color="indigo"
            />
            <StatCard
              title="Sexta-Parte"
              value={stats?.totalSextaParte || 0}
              color="teal"
            />
            <StatCard
              title="Evolução Funcional"
              value={stats?.totalEvolucao || 0}
              color="amber"
            />
          </div>
        </section>

        {/* Menu Rápido */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAccessCard
              title="Servidores"
              href="/dashboard/admin/servidores"
              icon="users"
            />
            <QuickAccessCard
              title="Importar Excel"
              href="/dashboard/admin/importar"
              icon="upload"
            />
            <QuickAccessCard
              title="ATS"
              href="/dashboard/admin/ats"
              icon="document"
            />
            <QuickAccessCard
              title="Sexta-Parte"
              href="/dashboard/admin/sexta-parte"
              icon="sexta"
            />
            <QuickAccessCard
              title="Evolução Funcional"
              href="/dashboard/admin/evolucao"
              icon="evolucao"
            />
            <QuickAccessCard
              title="Licença-Prêmio"
              href="/dashboard/admin/licenca-premio"
              icon="calendar"
            />
            <QuickAccessCard
              title="Solicitações"
              href="/dashboard/admin/solicitacoes"
              icon="solicitacao"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "green" | "blue" | "gray" | "purple" | "indigo" | "teal" | "amber";
}) {
  const colorClasses = {
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function QuickAccessCard({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow border border-gray-100"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          {icon === "users" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
          {icon === "upload" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          {icon === "document" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {icon === "calendar" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          {icon === "sexta" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )}
          {icon === "evolucao" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {icon === "solicitacao" && (
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium text-gray-900">{title}</span>
      </div>
    </Link>
  );
}
