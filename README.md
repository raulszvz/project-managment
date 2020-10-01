# Project Managment

## API

### Ejecutar en windows
- Para ejecutar la API utilize el script [run.ps1](https://gist.github.com/raulszvz/64f5ff8579f25c5667e2fe45d15f5429) en powershell.
- Como ejecutar el script:
    1. Ejecute powershell como administrador
    2. Ejecute el comando
        ```
        Set-ExecutionPolicy RemoteSigned 
        ``` 
    3. Escriba el siguiente comando para ejecutar el script y presione enter:
        ```
        & "C:\PATH\TO\SCRIPT\run.ps1"
        ```

### Ejecutar en linux

### Desplegar en Heroku

1. Crear la imagen de producción
 ```docker-compose -f docker-compose.prod.yml build```
2. Listar todas las imagenes```docker image ls```
3. Buscar la imagen creada y ejecutar el siguiente comando
 ```docker tag <image-id> registry.heroku.com/<app-name>/web``` para registrar la imagen en Herouku
4. Ejecutar ```docker push registry.heroku.com/<app-name>/web ``` para subir la imagen.
5. Ejecutar ```heroku container:release --app=<app-name> web``` para inicializar el contenedor en Heroku.

## Client
Para usar el cliente basta con abrir el archivo index.html (ubicado en la carpeta client)

Existe un usuario de prueba
usuario: r@email.com
contraseña: 1234