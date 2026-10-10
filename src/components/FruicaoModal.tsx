"use client";

import { useState } from "react";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
}

interface Certidao {
  id: string;
  serverId: string;
  numero: string;
  ano: number;
  saldoAtual: number;
}

interface FruicaoModalProps {
  servidores: Servidor[];
  certidoes: Certidao[];
  onClose: () => void;
  onSave: () => void;
}

export default function FruicaoModal({ servidores, certidoes, onClose, onSave }: FruicaoModalProps) {
  const [modalidade, setModalidade] = useState<"FRUICAO" | "PECUNIA">("FRUICAO");
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(null);
  const [selectedCertidao, setSelectedCertidao] = useState<Certidao | null>(null);
  const [dias, setDias] = useState(30);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [dataAutorizacao, setDataAutorizacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token] = useState(() => localStorage.getItem("admin_token") || "");

  const diasOpcoes = [15, 30, 45, 60, 75, 90];

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

  const handleServidorChange = (servidorId: string) => {
    const servidor = servidores.find((s) => s.id === servidorId) || null;
    setSelectedServidor(servidor);
    setSelectedCertidao(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!selectedServidor || !selectedCertidao) {
        setError("Selecione servidor e certidão");
        setLoading(false);
        return;
      }

      if (modalidade === "FRUICAO" && (!dataInicio || !dataFim)) {
        setError("Data de início e fim são obrigatórias para fruição");
        setLoading(false);
        return;
      }

      if (modalidade === "PECUNIA" && (!dataAutorizacao)) {
        setError("Data de autorização é obrigatória para pecúnia");
        setLoading(false);
        return;
      }

      const url = modalidade === "FRUICAO" ? "/api/admin/fruicoes" : "/api/admin/pecunias";
      
      const body = modalidade === "FRUICAO"
        ? {
            certiaoId: selectedCertidao.id,
            serverId: selectedServidor.id,
            dias,
            dataInicio: formatDataInput(dataInicio),
            dataFim: formatDataInput(dataFim),
            dataAutorizacao: dataAutorizacao ? formatDataInput(dataAutorizacao) : null,
          }
        : {
            certiaoId: selectedCertidao.id,
            serverId: selectedServidor.id,
            dias: 30,
            ano: parseInt(ano),
            dataAutorizacao: formatDataInput(dataAutorizacao),
          };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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

  const servidorCertidoes = certidoes.filter((c) => c.serverId === selectedServidor?.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Nova Movimentação de Licença-Prêmio</h2>
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
            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={modalidade === "FRUICAO"}
                    onChange={() => setModalidade("FRUICAO")}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium">Fruição (Gozo)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={modalidade === "PECUNIA"}
                    onChange={() => setModalidade("PECUNIA")}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium">Pecúnia (30 dias)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servidor *</label>
              <select
                value={selectedServidor?.id || ""}
                onChange={(e) => handleServidorChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required
              >
                <option value="">Selecione um servidor</option>
                {servidores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certidão *</label>
              <select
                value={selectedCertidao?.id || ""}
                onChange={(e) => setSelectedCertidao(servidorCertidoes.find((c) => c.id === e.target.value) || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                required
                disabled={!selectedServidor}
              >
                <option value="">Selecione uma certidão</option>
                {servidorCertidoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero} ({c.ano}) - Saldo: {c.saldoAtual} dias
                  </option>
                ))}
              </select>
              {selectedCertidao && (
                <p className="mt-1 text-sm text-gray-600">Saldo disponível: {selectedCertidao.saldoAtual} dias</p>
              )}
            </div>

            {modalidade === "FRUICAO" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade de Dias *</label>
                  <select
                    value={dias}
                    onChange={(e) => setDias(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                  >
                    {diasOpcoes.map((d) => (
                      <option key={d} value={d}>{d} dias</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="DD/MM/AAAA"
                      value={dataInicio}
                      onChange={handleChangeData(setDataInicio)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                      required
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="DD/MM/AAAA"
                      value={dataFim}
                      onChange={handleChangeData(setDataFim)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Autorização *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/AAAA"
                    value={dataAutorizacao}
                    onChange={handleChangeData(setDataAutorizacao)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                    required
                    maxLength={10}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    💡 Pecúnia corresponde a <strong>30 dias</strong> de forma fixa
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ano da Pecúnia *</label>
                  <input
                    type="number"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Autorização *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/AAAA"
                    value={dataAutorizacao}
                    onChange={handleChangeData(setDataAutorizacao)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                    required
                    maxLength={10}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg flex items-center">
              {loading ? "Salvando..." : `Salvar ${modalidade === "FRUICAO" ? "Fruição" : "Pecúnia"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
