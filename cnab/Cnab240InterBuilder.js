/**
 * Gerador de arquivo CNAB 240 - Pagamento de Títulos
 * Banco Inter (Código 077)
 * Versão Corrigida 2.0: Correção do Segmento J-52 (Pagador vs Beneficiário)
 */

class Cnab240InterBuilder {
  constructor(dadosEmpresa = {}) {
    this.linhas = [];
    this.sequenciaLote = 0;
    this.sequenciaRegistro = 0;
    this.totalRegistros = 0;
    this.totalValor = 0;
    this.quantidadePagamentos = 0;

    // Dados da empresa (cedente/pagador)
    this.empresa = {
      nome: dadosEmpresa.nome || '',
      cnpj: dadosEmpresa.cnpj || '',
      agencia: dadosEmpresa.agencia || '',
      contaBancaria: dadosEmpresa.conta_bancaria || dadosEmpresa.contaBancaria || '',
      dv: dadosEmpresa.dv || '',
      codigoBanco: '077', // Banco Inter
    };

    this.pagamentos = [];
  }

  // --- Métodos Auxiliares Internos ---

  padLeft(value, length, char = '0') {
    return (char.repeat(length) + value).slice(-length);
  }

  padRight(value, length, char = ' ') {
    return (value + char.repeat(length)).slice(0, length);
  }

  onlyNumbers(str) {
    return str ? String(str).replace(/\D/g, '') : '';
  }

  removeAccents(str) {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  }

  formatDate(dateStr) {
    if (!dateStr) return '00000000';
    try {
      const [ano, mes, dia] = dateStr.split('-');
      if (!ano || !mes || !dia) return '00000000';
      return `${dia}${mes}${ano}`;
    } catch (e) { return '00000000'; }
  }

  formatMoney(value) {
    if (value === undefined || value === null) return '000000000000000';
    const num = parseFloat(value).toFixed(2).replace('.', '');
    return this.padLeft(num, 15, '0');
  }

  // --- Lógica Principal ---

  addBoletoPayment(dadosBoleto) {
    this.pagamentos.push({
      linhaDigitavel: dadosBoleto.linhaDigitavel,
      valor: dadosBoleto.valor,
      vencimento: dadosBoleto.vencimento,
      sacado: dadosBoleto.sacado, // Na verdade, aqui contém o Beneficiário do boleto
      seuNumero: dadosBoleto.seuNumero || dadosBoleto.descricao || '',
    });

    this.totalValor += parseFloat(dadosBoleto.valor);
    this.quantidadePagamentos++;
  }

  build() {
    this.linhas = [];
    this.sequenciaLote = 0;
    this.totalRegistros = 0;

    this.addHeaderArquivo();
    this.addHeaderLote();

    let seqRegistroLote = 1;
    this.pagamentos.forEach((pgto) => {
      this.addSegmentoJ(pgto, seqRegistroLote);
      seqRegistroLote++;
      
      this.addSegmentoJ52(pgto, seqRegistroLote);
      seqRegistroLote++;
    });

    this.addTrailerLote(seqRegistroLote + 1);
    this.addTrailerArquivo();

    return this.linhas.join('\r\n');
  }

  // --- Segmentos CNAB 240 ---

  addHeaderArquivo() {
    const hoje = new Date();
    const dataGeracao = this.padLeft(hoje.getDate().toString(), 2) + 
                        this.padLeft((hoje.getMonth()+1).toString(), 2) + 
                        hoje.getFullYear().toString();
    const horaGeracao = this.padLeft(hoje.getHours().toString(), 2) +
                        this.padLeft(hoje.getMinutes().toString(), 2) +
                        this.padLeft(hoje.getSeconds().toString(), 2);

    let linha = '';
    linha += '077';
    linha += '0000';
    linha += '0';
    linha += this.padRight('', 9);
    linha += this.empresa.cnpj.length > 11 ? '2' : '1';
    linha += this.padLeft(this.onlyNumbers(this.empresa.cnpj), 14);
    linha += this.padRight('', 20);
    linha += this.padLeft(this.onlyNumbers(this.empresa.agencia), 5);
    linha += ' ';
    linha += this.padLeft(this.onlyNumbers(this.empresa.contaBancaria), 12);
    linha += this.padLeft(this.empresa.dv, 1);
    linha += ' ';
    linha += this.padRight(this.empresa.nome.substring(0, 30), 30);
    linha += this.padRight('BANCO INTER', 30);
    linha += this.padRight('', 10);
    linha += '1';
    linha += dataGeracao;
    linha += horaGeracao;
    linha += '000001';
    linha += '080';
    linha += '00000';
    linha += this.padRight('', 69);
    
    this.linhas.push(linha);
    this.totalRegistros++;
  }

  addHeaderLote() {
    this.sequenciaLote++;
    let linha = '';
    linha += '077';
    linha += this.padLeft(this.sequenciaLote, 4);
    linha += '1';
    linha += 'C';
    linha += '20';
    linha += '30';
    linha += '040';
    linha += ' ';
    linha += this.empresa.cnpj.length > 11 ? '2' : '1'; 
    linha += this.padLeft(this.onlyNumbers(this.empresa.cnpj), 14);
    linha += this.padRight('', 20);
    linha += this.padLeft(this.onlyNumbers(this.empresa.agencia), 5);
    linha += ' ';
    linha += this.padLeft(this.onlyNumbers(this.empresa.contaBancaria), 12);
    linha += this.padLeft(this.empresa.dv, 1);
    linha += ' ';
    linha += this.padRight(this.empresa.nome.substring(0, 30), 30);
    linha += this.padRight('', 40);
    linha += this.padRight('', 40);
    linha += this.padLeft('', 8);
    linha += this.padRight('', 8);
    linha += this.padRight('', 10);
    
    this.linhas.push(this.padRight(linha, 240));
    this.totalRegistros++;
  }

