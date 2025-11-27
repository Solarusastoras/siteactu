#!/bin/bash

# 🚀 Installation complète Sports Updater sur Debian (VM VirtualBox)
# Ce script installe TOUT automatiquement : Node.js, dépendances, service

set -e  # Arrêt en cas d'erreur

echo "========================================"
echo "🏆 Installation Sports Updater - Debian"
echo "========================================"
echo ""

# Variables
APP_DIR="$HOME/sports-updater"
SERVICE_NAME="sports-updater"

# Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update
sudo apt upgrade -y
echo "✅ Système à jour"
echo ""

# Installation de Node.js (version 18 LTS)
echo "📦 Installation de Node.js 18 LTS..."
if ! command -v node &> /dev/null; then
    echo "Téléchargement et installation de Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✅ Node.js installé"
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js déjà installé : $NODE_VERSION"
fi
echo ""

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    sudo apt install -y npm
fi

NPM_VERSION=$(npm --version)
echo "✅ npm version : $NPM_VERSION"
echo ""

# Installation de Git (pour récupérer les fichiers)
echo "📦 Installation de Git..."
sudo apt install -y git
echo "✅ Git installé"
echo ""

# Création du dossier de l'application
echo "📁 Création du dossier $APP_DIR..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/output"
echo "✅ Dossier créé"
echo ""

# Copier les fichiers depuis le PC Windows
echo "📄 Transfert des fichiers nécessaires..."
echo ""
echo "⚠️  ACTION REQUISE :"
echo "Depuis votre PC Windows, ouvrez un PowerShell et exécutez :"
echo ""
echo "  scp -r C:\\Users\\Micyo\\Desktop\\siteactu\\nas-updater\\* votreuser@IP_VM:$APP_DIR/"
echo ""
echo "Remplacez :"
echo "  - votreuser par votre nom d'utilisateur Debian"
echo "  - IP_VM par l'adresse IP de votre VM"
echo ""
echo "Exemple :"
echo "  scp -r C:\\Users\\Micyo\\Desktop\\siteactu\\nas-updater\\* debian@192.168.1.100:$APP_DIR/"
echo ""
read -p "Appuyez sur Entrée une fois les fichiers transférés..."
echo ""

# Vérifier que les fichiers sont présents
cd "$APP_DIR" || exit 1

if [ ! -f "package.json" ]; then
    echo "❌ Fichier package.json manquant"
    echo "Assurez-vous d'avoir transféré tous les fichiers du dossier nas-updater"
    exit 1
fi

if [ ! -f "index.js" ]; then
    echo "❌ Fichier index.js manquant"
    exit 1
fi

echo "✅ Fichiers détectés"
echo ""

# Installation des dépendances npm
echo "📦 Installation des dépendances npm..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi
echo "✅ Dépendances installées (axios, ssh2-sftp-client, dotenv)"
echo ""

# Création du fichier .env
if [ ! -f ".env" ]; then
    echo "⚙️  Configuration du fichier .env..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "⚠️  CONFIGURATION IMPORTANTE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Vous devez maintenant configurer vos identifiants OVH."
        echo ""
        
        # Demander les informations interactivement
        read -p "Hôte SFTP OVH (ex: ftp.votre-domaine.ovh) : " SFTP_HOST
        read -p "Port SFTP (généralement 22) : " SFTP_PORT
        SFTP_PORT=${SFTP_PORT:-22}
        read -p "Utilisateur SFTP OVH : " SFTP_USER
        read -sp "Mot de passe SFTP OVH : " SFTP_PASSWORD
        echo ""
        read -p "Chemin distant sur OVH (ex: /www/data/sports) : " SFTP_REMOTE_PATH
        SFTP_REMOTE_PATH=${SFTP_REMOTE_PATH:-/www/data/sports}
        read -p "Intervalle de mise à jour en millisecondes (5000 = 5 sec) : " UPDATE_INTERVAL
        UPDATE_INTERVAL=${UPDATE_INTERVAL:-5000}
        
        # Écrire dans .env
        cat > .env << EOF
# Configuration SFTP OVH
SFTP_HOST=$SFTP_HOST
SFTP_PORT=$SFTP_PORT
SFTP_USER=$SFTP_USER
SFTP_PASSWORD=$SFTP_PASSWORD
SFTP_REMOTE_PATH=$SFTP_REMOTE_PATH

# Intervalle de mise à jour (en millisecondes)
UPDATE_INTERVAL=$UPDATE_INTERVAL

# Mode debug (true/false)
DEBUG=false
EOF
        
        echo ""
        echo "✅ Configuration .env créée"
        echo ""
    else
        echo "❌ Fichier .env.example manquant"
        exit 1
    fi
else
    echo "✅ Fichier .env déjà existant"
    echo ""
fi

# Installation de PM2
echo "📦 Installation de PM2 (gestionnaire de processus)..."
sudo npm install -g pm2
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation de PM2"
    exit 1
fi
echo "✅ PM2 installé"
echo ""

# Arrêter le service s'il existe déjà
echo "🔄 Vérification du service existant..."
pm2 describe $SERVICE_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Service existant détecté, arrêt..."
    pm2 delete $SERVICE_NAME
fi
echo ""

# Test rapide du script
echo "🧪 Test de connexion..."
echo "Vérification que le script peut se connecter à OVH..."
timeout 30 node index.js &
TEST_PID=$!
sleep 10
kill $TEST_PID 2>/dev/null || true
echo ""

# Démarrage du service avec PM2
echo "🚀 Démarrage du service $SERVICE_NAME..."
pm2 start index.js --name $SERVICE_NAME
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du démarrage du service"
    exit 1
fi
echo "✅ Service démarré"
echo ""

# Configuration du démarrage automatique
echo "⚙️  Configuration du démarrage automatique..."
pm2 startup systemd -u $USER --hp $HOME
pm2 save
echo "✅ Démarrage automatique configuré"
echo ""

# Afficher le statut
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 État du service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
echo ""

# Afficher les premiers logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Logs en direct (Ctrl+C pour quitter)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 3
pm2 logs $SERVICE_NAME --lines 30 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation terminée avec succès !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Commandes utiles :"
echo "  pm2 logs $SERVICE_NAME          # Voir les logs en temps réel"
echo "  pm2 restart $SERVICE_NAME       # Redémarrer le service"
echo "  pm2 stop $SERVICE_NAME          # Arrêter le service"
echo "  pm2 monit                       # Monitoring temps réel"
echo "  pm2 status                      # État du service"
echo ""
echo "📁 Fichiers générés localement :"
echo "  $APP_DIR/output/"
echo ""
echo "📤 Fichiers uploadés sur OVH :"
echo "  $SFTP_REMOTE_PATH/"
echo ""
echo "🎯 Les données sont mises à jour toutes les $UPDATE_INTERVAL ms ($(($UPDATE_INTERVAL / 1000)) secondes)"
echo ""
echo "🔒 Votre VM est maintenant un serveur de données sportives 24/7 !"
echo ""
