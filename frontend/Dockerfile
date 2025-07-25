# --- Étape 1: La phase de "Build" ---
# On utilise une image Node.js. 'alpine' est une version très légère.
FROM node:18-alpine as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tout le reste du code source de l'application
COPY . .

# Exécuter le script de build pour générer les fichiers statiques
RUN npm run build

# --- Étape 2: La phase de "Serve" ---
# On repart d'une nouvelle image très légère, un serveur Nginx.
FROM nginx:1.25-alpine

# Copier les fichiers statiques générés à l'étape précédente (dans /app/dist)
# vers le répertoire où Nginx sert les fichiers par défaut.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie notre template de configuration Nginx.
# Le conteneur Nginx de base va automatiquement substituer les variables d'environnement
# (comme ${BACKEND_URL}) dans ce fichier au démarrage.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Indiquer que le conteneur écoutera sur le port 80 (port par défaut pour HTTP)
EXPOSE 80

# La commande par défaut de l'image Nginx se charge de démarrer le serveur,
# donc nous n'avons pas besoin de spécifier une commande CMD ici.
CMD ["nginx", "-g", "daemon off;"] 