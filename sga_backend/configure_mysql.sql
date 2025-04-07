-- Script para configurar o MySQL para aceitar conexões remotas

-- Cria um usuário que pode se conectar de qualquer host
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '12345678';

-- Concede todos os privilégios no banco de dados sga_db para o usuário
GRANT ALL PRIVILEGES ON sga_db.* TO 'root'@'%';

-- Atualiza os privilégios
FLUSH PRIVILEGES; 