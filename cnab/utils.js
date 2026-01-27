/**
 * Utilitários para formatação e conversão de dados CNAB
 */

/**
 * Remove acentos e caracteres especiais
 * @param {string} text - Texto a processar
 * @returns {string} Texto sem acentos
 */
function removeAccents(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\-\.]/g, '');
}

/**
 * Formata um campo para o padrão CNAB
 * @param {string|number} value - Valor a formatar
 * @param {number} length - Comprimento final do campo
 * @param {string} type - Tipo do campo: 'numeric' ou 'text'
 * @returns {string} Campo formatado com 240 caracteres
 */
function formatField(value, length, type = 'text') {
  let strValue = String(value || '').trim();

  if (type === 'numeric') {
    // Remove não-dígitos
    strValue = strValue.replace(/\D/g, '');
    // Preenche com zeros à esquerda
    strValue = strValue.padStart(length, '0');
  } else if (type === 'text') {
    // Remove acentos e caracteres especiais
    strValue = removeAccents(strValue);
    // Preenche com espaços à direita
    strValue = strValue.padEnd(length, ' ');
  }

  // Trunca se necessário
  return strValue.substring(0, length);
}

/**
 * Converte Linha Digitável (47 ou 48 dígitos) em Código de Barras (44 dígitos)
 * Algoritmo CNAB: Remove os dígitos de separação da linha digitável
 * 
 * Estrutura da Linha Digitável:
 * AAABC.DEFGH IJKLM.NOPQRS TUVWXY.ZZZZZZ DIACCC EEEEEEEEEEEE
 * 
 * Código de Barras:
 * AAABC DEFGH IJKLM NOPQRS TUVWXY ZZZZZZ DIA CCC EEEEEEEEEEEE (44 dígitos)
 * 
 * @param {string} linhaDigitavel - Linha digitável do boleto
 * @returns {string} Código de barras com 44 dígitos
 */
function convertLinhaDigitavelToCodigoBarras(linhaDigitavel) {
  if (!linhaDigitavel) {
    throw new Error('Linha Digitável não fornecida');
  }

  // Remove espaços e pontos
  const cleaned = linhaDigitavel.replace(/[\s.]/g, '');

  if (cleaned.length < 47) {
    throw new Error(
      `Linha Digitável inválida. Deve ter 47 ou 48 dígitos, recebido: ${cleaned.length}`
    );
  }

  // Extrai as partes da linha digitável
  // Posições 0-4: Banco (AAABC)
  const banco = cleaned.substring(0, 5);

  // Posições 5-10: Campo livre parte 1 (DEFGH)
  const cam1a = cleaned.substring(5, 11);

  // Posições 11-20: Campo livre parte 2 (IJKLMNOPQR)
  const cam1b = cleaned.substring(11, 20);

  // Posições 21-29: Campo livre parte 3 (STUVWXYZZZ)
  const cam1c = cleaned.substring(21, 29);

  // Posição 10: Dígito de verificação da primeira parte
  const dac1 = cleaned.substring(10, 11);

  // Posições 30-33: Dia do vencimento e 3 dígitos do banco (DIACCC)
  const vencDac = cleaned.substring(30, 34);

  // Posições 34-46: Valor (EEEEEEEEEEEE - 12 dígitos)
  const valor = cleaned.substring(34, 47);

  // Monta o código de barras: Banco + Vencimento + Valor + Campo Livre
  const codigoBarras = banco + vencDac + valor + cam1a + dac1 + cam1b + cam1c;

  return codigoBarras;
}

/**
 * Calcula o dígito verificador para o código de barras
 * Usa módulo 11
 * @param {string} codigo - Código de barras sem o dígito verificador (43 dígitos)
 * @returns {string} Dígito verificador
 */
function calculateCheckDigit(codigo) {
  const sequence = '2987654321';
  let sum = 0;
  const digitos = codigo.split('');

  for (let i = 0; i < digitos.length; i++) {
    sum += parseInt(digitos[i]) * parseInt(sequence[i % sequence.length]);
  }

  const remainder = sum % 11;
  let dac = 11 - remainder;

  if (dac === 0 || dac === 10 || dac === 11) {
    dac = 0;
  }

  return String(dac);
}

/**
 * Converte data YYYY-MM-DD para DDMMAAAA
 * @param {string} dataISO - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} Data no formato CNAB (DDMMAAAA)
 */
function convertDateToCNAB(dataISO) {
  if (!dataISO) return '00000000';

  const [year, month, day] = dataISO.split('-');
  return `${day}${month}${year}`;
}

/**
 * Converte data DDMMAAAA para YYYY-MM-DD
 * @param {string} dataCNAB - Data no formato CNAB (DDMMAAAA)
 * @returns {string} Data no formato ISO (YYYY-MM-DD)
 */
function convertDateFromCNAB(dataCNAB) {
  if (!dataCNAB || dataCNAB === '00000000') return '';

  const day = dataCNAB.substring(0, 2);
  const month = dataCNAB.substring(2, 4);
  const year = dataCNAB.substring(4, 8);

  return `${year}-${month}-${day}`;
}

/**
 * Converte valor monetário para formato CNAB (cents)
 * @param {number|string} valor - Valor em reais
 * @returns {string} Valor em centavos com zeros à esquerda (15 dígitos)
 */
function convertValueToCNAB(valor) {
  let numValue = 0;

  if (typeof valor === 'string') {
    numValue = parseFloat(valor.replace(',', '.'));
  } else {
    numValue = valor;
  }

  // Converte para centavos
  const centavos = Math.round(numValue * 100);
  return String(centavos).padStart(15, '0');
}

/**
 * Converte valor CNAB de volta para reais
 * @param {string} valorCNAB - Valor em centavos (15 dígitos)
 * @returns {string} Valor em reais formatado
 */
function convertValueFromCNAB(valorCNAB) {
  const centavos = parseInt(valorCNAB);
  const reais = centavos / 100;
  return reais.toFixed(2).replace('.', ',');
}

/**
 * Incrementa uma sequência numérica
 * @param {string|number} value - Valor atual
 * @param {number} length - Comprimento final
 * @returns {string} Próximo valor formatado
 */
function incrementSequence(value, length = 6) {
  const nextValue = parseInt(value) + 1;
  return String(nextValue).padStart(length, '0');
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a validar
 * @returns {boolean} CNPJ válido
 */
function validateCNPJ(cnpj) {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;

  let sum = 0;
  let multiplier = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  multiplier = 6;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  sum += digit1 * 2;
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return (
    digit1 === parseInt(cleaned[12]) && digit2 === parseInt(cleaned[13])
  );
}

/**
 * Valida CPF
 * @param {string} cpf - CPF a validar
 * @returns {boolean} CPF válido
 */
function validateCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }

  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }

  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return (
    digit1 === parseInt(cleaned[10]) && digit2 === parseInt(cleaned[11])
  );
}
