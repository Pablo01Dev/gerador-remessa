# 🚀 INÍCIO RÁPIDO - CNAB 240 + GEMINI

## ✅ Projeto Completamente Pronto!

Você tem um sistema **completo** para:
- ✅ Extrair dados de boletos com **Google Gemini**
- ✅ Validar informações automaticamente
- ✅ Gerar arquivo **CNAB 240** (Banco Inter)
- ✅ Servir via **API REST** (FastAPI)

---

## 📋 PASSO 1: Validar Instalação

```bash
cd "Remessa 2.0"
python setup.py
```

Saída esperada:
```
✓ Python: 3.12.x
✓ FastAPI
✓ Uvicorn
✓ Google Generative AI
✓ Unidecode
✓ Pydantic

⚠ GEMINI_API_KEY não configurada
  (opcional - sem isso funciona localmente)
```

---

## 🎯 PASSO 2: Escolha seu cenário

### Cenário A: Teste Local (sem API, sem Gemini)
```bash
python src/example.py
```

✅ Gera `remessa.txt` com dados de exemplo  
⏱️ Rápido e imediato  
❌ Sem extração via IA

### Cenário B: API Local (com documentação interativa)
```bash
python src/api.py
```

Abra no navegador:
```
http://localhost:8000/docs
```

✅ Documentação Swagger interativa  
✅ Testar endpoints sem código  
❌ Sem Gemini (precisa de chave)

### Cenário C: Full Stack (com Gemini + API + Testes)

**Passo 1: Obter chave Gemini** (Gratuita)
- Vá para: https://aistudio.google.com/app/apikey
- Clique em "Get API Key"
- Copie a chave

**Passo 2: Configurar variável de ambiente**

Windows (PowerShell):
```powershell
$env:GEMINI_API_KEY = 'sua_chave_aqui'
```

Windows (CMD):
```cmd
set GEMINI_API_KEY=sua_chave_aqui
```

Linux/Mac:
```bash
export GEMINI_API_KEY='sua_chave_aqui'
```

**Passo 3: Rodar API**
```bash
python src/api.py
```

**Passo 4: Em outro terminal, testar**
```bash
python src/test_api.py
```

---

## 💡 Exemplos de Uso

### Via Python (direto)

```python
from cnab.Cnab240InterBuilder import Cnab240InterBuilder

# Inicializar
builder = Cnab240InterBuilder({
    'nome': 'MINHA EMPRESA',
    'cnpj': '12.345.678/0001-00',
    'agencia': '0001',
    'conta_bancaria': '12345678901234',
    'dv': '5'
})

# Adicionar boleto
builder.add_boleto_payment({
    'linha_digitavel': '34191.79001 01288.050019 91010.510008 1 86580000010050',
    'valor': '100.50',
    'vencimento': '2026-02-15',
    'sacado': {
        'nome': 'JOAO SILVA',
        'cpf_cnpj': '123.456.789-00'
    }
})

# Gerar arquivo
arquivo = builder.build()
print(arquivo)  # CNAB pronto!

# Ou salvar em arquivo
builder.save_to_file('remessa.txt')
```

### Via API (cURL)

```bash
# 1. Extrair boleto de imagem
curl -X POST http://localhost:8000/extract-boleto \
  -F "file=@boleto.jpg"

# 2. Validar dados
curl -X POST http://localhost:8000/validate-boleto \
  -H "Content-Type: application/json" \
  -d '{
    "linha_digitavel": "34191.79001...",
    "valor": "100.50",
    "vencimento": "2026-02-15"
  }'

# 3. Gerar CNAB
curl -X POST http://localhost:8000/generate-cnab \
  -H "Content-Type: application/json" \
  -d @request.json
```

### Via Frontend React

```javascript
// Extrair boleto
const formData = new FormData();
formData.append('file', imagemDoBoleto);

const response = await fetch('http://localhost:8000/extract-boleto', {
  method: 'POST',
  body: formData
});

const dados = await response.json();
console.log(dados);
// {
//   linha_digitavel: "34191.79001...",
//   valor: "100.50",
//   vencimento: "2026-02-15",
//   beneficiario: "EMPRESA X",
//   status: "success"
// }
```

---

## 📂 Estrutura do Projeto

```
Remessa 2.0/
├── cnab/                          # Core CNAB
│   ├── Cnab240InterBuilder.py     # ⭐ Classe principal
│   ├── utils.py                   # Funções utilitárias
│   └── gemini_service.py          # Integração Gemini
├── src/
│   ├── example.py                 # Teste simples
│   └── api.py                     # ⭐ API FastAPI
├── setup.py                       # Validação de setup
├── requirements.txt               # Dependências
├── README.md                      # Documentação
├── API_README.md                  # Endpoints
└── ENTREGA.md                     # Sumário do projeto
```

