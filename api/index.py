#!/usr/bin/env python3
"""
Servidor Serverless (Flask) para a API do Gemini.
Otimizado para Vercel.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import base64
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configura o app Flask para Vercel
# A Vercel gerencia o roteamento de arquivos estáticos.
app = Flask(__name__)
CORS(app)  # Habilita CORS

# --- Rotas da API (Proxy para o Gemini) ---

# Tenta carregar a chave de várias variáveis possíveis
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_VISION_API_KEY') or os.getenv('GOOGLE_API_KEY')

@app.route('/api/ocr', methods=['POST'])
def processar_ocr():
    """
    Endpoint que recebe imagem em base64 e retorna JSON estruturado via Gemini.
    """
    try:
        dados = request.json
        
        if not dados or 'image' not in dados:
            return jsonify({'error': 'Campo "image" obrigatório'}), 400
        
        imagem_base64 = dados['image']
        
        api_key = GEMINI_API_KEY
        if not api_key:
             api_key = dados.get('apiKey')
        
        if not api_key:
            return jsonify({'error': 'Chave de API não configurada no servidor (.env).'}), 400
        
        client = genai.Client(api_key=api_key.strip())
        
        try:
            image_bytes = base64.b64decode(imagem_base64)
        except Exception:
            return jsonify({'error': 'Imagem inválida (erro de base64)'}), 400

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
        
        print(f"📡 Enviando requisição para o Gemini...")
        
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
        
        print("✅ Resposta recebida da IA.")
        return jsonify({
            'success': True,
            'texto': response.text
        })
    
    except Exception as e:
        erro_msg = str(e)
        print(f"❌ Erro no servidor: {erro_msg}")
        
        if "404" in erro_msg and "not found" in erro_msg:
             return jsonify({
                 'error': 'Modelo Gemini não encontrado. Verifique se sua chave tem acesso ou o nome do modelo em api/index.py.'
             }), 404
             
        if "API key expired" in erro_msg or "INVALID_ARGUMENT" in erro_msg:
            return jsonify({
                'error': 'A Chave de API do Google expirou ou é inválida. Atualize o arquivo .env.'
            }), 400
            
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# O Vercel usará a variável 'app' do Flask. O bloco if __name__ == '__main__' é desnecessário.