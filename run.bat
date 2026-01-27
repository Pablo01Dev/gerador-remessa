@echo off
echo --- Verificando e instalando dependencias ---
pip install -r requirements.txt

echo.
echo --- Iniciando Remessa 2.0 ---
echo O navegador deve abrir automaticamente...
python server.py
pause   