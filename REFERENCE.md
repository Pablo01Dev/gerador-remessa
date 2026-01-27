# 📋 REFERÊNCIA RÁPIDA - API e Classes

## 🎯 Classe Principal: Cnab240InterBuilder

### Inicialização
```python
from cnab.Cnab240InterBuilder import Cnab240InterBuilder

builder = Cnab240InterBuilder(dados_empresa={
    'nome': str,           # Obrigatório
    'cnpj': str,          # Obrigatório
    'agencia': str,        # Obrigatório
    'conta_bancaria': str, # Obrigatório
    'dv': str              # Dígito verificador
})
```

### Métodos Principais

#### add_header_arquivo()
```python
builder.add_header_arquivo()
# Cria segmento 0 (Header do arquivo)
# Chamado automaticamente ou manualmente
```

#### add_header_lote(tipo_servico='20')
```python
builder.add_header_lote('20')  # Pagamento Fornecedor
builder.add_header_lote('98')  # Pagamentos Diversos
# Cria segmento 1 (Header do lote)
```

#### add_boleto_payment(dados_boleto)
```python
builder.add_boleto_payment({
    'linha_digitavel': str,    # OBRIGATÓRIO: "34191.79001..."
    'valor': float|str,         # OBRIGATÓRIO: 100.50 ou "100.50"
    'vencimento': str,          # OBRIGATÓRIO: "2026-02-15" (YYYY-MM-DD)
    'sacado': {                 # OBRIGATÓRIO
        'nome': str,            # Nome completo
        'cpf_cnpj': str,        # Com ou sem formatação
        'endereco': str,        # Opcional
        'cep': str,             # Opcional: "01234-567"
        'cidade': str,          # Opcional
        'uf': str,              # Opcional: "SP"
        'telefone': str         # Opcional
    },
    'descricao': str            # Opcional: referência interna
})
# Cria segmentos 3(J) e 3(J-52)
# Retorna: None (levanta exceção se erro)
```

#### add_trailer_lote()
```python
builder.add_trailer_lote()
# Cria segmento 5 (Trailer do lote)
# Automático em build()
```

#### add_trailer_arquivo()
```python
builder.add_trailer_arquivo()
# Cria segmento 9 (Trailer do arquivo)
# Automático em build()
```

#### build()
```python
arquivo_cnab = builder.build()
# Retorna: str (conteúdo completo do arquivo CNAB)
# Exceções: ValueError se nenhum pagamento foi adicionado
```

#### save_to_file(filepath)
```python
builder.save_to_file('remessa.txt')
# Salva arquivo em disco
# Cria arquivo se não existir
# Sobrescreve se existir
```

#### get_summary()
```python
summary = builder.get_summary()
# Retorna dict com:
# {
#     'total_pagamentos': int,
#     'total_valor': float,
#     'total_registros': int,
#     'quantidade_linhas': int,
#     'pagamentos': list
# }
```

#### reset()
```python
builder.reset()
# Limpa todos os dados
# Permite reutilizar o objeto
```

#### get_linhas()
```python
linhas = builder.get_linhas()
# Retorna: List[str]
# Cada linha tem exatamente 240 caracteres
```

---

## 🛠️ Serviço Gemini: GeminiService

### Inicialização
```python
from cnab.gemini_service import GeminiService

service = GeminiService(api_key='sua_chave_aqui')
```

### Métodos

#### extract_boleto_data(image_source, source_type='url'|'file')
```python
# De URL
dados = service.extract_boleto_data(
    'https://example.com/boleto.jpg',
    source_type='url'
)

# De arquivo local
dados = service.extract_boleto_data(
    '/caminho/para/boleto.jpg',
    source_type='file'
)

# Retorna dict:
# {
#     'linha_digitavel': str,
#     'valor': str,
#     'vencimento': str (YYYY-MM-DD),
#     'beneficiario': str,
#     'sacador': str (opcional),
#     'banco': str,
#     'agencia': str,
#     'conta': str,
#     'status': 'success'|'error',
#     'mensagem': str (se erro)
# }
```

