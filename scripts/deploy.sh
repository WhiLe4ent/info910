#!/bin/bash

# Script de déploiement automatique pour Minikube
# Ce script automatise toutes les étapes nécessaires au déploiement de l'application

set -e  # Arrêter le script en cas d'erreur

echo "============================================"
echo "  Déploiement de Note Manager sur Minikube"
echo "============================================"
echo ""

# 1. Vérifier que Minikube est démarré
echo "📌 Étape 1: Vérification de Minikube..."
if ! minikube status | grep -q "Running"; then
    echo "⚠️  Minikube n'est pas démarré. Démarrage en cours..."
    minikube start
else
    echo "✅ Minikube est déjà en cours d'exécution"
fi
echo ""

# 2. Configurer l'environnement Docker
echo "📌 Étape 2: Configuration de l'environnement Docker..."
eval $(minikube docker-env)
echo "✅ Environnement Docker configuré"
echo ""

# 3. Construction des images Docker
echo "📌 Étape 3: Construction des images Docker..."

echo "  🔨 Construction de l'image de l'application..."
cd app
docker build -t note-manager-app:latest .
cd ..

echo "  🔨 Construction de l'image de la base de données..."
cd database
docker build -t note-manager-db:latest .
cd ..

echo "✅ Images Docker construites avec succès"
echo ""

# 4. Vérifier les images
echo "📌 Étape 4: Vérification des images..."
docker images | grep note-manager
echo ""

# 5. Déploiement sur Kubernetes
echo "📌 Étape 5: Déploiement sur Kubernetes..."

echo "  📦 Déploiement de la base de données..."
kubectl apply -f k8s/db-deployment.yaml
kubectl apply -f k8s/db-service.yaml

echo "  📦 Déploiement de l'application..."
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml

echo "✅ Déploiement effectué avec succès"
echo ""

# 6. Attendre que les pods soient prêts
echo "📌 Étape 6: Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod -l app=note-manager-db --timeout=120s
kubectl wait --for=condition=ready pod -l app=note-manager-app --timeout=120s
echo "✅ Tous les pods sont prêts"
echo ""

# 7. Afficher le statut
echo "📌 Étape 7: Vérification du déploiement..."
echo ""
echo "Pods en cours d'exécution:"
kubectl get pods
echo ""
echo "Services disponibles:"
kubectl get services
echo ""

# 8. Ouverture de l'application
echo "============================================"
echo "✨ Déploiement terminé avec succès!"
echo "============================================"
echo ""
echo "🌐 Ouverture de l'application dans le navigateur..."
minikube service note-manager-service
echo ""
