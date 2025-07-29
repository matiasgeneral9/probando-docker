# Imagen base
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./
COPY server ./server
COPY client ./client

# Instalar dependencias
RUN npm install --omit=dev

# Exponer el puerto de la app
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server/index.js"]
