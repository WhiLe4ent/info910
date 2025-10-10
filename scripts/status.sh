#!/bin/bash

# Script pour afficher le statut de l'application sur Minikube
# Affiche l'état des pods, services, et l'URL d'accès

echo "============================================"
echo "  Statut de Note Manager sur Minikube"
echo "============================================"
echo ""

# Vérifier si Minikube est en cours d'exécution
echo "📌 Statut de Minikube:"
if minikube status | grep -q "Running"; then
    echo "✅ Minikube est en cours d'exécution"
    echo ""
    minikube status
else
    echo "❌ Minikube n'est pas en cours d'exécution"
    echo ""
    echo "Pour démarrer l'application, utilisez:"
    echo "  ./scripts/deploy.sh"
    exit 1
fi

echo ""
echo "============================================"
echo ""

# Afficher les pods
echo "📦 Pods Kubernetes:"
echo ""
kubectl get pods -o wide

echo ""
echo "============================================"
echo ""

# Afficher les services
echo "🌐 Services Kubernetes:"
echo ""
kubectl get services

echo ""
echo "============================================"
echo ""

# Afficher les déploiements
echo "🚀 Déploiements Kubernetes:"
echo ""
kubectl get deployments

echo ""
echo "============================================"
echo ""

# Vérifier si l'application est prête
if kubectl get pods | grep -q "note-manager-app.*Running"; then
    echo "✅ L'application est en cours d'exécution"
    echo ""
    echo "Pour accéder à l'application:"
    echo "  minikube service note-manager-service"
    echo ""
    echo "Ou obtenez l'URL avec:"
    echo "  minikube service note-manager-service --url"
    echo ""
else
    echo "⚠️  L'application n'est pas encore prête"
    echo ""
    echo "Vérifiez les logs avec:"
    echo "  kubectl logs -l app=note-manager-app"
    echo "  kubectl logs -l app=note-manager-db"
    echo ""
fi

echo "============================================"
echo ""

# Afficher l'utilisation des ressources
echo "💾 Utilisation des ressources:"
echo ""
kubectl top pods 2>/dev/null || echo "⚠️  Metrics server non disponible (normal sur Minikube sans metrics-server activé)"

echo ""
echo "============================================"
echo ""
