# Usa una imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias antes
COPY src/package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación al directorio de trabajo excepto node_modules
COPY src/ .

# Copia el archivo de configuración .env.peer
COPY .env.peer .env

# Expone los puertos necesarios
EXPOSE 5000 50051

# Comando para ejecutar la aplicación
CMD ["node", "peer.js"]