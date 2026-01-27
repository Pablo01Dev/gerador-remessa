# 📑 ÍNDICE DO PROJETO - CNAB 240 + GEMINI

## 🎯 Comece por aqui

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ **LEIA PRIMEIRO**
   - 3 cenários práticos
   - Setup em 5 minutos
   - Escolha seu caminho

2. **[setup.py](setup.py)** - Validar instalação
   ```bash
   python setup.py
   ```

3. **[src/example.py](src/example.py)** - Teste local
   ```bash
   python src/example.py
   ```

---

## 📚 Documentação

### Guias Principais
- **[README.md](README.md)** - Documentação técnica completa
- **[API_README.md](API_README.md)** - Detalhes de cada endpoint
- **[REFERENCE.md](REFERENCE.md)** - Referência rápida de classes e funções
- **[ENTREGA.md](ENTREGA.md)** - Sumário técnico do projeto

### Configuração
- **[.env.example](.env.example)** - Template de variáveis de ambiente
- **[requirements.txt](requirements.txt)** - Dependências Python
- **[package.json](package.json)** - Dependências Node.js

---

## 💻 Código Fonte

### Core CNAB (cnab/)
- **[Cnab240InterBuilder.py](cnab/Cnab240InterBuilder.py)** ⭐ CLASSE PRINCIPAL
  - 6 métodos principais
  - Gera arquivo CNAB 240
  - Validação de dados
  - Suporte CPF/CNPJ

- **[utils.py](cnab/utils.py)** - Funções Utilitárias
  - Formatação CNAB
  - Conversão Linha Digitável → Código de Barras
  - Conversão de datas e valores
  - Validadores (CPF, CNPJ)

- **[gemini_service.py](cnab/gemini_service.py)** ⭐ NOVO
  - Integração com Google Gemini
  - Extração de boletos de imagens
  - Validação automática

### Versão Node.js (cnab/)
- **[Cnab240InterBuilder.js](cnab/Cnab240InterBuilder.js)**
- **[utils.js](cnab/utils.js)**

### API & Exemplos (src/)
- **[api.py](src/api.py)** ⭐ API REST FASTAPI
  - 5 endpoints
  - Documentação Swagger automática
  - Pronta para produção

- **[example.py](src/example.py)** - Teste Local
  - Usa dados hardcoded
  - Gera arquivo CNAB
  
- **[test_api.py](src/test_api.py)** - Testes da API
  - Valida endpoints
  - Exemplos de requisições

- **[example.js](src/example.js)** - Teste Node.js

---

## 🚀 Scripts de Inicialização

- **[run_api.bat](run_api.bat)** - Windows
  ```cmd
  run_api.bat
  ```

- **[run_api.sh](run_api.sh)** - Linux/Mac
  ```bash
  bash run_api.sh
  ```

---

## 📊 Arquivos Gerados

- **[remessa.txt](remessa.txt)** - Exemplo de saída CNAB

---

## 🔗 Quick Links

### Rodar Localmente
```bash
# Validar
python setup.py

# Teste
python src/example.py

# API
python src/api.py
```

### Acessar API
- Documentação interativa: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/health**

### Integrar com React
```javascript
fetch('http://localhost:8000/extract-boleto', {
  method: 'POST',
  body: formData
})
```

---

## 📋 Classes e Métodos Principais

### Cnab240InterBuilder
```python
builder = Cnab240InterBuilder(dados_empresa)
builder.add_boleto_payment(dados_boleto)
arquivo = builder.build()
builder.save_to_file('remessa.txt')
summary = builder.get_summary()
```

### GeminiService
```python
service = GeminiService(api_key)
dados = service.extract_boleto_data('/caminho/boleto.jpg', 'file')
validacao = service.validate_extracted_data(dados)
```

### Utilitários
```python
format_field(value, length, type)
convert_linha_digitavel_to_codigo_barras(linha)
convert_date_to_cnab(data_iso)
convert_value_to_cnab(valor)
remove_accents(text)
validate_cpf(cpf)
validate_cnpj(cnpj)
```

---

