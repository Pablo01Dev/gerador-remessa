#!/usr/bin/env python3
"""
Servidor web completo para a aplicação e proxy para a API do Google.
Otimizado para leitura de Boletos com Gemini 2.0 Flash via biblioteca google-genai (v1/v2).
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types
import base64
import os
from dotenv import load_dotenv
import webbrowser
from threading import Timer

# Carrega variáveis de ambiente
load_dotenv()

# Configura o app Flask
app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)  # Habilita CORS

# --- Rotas da Aplicação ---

@app.route('/')
def index():
    """Serve o arquivo index.html da aplicação."""
    return send_from_directory('.', 'index.html')

# --- Rotas da API (Proxy para o Gemini) ---

# Tenta carregar a chave de várias variáveis possíveis
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_VISION_API_KEY') or os.getenv('GOOGLE_API_KEY')

@app.route('/api/ocr', methods=['POST'])
def processar_ocr():
    """
    Endpoint que recebe imagem em base64 e retorna JSON estruturado via Gemini 2.0 Flash.
    """
    try:
        dados = request.json
        
        if not dados or 'image' not in dados:
            return jsonify({'error': 'Campo "image" obrigatório'}), 400
        
        imagem_base64 = dados['image']
        
        # 1. Definição da Chave de API (Prioridade: .env > Frontend)
        # Isso impede que uma chave velha salva no navegador quebre a requisição
        api_key = GEMINI_API_KEY
        if not api_key:
             api_key = dados.get('apiKey')
        
        if not api_key:
            return jsonify({'error': 'Chave de API não configurada no servidor (.env).'}), 400
        
        # Inicializa o cliente com a biblioteca nova (google-genai)
        client = genai.Client(api_key=api_key.strip())
        
        # 2. Decodifica a imagem
        try:
            image_bytes = base64.b64decode(imagem_base64)
        except Exception:
            return jsonify({'error': 'Imagem inválida (erro de base64)'}), 400

        # 3. PROMPT OTIMIZADO PARA BOLETOS
        # Instruções específicas para corrigir o erro de valor 0.0 e falta de linha digitável
        prompt_text = """
        Atue como um sistema OCR especializado em boletos bancários brasileiros.
        Analise a imagem fornecida e extraia os dados para preencher o seguinte JSON.

        Regras Estritas de Extração:
        1. "linha_digitavel": A linha digitável numérica completa (geralmente no topo, ~47 dígitos). Apenas números. Se não achar, tente ler o código de barras numérico.
        2. "valor": O valor TOTAL DO DOCUMENTO/COBRADO. Retorne EXATAMENTE como um número decimal (float) usando PONTO para separar centavos (ex: 1250.50). NÃO use vírgula. NÃO use R$.
        3. "vencimento": A data de vencimento no formato AAAA-MM-DD.
        4. "beneficiario": O nome do beneficiário/cedente.

        Se um campo não estiver visível ou legível, retorne null, mas mantenha a chave no JSON.
        """
        
        # 4. Chamada à API (Gemini 2.0 Flash)
        print(f"📡 Enviando requisição para Gemini 2.0 Flash...")
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                prompt_text,
                types.Part.from_bytes(data=image_bytes, mime_type="image/png")
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json" 
            )
        )
        
        # Retorna o texto JSON cru para o frontend tratar
        print("✅ Resposta recebida da IA.")
        return jsonify({
            'success': True,
            'texto': response.text
        })
    
    except Exception as e:
        erro_msg = str(e)
        print(f"❌ Erro no servidor: {erro_msg}")
        
        # Tratamento específico para erro de modelo não encontrado
        if "404" in erro_msg and "not found" in erro_msg:
             return jsonify({
                 'error': 'Modelo Gemini 2.0 Flash não encontrado. Verifique se sua chave tem acesso ou tente mudar para "gemini-1.5-flash" no server.py.'
             }), 404
             
        # Tratamento para chave expirada
        if "API key expired" in erro_msg or "INVALID_ARGUMENT" in erro_msg:
            return jsonify({
                'error': 'A Chave de API do Google expirou ou é inválida. Atualize o arquivo .env.'
            }), 400
            
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# O bloco a seguir é executado apenas quando você roda `python server.py` localmente.
# A Vercel ignora este bloco e usa a variável `app` diretamente.
if __name__ == '__main__':
    print('🚀 Servidor de desenvolvimento iniciado em http://127.0.0.1:5000')
    # O debug=True habilita o recarregamento automático ao salvar o arquivo.
    # Não use debug=True em um ambiente de produção.
    app.run(debug=True, host='127.0.0.1', port=5000)
    