  addSegmentoJ(pgto, seqRegistro) {
    let linha = '';
    linha += '077';
    linha += this.padLeft(this.sequenciaLote, 4);
    linha += '3'; 
    linha += this.padLeft(seqRegistro, 5);
    linha += 'J'; 
    linha += '000';
    
    const codBarras = this.linhaDigitavelParaCodBarras(pgto.linhaDigitavel);
    linha += this.padRight(codBarras, 44, '0');

    const nomeBeneficiario = this.removeAccents(pgto.sacado.nome || 'Beneficiario').substring(0, 30);
    linha += this.padRight(nomeBeneficiario, 30);

    linha += this.formatDate(pgto.vencimento);
    linha += this.formatMoney(pgto.valor);
    linha += this.padLeft('0', 15);
    linha += this.padLeft('0', 15);
    linha += this.formatDate(pgto.vencimento); 
    linha += this.formatMoney(pgto.valor);
    linha += this.padLeft('0', 15);

    // Identificação do Título na Empresa (Seu Número)
    const seuNumero = this.padRight(pgto.seuNumero || '', 20);
    linha += seuNumero;

    linha += this.padRight('', 20);
    linha += '09';
    linha += this.padRight('', 6);
    linha += this.padRight('', 10);

    this.linhas.push(this.padRight(linha, 240));
    this.totalRegistros++;
  }

  addSegmentoJ52(pgto, seqRegistro) {
    let linha = '';
    linha += '077';
    linha += this.padLeft(this.sequenciaLote, 4);
    linha += '3'; // Detalhe
    linha += this.padLeft(seqRegistro, 5);
    linha += 'J'; // Segmento
    linha += '000'; // Movimento
    linha += '52'; // Identificador J-52 (Registro de Partes Envolvidas)

    // --- DADOS DO PAGADOR (SUA EMPRESA) ---
    // Posição 20: Tipo Inscrição (1=CPF, 2=CNPJ)
    const tipoInscEmpresa = this.empresa.cnpj.length > 11 ? '2' : '1';
    linha += tipoInscEmpresa;

    // Posição 21-35: Número Inscrição Pagador
    linha += this.padLeft(this.onlyNumbers(this.empresa.cnpj), 15);

    // Posição 36-75: Nome Pagador (40 chars)
    linha += this.padRight(this.empresa.nome.substring(0, 40), 40);

    // --- DADOS DO BENEFICIÁRIO (QUEM RECEBE - DADOS DO BOLETO) ---
    // Posição 76: Tipo Inscrição Beneficiário (1=CPF, 2=CNPJ, 0=Isento)
    // Se o OCR pegou o CNPJ, usamos. Se não, mandamos 0 para não quebrar com letras.
    const docBeneficiario = this.onlyNumbers(pgto.sacado.cpf_cnpj || '');
    let tipoInscBenef = '0';
    if (docBeneficiario.length === 11) tipoInscBenef = '1';
    if (docBeneficiario.length >= 12) tipoInscBenef = '2';
    
    linha += tipoInscBenef; // Aqui estava indo "C" antes (Erro 76)

    // Posição 77-91: Número Inscrição Beneficiário
    linha += this.padLeft(docBeneficiario, 15); // Aqui corrigimos o Erro 77-91

    // Posição 92-131: Nome Beneficiário (40 chars)
    const nomeBeneficiario = this.removeAccents(pgto.sacado.nome || 'BENEFICIARIO').substring(0, 40);
    linha += this.padRight(nomeBeneficiario, 40);

    // --- DADOS DO SACADOR AVALISTA (OPCIONAL) ---
    // Posições 132-198 (Zeros ou Brancos)
    linha += this.padLeft('0', 16); // Tipo + Numero
    linha += this.padRight('', 40); // Nome

    // Posições 199-240: Reservado
    linha += this.padRight('', 42);

    this.linhas.push(this.padRight(linha, 240));
    this.totalRegistros++;
  }

  addTrailerLote(qtdRegistrosLote) {
    let linha = '';
    linha += '077';
    linha += this.padLeft(this.sequenciaLote, 4);
    linha += '5';
    linha += this.padRight('', 9);
    linha += this.padLeft(qtdRegistrosLote, 6);
    linha += this.formatMoney(this.totalValor);
    linha += this.padLeft('0', 15);
    linha += this.padLeft('0', 6);
    linha += this.padRight('', 165);
    linha += this.padRight('', 10);

    this.linhas.push(this.padRight(linha, 240));
    this.totalRegistros++;
  }

  addTrailerArquivo() {
    let linha = '';
    linha += '077';
    linha += '9999';
    linha += '9';
    linha += this.padRight('', 9);
    linha += this.padLeft('1', 6);
    linha += this.padLeft(this.totalRegistros + 1, 6);
    linha += this.padLeft('0', 6);
    linha += this.padRight('', 205);

    this.linhas.push(this.padRight(linha, 240));
  }

  linhaDigitavelParaCodBarras(linha) {
    const str = this.onlyNumbers(linha);
    if (str.length !== 47) return str;
    const p1 = str.substring(0, 4);
    const p2 = str.substring(32, 47);
    const p3 = str.substring(4, 9);
    const p4 = str.substring(10, 20);
    const p5 = str.substring(21, 31);
    const dvGeral = str.substring(32, 33);
    return p1 + dvGeral + str.substring(33, 47) + p3 + p4 + p5;
  }
}

window.Cnab240InterBuilder = Cnab240InterBuilder;