#### validate_extracted_data(dados)
```python
validacao = service.validate_extracted_data(dados)
# Retorna dict:
# {
#     'valid': bool,
#     'errors': list[str],
#     'warnings': list[str]
# }
```

---

## 🌐 API REST Endpoints

### 1. GET /health
```bash
curl http://localhost:8000/health

Resposta (200):
{
  "status": "healthy",
  "gemini_configured": true|false
}
```

### 2. POST /extract-boleto
```bash
curl -X POST http://localhost:8000/extract-boleto \
  -F "file=@boleto.jpg"

Resposta (200):
{
  "linha_digitavel": "34191.79001 01288.050019...",
  "valor": "100.50",
  "vencimento": "2026-02-15",
  "beneficiario": "EMPRESA X",
  "banco": "BANCO INTER",
  "agencia": "0001",
  "conta": "12345678",
  "status": "success"
}

Resposta erro (400|500):
{
  "status": "error",
  "mensagem": "Motivo do erro"
}
```

### 3. POST /validate-boleto
```bash
curl -X POST http://localhost:8000/validate-boleto \
  -H "Content-Type: application/json" \
  -d '{
    "linha_digitavel": "34191.79001...",
    "valor": "100.50",
    "vencimento": "2026-02-15"
  }'

Resposta (200):
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

### 4. POST /generate-cnab
```bash
curl -X POST http://localhost:8000/generate-cnab \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": {
      "nome": "MINHA EMPRESA",
      "cnpj": "12.345.678/0001-00",
      "agencia": "0001",
      "conta_bancaria": "12345678901234",
      "dv": "5"
    },
    "pagamentos": [
      {
        "linha_digitavel": "34191.79001...",
        "valor": "100.50",
        "vencimento": "2026-02-15",
        "sacado": {
          "nome": "JOAO SILVA",
          "cpf_cnpj": "123.456.789-00"
        }
      }
    ]
  }'

Resposta (200):
{
  "status": "success",
  "summary": {
    "total_pagamentos": 1,
    "total_valor": 100.50,
    "total_registros": 8,
    "quantidade_linhas": 8
  },
  "arquivo": "Gerado com sucesso",
  "mensagem": "1 pagamentos processados"
}
```

### 5. POST /generate-cnab-complete
```bash
curl -X POST http://localhost:8000/generate-cnab-complete \
  -F "files=@boleto1.jpg" \
  -F "files=@boleto2.jpg" \
  -F 'empresa={"nome":"EMPRESA","cnpj":"12.345.678/0001-00",...}'

Resposta (200):
{
  "status": "success",
  "total_extraidos": 2,
  "total_processados": 2,
  "valor_total": 350.50,
  "arquivo": "Gerado com sucesso",
  "boletos": [...]
}
```

---

## 🔧 Funções Utilitárias

### format_field()
```python
from cnab.utils import format_field

# Numérico (zeros à esquerda)
format_field(123, 6, 'numeric')  # "000123"

# Texto (espaços à direita)
format_field("JOAO", 10, 'text')  # "JOAO      "
```

### convert_linha_digitavel_to_codigo_barras()
```python
from cnab.utils import convert_linha_digitavel_to_codigo_barras

# Entrada: Linha digitável (47-48 dígitos com pontos)
linha = "34191.79001 01288.050019 91010.510008 1 86580000010050"

# Saída: Código de barras (44 dígitos contínuos)
codigo = convert_linha_digitavel_to_codigo_barras(linha)
# "341910865800000100501790010128805001991010510008"
```

### convert_date_to_cnab()
```python
from cnab.utils import convert_date_to_cnab

data_cnab = convert_date_to_cnab("2026-02-15")
# "15022026" (DDMMAAAA)
```

### convert_value_to_cnab()
```python
from cnab.utils import convert_value_to_cnab

