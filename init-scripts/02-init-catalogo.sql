-- Script para inicializar productos en el catálogo
-- NOTA: Los productos se insertan cuando el microservicio crea la tabla via Hibernate.
-- Este script solo asegura que la BD exista (ya creada en 01-init-users.sql).
USE catalogodb;
SELECT 'catalogodb lista' AS status;