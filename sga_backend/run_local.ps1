# Verifica se a porta 8000 está em uso
$portInUse = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "A porta 8000 está em uso. Tentando liberar..."
    $processId = $portInUse.OwningProcess
    Stop-Process -Id $processId -Force
    Write-Host "Porta 8000 liberada."
}

# Ativa o ambiente virtual (se existir)
if (Test-Path "venv") {
    Write-Host "Ativando ambiente virtual..."
    .\venv\Scripts\Activate.ps1
}

# Instala as dependências
Write-Host "Instalando dependências..."
pip install -r requirements.txt

# Executa as migrações
Write-Host "Executando migrações..."
python manage.py migrate

# Cria o superusuário
Write-Host "Criando superusuário..."
$env:DJANGO_SUPERUSER_USERNAME = "SGAadmin"
$env:DJANGO_SUPERUSER_EMAIL = "vbtatagiba77@gmail.com"
$env:DJANGO_SUPERUSER_PASSWORD = "passaporte2025"

# Inicia o servidor
Write-Host "Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000