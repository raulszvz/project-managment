# Project Managment
## API

### Desplegar en Heroku

1. Crear la imagen de producción
 ```docker-compose -f docker-compose.prod.yml build```
2. Listar todas las imagenes```docker image ls```
3. Buscar la imagen creada y ejecutar el siguiente comando
 ```docker tag <image-id> registry.heroku.com/<app-name>/web``` para registrar la imagen en Herouku
4. Ejecutar ```docker push registry.heroku.com/<app-name>/web ``` para subir la imagen.
5. Ejecutar ```heroku container:release --app=<app-name> web``` para inicializar el contenedor en Heroku.