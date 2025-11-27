#!/bin/bash

# 🚀 Script d'installation automatique pour TerraMaster F4-423
# Ce script installe et configure automatiquement le service Sports Updater

echo "========================================"
echo "🏆 Installation Sports Updater"
echo "========================================"
echo ""

# Variables
APP_DIR="/volume1/apps/sports-updater"
SERVICE_NAME="sports-updater"

# Vérifier Node.js
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé !"
    echo "Installez Node.js via TOS Package Center ou manuellement."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js détecté : $NODE_VERSION"
echo ""

# Créer le dossier d'application
echo "📁 Création du dossier $APP_DIR..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/output"
echo "✅ Dossier créé"
echo ""

# Copier les fichiers (à adapter selon votre méthode de transfert)
echo "📄 Les fichiers suivants doivent être dans $APP_DIR :"
echo "   - index.js"
echo "   - package.json"
echo "   - .env.example"
echo ""

# Vérifier si les fichiers sont présents
if [ ! -f "$APP_DIR/package.json" ]; then
    echo "❌ Fichier package.json manquant dans $APP_DIR"
    echo "Transférez d'abord les fichiers depuis votre PC vers ce dossier."
    exit 1
fi

if [ ! -f "$APP_DIR/index.js" ]; then
    echo "❌ Fichier index.js manquant dans $APP_DIR"
    echo "Transférez d'abord les fichiers depuis votre PC vers ce dossier."
    exit 1
fi

echo "✅ Fichiers détectés"
echo ""

# Aller dans le dossier
cd "$APP_DIR" || exit 1

# Installer les dépendances
echo "📦 Installation des dépendances npm..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi
echo "✅ Dépendances installées"
echo ""

# Créer le fichier .env si nécessaire
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚙️  Création du fichier .env..."
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env"
        echo "✅ Fichier .env créé depuis .env.example"
        echo ""
        echo "⚠️  IMPORTANT : Éditez maintenant le fichier .env avec vos identifiants OVH :"
        echo "   nano $APP_DIR/.env"
        echo ""
        echo "Remplissez :"
        echo "   - SFTP_HOST"
        echo "   - SFTP_USER"
        echo "   - SFTP_PASSWORD"
        echo "   - SFTP_REMOTE_PATH"
        echo ""
        read -p "Appuyez sur Entrée après avoir configuré .env..."
    else
        echo "❌ Fichier .env.example manquant"
        exit 1
    fi
else
    echo "✅ Fichier .env déjà existant"
    echo ""
fi

# Installer PM2 globalement si nécessaire
echo "📦 Vérification de PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Installation de PM2..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation de PM2"
        exit 1
    fi
    echo "✅ PM2 installé"
else
    echo "✅ PM2 déjà installé"
fi
echo ""

# Arrêter le service s'il existe déjà
echo "🔄 Vérification du service existant..."
pm2 describe $SERVICE_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Service existant détecté, arrêt..."
    pm2 delete $SERVICE_NAME
fi
echo ""

# Démarrer le service
echo "🚀 Démarrage du service $SERVICE_NAME..."
pm2 start index.js --name $SERVICE_NAME
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du démarrage du service"
    exit 1
fi
echo "✅ Service démarré"
echo ""

# Configurer le démarrage automatique
echo "⚙️  Configuration du démarrage automatique..."
pm2 startup
pm2 save
echo "✅ Démarrage automatique configuré"
echo ""

# Afficher le statut
echo "📊 État du service :"
pm2 status
echo ""

# Afficher les logs
echo "📝 Derniers logs (Ctrl+C pour quitter) :"
echo ""
sleep 2
pm2 logs $SERVICE_NAME --lines 20

echo ""
echo "========================================"
echo "✅ Installation terminée !"
echo "========================================"
echo ""
echo "Commandes utiles :"
echo "  pm2 logs $SERVICE_NAME          # Voir les logs"
echo "  pm2 restart $SERVICE_NAME       # Redémarrer"
echo "  pm2 stop $SERVICE_NAME          # Arrêter"
echo "  pm2 monit                       # Monitoring"
echo ""
echo "Les fichiers JSON sont générés dans :"
echo "  $APP_DIR/output/"
echo ""
echo "Et uploadés automatiquement sur OVH dans :"
echo "  /www/data/sports/ (selon votre config)"
echo ""
