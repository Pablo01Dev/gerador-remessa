class Cnab400InterBuilder {
  constructor(dadosEmpresa = {}) {
    this.linhas = [];
    this.sequenciaRegistro = 1;
    this.totalValor = 0;
    this.quantidadePagamentos = 0;

    this.empresa = {
      nome: dadosEmpresa.nome || '',
      cnpj: dadosEmpresa.cnpj || '',
      agencia: dadosEmpresa.agencia || '',
      contaBancaria: dadosEmpresa.conta_bancaria || dadosEmpresa.contaBancaria || '',
      dv: dadosEmpresa.dv || '',
      codigoBanco: '077',
    };

    this.pagamentos = [];
  }

  padLeft(value, length, char = '0') {
    const text = String(value ?? '');
    return (char.repeat(length) + text).slice(-length);
  }

  padRight(value, length, char = ' ') {
    const text = String(value ?? '');
    return (text + char.repeat(length)).slice(0, length);
  }

  onlyNumbers(str) {
    return str ? String(str).replace(/\D/g, '') : '';
  }

  removeAccents(str) {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  }

  sanitizeAlpha(str, length) {
    const texto = this.removeAccents(str || '')
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, ' ')
      .trim();

    return this.padRight(texto, length, ' ');
  }

  formatDate6(dateStr) {
    if (!dateStr) return '000000';
    try {
      const [ano, mes, dia] = String(dateStr).split('-');
      if (!ano || !mes || !dia) return '000000';
      return `${dia}${mes}${ano.substring(2, 4)}`;
    } catch (e) {
      return '000000';
    }
  }

  formatMoneyCents(value) {
    if (value === undefined || value === null || value === '') return this.padLeft('0', 13, '0');

    const numero = parseFloat(String(value).replace(',', '.'));
    const cents = Math.round(Math.abs(numero) * 100);
    return this.padLeft(cents.toString(), 13, '0');
  }

  addBoletoPayment(dadosBoleto) {
    this.pagamentos.push({
      linhaDigitavel: dadosBoleto.linhaDigitavel || '',
      valor: dadosBoleto.valor || '0.00',
      vencimento: dadosBoleto.vencimento || '',
      sacado: dadosBoleto.sacado || {},
      seuNumero: dadosBoleto.seuNumero || dadosBoleto.descricao || '',
      numeroDocumento: dadosBoleto.numeroDocumento || dadosBoleto.seuNumero || dadosBoleto.descricao || '',
      mensagem: dadosBoleto.mensagem || dadosBoleto.descricao || 'REFERENTE AO ALUGUEL MENSAL',
      pagador: dadosBoleto.pagador || dadosBoleto.sacado || {},
    });

    this.totalValor += parseFloat(dadosBoleto.valor || 0);
    this.quantidadePagamentos++;
  }

  build() {
    this.linhas = [];
    this.sequenciaRegistro = 1;
    this.quantidadeBoletos = this.pagamentos.length;

    this.addHeader();

    this.pagamentos.forEach((pgto) => {
      this.addDetalhe(pgto);
    });

    this.addTrailer();

    return this.linhas.join('\r\n');
  }

  addHeader() {
    const hoje = new Date();
    const dataGeracao = this.padLeft(hoje.getDate().toString(), 2) +
      this.padLeft((hoje.getMonth() + 1).toString(), 2) +
      hoje.getFullYear().toString().substring(2, 4);

    let linha = '';
    linha += '0';
    linha += '1';
    linha += this.sanitizeAlpha('REMESSA', 7);
    linha += '01';
    linha += this.sanitizeAlpha('COBRANCA', 15);
    linha += this.padRight('', 20);
    linha += this.sanitizeAlpha(this.empresa.nome, 30);
    linha += '077';
    linha += this.sanitizeAlpha('INTER', 15);
    linha += dataGeracao;
    linha += this.padRight('', 10);
    linha += this.padLeft(this.sequenciaRegistro.toString(), 7, '0');
    linha += this.padRight('', 277);
    linha += this.padLeft(this.sequenciaRegistro.toString(), 6, '0');

    this.linhas.push(this.padRight(linha, 400).substring(0, 400));
    this.sequenciaRegistro++;
  }

  addDetalhe(pgto) {
    const pagador = pgto.pagador || pgto.sacado || {};
    const nomePagador = pagador.nome || this.empresa.nome || 'PAGADOR';
    const docPagador = this.onlyNumbers(pagador.cpf_cnpj || '');
    const tipoInscricao = docPagador.length >= 12 ? '02' : (docPagador.length === 11 ? '01' : '01');
    const endereco = [pagador.endereco || '', pagador.cidade || '', pagador.uf || ''].join(' ').trim();
    const cep = this.onlyNumbers(pagador.cep || '');

    let linha = '';
    linha += '1';
    linha += this.padRight('', 19);
    linha += '112';
    linha += this.padLeft(this.onlyNumbers(this.empresa.agencia), 4, '0');
    linha += this.padLeft(this.onlyNumbers(this.empresa.contaBancaria), 9, '0');
    linha += this.padLeft(this.onlyNumbers(this.empresa.dv), 1, '0');
    linha += this.sanitizeAlpha(pgto.seuNumero || pgto.descricao || '', 25);
    linha += '001';
    linha += '0';
    linha += this.padLeft('', 23, '0');
    linha += this.padLeft('', 11, '0');
    linha += this.padRight('', 8);
    linha += '01';
    linha += this.sanitizeAlpha(pgto.numeroDocumento || pgto.seuNumero || pgto.descricao || '', 10);
    linha += this.formatDate6(pgto.vencimento);
    linha += this.formatMoneyCents(pgto.valor);
    linha += '30';
    linha += this.padRight('', 6);
    linha += '01';
    linha += 'N';
    linha += this.padRight('', 9);
    linha += '0';
    linha += this.padLeft('', 23, '0');
    linha += '0';
    linha += this.padLeft('', 23, '0');
    linha += this.padRight('', 13);
    linha += tipoInscricao;
    linha += this.padLeft(docPagador, 14, '0');
    linha += this.sanitizeAlpha(nomePagador, 40);
    linha += this.sanitizeAlpha(endereco, 38);
    linha += this.sanitizeAlpha(pagador.uf || '', 2);
    linha += this.padLeft(cep, 8, '0');
    linha += this.sanitizeAlpha(pgto.mensagem || pgto.descricao || 'REFERENTE AO ALUGUEL MENSAL', 70);
    linha += this.padLeft(this.sequenciaRegistro.toString(), 6, '0');

    this.linhas.push(this.padRight(linha, 400).substring(0, 400));
    this.sequenciaRegistro++;
  }

  addTrailer() {
    let linha = '';
    linha += '9';
    linha += this.padLeft(this.quantidadePagamentos.toString(), 6, '0');
    linha += this.padRight('', 387);
    linha += this.padLeft(this.sequenciaRegistro.toString(), 6, '0');

    this.linhas.push(this.padRight(linha, 400).substring(0, 400));
  }
}

window.Cnab400InterBuilder = Cnab400InterBuilder;
