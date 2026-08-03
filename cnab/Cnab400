class Cnab400InterBuilder {
  constructor(dadosEmpresa = {}) {
    this.linhas = [];
    this.sequenciaRegistro = 1; // Sequencial geral da linha no arquivo
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

  formatDate6(dateStr) {
    // Retorna formato DDMMAA (Padrão para Header no CNAB 400)
    if (!dateStr) return '000000';
    try {
      const [ano, mes, dia] = dateStr.split('-');
      if (!ano || !mes || !dia) return '000000';
      return `${dia}${mes}${ano.substring(2, 4)}`;
    } catch (e) { return '000000'; }
  }

  formatDate8(dateStr) {
    // Retorna formato DDMMAAAA (Alguns detalhes no CNAB 400 exigem 8 dígitos)
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
      sacado: dadosBoleto.sacado, 
      seuNumero: dadosBoleto.seuNumero || dadosBoleto.descricao || '',
    });

    this.totalValor += parseFloat(dadosBoleto.valor);
    this.quantidadePagamentos++;
  }

  build() {
    this.linhas = [];
    this.sequenciaRegistro = 1; // Reinicia a cada build

    this.addHeader();

    this.pagamentos.forEach((pgto) => {
      this.addDetalhe(pgto);
    });

    this.addTrailer();

    return this.linhas.join('\r\n');
  }

  // --- Segmentos CNAB 400 ---

  addHeader() {
    const hoje = new Date();
    const dataGeracao = this.padLeft(hoje.getDate().toString(), 2) + 
                        this.padLeft((hoje.getMonth() + 1).toString(), 2) + 
                        hoje.getFullYear().toString().substring(2, 4); // DDMMAA

    let linha = '';
    
    // 001-001: Identificação do Registro (0 = Header)
    linha += '0'; 
    // 002-002: Tipo de Operação (1 = Remessa)
    linha += '1'; 
    // 003-009: Identificação por Extenso
    linha += this.padRight('REMESSA', 7); 
    // 010-011: Código do Serviço (20 = Pagamento a Fornecedores/Títulos)
    linha += '20'; 
    // 012-026: Extenso do Serviço
    linha += this.padRight('PAGAMENTO TITULOS', 15); 
    
    // 027-046: Dados da Empresa (Agência 5 + Conta 12 + DV 1 = 18. Preenchemos até 20)
    const agConta = this.padLeft(this.onlyNumbers(this.empresa.agencia), 5) +
                    this.padLeft(this.onlyNumbers(this.empresa.contaBancaria), 12) +
                    this.padLeft(this.empresa.dv, 1);
    linha += this.padRight(agConta, 20);
    
    // 047-076: Nome da Empresa (30 caracteres)
    linha += this.padRight(this.removeAccents(this.empresa.nome).substring(0, 30), 30);
    
    // 077-079: Código do Banco
    linha += '077'; 
    // 080-094: Nome do Banco (15 caracteres)
    linha += this.padRight('BANCO INTER', 15); 
    // 095-100: Data de Gravação
    linha += dataGeracao; 
    
    // 101-394: Espaços em Branco (294 posições)
    linha += this.padRight('', 294); 
    
    // 395-400: Sequencial do Registro
    linha += this.padLeft(this.sequenciaRegistro++, 6);

    // Garante que a linha tenha exatamente 400 posições e adiciona ao array
    this.linhas.push(this.padRight(linha, 400).substring(0, 400));
  }

  addDetalhe(pgto) {
    let linha = '';
    
    // 001-001: Identificação do Registro (1 = Detalhe)
    linha += '1'; 

    // 002-017: Tipo de Inscrição e CNPJ (2 posições tipo + 14 posições documento)
    const tipoInscEmpresa = this.empresa.cnpj.length > 11 ? '02' : '01'; // 01 CPF, 02 CNPJ
    linha += tipoInscEmpresa;
    linha += this.padLeft(this.onlyNumbers(this.empresa.cnpj), 14);

    // 018-037: Seu Número / Identificação na Empresa (20 posições)
    linha += this.padRight(pgto.seuNumero || '', 20);

    // 038-084: Linha Digitável do Título a ser pago (47 posições)
    // Removido o conversor de barras, usa os números puros da linha
    const linhaDig = this.onlyNumbers(pgto.linhaDigitavel);
    linha += this.padRight(linhaDig, 47, '0');

    // 085-114: Nome do Beneficiário (Sacado no objeto) (30 posições)
    const nomeBeneficiario = this.removeAccents(pgto.sacado.nome || 'BENEFICIARIO').substring(0, 30);
    linha += this.padRight(nomeBeneficiario, 30);

    // 115-122: Data de Vencimento (8 posições - DDMMAAAA)
    linha += this.formatDate8(pgto.vencimento);

    // 123-137: Valor do Título a ser Pago (15 posições, centavos implícitos)
    linha += this.formatMoney(pgto.valor);

    // 138-152: CPF/CNPJ do Beneficiário (15 posições)
    const docBeneficiario = this.onlyNumbers(pgto.sacado.cpf_cnpj || '');
    linha += this.padLeft(docBeneficiario, 15);

    // 153-394: Restante da linha (242 posições, pode conter descontos, juros, etc. Deixamos em branco para layout base)
    linha += this.padRight('', 242);

    // 395-400: Sequencial do Registro
    linha += this.padLeft(this.sequenciaRegistro++, 6);

    this.linhas.push(this.padRight(linha, 400).substring(0, 400));
  }

  addTrailer() {
    let linha = '';
    
    // 001-001: Identificação do Registro (9 = Trailer)
    linha += '9'; 
    
    // 002-394: Pode variar, a maioria utiliza brancos, porém incluí os totalizadores padrões FEBRABAN no fim da linha vazia
    linha += this.padRight('', 378); 
    
    // Muitas vezes o banco requer o totalizador de valor no fim do trailer (pos 380-394):
    linha += this.formatMoney(this.totalValor);
    
    // 395-400: Sequencial do Registro
    linha += this.padLeft(this.sequenciaRegistro++, 6);

    this.linhas.push(this.padRight(linha, 400).substring(0, 400));
  }
}

window.Cnab400InterBuilder = Cnab400InterBuilder;
