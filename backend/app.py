import os
import joblib
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk

# --- CONFIGURATION ET CHARGEMENT DU MODÈLE ---

# Télécharger les 'stopwords' de NLTK si ce n'est pas déjà fait
try:
    nltk.data.find('corpora/stopwords')
except nltk.downloader.DownloadError:
    nltk.download('stopwords')

from nltk.corpus import stopwords

# Crée une instance de l'application Flask
app = Flask(__name__)

# --- CONFIGURATION DE CORS ---
# 2. INITIALISER CORS, en spécifiant que seules les requêtes
# venant de l'origine de notre app React sont autorisées.
CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})
# ---------------------------

# Charger le modèle et le vectoriseur sauvegardés
# On le fait ici, au démarrage, pour ne pas avoir à les recharger à chaque requête.
model_path = os.path.join('models', 'sentiment_model.joblib')
vectorizer_path = os.path.join('models', 'tfidf_vectorizer.joblib')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

# --- FONCTION DE NETTOYAGE ---

# C'est une copie exacte de la fonction `nettoyer_texte_v2` de notre notebook.
# Il est crucial d'appliquer EXACTEMENT le même pré-traitement.
stop_words_francais = set(stopwords.words('french'))
ponctuation_a_supprimer = string.punctuation.replace("'", "")

def nettoyer_texte_v2(texte):
    texte = texte.lower()
    for char in ponctuation_a_supprimer:
        texte = texte.replace(char, ' ')
    mots = texte.split()
    mots_filtres = [mot for mot in mots if mot not in stop_words_francais]
    texte_nettoye = " ".join(mots_filtres)
    return texte_nettoye

# --- ROUTES DE L'API ---

@app.route('/')
def home():
    return "API de sentiment fonctionnelle. Utilisez l'endpoint /predict."

# On définit la route '/predict' qui accepte les requêtes POST
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Récupérer les données JSON envoyées avec la requête
        data = request.get_json()
        
        # Vérifier que la clé 'texte' est bien présente dans le JSON
        if 'texte' not in data:
            return jsonify({'error': "La clé 'texte' est manquante dans la requête JSON."}), 400

        texte_original = data['texte']
        
        # 1. Nettoyer le texte
        texte_nettoye = nettoyer_texte_v2(texte_original)
        
        # 2. Vectoriser le texte nettoyé
        # On utilise .transform() car le vectorizer est déjà entraîné.
        # Le texte doit être dans une liste ou un itérable.
        texte_vect = vectorizer.transform([texte_nettoye])
        
        # OBTENIR LES PROBABILITÉS
        probabilities = model.predict_proba(texte_vect)[0]
        
        # OBTENIR LA CLASSE PRÉDITE (comme avant)
        prediction_binaire = model.classes_[probabilities.argmax()]

        # Déterminer la confiance
        confidence = max(probabilities)

        # Appliquer notre nouvelle logique à 3 classes
        seuil_confiance = 0.70  # On peut ajuster ce seuil
        if confidence < seuil_confiance:
            prediction_finale = 'neutre'
        else:
            prediction_finale = prediction_binaire

        # Renvoyer une réponse enrichie
        return jsonify({
            'texte_original': texte_original,
            'prediction_finale': prediction_finale,
            'prediction_binaire_brute': prediction_binaire,
            'confiance': float(confidence),
            'details_probabilites': {
                'negatif': float(probabilities[0]),
                'positif': float(probabilities[1])
            }
        })

    except Exception as e:
        # En cas d'erreur inattendue, on renvoie un message clair.
        return jsonify({'error': f"Une erreur est survenue: {str(e)}"}), 500

# Lancer le serveur
if __name__ == '__main__':
    app.run(debug=True)
