"use client";

import { useState } from "react";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  categoria: string;
}

interface SextaParteModalProps {
  servidores: Servidor[];
  onClose: () => void;
  onSave: () => void;
}

export default function SextaParteModal({ servidores, onClose, onSave }: SextaParteModalProps) {
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(null);
  const [vigencia, setVigencia] = useState("");
  const [doe, setDoe] = useState("");
  const [ato, setAto] = useState("");
  const [continuar, setContinuar] = useState(false);
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

  const resetForm = () => {
    setVigencia("");
    setDoe("");
    setAto("");
    setError("");
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

      if (!vigencia || !doe) {
        setError("Data de vigência e DOE são obrigatórias");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/sexta-parte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serverId: selectedServidor.id,
          vigencia: formatDataInput(vigencia),
          doe: formatDataInput(doe),
          ato: ato || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao salvar");
      }

      if (continuar) {
        resetForm();
        setLoading(false);
        return;
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Novo Registro de Sexta-Parte</h2>
            {continuar && selectedServidor && (
              <p className="text-sm text-green-700 mt-1">Servidor mantido: {selectedServidor.nome}</p>
            )}
          </div>
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
                onChange={(e) => {
                  const servidor = servidores.find((s) => s.id === e.target.value) || null;
                  setSelectedServidor(servidor);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required
              >
                <option value="">Selecione um servidor</option>
                {servidores.map((servidor) => (
                  <option key={servidor.id} value={servidor.id}>
                    {servidor.nome} - {servidor.cargo} ({servidor.categoria})
                  </option>
                ))}
              </select>
              <p className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-900">✅ TODOS os servidores são elegíveis para Sexta-Parte</p>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vigência *</label>
              <input
                type="text" inputMode="numeric" placeholder="DD/MM/AAAA"
                value={vigencia} onChange={handleChangeData(setVigencia)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data do DOE *</label>
              <input
                type="text" inputMode="numeric" placeholder="DD/MM/AAAA"
                value={doe} onChange={handleChangeData(setDoe)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identificação do Ato</label>
              <input
                type="text" value={ato} onChange={(e) => setAto(e.target.value)}
                placeholder="Ex: DOE XX/XX/XXXX - Pág. XX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={continuar} onChange={(e) => setContinuar(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600"
                />
                <div>
                  <span className="text-sm font-medium text-blue-900">Continuar cadastrando para o mesmo servidor?</span>
                  <p className="text-xs text-blue-700 mt-1">O modal permanecerá aberto com o servidor mantido.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg flex items-center">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
