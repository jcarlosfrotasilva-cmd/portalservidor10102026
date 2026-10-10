"use client";

import { useState } from "react";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
}

interface CertidaoModalProps {
  servidores: Servidor[];
  onClose: () => void;
  onSave: () => void;
}

export default function CertidaoModal({ servidores, onClose, onSave }: CertidaoModalProps) {
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(null);
  const [numero, setNumero] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [doe, setDoe] = useState("");
  const [ato, setAto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token] = useState(() => localStorage.getItem("admin_token") || "");

  const formatDataInput = (dateStr: string) => {
    const parts = dateStr.replace(/\D/g, "").match(/(\d{2})(\d{2})(\d{4})/);
    if (parts) {
      return `${parts[3]}-${parts[2]}-${parts[1]}`;
    }
    return dateStr;
  };

  const handleChangeData = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3")
      .replace(/(\/\d{4})\d+?$/, "$1");
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!selectedServidor) {
        setError("Selecione um servidor");
        setLoading(false);
        return;
      }

      if (!numero || !ano || !dataInicial || !dataFinal) {
        setError("Campos obrigatórios não preenchidos");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/certidoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serverId: selectedServidor.id,
          numero,
          ano: parseInt(ano),
          dataInicial: formatDataInput(dataInicial),
          dataFinal: formatDataInput(dataFinal),
          doe: doe ? formatDataInput(doe) : null,
          ato: ato || null,
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Nova Certidão de Licença-Prêmio</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servidor *</label>
              <select
                value={selectedServidor?.id || ""}
                onChange={(e) => setSelectedServidor(servidores.find((s) => s.id === e.target.value) || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required
              >
                <option value="">Selecione um servidor</option>
                {servidores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número da Certidão *</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano *</label>
                <input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={dataInicial}
                  onChange={handleChangeData(setDataInicial)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  required
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Final *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={dataFinal}
                  onChange={handleChangeData(setDataFinal)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  required
                  maxLength={10}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data do DOE</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={doe}
                  onChange={handleChangeData(setDoe)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ato</label>
                <input
                  type="text"
                  value={ato}
                  onChange={(e) => setAto(e.target.value)}
                  placeholder="Identificação do ato"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Saldo inicial será automaticamente definido como <strong>90 dias</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg flex items-center">
              {loading ? "Salvando..." : "Salvar Certidão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
