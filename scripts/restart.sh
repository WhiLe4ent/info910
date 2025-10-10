#!/bin/bash

# Script pour redémarrer l'application sur Minikube
# Arrête puis redéploie tous les composants

set -e

echo "============================================"
echo "  Redémarrage de Note Manager sur Minikube"
echo "============================================"
echo ""

echo "📌 Étape 1: Arrêt de l'application..."
kubectl delete -f k8s/ --ignore-not-found=true

echo ""
echo "⏳ Attente de la suppression complète..."
sleep 5
echo ""

echo "📌 Étape 2: Redéploiement de l'application..."

echo "  📦 Déploiement de la base de données..."
kubectl apply -f k8s/db-deployment.yaml
kubectl apply -f k8s/db-service.yaml

echo "  📦 Déploiement de l'application..."
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml

echo ""
echo "📌 Étape 3: Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod -l app=note-manager-db --timeout=120s
kubectl wait --for=condition=ready pod -l app=note-manager-app --timeout=120s

echo ""
echo "============================================"
echo "✨ Redémarrage terminé avec succès!"
echo "============================================"
echo ""

echo "État actuel:"
kubectl get pods
echo ""
kubectl get services
echo ""

echo "Pour accéder à l'application:"
echo "  minikube service note-manager-service"
echo ""