valor = convert_value_to_cnab(100.50)
# "000000000010050" (em centavos, 15 dígitos)
```

### remove_accents()
```python
from cnab.utils import remove_accents

nome = remove_accents("JOÃO SILVA")
# "JOAO SILVA"
```

### validate_cpf() / validate_cnpj()
```python
from cnab.utils import validate_cpf, validate_cnpj

validate_cpf("123.456.789-00")    # True/False
validate_cnpj("12.345.678/0001-00")  # True/False
```

---

## 📊 Estrutura de Dados

### Dados de Empresa
```python
{
    'nome': 'MINHA EMPRESA LTDA',
    'cnpj': '12.345.678/0001-00',  # Com ou sem formatação
    'agencia': '0001',
    'conta_bancaria': '12345678901234',
    'dv': '5'  # Dígito verificador
}
```

### Dados de Boleto
```python
{
    'linha_digitavel': '34191.79001 01288.050019...',  # 47-48 dígitos
    'valor': '100.50',  # ou 100.50 (float)
    'vencimento': '2026-02-15',  # YYYY-MM-DD
    'sacado': {
        'nome': 'JOAO DA SILVA',
        'cpf_cnpj': '123.456.789-00',
        'endereco': 'Rua X, 123',
        'cep': '01234-567',
        'cidade': 'Sao Paulo',
        'uf': 'SP',
        'telefone': '(11) 98765-4321'
    },
    'descricao': 'Referência interna'
}
```

### Resposta de Extração
```python
{
    'linha_digitavel': str,
    'codigo_barras': str (opcional),
    'valor': str,
    'vencimento': str (YYYY-MM-DD),
    'beneficiario': str,
    'sacador': str,
    'banco': str,
    'agencia': str,
    'conta': str,
    'status': 'success'|'error',
    'mensagem': str (se erro)
}
```

---

## 🚀 Exemplos Rápidos

### Python - Uso Simples
```python
from cnab.Cnab240InterBuilder import Cnab240InterBuilder

builder = Cnab240InterBuilder({'nome': 'EMPRESA', 'cnpj': '12.345.678/0001-00', ...})
builder.add_boleto_payment({'linha_digitavel': '...', 'valor': '100.50', ...})
arquivo = builder.build()
builder.save_to_file('remessa.txt')
```

### Python - Com Gemini
```python
from cnab.gemini_service import GeminiService

service = GeminiService('sua_chave')
dados = service.extract_boleto_data('/caminho/boleto.jpg', 'file')
validacao = service.validate_extracted_data(dados)

if validacao['valid']:
    builder.add_boleto_payment(dados)
```

### JavaScript/Node.js
```javascript
const Cnab240InterBuilder = require('./cnab/Cnab240InterBuilder.js');

const builder = new Cnab240InterBuilder(dadosEmpresa);
builder.addBoletoPayment(dadosBoleto);
const arquivo = builder.build();
```

### React
```javascript
// Upload e extrair
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:8000/extract-boleto', {
  method: 'POST',
  body: formData
});

const dados = await response.json();
// Usar dados no formulário
```

---

## ⚠️ Validações Automáticas

- ✅ Linha digitável: 47-48 dígitos
- ✅ Valor: > 0
- ✅ Data: formato válido
- ✅ CPF: 11 dígitos validados
- ✅ CNPJ: 14 dígitos validados
- ✅ Acentos: removidos
- ✅ Caracteres especiais: removidos
- ✅ Comprimento de linha: exatamente 240 chars

---

## 📖 Leia Também

- **QUICKSTART.md** - Primeiros passos (3 cenários)
- **README.md** - Documentação técnica
- **API_README.md** - Detalhes dos endpoints
- **http://localhost:8000/docs** - Swagger interativo

---

**Última atualização**: 20/01/2026  
**Versão**: 1.0.0
