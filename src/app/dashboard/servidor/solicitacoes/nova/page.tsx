"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState("duvida");
  const [modulo, setModulo] = useState("cadastro");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("servidor_token") || "");
  }, []);

  const tipos = [
    { value: "duvida", label: "Dúvida" },
    { value: "correcao", label: "Solicitação de Correção" },
    { value: "contestacao", label: "Contestação" },
    { value: "outra", label: "Outra" },
  ];

  const modulos = [
    { value: "cadastro", label: "Cadastro" },
    { value: "ats", label: "ATS" },
    { value: "sexta_parte", label: "Sexta-Parte" },
    { value: "evolucao_funcional", label: "Evolução Funcional" },
    { value: "licenca_premio", label: "Licença-Prêmio" },
    { value: "outro", label: "Outro" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!descricao.trim()) {
        setError("Informe uma descrição");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/servidor/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo,
          modulo,
          descricao,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao enviar");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/servidor/solicitacoes");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard/servidor/solicitacoes" className="text-sm text-green-700 hover:text-green-800 font-medium inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para minhas solicitações
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Solicitação</h1>
          <p className="text-gray-600 mb-8">
            Abra uma solicitação, dúvida ou contestação sobre seus registros funcionais.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-green-900 mb-2">Solicitação Enviada!</h2>
              <p className="text-green-700">Você será redirecionado em instantes...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Solicitação *
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  required
                >
                  {tipos.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Módulo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Módulo Relacionado *
                </label>
                <select
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  required
                >
                  {modulos.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva detalhadamente sua solicitação, dúvida ou contestação. Inclua informações relevantes como datas, números de processos, etc."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none resize-none"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Seja o mais detalhoso possível para facilitar a análise da sua solicitação.
                </p>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                  href="/dashboard/servidor/solicitacoes"
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar Solicitação"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
