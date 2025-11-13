import { useState, useEffect } from 'react';

function ActuFrance() {
  const [actualites, setActualites] = useState([]);

  useEffect(() => {
    // Exemple de données d'actualités
    const actusExemple = [
      {
        id: 1,
        titre: "Actualité France 1",
        description: "Description de l'actualité française",
        date: new Date().toLocaleDateString('fr-FR')
      },
      {
        id: 2,
        titre: "Actualité France 2",
        description: "Une autre actualité importante",
        date: new Date().toLocaleDateString('fr-FR')
      }
    ];
    setActualites(actusExemple);
  }, []);

  return (
    <div className="ActuFrance">
      <h2>Actualités France</h2>
      <div className="actualites-container">
        {actualites.length > 0 ? (
          actualites.map((actu) => (
            <article key={actu.id} className="actu-card">
              <h3>{actu.titre}</h3>
              <p>{actu.description}</p>
              <span className="date">{actu.date}</span>
            </article>
          ))
        ) : (
          <p>Aucune actualité disponible</p>
        )}
      </div>
    </div>
  );
}

export default ActuFrance;