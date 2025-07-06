# Étape 1: Utiliser une image Python officielle et légère comme base.
FROM python:3.11-slim

# Étape 2: Définir le répertoire de travail à l'intérieur du conteneur.
# Toutes les commandes suivantes s'exécuteront depuis ce dossier.
WORKDIR /app

# Étape 3: Copier uniquement le fichier des dépendances pour l'instant.
# On le fait séparément pour profiter du système de cache de Docker.
COPY requirements.txt .

# Étape 4: Installer les dépendances Python.
# Le flag --no-cache-dir réduit la taille finale de l'image.
RUN pip install --no-cache-dir -r requirements.txt

# Étape 5: Télécharger les données NLTK (stopwords).
# Cette commande est exécutée une seule fois pendant la construction de l'image.
RUN python -m nltk.downloader stopwords

# Étape 6: Copier tout le reste de notre code (app.py, le dossier /models) dans le conteneur.
COPY . .

# Étape 7: Indiquer à Docker que le conteneur écoutera sur le port 5000.
EXPOSE 5000

# Étape 8: La commande à exécuter pour démarrer l'application.
# On utilise gunicorn pour lancer le serveur.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"] 