---

## 🔑 Funcionalidades Principais

### Classe Cnab240InterBuilder
- `add_boleto_payment()` - Adiciona pagamento
- `build()` - Monta arquivo final
- `save_to_file()` - Salva em disco
- `get_summary()` - Retorna resumo

### Serviço Gemini
- `extract_boleto_data()` - Extrai de imagem
- `validate_extracted_data()` - Valida dados

### Utilitários
- `convert_linha_digitavel_to_codigo_barras()` - Conversão automática
- `format_field()` - Formatação CNAB
- `convert_date_to_cnab()` - Data DDMMAAAA
- `convert_value_to_cnab()` - Valor em centavos

---

## 🌐 API Endpoints

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/health` | Health check |
| POST | `/extract-boleto` | Extrai dados (Gemini) |
| POST | `/validate-boleto` | Valida dados |
| POST | `/generate-cnab` | Gera arquivo CNAB |
| POST | `/generate-cnab-complete` | Pipeline completo |

---

## 🎓 Fluxo Completo (React + Node)

```
1. Frontend React
   └─> Usuário faz upload de PDFs dos boletos

2. Backend Node/Python
   ├─> POST /extract-boleto
   │   └─> Gemini extrai dados
   ├─> POST /validate-boleto
   │   └─> Validação automática
   └─> POST /generate-cnab
       └─> Arquivo CNAB gerado

3. Frontend React
   └─> Tabela de verificação (imagem + valor + data)
   └─> Botão "Gerar Remessa"

4. Backend
   └─> Cria arquivo CNAB pronto

5. Download
   └─> Usuário baixa arquivo

6. Banco Inter
   └─> Enviado para processamento
```

---

## 🐛 Troubleshooting

### "Module not found"
```bash
pip install -r requirements.txt
```

### "GEMINI_API_KEY not configured"
- Obtenha em: https://aistudio.google.com/app/apikey
- Configure variável de ambiente (veja acima)

### Erro de encoding no Windows
- Use Python 3.8+ com UTF-8
- Scripts já ajustados para isso

### Imagem não é processada
- Verifique se é um boleto válido
- Use PNG/JPG de boa qualidade
- Mínimo 200x200 pixels

---

## 📚 Documentação Completa

- **README.md** - Visão geral
- **API_README.md** - Endpoints detalhados
- **ENTREGA.md** - Sumário do projeto
- **http://localhost:8000/docs** - Swagger interativo (quando API rodando)

---

## ✅ Checklist de Implementação

- ✅ Sistema funcional
- ✅ Classe CNAB 240 implementada
- ✅ Conversão linha digitável automática
- ✅ Integração Gemini pronta
- ✅ API REST com 5 endpoints
- ✅ Documentação completa
- ✅ Exemplos funcionando
- ✅ Setup validado

---

## 🎯 Próximas Etapas (Sugeridas)

1. **Integrar com seu React**
   - Usar `fetch()` ou `axios`
   - Chamar `/extract-boleto` no upload

2. **Banco de Dados**
   - SQLAlchemy + PostgreSQL
   - Salvar histórico de remessas

3. **Autenticação**
   - JWT para proteger API
   - Controle de acesso

4. **Integração Banco Inter**
   - Webhook para status
   - Rastreamento em tempo real

5. **Deploy**
   - Docker + Docker Compose
   - Heroku, AWS, DigitalOcean, etc

---

## 💬 Dúvidas Frequentes

**P: Preciso da chave Gemini para tudo?**  
R: Não. Sem Gemini, você pode testar localmente com dados hardcoded.

**P: Posso usar com meu banco?**  
R: Este sistema é específico para Banco Inter. Outros bancos têm layouts diferentes.

**P: Quantos boletos por remessa?**  
R: Sem limite técnico, mas check o limite do banco.

**P: Posso rodar em produção?**  
R: Sim! Use Gunicorn + Nginx para produção.

---

## 📞 Suporte

- **Documentação Banco Inter**: https://banco.inter.com.br/
- **Gemini API**: https://ai.google.dev/
- **FastAPI**: https://fastapi.tiangolo.com/

---

## 🎉 Você está pronto!

Escolha um cenário acima e comece! 

Qualquer dúvida, a documentação está completa em cada arquivo.

**Boa sorte com seu projeto!** 🚀
