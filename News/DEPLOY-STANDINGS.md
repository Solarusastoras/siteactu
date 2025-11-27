# Instructions de déploiement - Système de standings dynamiques

## Fichiers à transférer vers le serveur Debian

1. **nhl-initial-standings.js** → /home/micyo/News/
2. **nba-initial-standings.js** → /home/micyo/News/
3. **nfl-initial-standings.js** → /home/micyo/News/
4. **standings-calculator.js** → /home/micyo/News/
5. **index.js** (modifié) → /home/micyo/News/

## Commandes de déploiement

```bash
# Sur le serveur Debian
cd /home/micyo/News

# Redémarrer PM2
pm2 restart sports-updater

# Vérifier les logs
pm2 logs sports-updater --lines 50

# Attendre quelques secondes pour voir les standings calculés
```

## Ce qui a été modifié

### 1. Fichiers de données initiales créés :
- `nhl-initial-standings.js` : Standings NHL au 27/11/2025
- `nba-initial-standings.js` : Standings NBA au 27/11/2025  
- `nfl-initial-standings.js` : Standings NFL au 27/11/2025 (Week 12)

### 2. Nouveau module `standings-calculator.js` :
- Charge les standings initiaux ou les standings sauvegardés
- Met à jour dynamiquement avec les résultats du scoreboard ESPN
- Recalcule les positions après chaque match
- Sauvegarde dans `/output/[sport]-live-standings.json`
- Formate au format SofaScore (compatible frontend)

### 3. Modifications dans `index.js` :
- Import du module `calculateLiveStandings`
- Dans `fetchESPNCompetition()` :
  - Pour NHL, NBA, NFL : utilise `calculateLiveStandings()` au lieu de `fetchSofaScoreStandings()`
  - Pour les ligues de football : continue d'utiliser SofaScore API

## Fonctionnement

1. **Initialisation** : Au premier lancement, charge les standings initiaux depuis les fichiers .js
2. **Mise à jour** : À chaque cycle (toutes les 10 secondes) :
   - Récupère le scoreboard ESPN
   - Identifie les matchs terminés
   - Met à jour wins/losses/points
   - Recalcule les positions
   - Sauvegarde les nouveaux standings
3. **Persistance** : Les standings sont sauvegardés dans `output/[sport]-live-standings.json`
4. **Format** : Retourne le format conférences compatible avec le frontend existant

## Avantages

✅ **Plus de dépendance à SofaScore API** (fini les 403 errors)
✅ **Mises à jour en temps réel** avec les résultats ESPN
✅ **Calcul automatique des positions** après chaque match
✅ **Persistance** : les standings survivent aux redémarrages
✅ **Compatible** : format identique au frontend actuel (2 conférences)

## Logs attendus

```
→ Calcul standings NHL...
✓ Standings NHL chargés depuis cache
✓ Standings NHL calculés
🔄 NHL - Classement calculé dynamiquement

→ Calcul standings NBA...
✓ Standings NBA chargés depuis cache  
✓ Standings NBA calculés
🔄 NBA - Classement calculé dynamiquement

→ Calcul standings NFL...
✓ Standings NFL chargés depuis cache
✓ Standings NFL calculés
🔄 NFL - Classement calculé dynamiquement
```

## Test local

Résultats du test avec matchs simulés :
- NHL : WSH bat NYR 3-2 → WSH passe de 28 à 30 pts
- NHL : BOS bat TOR 4-3 (OT) → BOS 24 pts, TOR 1 pt OT
- NBA : CLE bat BOS 115-108 → CLE 18-1, BOS 14-5
- NFL : DET bat GB 24-17 → DET 11-1, GB 8-4

✅ Tous les calculs validés !
