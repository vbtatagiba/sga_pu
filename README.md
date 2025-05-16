# SGA PU - Sistema de Gerenciamento de Atendimento

Sistema de gerenciamento de atendimento para o Programa Passaporte Universitário.

## Tecnologias Utilizadas

- Backend: Django/Python
- Frontend: React
- Banco de Dados: MySQL
- Containerização: Docker

## Requisitos

- Docker
- Docker Compose
- Git

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sga_pu.git
cd sga_pu
```

2. Inicie os containers:
```bash
docker-compose up --build
```

3. Acesse o sistema:
- Frontend: http://localhost:3000
- Backend: http://0.0.0.0:8000
- MySQL: localhost:3306

## Estrutura do Projeto

```
sga_pu/
├── sga_backend/         # Backend Django
├── sga-frontend/        # Frontend React
├── docker-compose.yml   # Configuração Docker
└── README.md           # Documentação
```

## Desenvolvimento

Para desenvolvimento local:

1. Backend (Django):
```bash
cd sga_backend
python manage.py runserver
```

2. Frontend (React):
```bash
cd sga-frontend
npm start
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 