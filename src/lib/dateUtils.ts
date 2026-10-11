/**
 * Utilitários de formatação de datas
 */

/**
 * Formata data no formato DD/MM/AAAA enquanto o usuário digita
 * @param value Valor do input
 * @returns Valor formatado
 */
export function formatDataInput(value: string): string {
  // Remove todos caracteres não numéricos
  const digits = value.replace(/\D/g, "").slice(0, 8);
  
  // Formata progressivamente
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
}

/**
 * Converte data do formato DD/MM/AAAA para YYYY-MM-DD (para salvar no banco)
 * @param dateStr Data no formato DD/MM/AAAA
 * @returns Data no formato YYYY-MM-DD
 */
export function formatDataForDatabase(dateStr: string): string {
  const digits = dateStr.replace(/\D/g, "");
  
  if (digits.length !== 8) {
    return dateStr;
  }
  
  const dia = digits.slice(0, 2);
  const mes = digits.slice(2, 4);
  const ano = digits.slice(4, 8);
  
  return `${ano}-${mes}-${dia}`;
}

/**
 * Converte data do banco (YYYY-MM-DD) para exibição (DD/MM/AAAA)
 * @param dateStr Data no formato YYYY-MM-DD
 * @returns Data no formato DD/MM/AAAA
 */
export function formatDataForDisplay(dateStr: string | null): string {
  if (!dateStr) return "-";
  
  const partes = dateStr.split("-");
  if (partes.length !== 3) {
    return dateStr;
  }
  
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Cria handler para inputs de data
 * @param setter Função para atualizar o estado
 * @returns Handler de evento
 */
export function createDataHandler(setter: (value: string) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(formatDataInput(e.target.value));
  };
}
