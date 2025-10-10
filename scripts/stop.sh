#!/bin/bash

# Script pour arrêter l'application sur Minikube
# Supprime tous les déploiements mais garde Minikube en cours d'exécution

set -e

echo "============================================"
echo "  Arrêt de Note Manager sur Minikube"
echo "============================================"
echo ""

echo "📌 Suppression des déploiements Kubernetes..."
kubectl delete -f k8s/ --ignore-not-found=true

echo ""
echo "✅ Application arrêtée avec succès"
echo ""
echo "Note: Minikube est toujours en cours d'exécution."
echo "Pour arrêter complètement Minikube, utilisez: ./scripts/delete.sh"
echo ""

# Afficher l'état
echo "État actuel:"
kubectl get pods
echo ""
kubectl get services
echo ""
