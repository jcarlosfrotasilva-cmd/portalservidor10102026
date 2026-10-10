"use client";

import { useState, useEffect } from "react";

interface SolicitacaoModalProps {
  solicitacaoId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SolicitacaoModal({ solicitacaoId, onClose, onSave }: SolicitacaoModalProps) {
  const [resposta, setResposta] = useState("");
  const [situacao, setSituacao] = useState("respondida");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token] = useState(() => localStorage.getItem("admin_token") || "");

  const situacoes = [
    { value: "em_analise", label: "Em Análise" },
    { value: "aguardando_info", label: "Aguardando Informação" },
    { value: "respondida", label: "Respondida" },
    { value: "encerrada", label: "Encerrada" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!resposta && situacao === "respondida") {
        setError("Informe uma resposta para marcar como respondida");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/solicitacoes/${solicitacaoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resposta: resposta || null,
          situacao,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao salvar");
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Responder Solicitação
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Situação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situação *
              </label>
              <select
                value={situacao}
                onChange={(e) => setSituacao(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required
              >
                {situacoes.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Resposta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resposta *
              </label>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreva sua resposta aqui..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none resize-none"
                required={situacao === "respondida"}
              />
              <p className="mt-1 text-xs text-gray-500">
                Esta resposta será visível para o servidor na sua área pessoal.
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
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
                  Salvando...
                </>
              ) : (
                "Salvar Resposta"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
