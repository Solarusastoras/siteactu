# 🏆 Sports Updater pour TerraMaster F4-423 (Node.js Direct)

Système d'actualisation automatique des données sportives ESPN vers OVH.

## 📋 Fonctionnalités

- ✅ Mise à jour toutes les **5 secondes** pendant les matchs
- ✅ Support de 6 compétitions : Ligue 1, CAN 2025, Champions League, NBA, NFL, NHL
- ✅ Upload SFTP automatique vers OVH (100% sécurisé)
- ✅ Génération de fichiers JSON légers
- ✅ Service permanent sur votre TerraMaster
- ✅ Logs détaillés et gestion d'erreurs

## 🔧 Installation sur TerraMaster F4-423

### Prérequis

1. ✅ **Node.js** déjà installé sur votre TerraMaster
2. **Accès SFTP OVH** configuré
3. **Connexion Internet** stable

### Étape 1 : Transfert des fichiers

1. Connectez-vous en SSH à votre TerraMaster :
   ```bash
   ssh admin@IP_DE_VOTRE_NAS
   ```

2. Créez le dossier du projet :
   ```bash
   mkdir -p /volume1/apps/sports-updater
   cd /volume1/apps/sports-updater
   ```

3. Transférez les fichiers depuis votre PC :
   - Utilisez WinSCP, FileZilla ou la commande scp
   - Copiez tout le contenu du dossier `nas-updater/` vers `/volume1/apps/sports-updater/`

### Étape 2 : Installation des dépendances

```bash
cd /volume1/apps/sports-updater
npm install
```

Cela va installer :
- `axios` - Pour appeler l'API ESPN
- `ssh2-sftp-client` - Pour l'upload SFTP vers OVH
- `dotenv` - Pour la configuration sécurisée

### Étape 3 : Configuration

1. Créez le fichier `.env` :
   ```bash
   cp .env.example .env
   nano .env
   ```

2. Remplissez vos identifiants OVH :
   ```env
   SFTP_HOST=ftp.votre-domaine.ovh
   SFTP_PORT=22
   SFTP_USER=votre_utilisateur_ovh
   SFTP_PASSWORD=votre_mot_de_passe_secure
   SFTP_REMOTE_PATH=/www/data/sports
   UPDATE_INTERVAL=5000
   DEBUG=false
   ```

3. Sauvegardez (Ctrl+X, puis Y, puis Entrée)

### Étape 4 : Test manuel

Lancez le script une première fois pour vérifier :

```bash
node index.js
```

Vous devriez voir :
```
[2025-11-22T...] ✅ 🚀 Démarrage du service d'actualisation sportive
[2025-11-22T...] ✅ 📊 Compétitions surveillées: 6
[2025-11-22T...] ✅ ⏱️  Intervalle: 5 secondes
[2025-11-22T...] ✅ Connexion SFTP établie avec OVH
[2025-11-22T...] ✅ ✓ Ligue 1 mis à jour
[2025-11-22T...] ✅ ✓ CAN 2025 mis à jour
[2025-11-22T...] ✅ Cycle terminé en 2.34s
```

Si tout fonctionne, arrêtez avec **Ctrl+C**.

### Étape 5 : Service permanent avec PM2

**PM2** est un gestionnaire de processus Node.js qui maintient le script actif en permanence.

1. Installez PM2 globalement :
   ```bash
   npm install -g pm2
   ```

2. Démarrez le service :
   ```bash
   cd /volume1/apps/sports-updater
   pm2 start index.js --name sports-updater
   ```

3. Configurez le démarrage automatique au boot du NAS :
   ```bash
   pm2 startup
   pm2 save
   ```

4. Vérifiez l'état :
   ```bash
   pm2 status
   ```

Vous devriez voir :
```
┌─────┬──────────────────┬─────────┬──────┬────────┬─────────┐
│ id  │ name             │ status  │ cpu  │ memory │ restart │
├─────┼──────────────────┼─────────┼──────┼────────┼─────────┤
│ 0   │ sports-updater   │ online  │ 0.3% │ 45 MB  │ 0       │
└─────┴──────────────────┴─────────┴──────┴────────┴─────────┘
```

## 📁 Fichiers générés

Sur votre NAS, dans `/volume1/apps/sports-updater/output/` :
```
ligue1-live.json
ligue1-standings.json
can-live.json
can-standings.json
champions-live.json
champions-standings.json
nba-live.json
nba-standings.json
nfl-live.json
nfl-standings.json
nhl-live.json
nhl-standings.json
```

Sur OVH, dans `/www/data/sports/` : **mêmes fichiers uploadés automatiquement !**

## 🔒 Sécurité

- ✅ **Aucun port ouvert** sur votre NAS (connexion sortante uniquement)
- ✅ **SFTP chiffré** (SSH)
- ✅ **Credentials dans .env** (jamais dans le code)
- ✅ **Process isolé** avec PM2
- ✅ **Logs rotatifs** automatiques

## 📊 Commandes PM2 utiles

```bash
# Voir les logs en temps réel
pm2 logs sports-updater

# Arrêter le service
pm2 stop sports-updater

# Redémarrer le service
pm2 restart sports-updater

# Voir les statistiques
pm2 monit

# Voir l'historique
pm2 logs sports-updater --lines 100

# Supprimer le service
pm2 delete sports-updater
```

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

## 🐛 Dépannage

### Le service ne démarre pas

Vérifiez les logs :
```bash
pm2 logs sports-updater --err
```

### Erreur de connexion SFTP

Testez manuellement :
```bash
sftp -P 22 votre_user@ftp.votre-domaine.ovh
```

### Mode debug

Activez dans `.env` :
```env
DEBUG=true
```

Puis redémarrez :
```bash
pm2 restart sports-updater
```

### Vérifier les fichiers générés

```bash
ls -lh /volume1/apps/sports-updater/output/
```

### Mettre à jour le code

```bash
cd /volume1/apps/sports-updater
# Modifiez index.js ou .env
pm2 restart sports-updater
```

## 🔄 Mise à jour des compétitions

Pour ajouter/modifier des compétitions, éditez `index.js` section `COMPETITIONS` :

```javascript
const COMPETITIONS = {
  ligue1: {
    name: 'Ligue 1',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/fra.1/standings',
    files: {
      live: 'ligue1-live.json',
      standings: 'ligue1-standings.json'
    }
  },
  // Ajoutez d'autres compétitions ici...
};
```

Puis redémarrez :
```bash
pm2 restart sports-updater
```

## ✅ Avantages de cette solution

- **Temps réel** : 5 secondes d'actualisation
- **Sécurisé** : SFTP chiffré, NAS fermé
- **Fiable** : PM2 redémarre automatiquement en cas d'erreur
- **Léger** : JSON optimisés, ~50 MB RAM
- **Maintenable** : Code clair, logs détaillés
- **Native** : Pas de Docker, utilise Node.js directement

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `pm2 logs sports-updater`
2. Testez la connexion SFTP manuellement
3. Vérifiez que Node.js fonctionne : `node --version`
4. Assurez-vous que les credentials OVH sont corrects
5. Vérifiez l'espace disque : `df -h /volume1`

## 🎉 Félicitations !

Votre système d'actualisation sportive est maintenant opérationnel 24/7 sur votre TerraMaster F4-423 !
