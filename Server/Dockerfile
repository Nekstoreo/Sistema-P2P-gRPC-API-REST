# Usa una imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY src/ .

# Instala las dependencias
RUN npm install

# Expone el puerto necesario
EXPOSE 6000

# Comando para ejecutar la aplicación
CMD ["node", "directoryServer.js"]