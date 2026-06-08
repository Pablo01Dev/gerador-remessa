@echo off
echo --- Verificando e instalando dependencias ---
pip install -r requirements.txt

echo.
echo --- Iniciando Remessa 2.0 ---
echo O navegador deve abrir automaticamente...
start http://127.0.0.1:8000
python -m flask --app api/index.py run --port 8000
pause   