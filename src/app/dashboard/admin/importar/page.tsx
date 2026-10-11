"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";

interface PreviewRow {
  rowNumber: number;
  nome: string;
  cpf: string;
  rgcin: string;
  di: string;
  dtnasc: string;
  sexo: string;
  tel: string;
  email: string;
  cargo: string;
  categoria: string;
  faixa: string;
  nivel: string;
  jornada: string;
  lotacao: string;
  situacao: string;
  valid: boolean;
  error?: string;
}

export default function ImportarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [allRows, setAllRows] = useState<PreviewRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    updated: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [token, setToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const columnMapping: Record<string, string> = {
    "NOME": "nome",
    "NOME COMPLETO": "nome",
    "CPF": "cpf",
    "RG/CIN": "rgcin",
    "RG CIN": "rgcin",
    "DI": "di",
    "DTNASC": "dtnasc",
    "DATA NASC": "dtnasc",
    "DATA NASCIMENTO": "dtnasc",
    "SEXO": "sexo",
    "TEL": "tel",
    "TELEFONE": "tel",
    "EMAIL": "email",
    "CARGO": "cargo",
    "CATEGORIA": "categoria",
    "FAIXA": "faixa",
    "NIVEL": "nivel",
    "NÍVEL": "nivel",
    "JORNADA": "jornada",
    "LOTACAO": "lotacao",
    "LOTAÇÃO": "lotacao",
    "SITUACAO": "situacao",
    "SITUAÇÃO": "situacao",
  };

  const parseExcelDate = (value: any): string => {
    if (!value) return "";
    
    if (typeof value === "string") {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        return value;
      }
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return value;
    }

    if (typeof value === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + value * 86400000);
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const correctedDate = new Date(utc);
      const day = String(correctedDate.getDate()).padStart(2, "0");
      const month = String(correctedDate.getMonth() + 1).padStart(2, "0");
      const year = correctedDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return String(value);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setImportResult(null);
    setShowAllPreview(false);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        alert("Arquivo vazio ou sem dados válidos.");
        setLoading(false);
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h).toUpperCase().trim());
      
      const columnIndices: Record<string, number> = {};
      headers.forEach((header: string, index: number) => {
        const mapped = columnMapping[header];
        if (mapped) {
          columnIndices[mapped] = index;
        }
      });

      const rows: PreviewRow[] = [];
      let validCount = 0;

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || (row as any[]).length === 0) continue;

        const getData = (field: string): string => {
          const idx = columnIndices[field];
          if (idx === undefined || !row[idx]) return "";
          
          if (field === "dtnasc") {
            return parseExcelDate(row[idx]);
          }
          return String(row[idx]).trim();
        };

        const nome = getData("nome");
        const cpf = getData("cpf").replace(/\D/g, "");
        const cargo = getData("cargo");

        let valid = true;
        let error = "";

        if (!nome) {
          valid = false;
          error = "Nome não informado";
        } else if (!cpf || cpf.length !== 11) {
          valid = false;
          error = "CPF inválido";
        } else if (!cargo) {
          valid = false;
          error = "Cargo não informado";
        }

        if (valid) validCount++;

        rows.push({
          rowNumber: i + 1,
          nome,
          cpf: formatCPF(cpf),
          rgcin: getData("rgcin"),
          di: getData("di"),
          dtnasc: getData("dtnasc"),
          sexo: getData("sexo"),
          tel: getData("tel"),
          email: getData("email"),
          cargo,
          categoria: getData("categoria"),
          faixa: getData("faixa"),
          nivel: getData("nivel"),
          jornada: getData("jornada"),
          lotacao: getData("lotacao"),
          situacao: getData("situacao") || "ATIVO",
          valid,
          error: error || undefined,
        });
      }

      setTotalRows(rows.length);
      setAllRows(rows); // Salvar TODOS os registros
      setPreview(rows.slice(0, 20)); // Mostrar apenas 20 na prévia inicialmente
      setLoading(false);
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      alert("Erro ao ler arquivo Excel. Verifique o formato.");
      setLoading(false);
    }
  };

  const formatCPF = (cpf: string): string => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleImport = async () => {
    setImporting(true);
    const adminToken = localStorage.getItem("admin_token") || "";
    setToken(adminToken);

    const result = { success: 0, updated: 0, skipped: 0, errors: 0 };

    try {
      const rowsToImport = allRows;
      
      console.log(`Importando ${rowsToImport.length} registros...`);

      const batches = [];
      for (let i = 0; i < rowsToImport.length; i += 50) {
        batches.push(rowsToImport.slice(i, i + 50));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (row) => {
          if (!row.valid) {
            result.errors++;
            return;
          }

          try {
            const response = await fetch("/api/admin/servidores/import", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
              },
              body: JSON.stringify({
                nome: row.nome,
                cpf: row.cpf.replace(/\D/g, ""),
                rgcin: row.rgcin || null,
                di: row.di || null,
                dtnasc: row.dtnasc || null,
                sexo: row.sexo || null,
                tel: row.tel || null,
                email: row.email || null,
                cargo: row.cargo,
                categoria: row.categoria || null,
                faixa: row.faixa || null,
                nivel: row.nivel || null,
                jornada: row.jornada || null,
                lotacao: row.lotacao || null,
                situacao: row.situacao || "ATIVO",
                active: true,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              if (data.created) {
                result.success++;
              } else {
                result.updated++;
              }
            } else {
              if (data.error?.includes("CPF já cadastrado")) {
                result.skipped++;
              } else {
                result.errors++;
              }
            }
          } catch (error) {
            result.errors++;
          }
        });

        await Promise.all(batchPromises);
      }

      setImportResult(result);
      setImporting(false);
      
      // Redirecionar para lista de servidores após 3 segundos
      setTimeout(() => {
        router.push("/dashboard/admin/servidores");
      }, 3000);
    } catch (error) {
      console.error("Erro na importação:", error);
      alert("Erro na importação. Tente novamente.");
      setImporting(false);
    }
  };

  const togglePreview = () => {
    setShowAllPreview(!showAllPreview);
    setPreview(showAllPreview ? allRows.slice(0, 20) : allRows);
  };

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
                Importar Servidores (Excel)
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Instruções para Importação
          </h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• O arquivo deve estar no formato <strong>.xlsx</strong> ou <strong>.xls</strong></p>
            <p>• A primeira linha deve conter os cabeçalhos</p>
            <p>• Campos obrigatórios: <strong>NOME</strong>, <strong>CPF</strong>, <strong>CARGO</strong></p>
            <p>• Data de nascimento pode estar no formato <strong>DD/MM/AAAA</strong> ou como data do Excel</p>
            <p>• CPF deve conter 11 dígitos</p>
            <p className="text-green-700 font-medium">✓ TODOS os registros serão importados (não apenas 20)</p>
          </div>
        </div>

        {/* Upload */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-xl shadow-card p-12 text-center cursor-pointer hover:shadow-card-hover transition-shadow border-2 border-dashed border-gray-300 hover:border-green-500"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-900">
              Clique para selecionar um arquivo Excel
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ou arraste e solte o arquivo aqui
            </p>
            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700 mr-2"></div>
                <span className="text-gray-600">Lendo arquivo...</span>
              </div>
            )}
          </div>
        )}

        {/* Pré-visualização */}
        {file && preview.length > 0 && (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Arquivo: {file.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-green-700">{totalRows}</span> registros encontrados - <strong>TODOS serão importados</strong>
                  </p>
                </div>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Importar {totalRows} registros
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tabela de Prévia */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">#</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">CPF</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Cargo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Dt. Nascimento</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row) => (
                    <tr key={row.rowNumber} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-500">{row.rowNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{row.nome}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{row.cpf}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{row.cargo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{row.dtnasc || "-"}</td>
                      <td className="py-3 px-4">
                        {row.valid ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600 text-xs">{row.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalRows > 20 && (
              <div className="p-4 bg-gray-50 text-center">
                <button
                  onClick={togglePreview}
                  className="text-green-700 hover:text-green-900 font-medium text-sm"
                >
                  {showAllPreview ? "Ver apenas 20" : `Ver todos (${totalRows})`}
                </button>
              </div>
            )}

            {/* Resultado */}
            {importResult && (
              <div className="p-6 bg-green-50 border-t border-green-200">
                <h4 className="font-semibold text-green-900 mb-4">Resultado da Importação</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-700">{importResult.success}</p>
                    <p className="text-sm text-gray-600">Incluídos</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-700">{importResult.updated}</p>
                    <p className="text-sm text-gray-600">Atualizados</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-700">{importResult.skipped}</p>
                    <p className="text-sm text-gray-600">Ignorados (CPF duplicado)</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
                    <p className="text-sm text-gray-600">Erros</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setAllRows([]);
                    setImportResult(null);
                    setTotalRows(0);
                    setShowAllPreview(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Importar outro arquivo
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
