# 🏆 Sports Updater pour TerraMaster F4-423

Système d'actualisation automatique des données sportives ESPN vers OVH.

## 📋 Fonctionnalités

- ✅ Mise à jour toutes les **5 secondes** pendant les matchs
- ✅ Support de 6 compétitions : Ligue 1, CAN 2025, Champions League, NBA, NFL, NHL
- ✅ Upload SFTP automatique vers OVH (100% sécurisé)
- ✅ Génération de fichiers JSON légers
- ✅ Container Docker isolé et sécurisé
- ✅ Logs détaillés et gestion d'erreurs

## 🔧 Installation sur TerraMaster F4-423

### Prérequis

1. **Docker** installé sur votre TerraMaster (via TOS)
2. **Accès SFTP OVH** configuré
3. **Connexion Internet** stable

### Étape 1 : Transfert des fichiers

1. Copiez le dossier `nas-updater` sur votre NAS
2. Placez-le dans `/volume1/docker/sports-updater/` (ou autre emplacement)

### Étape 2 : Configuration

1. Copiez `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

2. Éditez `.env` avec vos identifiants OVH :
   ```bash
   nano .env
   ```

3. Remplissez les informations :
   ```env
   SFTP_HOST=ftp.votre-domaine.ovh
   SFTP_PORT=22
   SFTP_USER=votre_utilisateur
   SFTP_PASSWORD=votre_mot_de_passe
   SFTP_REMOTE_PATH=/www/data/sports
   UPDATE_INTERVAL=5000
   DEBUG=false
   ```

### Étape 3 : Construction et lancement

Via l'interface TOS Docker :

1. Ouvrez **TOS** → **Docker**
2. Allez dans **Images** → **Importer depuis un fichier**
3. Sélectionnez le dossier `nas-updater`
4. Lancez `docker-compose up -d`

OU via SSH :

```bash
cd /volume1/docker/sports-updater
docker-compose up -d
```

### Étape 4 : Vérification

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Vous devriez voir :
# ✅ Connexion SFTP établie avec OVH
# ✅ ✓ Ligue 1 mis à jour
# ✅ ✓ CAN 2025 mis à jour
# ✅ Cycle terminé en 2.34s
```

## 📁 Fichiers générés

Sur OVH, dans `/www/data/sports/` :

```
ligue1-live.json          # Matchs Ligue 1 en direct
ligue1-standings.json     # Classement Ligue 1
can-live.json             # Matchs CAN en direct
can-standings.json        # Classement CAN
champions-live.json       # Matchs Champions League
champions-standings.json  # Classement Champions League
nba-live.json            # Matchs NBA
nba-standings.json       # Classement NBA
nfl-live.json            # Matchs NFL
nfl-standings.json       # Classement NFL
nhl-live.json            # Matchs NHL
nhl-standings.json       # Classement NHL
```

## 🔒 Sécurité

- ✅ **Aucun port ouvert** sur votre NAS (connexion sortante uniquement)
- ✅ **SFTP chiffré** (SSH)
- ✅ **Credentials dans .env** (jamais dans le code)
- ✅ **Container isolé** du système hôte
- ✅ **Logs limités** (rotation automatique)

## 🎯 Intégration React (côté OVH)

Dans votre site React, créez un hook pour lire les JSON :

```javascript
// src/hooks/useSportsData.js
import { useState, useEffect } from 'react';

export function useSportsData(competition, type = 'live') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://votre-domaine.ovh/data/sports/${competition}-${type}.json`
        );
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(interval);
  }, [competition, type]);

  return { data, loading };
}
```

Utilisation dans un composant :

```javascript
import { useSportsData } from './hooks/useSportsData';

function Ligue1Live() {
  const { data, loading } = useSportsData('ligue1', 'live');

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>{data.competition}</h2>
      <p>Dernière mise à jour : {new Date(data.lastUpdate).toLocaleString()}</p>
      {data.matches.map(match => (
        <div key={match.id}>
          <strong>{match.home.name}</strong> {match.home.score} - {match.away.score} <strong>{match.away.name}</strong>
          <span> ({match.status})</span>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Commandes utiles

```bash
# Démarrer le service
docker-compose up -d

# Arrêter le service
docker-compose down

# Redémarrer le service
docker-compose restart

# Voir les logs
docker-compose logs -f

# Voir les logs d'une seule journée
docker-compose logs --since 24h

# Mettre à jour le code
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Voir l'état
docker-compose ps

# Nettoyer les anciens logs
docker-compose down
rm -rf output/*.json
docker-compose up -d
```

## 🐛 Dépannage

### Problème de connexion SFTP

```bash
# Tester manuellement la connexion SFTP
docker-compose exec sports-updater sh
apk add openssh-client
sftp -P 22 votre_user@ftp.votre-domaine.ovh
```

### Logs d'erreur

Activez le mode debug dans `.env` :
```env
DEBUG=true
```

Puis redémarrez :
```bash
docker-compose restart
```

### Espace disque NAS

Vérifiez l'espace disponible :
```bash
df -h /volume1
```

Les fichiers JSON sont très légers (~10 Ko chacun), aucun problème d'espace.

## 🔄 Mise à jour du script

Pour modifier les compétitions ou l'intervalle :

1. Éditez `index.js` ou `.env`
2. Reconstruisez le container :
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## ✅ Avantages de cette solution

- **Temps réel** : 5 secondes d'actualisation
- **Sécurisé** : SFTP chiffré, NAS fermé
- **Fiable** : Redémarrage automatique en cas d'erreur
- **Léger** : JSON optimisés, faible bande passante
- **Maintenable** : Code clair, logs détaillés

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs -f`
2. Testez la connexion SFTP manuellement
3. Vérifiez que Docker est bien installé sur TOS
4. Assurez-vous que les credentials OVH sont corrects
