@echo off
echo ========================================
echo SUBIR PROYECTO A GITHUB
echo ========================================
echo.

cd "c:\Users\nacho\Desktop\cloud ev1"

echo Inicializando repositorio Git...
git init

echo.
echo Agregando README.md...
git add README.md

echo.
echo Agregando .gitignore...
git add .gitignore

echo.
echo Agregando documentacion...
git add ENTREGA_FINAL.md
git add GUIA_RAPIDA_DEPLOYMENT.txt
git add CHECKLIST_VIDEO.txt
git add COMANDOS_RAPIDOS.txt
git add INSTRUCCIONES_MYSQL.txt
git add COMANDOS_RECOMPILAR.bat

echo.
echo Agregando codigo fuente...
git add pedidos360-bff/
git add pedidos360-catalogo/
git add pedidos360-ordenes/
git add pedidos360-frontend/

echo.
echo Creando commit...
git commit -m "Proyecto Pedidos360 - Sistema de microservicios en AWS con Azure AD"

echo.
echo Configurando rama principal...
git branch -M main

echo.
echo Agregando repositorio remoto...
git remote add origin https://github.com/Ignaciogvr/Pedidos_360.git

echo.
echo ========================================
echo SUBIENDO A GITHUB...
echo ========================================
echo.
echo Te pedira tu usuario y token de GitHub
echo.

git push -u origin main

echo.
echo ========================================
echo ✅ SUBIDA COMPLETA
echo ========================================
echo.
echo Tu proyecto esta en:
echo https://github.com/Ignaciogvr/Pedidos_360
echo.
pause
