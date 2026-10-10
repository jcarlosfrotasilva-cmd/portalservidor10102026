/**
 * REGRAS DE ELEGIBILIDADE PARA VANTAGENS DOS SERVIDORES
 * 
 * Conforme documento oficial do Portal de Vantagens dos Servidores
 * EE Profª Marlene Frattini — Matão/SP
 * 
 * ATUALIZADO EM: 2024
 */

// ============================================
// CARGOS ELEGÍVEIS POR VANTAGEM
// ============================================

export const CARGOS_ELEGIVEIS = {
  // ATS: Todos servidores efetivos (AOE, Secretário, PEB I, PEB II, Diretor)
  ATS: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola"],
  
  // Sexta-Parte: Mesma regra do ATS
  SEXTA_PARTE: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola"],
  
  // Evolução Funcional: Apenas PEB I, PEB II, Diretor (Secretário NÃO é elegível)
  EVOLUCAO_FUNCIONAL: ["PEB I", "PEB II", "Diretor de Escola"],
  
  // Licença-Prêmio: Todos os cargos
  LICENCA_PREMIO: ["AOE", "Secretário de Escola", "PEB I", "PEB II", "Diretor de Escola"],
};

// ============================================
// CATEGORIAS ELEGÍVEIS (para todas as vantagens)
// ============================================

export const CATEGORIAS_ELEGIVEIS = {
  // ATS e Sexta-Parte: Apenas A-EFETIVO e ACT-F
  ATS: ["A-EFETIVO", "ACT-F"],
  SEXTA_PARTE: ["A-EFETIVO", "ACT-F"],
  
  // Evolução Funcional: Apenas A-EFETIVO e ACT-F
  EVOLUCAO_FUNCIONAL: ["A-EFETIVO", "ACT-F"],
  
  // Licença-Prêmio: Apenas A-EFETIVO e ACT-F
  LICENCA_PREMIO: ["A-EFETIVO", "ACT-F"],
};

// ============================================
// TABELAS DE INTERSTÍCIO PARA EVOLUÇÃO FUNCIONAL
// ============================================

export interface RegraEvolucao {
  nivelAtual: string;
  nivelProximo: string;
  intersticioAnos: number;
  pontuacaoMinima: number;
  pesos: {
    atualizacao: number;
    aperfeiçoamento: number;
    producaoProfissional: number;
  };
}

