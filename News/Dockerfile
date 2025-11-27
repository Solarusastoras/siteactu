# Image Node.js légère pour TerraMaster F4-423
FROM node:18-alpine

# Installation des dépendances système
RUN apk add --no-cache openssh-client

# Création du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances Node.js
RUN npm install --production

# Copie du code source
COPY . .

# Création du dossier pour les JSON générés
RUN mkdir -p /app/output

# Lancement du script
CMD ["node", "index.js"]
