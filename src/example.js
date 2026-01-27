/**
 * Exemplo de uso do Cnab240InterBuilder
 */

import Cnab240InterBuilder from '../cnab/Cnab240InterBuilder.js';

// Dados da empresa (cedente)
const dadosEmpresa = {
  nome: 'MINHA EMPRESA LTDA',
  cnpj: '12.345.678/0001-00', // Será limpo automaticamente
  agencia: '0001',
  contaBancaria: '12345678901234',
  dv: '5', // Dígito verificador da conta
};

// Cria a instância do builder
const builder = new Cnab240InterBuilder(dadosEmpresa);

// Dados do boleto (extraído via Gemini API)
const boleto1 = {
  linhaDigitavel: '34191.79001 01288.050019 91010.510008 1 86580000010050', // Exemplo
  valor: '100.50', // Em reais
  vencimento: '2026-02-15', // ISO format
  sacado: {
    nome: 'JOAO DA SILVA',
    cpfCnpj: '123.456.789-00',
    endereco: 'Rua das Flores, 123',
    cep: '01234-567',
    cidade: 'Sao Paulo',
    uf: 'SP',
    telefone: '11987654321',
  },
  descricao: 'Pagamento Boleto #001',
};

const boleto2 = {
  linhaDigitavel: '34191.79001 01288.050019 91010.510008 1 86580000010050',
  valor: '250.00',
  vencimento: '2026-03-10',
  sacado: {
    nome: 'MARIA SANTOS',
    cpfCnpj: '987.654.321-00',
    endereco: 'Av. Paulista, 1000',
    cep: '01311-100',
    cidade: 'Sao Paulo',
    uf: 'SP',
    telefone: '11912345678',
  },
  descricao: 'Pagamento Boleto #002',
};

try {
  // Adiciona os pagamentos
  builder.addBoletoPayment(boleto1);
  builder.addBoletoPayment(boleto2);

  // Gera o arquivo
  const arquivoCNAB = builder.build();

  // Exibe resumo
  console.log('=== RESUMO DA REMESSA ===');
  console.log(builder.getSummary());

  console.log('\n=== ARQUIVO CNAB 240 (primeiras 10 linhas) ===');
  const linhas = arquivoCNAB.split('\n');
  linhas.slice(0, 10).forEach((linha, idx) => {
    console.log(`Linha ${idx + 1} (${linha.length} chars): ${linha.substring(0, 50)}...`);
  });

  console.log('\n=== ARQUIVO COMPLETO ===');
  console.log(arquivoCNAB);

  // Salvar em arquivo (opcional)
  // import fs from 'fs';
  // fs.writeFileSync('remessa.txt', arquivoCNAB, 'utf8');
  // console.log('Arquivo salvo como remessa.txt');

} catch (error) {
  console.error('Erro ao gerar CNAB:', error.message);
}
