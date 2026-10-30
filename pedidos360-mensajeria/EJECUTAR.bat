@echo off
echo ========================================
echo PASO 3 - Ejecutando Microservicio
echo ========================================

echo.
echo [1/3] Descargando Maven portable...
powershell -Command "Invoke-WebRequest -Uri 'https://dlcdn.apache.org/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.zip' -OutFile 'maven.zip' -UseBasicParsing; Expand-Archive -Path 'maven.zip' -DestinationPath '.' -Force; Remove-Item 'maven.zip'"

echo.
echo [2/3] Compilando proyecto...
apache-maven-3.9.5\bin\mvn.cmd clean package -DskipTests

echo.
echo [3/3] Ejecutando microservicio en puerto 8083...
echo Presiona Ctrl+C para detener
apache-maven-3.9.5\bin\mvn.cmd spring-boot:run

pause
