from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types
import base64
import os
import json

# --- Configuração Crítica para Vercel ---
# static_folder='../' diz para o Flask procurar arquivos na raiz do projeto (um nível acima de /api)
app = Flask(__name__, static_folder='../', static_url_path='')
CORS(app)

# --- Rota Principal (Serve o index.html) ---
@app.route('/')
def index():
    # Quando acessar a raiz, entrega o index.html que está na pasta '../'
    return send_from_directory(app.static_folder, 'index.html')

# --- Rota Genérica (Serve CSS, JS e outros arquivos) ---
@app.route('/<path:path>')
def static_files(path):
    # Entrega qualquer outro arquivo (app.js, style.css) que o navegador pedir
    return send_from_directory(app.static_folder, path)

# --- Rotas da API ---

# Carrega a chave de ambiente
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

@app.route('/api/ocr', methods=['POST'])
def processar_ocr():
    try:
        dados = request.json
        if not dados or 'image' not in dados:
            return jsonify({'error': 'Campo "image" obrigatório'}), 400
        
        # Prioriza a chave do ambiente (Vercel)
        api_key = GEMINI_API_KEY or dados.get('apiKey')
        
        if not api_key:
            return jsonify({'error': 'Chave de API não configurada'}), 400
        
        client = genai.Client(api_key=api_key.strip())
        
        image_bytes = base64.b64decode(dados['image'])
        
        prompt_text = """
        Atue como um sistema OCR especializado em boletos bancários brasileiros.
        Extraia: "linha_digitavel", "valor" (decimal com ponto), "vencimento" (AAAA-MM-DD) e "beneficiario".
        Retorne apenas JSON.
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[prompt_text, types.Part.from_bytes(data=image_bytes, mime_type="image/png")],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        return jsonify({'success': True, 'texto': response.text})
    
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return "OK", 200

# Necessário para a Vercel detectar a aplicação
app = app