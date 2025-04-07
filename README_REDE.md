# Configuração do SGA para Ambiente de Rede

Este documento contém instruções para configurar o Sistema de Gerenciamento de Atendimentos (SGA) para funcionar em um ambiente de rede.

## Configuração do Banco de Dados MySQL

O erro `Host 'PMM-TC157.pmm.local' is not allowed to connect to this MySQL server` indica que o servidor MySQL não está permitindo conexões do seu host. Para resolver isso, siga estas etapas:

### No servidor MySQL:

1. Acesse o servidor MySQL onde o banco de dados está instalado.
2. Execute os seguintes comandos SQL:

```sql
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON sga_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

Ou execute o script `configure_mysql.bat` (Windows) ou `configure_mysql.sh` (Linux/Mac) que foi criado para automatizar esse processo.

### Configuração do arquivo my.cnf ou my.ini:

1. Localize o arquivo de configuração do MySQL (geralmente em `/etc/mysql/my.cnf` no Linux ou `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini` no Windows).
2. Adicione ou modifique a linha `bind-address` para permitir conexões de qualquer IP:

```
[mysqld]
bind-address = 0.0.0.0
```

3. Reinicie o serviço MySQL.

## Configuração do Backend Django

O arquivo `settings.py` do Django já está configurado para usar o endereço IP correto do servidor MySQL. Verifique se as seguintes configurações estão corretas:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'sga_db',
        'USER': 'root',
        'PASSWORD': '12345678',
        'HOST': '10.1.218.112',  # Endereço IP do servidor MySQL
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }
}
```

### Iniciando o servidor Django na rede

Para que outras máquinas na rede possam acessar o servidor Django, você precisa iniciá-lo com o endereço 0.0.0.0 em vez de 127.0.0.1. Use o script `run_server.bat` que foi criado para isso:

```
cd sga_backend
run_server.bat
```

Ou execute o comando manualmente:

```
cd sga_backend
python manage.py runserver 0.0.0.0:8000
```

## Configuração do Frontend React

O frontend React já está configurado para se conectar ao backend usando o endereço IP correto. As URLs da API estão centralizadas no arquivo `src/config/api.js`, o que facilita a manutenção.

Se você precisar alterar o endereço IP do servidor, basta modificar a constante `API_BASE_URL` no arquivo `src/config/api.js`:

```javascript
// Configuração da API
const API_BASE_URL = 'http://10.1.218.112:8000';
```

## Executando o Sistema

1. Inicie o servidor MySQL.
2. Inicie o backend Django:
   ```
   cd sga_backend
   run_server.bat
   ```
3. Inicie o frontend React:
   ```
   cd sga-frontend
   npm start
   ```

## Solução de Problemas

Se ainda estiver enfrentando problemas de conexão:

1. Verifique se o firewall está permitindo conexões na porta 3306 (MySQL) e 8000 (Django).
2. Verifique se o servidor MySQL está configurado para aceitar conexões remotas.
3. Verifique se as credenciais do banco de dados estão corretas.
4. Verifique se o endereço IP do servidor MySQL está correto nas configurações do Django.
5. Verifique se o servidor Django está sendo iniciado com o endereço 0.0.0.0 e não 127.0.0.1. 