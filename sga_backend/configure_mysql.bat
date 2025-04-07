@echo off
REM Script para configurar o MySQL para aceitar conexões remotas no Windows

REM Conecta ao MySQL e concede permissões para o usuário root acessar de qualquer host
mysql -u root -p12345678 -e "CREATE USER IF NOT EXISTS 'root'@'%%' IDENTIFIED BY '12345678';"
mysql -u root -p12345678 -e "GRANT ALL PRIVILEGES ON sga_db.* TO 'root'@'%%';"
mysql -u root -p12345678 -e "FLUSH PRIVILEGES;"

echo Configuracao do MySQL concluida. Agora o servidor deve aceitar conexoes remotas.
pause 