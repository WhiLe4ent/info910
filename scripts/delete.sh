#!/bin/bash

# Script pour supprimer complètement l'application et arrêter Minikube
# Nettoie toutes les ressources Kubernetes et arrête le cluster

set -e

echo "============================================"
echo "  Suppression complète de Note Manager"
echo "============================================"
echo ""

echo "⚠️  ATTENTION: Cette action va:"
echo "   - Supprimer tous les déploiements Kubernetes"
echo "   - Supprimer complètement le cluster Minikube"
echo "   - Effacer toutes les données et images Docker"
echo ""
read -p "Voulez-vous continuer? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 1
fi

echo ""
echo "📌 Étape 1: Suppression des déploiements Kubernetes..."
kubectl delete -f k8s/ --ignore-not-found=true

echo ""
echo "📌 Étape 2: Arrêt de Minikube..."
minikube stop

echo ""
echo "📌 Étape 3: Suppression complète du cluster Minikube..."
minikube delete

echo ""
echo "============================================"
echo "✅ Suppression terminée avec succès!"
echo "============================================"
echo ""
echo "Le cluster Minikube a été complètement supprimé."
echo ""
echo "Pour redémarrer l'application plus tard:"
echo "  ./scripts/deploy.sh"
echo ""
