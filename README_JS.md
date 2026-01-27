# 🎯 CNAB 240 - Gerador JavaScript

Sistema **simples e eficiente** para gerar arquivos CNAB 240 no navegador!

## ✨ Características

- ✅ **100% JavaScript** - Roda no navegador
- ✅ **Sem backend** - Sem dependências de servidor
- ✅ **Interface amigável** - Formulários intuitivos
- ✅ **Validações** - Dados automáticos checados
- ✅ **Download direto** - Baixe o arquivo CNAB pronto
- ✅ **Cópia para clipboard** - Cole em qualquer lugar

## 🚀 Como Usar

### 1. Abra no Navegador
```bash
# Abra diretamente o index.html
open index.html

# Ou use um servidor local (qualquer um funciona)
python -m http.server 8000
# Acesse: http://localhost:8000
```

### 2. Preencha os Dados

**Dados da Empresa:**
- Nome
- CNPJ
- Agência
- Conta
- Dígito Verificador

**Boletos:**
- Linha Digitável
- Valor
- Vencimento
- Nome do Sacado
- CPF/CNPJ do Sacado

### 3. Gere o CNAB
Clique em **"🚀 Gerar Arquivo CNAB 240"**

### 4. Use o Arquivo
- **Copiar**: Copie para clipboard
- **Baixar**: Baixe como arquivo .txt

## 📂 Estrutura

```
Remessa 2.0/
├── index.html              # Página principal
├── app.js                  # Lógica da aplicação
├── styles.css              # Estilos
├── cnab/
│   ├── Cnab240InterBuilder.js
│   └── utils.js
└── package.json            # Dependências
```

## 💡 Exemplo de Uso

1. **Dados Empresa:**
   - Nome: MINHA EMPRESA LTDA
   - CNPJ: 12.345.678/0001-00
   - Agência: 0001
   - Conta: 12345678901234
   - DV: 5

2. **Boleto:**
   - Linha: 34191.79001 01288.050019 91010.510008 1 86580000010050
   - Valor: 100.50
   - Vencimento: 2026-02-15
   - Sacado: JOAO DA SILVA
   - CPF: 123.456.789-00

3. **Clique em "Gerar CNAB 240"**
4. **Copie ou baixe o arquivo!**

## 🔧 Customização

### Mudar estilos
Edite `styles.css`

### Adicionar campos
Edite `index.html` e `app.js`

### Modificar CNAB
Edite `cnab/Cnab240InterBuilder.js`

## 📋 Validações Automáticas

- ✅ Linha digitável deve ter 47-48 dígitos
- ✅ Todos os campos obrigatórios
- ✅ Formato de data YYYY-MM-DD
- ✅ Valor deve ser numérico
- ✅ CNPJ/CPF removem formatação automaticamente

## 🌐 Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 📝 Notas

- Sem dependências externas (JavaScript puro)
- Tudo roda **localmente** no seu navegador
- Seus dados **não são enviados** para nenhum servidor
- 100% seguro

## 🎓 Próximos Passos

1. Use em produção
2. Integre com seu sistema
3. Customizar conforme necessário
4. Adicionar mais validações se quiser

## 📞 Suporte

- Documentação: Ver código comentado
- CNAB 240: https://banco.inter.com.br
- JavaScript: https://developer.mozilla.org

---

**v1.0.0** | 2026 | Banco Inter
