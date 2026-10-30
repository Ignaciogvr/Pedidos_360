-- Script ejecutado automáticamente al iniciar MySQL por primera vez
CREATE USER IF NOT EXISTS 'pedidos360'@'%' IDENTIFIED BY 'Pedidos360Pass!';
GRANT ALL PRIVILEGES ON *.* TO 'pedidos360'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS ordenesdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogodb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mensajeriadb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
