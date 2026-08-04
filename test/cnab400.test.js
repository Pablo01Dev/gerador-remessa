const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('o app usa o builder de CNAB400', () => {
  const appCode = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  assert.match(appCode, /new window\.Cnab400InterBuilder/);
  assert.match(appCode, /CNAB 400/);
});

test('o builder CNAB400 gera linhas com 400 caracteres', () => {
  const builderCode = fs.readFileSync(path.join(__dirname, '..', 'cnab', 'Cnab400InterBuilder.js'), 'utf8');
  const context = {
    window: {},
    console,
    Date,
    String,
    Number,
    parseFloat,
    parseInt,
    Array,
    RegExp,
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(builderCode, context);

  const Builder = context.window.Cnab400InterBuilder;
  const builder = new Builder({
    nome: 'ACME LTDA',
    cnpj: '12.345.678/0001-99',
    agencia: '1234',
    contaBancaria: '123456789012',
    dv: '8',
  });

  builder.addBoletoPayment({
    linhaDigitavel: '00190500954510000000000000000000000000000000',
    valor: '100.00',
    vencimento: '2026-08-10',
    sacado: { nome: 'Cliente Teste', cpf_cnpj: '12345678901' },
    seuNumero: 'TESTE001',
  });

  const arquivo = builder.build();
  const linhas = arquivo.split(/\r?\n/).filter(Boolean);

  assert.ok(linhas.length >= 3);
  linhas.forEach((linha) => assert.equal(linha.length, 400));

  const header = linhas[0];
  assert.equal(header[0], '0');
  assert.equal(header[1], '1');
  assert.equal(header.substring(2, 9), 'REMESSA');
  assert.equal(header.substring(9, 11), '01');
  assert.equal(header.substring(76, 79), '077');

  const detalhe = linhas[1];
  assert.equal(detalhe[0], '1');
  assert.equal(detalhe.substring(20, 23), '112');
  assert.equal(detalhe.substring(62, 65), '001');
  assert.equal(detalhe.substring(108, 110), '01');
});
