"use client";

import { useState, useEffect } from "react";

interface Servidor {
  id: string;
  nome: string;
  cpf: string;
  rgcin?: string | null;
  di?: string | null;
  dtnasc?: string | null;
  sexo?: string | null;
  tel?: string | null;
  email?: string | null;
  cargo: string;
  categoria?: string | null;
  faixa?: string | null;
  nivel?: string | null;
  jornada?: string | null;
  lotacao?: string | null;
  situacao?: string;
  active?: boolean;
}

interface ServidorModalProps {
  servidor: Servidor | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ServidorModal({ servidor, onClose, onSave }: ServidorModalProps) {
  const [formData, setFormData] = useState<Partial<Servidor>>({
    nome: "",
    cpf: "",
    rgcin: "",
    di: "",
    dtnasc: "",
    sexo: "",
    tel: "",
    email: "",
    cargo: "",
    categoria: "",
    faixa: "",
    nivel: "",
    jornada: "",
    lotacao: "",
    situacao: "ATIVO",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (servidor) {
      setFormData({
        ...servidor,
        dtnasc: servidor.dtnasc ? formatDataBR(servidor.dtnasc) : "",
      });
    }
    const adminToken = localStorage.getItem("admin_token") || "";
    setToken(adminToken);
  }, [servidor]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1)$2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const formatDataBR = (dateStr: string) => {
    // Aceita YYYY-MM-DD ou DDMMAAAA
    const clean = dateStr.replace(/-/g, "");
    if (clean.length === 8) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;
    }
    return dateStr;
  };

  const formatDataInput = (dateStr: string) => {
    // Converte DD/MM/AAAA para YYYY-MM-DD
    const parts = dateStr.replace(/\D/g, "").match(/(\d{2})(\d{2})(\d{4})/);
    if (parts) {
      return `${parts[3]}-${parts[2]}-${parts[1]}`;
    }
    return dateStr;
  };

  const handleChange = (field: string, value: string) => {
    let formatted = value;
    
    if (field === "cpf") {
      formatted = formatCPF(value);
    } else if (field === "tel") {
      formatted = formatTelefone(value);
    } else if (field === "dtnasc") {
      // Mantém formato DD/MM/AAAA para exibição
      formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3")
        .replace(/(\/\d{4})\d+?$/, "$1");
    }

    setFormData((prev) => ({ ...prev, [field]: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Normalizar dados para envio
      const payload = {
        ...formData,
        cpf: formData.cpf?.replace(/\D/g, "") || "",
        dtnasc: formData.dtnasc ? formatDataInput(formData.dtnasc) : null,
      };

      const url = servidor
        ? `/api/admin/servidores/${servidor.id}`
        : "/api/admin/servidores";

      const method = servidor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao salvar servidor");
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {servidor ? "Editar Servidor" : "Novo Servidor"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={formData.cpf || ""}
                onChange={(e) => handleChange("cpf", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
                maxLength={14}
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo *
              </label>
              <input
                type="text"
                value={formData.cargo || ""}
                onChange={(e) => handleChange("cargo", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                required
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={formData.dtnasc || ""}
                onChange={(e) => handleChange("dtnasc", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                maxLength={10}
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={formData.categoria || ""}
                onChange={(e) => handleChange("categoria", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={formData.tel || ""}
                onChange={(e) => handleChange("tel", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                maxLength={15}
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo
              </label>
              <select
                value={formData.sexo || ""}
                onChange={(e) => handleChange("sexo", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>

            {/* Nível */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível
              </label>
              <input
                type="text"
                value={formData.nivel || ""}
                onChange={(e) => handleChange("nivel", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* Jornada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jornada
              </label>
              <input
                type="text"
                value={formData.jornada || ""}
                onChange={(e) => handleChange("jornada", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* Lotação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lotação
              </label>
              <input
                type="text"
                value={formData.lotacao || ""}
                onChange={(e) => handleChange("lotacao", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* Faixa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa
              </label>
              <input
                type="text"
                value={formData.faixa || ""}
                onChange={(e) => handleChange("faixa", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* RG/CIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RG/CIN
              </label>
              <input
                type="text"
                value={formData.rgcin || ""}
                onChange={(e) => handleChange("rgcin", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* DI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DI
              </label>
              <input
                type="text"
                value={formData.di || ""}
                onChange={(e) => handleChange("di", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>

            {/* Situação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situação
              </label>
              <select
                value={formData.situacao || "ATIVO"}
                onChange={(e) => handleChange("situacao", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="LICENCA">Em Licença</option>
                <option value="APOSENTADO">Aposentado</option>
              </select>
            </div>

            {/* Ativo */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active !== false}
                  onChange={(e) => handleChange("active", e.target.checked ? "true" : "false")}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600"
                />
                <span className="text-sm font-medium text-gray-700">Servidor Ativo</span>
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
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
