@echo off
echo Iniciando o servidor Django na rede...
echo O servidor estara disponivel em http://127.0.0.1:8000
python manage.py runserver 0.0.0.0:8000 