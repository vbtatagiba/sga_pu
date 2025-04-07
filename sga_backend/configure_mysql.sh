#!/bin/bash

# Script para configurar o MySQL para aceitar conexões remotas

# Conecta ao MySQL e concede permissões para o usuário root acessar de qualquer host
mysql -u root -p12345678 << EOF
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON sga_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
EOF

echo "Configuração do MySQL concluída. Agora o servidor deve aceitar conexões remotas." 