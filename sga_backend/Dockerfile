FROM python:3.9-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

# Copiar o código da aplicação
COPY . .

# Configurar variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=sga_backend.settings
ENV PATH="/usr/local/bin:${PATH}"

# Expor a porta
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8000", "sga_backend.wsgi:application"] 