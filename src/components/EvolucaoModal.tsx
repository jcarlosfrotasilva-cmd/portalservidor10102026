"use client";

import { useState } from "react";
import { CARGOS_ELEGIVEIS, getRegrasEvolucao } from "@/lib/elegibilidade";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  nivel: string | null;
}

interface EvolucaoModalProps {
  servidores: Servidor[];
  onClose: () => void;
  onSave: () => void;
}

export default function EvolucaoModal({ servidores, onClose, onSave }: EvolucaoModalProps) {
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(null);
  const [tipo, setTipo] = useState("1ª Evolução");
  const [nivelAnterior, setNivelAnterior] = useState("I");
  const [vigencia, setVigencia] = useState("");
  const [doe, setDoe] = useState("");
  const [ato, setAto] = useState("");
  const [ultimo, setUltimo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token] = useState(() => localStorage.getItem("admin_token") || "");

  const tipos = [
    "1ª Evolução", "2ª Evolução", "3ª Evolução", "4ª Evolução", "5ª Evolução",
    "6ª Evolução", "7ª Evolução", "8ª Evolução", "9ª Evolução", "10ª Evolução"
  ];

  const niveis = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  const getNivelAtual = () => {
    const index = niveis.indexOf(nivelAnterior);
    if (index >= 0 && index < niveis.length - 1) {
      return niveis[index + 1];
    }
    return "VIII";
  };

  const isServidorElegivel = (servidor: Servidor) => {
    return CARGOS_ELEGIVEIS.EVOLUCAO_FUNCIONAL.includes(servidor.cargo);
  };

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

      if (!vigencia || !doe) {
        setError("Data de vigência e DOE são obrigatórias");
        setLoading(false);
        return;
      }

      const nivelAtual = getNivelAtual();

      const response = await fetch("/api/admin/evolucao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serverId: selectedServidor.id,
          tipo,
          nivelAnterior,
          nivelAtual,
          vigencia: formatDataInput(vigencia),
          doe: formatDataInput(doe),
          ato: ato || null,
          ultimo,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Nova Evolução Funcional
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
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
            {/* Selecionar Servidor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servidor *
              </label>
              <select
                value={selectedServidor?.id || ""}
                onChange={(e) => {
                  const servidor = servidores.find((s) => s.id === e.target.value) || null;
                  setSelectedServidor(servidor);
                  if (servidor) {
                    setNivelAnterior(servidor.nivel || "I");
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
              >
                <option value="">Selecione um servidor</option>
                {servidores
                  .filter(isServidorElegivel)
                  .map((servidor) => (
                    <option key={servidor.id} value={servidor.id}>
                      {servidor.nome} - {servidor.cargo} (Nível {servidor.nivel || "I"})
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-red-600 font-medium">
                ⚠️ Cargos elegíveis: {CARGOS_ELEGIVEIS.EVOLUCAO_FUNCIONAL.join(", ")}
              </p>
              <p className="mt-1 text-xs text-red-600 font-medium">
                ❌ Secretário de Escola NÃO é elegível para Evolução Funcional
              </p>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
              >
                {tipos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Nível Atual */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível Atual *
                </label>
                <select
                  value={nivelAnterior}
                  onChange={(e) => setNivelAnterior(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  required
                >
                  {niveis.map((n) => (
                    <option key={n} value={n}>Nível {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível Alcançado
                </label>
                <input
                  type="text"
                  value={`Nível ${getNivelAtual()}`}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Data de Vigência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vigência *
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={vigencia}
                onChange={handleChangeData(setVigencia)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
                maxLength={10}
              />
            </div>

            {/* Data do DOE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do DOE *
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={doe}
                onChange={handleChangeData(setDoe)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
                maxLength={10}
              />
            </div>

            {/* Ato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identificação do Ato
              </label>
              <input
                type="text"
                value={ato}
                onChange={(e) => setAto(e.target.value)}
                placeholder="Ex: DOE XX/XX/XXXX - Pág. XX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* É o último? */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ultimo}
                  onChange={(e) => setUltimo(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  É a última evolução? (O sistema calculará a próxima previsão)
                </span>
              </label>
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
                "Salvar Evolução"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
