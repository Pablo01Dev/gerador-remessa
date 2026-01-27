# 📋 Gerador CNAB 240 - Banco Inter com Gemini AI

Sistema completo para extrair dados de boletos via **Google Gemini**, validar e gerar arquivos de remessa **CNAB 240** para o Banco Inter.

## ✨ Funcionalidades

- ✅ **Extração de boletos via IA**: Processa imagens de boletos com Gemini
- ✅ **Validação de dados**: Valida linha digitável, datas e valores
- ✅ **Geração CNAB 240**: Cria arquivo formatado (240 caracteres/linha)
- ✅ **API REST**: FastAPI com endpoints prontos para integração
- ✅ **Conversão inteligente**: Converte Linha Digitável → Código de Barras automaticamente
- ✅ **Suporte Python & Node.js**: Implementações em ambas linguagens

## 🚀 Quick Start

### 1. Clonar/Preparar projeto
```bash
cd Remessa\ 2.0
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Configurar Gemini API

Obtenha uma chave gratuita em: https://aistudio.google.com/app/apikey

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY = 'sua_chave_aqui'
```

**Windows (CMD):**
```cmd
set GEMINI_API_KEY=sua_chave_aqui
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY='sua_chave_aqui'
```

### 4. Iniciar API
```bash
# Windows
run_api.bat

# Linux/Mac
bash run_api.sh

# Ou direto
python src/api.py
```

### 5. Acessar documentação
Abra no navegador: http://localhost:8000/docs

## 📚 Estrutura do Projeto

```
Remessa 2.0/
├── cnab/
│   ├── __init__.py
│   ├── utils.py                    # Funções utilitárias (formatação, conversão)
│   ├── Cnab240InterBuilder.py      # Classe principal para gerar CNAB
│   ├── gemini_service.py           # Integração com Google Gemini
│   ├── Cnab240InterBuilder.js      # Versão Node.js
│   └── utils.js                    # Versão Node.js
├── src/
│   ├── example.py                  # Exemplo simples (dados hardcoded)
│   ├── api.py                      # API FastAPI (novo)
│   ├── test_api.py                 # Testes da API
│   └── example.js                  # Exemplo Node.js
├── requirements.txt                # Dependências Python
├── package.json                    # Dependências Node.js
├── .env.example                    # Variáveis de ambiente (template)
├── run_api.bat                     # Script para rodar API (Windows)
├── run_api.sh                      # Script para rodar API (Linux/Mac)
└── README.md                       # Este arquivo
```

## 💻 Uso via Python

### Opção 1: Executável simples (sem API)
```bash
python src/example.py
```

Gera `remessa.txt` com dados de exemplo.

### Opção 2: Usar classe diretamente
```python
from cnab.Cnab240InterBuilder import Cnab240InterBuilder

builder = Cnab240InterBuilder({
    'nome': 'MINHA EMPRESA',
    'cnpj': '12.345.678/0001-00',
    'agencia': '0001',
    'conta_bancaria': '12345678901234',
    'dv': '5'
})

builder.add_boleto_payment({
    'linha_digitavel': '34191.79001 01288.050019 91010.510008 1 86580000010050',
    'valor': '100.50',
    'vencimento': '2026-02-15',
    'sacado': {
        'nome': 'JOAO SILVA',
        'cpf_cnpj': '123.456.789-00',
        'endereco': 'Rua X, 123',
        'cep': '01234-567',
        'cidade': 'Sao Paulo',
        'uf': 'SP',
        'telefone': '(11) 98765-4321'
    }
})

arquivo = builder.build()
print(arquivo)  # Arquivo CNAB pronto
```

## 🌐 API REST Endpoints

### Documentação Interativa
```
GET http://localhost:8000/docs
```

### Health Check
```bash
curl http://localhost:8000/health
```

### Extrair boleto (Gemini)
```bash
curl -X POST http://localhost:8000/extract-boleto \
  -F "file=@boleto.jpg"
```

Resposta:
```json
{
  "linha_digitavel": "34191.79001...",
  "valor": "100.50",
  "vencimento": "2026-02-15",
  "beneficiario": "EMPRESA X",
  "status": "success"
}
```

### Validar boleto
```bash
curl -X POST http://localhost:8000/validate-boleto \
  -H "Content-Type: application/json" \
  -d '{
    "linha_digitavel": "34191.79001...",
    "valor": "100.50",
    "vencimento": "2026-02-15"
  }'
```

### Gerar CNAB
```bash
curl -X POST http://localhost:8000/generate-cnab \
  -H "Content-Type: application/json" \
  -d @request.json
```

Ver detalhes em `API_README.md`

## 🧪 Testar

```bash
# Terminal 1: Rodar API
python src/api.py

# Terminal 2: Testes
python src/test_api.py
```

## 🔌 Integração com React

```javascript
// Exemplo com fetch
const formData = new FormData();
formData.append('file', arquivo);

const response = await fetch('http://localhost:8000/extract-boleto', {
  method: 'POST',
  body: formData
});

const dados = await response.json();
console.log(dados); // { linha_digitavel, valor, vencimento, ... }
```

## 📋 Formato CNAB 240 - Segmentos

Implementados:
- **Segmento 0**: Header do Arquivo
- **Segmento 1**: Header do Lote
- **Segmento 3 (J)**: Detalhe do Pagamento
- **Segmento 3 (J-52)**: Detalhe das Partes (Sacado)
- **Segmento 5**: Trailer do Lote
- **Segmento 9**: Trailer do Arquivo

Cada linha: **240 caracteres** (conforme especificação Banco Inter)

## 🔐 Conversão Linha Digitável → Código de Barras

Implementado algoritmo automático:

**Entrada**: `34191.79001 01288.050019 91010.510008 1 86580000010050` (47-48 dígitos com pontos)

**Saída**: `341910865800000100501 79001012880500199101051000` (44 dígitos contínuos)

Usado no Segmento J (posições 18-44)

## 🛠️ Troubleshooting

### "ModuleNotFoundError: No module named 'google.generativeai'"
```bash
pip install google-generativeai
```

### "GEMINI_API_KEY not configured"
```bash
# Verifique se a variável está realmente configurada
echo $GEMINI_API_KEY  # Linux/Mac
echo %GEMINI_API_KEY%  # Windows
```

### Erro ao processar imagem
- Verifique qualidade da imagem (mínimo 200x200px)
- Use formatos: PNG, JPG, GIF, WEBP
- Certifique-se que é um boleto válido

## 📞 Suporte

### Documentação Oficial
- [CNAB 240 - Banco Inter](https://banco.inter.com.br/)
- [Google Gemini API](https://ai.google.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)

### Estrutura de Requisição CNAB

**Request POST /generate-cnab**:
```json
{
  "empresa": {
    "nome": "string",
    "cnpj": "string (com ou sem formatação)",
    "agencia": "string",
    "conta_bancaria": "string",
    "dv": "string"
  },
  "pagamentos": [
    {
      "linha_digitavel": "string (47-48 dígitos)",
      "valor": "string ou number (em reais)",
      "vencimento": "YYYY-MM-DD",
      "sacado": {
        "nome": "string",
        "cpf_cnpj": "string",
        "endereco": "string (optional)",
        "cep": "string (optional)",
        "cidade": "string (optional)",
        "uf": "string (optional)",
        "telefone": "string (optional)"
      },
      "descricao": "string (optional)"
    }
  ]
}
```

## 📝 Licença

MIT

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para automação de processos financeiros

---

**v1.0.0** | Atualizado em 2026