## 🌐 API Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| POST | `/extract-boleto` | Extrai boleto (Gemini) |
| POST | `/validate-boleto` | Valida dados |
| POST | `/generate-cnab` | Gera CNAB |
| POST | `/generate-cnab-complete` | Pipeline completo |

---

## 📁 Estrutura do Projeto

```
Remessa 2.0/
├── cnab/
│   ├── Cnab240InterBuilder.py (21 KB) ⭐
│   ├── Cnab240InterBuilder.js
│   ├── utils.py (5 KB)
│   ├── utils.js
│   ├── gemini_service.py (8 KB) 🆕
│   └── __init__.py
├── src/
│   ├── api.py (10 KB) 🆕
│   ├── example.py (3 KB)
│   ├── example.js
│   └── test_api.py (3 KB) 🆕
├── setup.py (6 KB) 🆕
├── QUICKSTART.md ⭐ LEIA PRIMEIRO
├── README.md
├── API_README.md 🆕
├── REFERENCE.md 🆕
├── ENTREGA.md 🆕
├── requirements.txt
├── package.json
├── .env.example 🆕
├── run_api.bat 🆕
├── run_api.sh 🆕
└── remessa.txt (exemplo)
```

---

## 🎯 Fluxo de Uso

### Cenário 1: Teste Local (5 min)
```
setup.py → example.py → remessa.txt gerado
```

### Cenário 2: API com Documentação (10 min)
```
setup.py → api.py → http://localhost:8000/docs → Testar endpoints
```

### Cenário 3: Full Stack (30 min)
```
setup.py → Configurar GEMINI_API_KEY → api.py → Integrar React
```

---

## ✅ Checklist de Implementação

- ✅ Classe Cnab240InterBuilder
- ✅ Utilitários de formatação
- ✅ Conversão Linha Digitável → Código de Barras
- ✅ Integração Google Gemini
- ✅ API REST com FastAPI
- ✅ 5 endpoints funcionais
- ✅ Validação de dados
- ✅ Documentação em 7 arquivos
- ✅ Scripts de inicialização
- ✅ Exemplos funcionando
- ✅ Setup validado
- ✅ Pronto para produção

---

## 🔐 Configuração Gemini (Opcional)

1. Obtenha chave: https://aistudio.google.com/app/apikey
2. Configure variável:
   ```bash
   export GEMINI_API_KEY='sua_chave'  # Linux/Mac
   set GEMINI_API_KEY=sua_chave       # Windows CMD
   $env:GEMINI_API_KEY = 'sua_chave'  # Windows PowerShell
   ```

---

## 📞 Documentação Externa

- [CNAB 240 - Banco Inter](https://banco.inter.com.br/)
- [Google Generative AI](https://ai.google.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Python Documentation](https://docs.python.org/)

---

## 🎓 Tutoriais Úteis

### Como extrair boleto com Gemini
Veja: [API_README.md](API_README.md#extrair-boleto)

### Como usar a classe diretamente
Veja: [REFERENCE.md](REFERENCE.md#classe-principal-cnab240interbuilder)

### Integração com React
Veja: [QUICKSTART.md](QUICKSTART.md#via-frontend-react)

---

## 🔄 Roadmap Futuro (Sugestões)

1. Banco de dados (PostgreSQL)
2. Autenticação (JWT)
3. Webhooks do Banco Inter
4. Dashboard de remessas
5. Agendamento de pagamentos
6. Relatórios e analytics
7. Suporte a outros bancos

---

## 📞 Suporte

Leia a documentação nesta ordem:
1. **QUICKSTART.md** - Primeiras dúvidas
2. **README.md** - Técnicas
3. **API_README.md** - Endpoints
4. **REFERENCE.md** - Referência rápida

---

## ✨ Versão Atual

- **Versão**: 1.0.0
- **Data**: 20/01/2026
- **Status**: ✅ PRONTO PARA PRODUÇÃO
- **Python**: 3.8+
- **Banco**: Inter (077)
- **Formato**: CNAB 240

---

**Navegue pelos arquivos acima conforme sua necessidade!** 🚀

última atualização: 20/01/2026
