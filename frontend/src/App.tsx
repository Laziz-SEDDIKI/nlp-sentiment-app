// On définit un peu de style directement dans le fichier.
// C'est plus simple que de gérer plusieurs fichiers pour un petit projet.

// On définit un type pour les styles.
// C'est une bonne pratique pour éviter les erreurs de typage.
// On peut aussi utiliser des fichiers CSS séparés si on veut.
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: '#333'
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '2rem',
    },
    textarea: {
        width: '80%',
        minHeight: '150px',
        padding: '1rem',
        fontSize: '1.2rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
        marginBottom: '1rem',
    },
    button: {
        padding: '1rem 2rem',
        fontSize: '1.2rem',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    result: {
        marginTop: '2rem',
        padding: '1rem',
        borderRadius: '8px',
        width: '80%',
        textAlign: 'center',
        fontSize: '1.5rem',
    }
};

import { useState } from 'react';

// --- Définition des types TypeScript ---
// C'est une bonne pratique de définir la "forme" des objets que nous attendons.
// Ici, on définit ce à quoi la réponse de notre API doit ressembler.
type ApiResponse = {
  prediction_finale: 'positif' | 'negatif' | 'neutre';
  confiance: number;
};

// --- Composant principal de l'application ---
function App() {
  // --- États (States) ---
  // On utilise useState pour mémoriser des informations qui peuvent changer.
  const [texte, setTexte] = useState<string>(''); // Pour stocker le texte de la textarea
  const [resultat, setResultat] = useState<ApiResponse | null>(null); // Pour stocker la réponse de l'API
  const [isLoading, setIsLoading] = useState<boolean>(false); // Pour savoir si une requête est en cours
  const [error, setError] = useState<string | null>(null); // Pour stocker les messages d'erreur

  // --- Logique du clic sur le bouton ---
  const handleAnalyse = async () => {
    // Si le texte est vide, on ne fait rien.
    if (!texte.trim()) {
        setError("Veuillez entrer du texte avant d'analyser.");
        return;
    }

    setIsLoading(true); // On commence le chargement
    setError(null);
    setResultat(null);

    // L'URL de l'API est maintenant dynamique.
    // En production (dans Docker), elle pointera vers '/api/predict'.
    // En développement (npm run dev), elle utilisera le proxy de Vite.
    const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/predict`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: texte }),
      });

      if (!response.ok) {
        // Si la réponse n'est pas OK (ex: erreur 500), on lève une erreur.
        throw new Error(`Erreur du serveur: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setResultat(data); // On stocke le résultat dans notre état

    } catch (err) {
      // Si une erreur réseau ou autre survient
      setError("Impossible de contacter l'API. Assurez-vous que le serveur backend est bien lancé.");
      console.error(err);
    } finally {
      setIsLoading(false); // On a fini le chargement (succès ou échec)
    }
  };

  // --- Rendu du composant ---
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Analyse de Sentiments</h1>

      <textarea
        style={styles.textarea}
        placeholder="Écrivez une critique de film ici..."
        value={texte} // La valeur de la textarea est liée à notre état 'texte'
        onChange={(e) => setTexte(e.target.value)} // À chaque changement, on met à jour l'état
      />

      <button style={styles.button} onClick={handleAnalyse} disabled={isLoading}>
        {isLoading ? 'Analyse en cours...' : 'Analyser le sentiment'}
      </button>

      {/* --- Affichage conditionnel des résultats --- */}
      <div style={styles.result}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {resultat && (
            <div>
                <p>Sentiment Prédit : <strong>{resultat.prediction_finale}</strong></p>
                <p>Confiance : {Math.round(resultat.confiance * 100)}%</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default App
