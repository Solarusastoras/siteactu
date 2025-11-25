#!/bin/bash

# Script de mise à jour vers la version v2 avec actualités et culture

echo "🔄 Mise à jour vers version v2 (Sports + Actualités + Culture)"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "index.js" ]; then
    echo "❌ Erreur: Exécutez ce script depuis ~/sports-updater/"
    exit 1
fi

# Sauvegarder l'ancienne version
echo "📦 Sauvegarde de l'ancienne version..."
cp index.js index.js.backup
cp package.json package.json.backup
echo "✓ Sauvegarde créée (index.js.backup, package.json.backup)"
echo ""

# Remplacer par la nouvelle version
echo "📝 Installation de la nouvelle version..."
if [ -f "index-v2.js" ] && [ -f "package-v2.json" ]; then
    cp index-v2.js index.js
    cp package-v2.json package.json
    echo "✓ Fichiers mis à jour"
else
    echo "❌ Erreur: Fichiers index-v2.js ou package-v2.json introuvables"
    exit 1
fi
echo ""

# Installer la nouvelle dépendance rss-parser
echo "📚 Installation de la dépendance rss-parser..."
npm install
if [ $? -eq 0 ]; then
    echo "✓ Dépendances installées"
else
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi
echo ""

# Redémarrer PM2
echo "🔄 Redémarrage du service PM2..."
pm2 restart sports-updater
if [ $? -eq 0 ]; then
    echo "✓ Service redémarré"
else
    echo "⚠️ Impossible de redémarrer PM2 (peut-être pas encore configuré)"
fi
echo ""

echo "✅ Mise à jour terminée!"
echo ""
echo "📊 Nouvelle configuration:"
echo "   - 12 championnats (Ligue 1, Ligue 2, PL, Liga, Serie A, Bundesliga, Brasileirão, CAN, UCL, NBA, NFL, NHL) → Refresh intelligent"
echo "   - 2 flux actualités (France, Monde) → Refresh: 30 min"
echo "   - 6 flux culture (Cinéma, Musique, Jeux Vidéo, Santé, Sciences, Littérature) → Refresh: 30 min"
echo "   - 4 flux mercato (Maxifoot, RMC Sport, Le 10 Sport, Foot Mercato) → Refresh: 30 min"
echo ""
echo "🔍 Vérifier les logs:"
echo "   pm2 logs sports-updater"
echo ""
echo "📂 Structure OVH:"
echo "   /www/data/sports/    → 12 fichiers JSON (refresh intelligent)"
echo "   /www/data/actus/     → 2 fichiers JSON (refresh 30min)"
echo "   /www/data/culture/   → 6 fichiers JSON (refresh 30min)"
echo "   /www/data/mercato/   → 4 fichiers JSON (refresh 30min)"
