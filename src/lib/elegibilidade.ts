/**
 * REGRAS DE ELEGIBILIDADE PARA VANTAGENS DOS SERVIDORES
 * 
 * ATUALIZADO: TODOS OS SERVIDORES SÃO ELEGÍVEIS PARA TODAS AS VANTAGENS
 * Sem restrições por cargo ou categoria
 */

// ============================================
// TODOS OS CARGOS ELEGÍVEIS PARA TODAS AS VANTAGENS
// ============================================

export const CARGOS_ELEGIVEIS = {
  ATS: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola", "Outros"],
  SEXTA_PARTE: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola", "Outros"],
  EVOLUCAO_FUNCIONAL: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola", "Outros"],
  LICENCA_PREMIO: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola", "Outros"],
};

// ============================================
// TODAS AS CATEGORIAS ELEGÍVEIS
// ============================================

export const CATEGORIAS_ELEGIVEIS = {
  ATS: ["A-EFETIVO", "ACT-F", "Outros"],
  SEXTA_PARTE: ["A-EFETIVO", "ACT-F", "Outros"],
  EVOLUCAO_FUNCIONAL: ["A-EFETIVO", "ACT-F", "Outros"],
  LICENCA_PREMIO: ["A-EFETIVO", "ACT-F", "Outros"],
};

// ============================================
// FUNÇÕES DE VERIFICAÇÃO - TODOS ELEGÍVEIS
// ============================================

export function isElegivelParaATS(cargo: string, categoria: string | null): boolean {
  // TODOS são elegíveis
  return true;
}

export function isElegivelParaSextaParte(cargo: string, categoria: string | null): boolean {
  // TODOS são elegíveis
  return true;
}

export function isElegivelParaEvolucaoFuncional(cargo: string, categoria: string | null): boolean {
  // TODOS são elegíveis
  return true;
}

export function isElegivelParaLicencaPremio(cargo: string, categoria: string | null): boolean {
  // TODOS são elegíveis
  return true;
}

export function getRegrasEvolucao(cargo: string) {
  // Tabela padrão para todos os cargos
  return [
    {
      nivelAtual: "I",
      nivelProximo: "II",
      intersticioAnos: 4,
      pontuacaoMinima: 35,
      pesos: { atualizacao: 4, aperfeiçoamento: 4, producaoProfissional: 2 },
    },
    {
      nivelAtual: "II",
      nivelProximo: "III",
      intersticioAnos: 4,
      pontuacaoMinima: 40,
      pesos: { atualizacao: 4, aperfeiçoamento: 4, producaoProfissional: 2 },
    },
    {
      nivelAtual: "III",
      nivelProximo: "IV",
      intersticioAnos: 5,
      pontuacaoMinima: 50,
      pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
    },
    {
      nivelAtual: "IV",
      nivelProximo: "V",
      intersticioAnos: 5,
      pontuacaoMinima: 60,
      pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
    },
    {
      nivelAtual: "V",
      nivelProximo: "VI",
      intersticioAnos: 4,
      pontuacaoMinima: 60,
      pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
    },
    {
      nivelAtual: "VI",
      nivelProximo: "VII",
      intersticioAnos: 4,
      pontuacaoMinima: 60,
      pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
    },
    {
      nivelAtual: "VII",
      nivelProximo: "VIII",
      intersticioAnos: 4,
      pontuacaoMinima: 60,
      pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
    },
  ];
}

export function getIntersticioParaEvolucao(cargo: string, nivelAtual: string): number | null {
  const regras = getRegrasEvolucao(cargo);
  const regra = regras.find((r) => r.nivelAtual === nivelAtual);
  return regra ? regra.intersticioAnos : null;
}

// ============================================
// MATRIZ DE ELEGIBILIDADE - TODOS ELEGÍVEIS
// ============================================

export const MATRIZ_ELEGIBILIDADE = {
  "AOE": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: true, // AGORA ELEGÍVEL
    LicencaPremio: true,
  },
  "Secretário de Escola": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: true, // AGORA ELEGÍVEL
    LicencaPremio: true,
  },
  "PEB I": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: true,
    LicencaPremio: true,
  },
  "PEB II": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: true,
    LicencaPremio: true,
  },
  "Diretor de Escola": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: true,
    LicencaPremio: true,
  },
  "Outros": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: true, // AGORA ELEGÍVEL
    LicencaPremio: true,
  },
};

/**
 * RESUMO: TODOS OS SERVIDORES SÃO ELEGÍVEIS PARA TODAS AS VANTAGENS
 * Sem restrições por cargo ou categoria
 */
