.PHONY: help build deploy start stop restart status delete clean logs test

# Variables
APP_NAME = note-manager
NAMESPACE = default

help: ## Affiche l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Construit les images Docker
	@echo "Construction des images Docker..."
	@minikube status | grep -q "Running" || (echo "⚠️  Minikube n'est pas démarré. Démarrage..." && minikube start)

	eval $$(minikube docker-env) && \
	cd app && docker build -t $(APP_NAME)-app:latest . && cd .. && cd database && docker build -t $(APP_NAME)-db:latest . && cd ..
	@echo "✅ Images construites"

deploy: build ## Déploie l'application complète
	@echo "Déploiement de l'application..."
	kubectl apply -f k8s/db-secret.yaml
	kubectl apply -f k8s/app-configmap.yaml
	kubectl apply -f k8s/db-pvc.yaml
	kubectl apply -f k8s/db-deployment.yaml
	kubectl apply -f k8s/db-service.yaml
	kubectl apply -f k8s/app-deployment.yaml
	kubectl apply -f k8s/app-service.yaml
	kubectl apply -f k8s/network-policy.yaml
	@echo "Attente du démarrage des pods..."
	kubectl wait --for=condition=ready pod -l app=$(APP_NAME)-db --timeout=120s
	kubectl wait --for=condition=ready pod -l app=$(APP_NAME)-app --timeout=120s
	@echo "✅ Déploiement terminé"

start: ## Démarre Minikube et déploie l'application
	@echo "Démarrage de Minikube..."
	minikube start && minikube addons enable metrics-server && minikube addons enable ingress
	@make deploy

stop: ## Arrête l'application
	@echo "Arrêt de l'application..."
	kubectl delete -f k8s/ --ignore-not-found=true
	@echo "✅ Application arrêtée"

restart: ## Redémarre l'application
	@make stop
	@sleep 5
	@make deploy

status: ## Affiche le statut de l'application
	@echo "=== Statut Minikube ==="
	@minikube status || echo "Minikube n'est pas démarré"
	@echo ""
	@echo "=== Pods ==="
	@kubectl get pods -o wide
	@echo ""
	@echo "=== Services ==="
	@kubectl get services
	@echo ""
	@echo "=== Deployments ==="
	@kubectl get deployments

delete: stop ## Supprime l'application et arrête Minikube
	@echo "Arrêt de Minikube..."
	minikube stop
	@echo "✅ Suppression terminée"

clean: delete ## Supprime complètement le cluster Minikube
	@echo "Suppression du cluster Minikube..."
	minikube delete
	@echo "✅ Nettoyage terminé"

logs-app: ## Affiche les logs de l'application
	kubectl logs -l app=$(APP_NAME)-app --tail=100 -f

logs-db: ## Affiche les logs de la base de données
	kubectl logs -l app=$(APP_NAME)-db --tail=100 -f

logs: ## Affiche tous les logs
	kubectl logs -l app=$(APP_NAME)-app --tail=50
	kubectl logs -l app=$(APP_NAME)-db --tail=50

test: ## Teste l'application
	@echo "Test de l'endpoint health..."
	@curl -s $$(minikube service $(APP_NAME)-service --url)/health | jq . || echo "❌ Test échoué"
	@echo ""
	@echo "Test de l'endpoint ready..."
	@curl -s $$(minikube service $(APP_NAME)-service --url)/ready | jq . || echo "❌ Test échoué"

open: ## Ouvre l'application dans le navigateur
	minikube service $(APP_NAME)-service

port-forward: ## Crée un port-forward vers l'application
	kubectl port-forward svc/$(APP_NAME)-service 3000:3000

metrics: ## Affiche les métriques de l'application
	@curl -s $$(minikube service $(APP_NAME)-service --url)/metrics | jq .

describe-app: ## Décrit le déploiement de l'application
	kubectl describe deployment $(APP_NAME)-app-deployment

describe-db: ## Décrit le déploiement de la base de données
	kubectl describe deployment $(APP_NAME)-db-deployment

shell-app: ## Ouvre un shell dans un pod de l'application
	kubectl exec -it $$(kubectl get pod -l app=$(APP_NAME)-app -o jsonpath="{.items[0].metadata.name}") -- /bin/sh

shell-db: ## Ouvre un shell dans le pod de la base de données
	kubectl exec -it $$(kubectl get pod -l app=$(APP_NAME)-db -o jsonpath="{.items[0].metadata.name}") -- /bin/bash

db-console: ## Se connecte à la console MySQL
	kubectl exec -it $$(kubectl get pod -l app=$(APP_NAME)-db -o jsonpath="{.items[0].metadata.name}") -- mysql -u user -ppassword mydb