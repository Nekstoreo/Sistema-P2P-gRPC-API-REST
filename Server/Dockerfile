# Base image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port for Directory Server
EXPOSE 6000

# Command to start the directory server
CMD ["node", "directoryServer.js"]