// Classe Docente (PEB I e PEB II)
export const REGRAS_EVOLUCAO_DOCENTE: RegraEvolucao[] = [
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

// Classe de Suporte Pedagógico (Diretor de Escola)
export const REGRAS_EVOLUCAO_DIRETOR: RegraEvolucao[] = [
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
    intersticioAnos: 5,
    pontuacaoMinima: 40,
    pesos: { atualizacao: 4, aperfeiçoamento: 4, producaoProfissional: 2 },
  },
  {
    nivelAtual: "III",
    nivelProximo: "IV",
    intersticioAnos: 6,
    pontuacaoMinima: 50,
    pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
  },
  {
    nivelAtual: "IV",
    nivelProximo: "V",
    intersticioAnos: 6,
    pontuacaoMinima: 60,
    pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
  },
  {
    nivelAtual: "V",
    nivelProximo: "VI",
    intersticioAnos: 5,
    pontuacaoMinima: 60,
    pesos: { atualizacao: 3, aperfeiçoamento: 3, producaoProfissional: 4 },
  },
  {
    nivelAtual: "VI",
    nivelProximo: "VII",
    intersticioAnos: 5,
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

// ============================================
// FUNÇÕES DE VERIFICAÇÃO
// ============================================

export function isElegivelParaATS(cargo: string, categoria: string | null): boolean {
  return (
    CARGOS_ELEGIVEIS.ATS.includes(cargo) &&
    CATEGORIAS_ELEGIVEIS.ATS.includes(categoria || "")
  );
}

export function isElegivelParaSextaParte(cargo: string, categoria: string | null): boolean {
  return (
    CARGOS_ELEGIVEIS.SEXTA_PARTE.includes(cargo) &&
    CATEGORIAS_ELEGIVEIS.SEXTA_PARTE.includes(categoria || "")
  );
}

export function isElegivelParaEvolucaoFuncional(cargo: string, categoria: string | null): boolean {
  return (
    CARGOS_ELEGIVEIS.EVOLUCAO_FUNCIONAL.includes(cargo) &&
    CATEGORIAS_ELEGIVEIS.EVOLUCAO_FUNCIONAL.includes(categoria || "")
  );
}

export function isElegivelParaLicencaPremio(cargo: string, categoria: string | null): boolean {
  return (
    CARGOS_ELEGIVEIS.LICENCA_PREMIO.includes(cargo) &&
    CATEGORIAS_ELEGIVEIS.LICENCA_PREMIO.includes(categoria || "")
  );
}

export function getRegrasEvolucao(cargo: string): RegraEvolucao[] {
  if (cargo === "Diretor de Escola") {
    return REGRAS_EVOLUCAO_DIRETOR;
  }
  return REGRAS_EVOLUCAO_DOCENTE; // PEB I e PEB II
}

export function getIntersticioParaEvolucao(cargo: string, nivelAtual: string): number | null {
  const regras = getRegrasEvolucao(cargo);
  const regra = regras.find((r) => r.nivelAtual === nivelAtual);
  return regra ? regra.intersticioAnos : null;
}

export function getMotivoInelegibilidade(cargo: string, categoria: string | null, vantagem: string): string {
  const cargosElegiveis = CARGOS_ELEGIVEIS[vantagem as keyof typeof CARGOS_ELEGIVEIS] || [];
  const categoriasElegiveis = CATEGORIAS_ELEGIVEIS[vantagem as keyof typeof CATEGORIAS_ELEGIVEIS] || [];
  
  let motivos = [];
  
  if (!cargosElegiveis.includes(cargo)) {
    motivos.push(`Cargo "${cargo}" não é elegível`);
  }
  
  if (!categoriasElegiveis.includes(categoria || "")) {
    motivos.push(`Categoria "${categoria}" não é elegível`);
  }
  
  if (motivos.length > 0) {
    return `${vantagem}: ${motivos.join(", ")}`;
  }
  
  return "Servidor elegível";
}

// ============================================
// MATRIZ DE ELEGIBILIDADE RESUMO
// ============================================

export const MATRIZ_ELEGIBILIDADE = {
  "AOE": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: false,
    LicencaPremio: true,
  },
  "Secretário de Escola": {
    ATS: true,
    SextaParte: true,
    EvolucaoFuncional: false, // IMPORTANTE: NÃO é elegível
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
};

// ============================================
// RESUMO DAS REGRAS ATUALIZADAS
// ============================================

/**
 * REGRAS ATUALIZADAS (Conforme solicitado):
 * 
 * 1. ATS - Adicional por Tempo de Serviço:
 *    - CARGOS: AOE, Secretário de Escola, PEB I, PEB II, Diretor de Escola
 *    - CATEGORIAS: A-EFETIVO, ACT-F
 *    - TODOS os servidores efetivos destas categorias são elegíveis
 * 
 * 2. Sexta-Parte:
 *    - CARGOS: AOE, Secretário de Escola, PEB I, PEB II, Diretor de Escola
 *    - CATEGORIAS: A-EFETIVO, ACT-F
 *    - Mesma regra do ATS
 * 
 * 3. Evolução Funcional:
 *    - CARGOS: PEB I, PEB II, Diretor de Escola
 *    - CATEGORIAS: A-EFETIVO, ACT-F
 *    - Secretário de Escola NÃO é elegível
 * 
 * 4. Certidão de Licença-Prêmio:
 *    - CARGOS: AOE, PEB I, PEB II, Diretor de Escola, Secretário de Escola
 *    - CATEGORIAS: A-EFETIVO, ACT-F
 *    - TODOS os cargos destas categorias são elegíveis
 */
