import os
from google import genai

# Tenta pegar a chave do .env se existir, senão pede pro usuário digitar
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    api_key = input("Cole sua API KEY do Google AI Studio aqui: ").strip()

try:
    print("\nConectando com o Google e buscando modelos liberados para sua chave...")
    client = genai.Client(api_key=api_key)
    
    modelos_encontrados = False
    for model in client.models.list():
        if 'gemini' in model.name.lower():
            print(f"- {model.name}")
            modelos_encontrados = True
            
    if not modelos_encontrados:
        print("Nenhum modelo Gemini foi retornado para esta chave.")
        
except Exception as e:
    print(f"\nErro ao listar modelos: {e}")
