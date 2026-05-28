@echo off
cd /d "%~dp0backend"
set "JAVA_HOME=C:\Program Files\Java\jdk-18.0.2"
set "PATH=%JAVA_HOME%\bin;D:\Maven\apache-maven-3.9.15\bin;D:\Maven\bin;%PATH%"
call mvn.cmd clean spring-boot:run
pause
