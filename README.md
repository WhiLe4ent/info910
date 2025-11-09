# Note Manager

## Description

Note Manager est une application web de gestion de notes simple et intuitive. Elle permet de créer, éditer, sauvegarder et supprimer des notes dans une interface utilisateur moderne et réactive.

### Fonctionnalités

- **Création de pages** : Ajoutez de nouvelles notes en un clic
- **Édition en temps réel** : Modifiez vos notes facilement avec un éditeur de texte simple
- **Support Markdown** : Écrivez en Markdown et prévisualisez le rendu en temps réel
- **Mode Preview** : Basculez entre mode édition et prévisualisation avec un simple bouton
- **Sauvegarde** : Enregistrez vos modifications dans une base de données MySQL
- **Suppression** : Supprimez les notes dont vous n'avez plus besoin
- **Actualisation** : Rechargez une note pour annuler les modifications non sauvegardées
- **Interface moderne** : Design épuré et responsive

## Architecture

Le projet est composé de trois parties principales :

### Frontend
- **HTML** (`app/public/index.html`) : Structure de la page
- **CSS** (`app/public/styles.css`) : Styles et mise en page
- **JavaScript** (`app/public/app.js`) : Logique client et interactions avec l'API

### Backend
- **Node.js + Express** (`app/server.js`) : Serveur API REST
- **API REST** : Endpoints pour gérer les pages (GET, POST, PUT, DELETE)

### Base de données
- **MySQL** : Stockage des notes avec table `pages`
- **Schéma** : id, title, content, created_at, updated_at

## Prérequis

### Pour Kubernetes (Minikube)
- **Minikube** : Version 1.25 ou supérieure
- **kubectl** : Version compatible avec votre cluster Kubernetes
- **Docker** : Pour construire les images localement

### Pour Docker Compose
- **Docker** : Version 20.10 ou supérieure
- **Docker Compose** : Version 1.29 ou supérieure

## Installation et Démarrage

### Méthode 1 : Avec Minikube (Kubernetes) - Recommandé

#### 🔐 Configuration des secrets

L'application utilise des **Kubernetes Secrets** pour stocker les informations sensibles comme les identifiants de base de données.

**Important** : Avant le premier déploiement, vous devez configurer vos identifiants dans le fichier `k8s/db-secret.yaml`.

Par défaut, le fichier contient :
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  mysql-root-password: "rootpassword"
  mysql-database: "mydb"
  mysql-user: "user"
  mysql-password: "password"
```

**Recommandations de sécurité** :
- Modifiez les mots de passe par défaut avant le déploiement
- Ne committez JAMAIS ce fichier avec des identifiants réels dans Git
- Pour la production, utilisez des outils comme `kubectl create secret` ou des gestionnaires de secrets externes
- Ajoutez `k8s/db-secret.yaml` à votre `.gitignore` si vous utilisez des identifiants réels

**Pour créer un secret manuellement** :
```bash
kubectl create secret generic db-secret \
  --from-literal=mysql-root-password=YOUR_ROOT_PASSWORD \
  --from-literal=mysql-database=mydb \
  --from-literal=mysql-user=YOUR_USER \
  --from-literal=mysql-password=YOUR_PASSWORD
```

---

#### 🚀 Déploiement automatique avec scripts

Pour simplifier le déploiement, des scripts automatisés sont disponibles :

**Linux/Mac :**
```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Déployer l'application
./scripts/deploy.sh

# Voir le statut de l'application
./scripts/status.sh

# Redémarrer l'application
./scripts/restart.sh

# Arrêter l'application (garde Minikube actif)
./scripts/stop.sh

# Supprimer complètement l'application et arrêter Minikube
./scripts/delete.sh
```

---

#### 📋 Déploiement manuel étape par étape

#### 1️⃣ Démarrer Minikube

```bash
minikube start
```

Vérifier que le cluster tourne :
```bash
kubectl get nodes
```

---

#### 2️⃣ Utiliser le Docker de Minikube

Se connecter au docker de minikube :
```bash
# Linux/Mac
eval $(minikube docker-env)

# Windows (PowerShell)
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

---

#### 3️⃣ Construire les images Docker

**Application Node.js :**
```bash
cd app
docker build -t note-manager-app:latest .
```

**Base de données MySQL :**
```bash
cd ../database
docker build -t note-manager-db:latest .
```

Vérifier que les images sont bien présentes :
```bash
docker images
```

Vous devriez voir :
```
REPOSITORY           TAG       IMAGE ID       CREATED         SIZE
note-manager-app     latest    ...            ...             ...
note-manager-db      latest    ...            ...             ...
```

---

#### 4️⃣ Déployer sur Kubernetes

Depuis la racine du projet :

```bash
# Créer d'abord le secret
kubectl apply -f k8s/db-secret.yaml

# Puis déployer les services
kubectl apply -f k8s/db-deployment.yaml
kubectl apply -f k8s/db-service.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

---

#### 5️⃣ Vérifier le déploiement

Vérifier que les pods sont en cours d'exécution :
```bash
kubectl get pods
```

Vérifier les services :
```bash
kubectl get services
```

---

#### 6️⃣ Accéder à l'application

Obtenir l'URL du service :
```bash
minikube service note-manager-service --url
```

Ou ouvrir directement dans le navigateur :
```bash
minikube service note-manager-service
```

L'application sera accessible via l'URL fournie.

---

#### 7️⃣ Arrêter et nettoyer

Supprimer tous les déploiements :
```bash
kubectl delete -f k8s/
```

Arrêter Minikube :
```bash
minikube stop
```

Supprimer complètement le cluster (optionnel) :
```bash
minikube delete
```

---

### Méthode 2 : Avec Docker Compose

1. **Clonez le projet** (si ce n'est pas déjà fait) :
   ```bash
   git clone <url-du-projet>
   cd info910
   ```

2. **Démarrez l'application** :
   ```bash
   docker compose up --build -d
   ```

3. **Accédez à l'application** :
   - Ouvrez votre navigateur et allez sur : `http://localhost:3000`

4. **Arrêter l'application** :
   ```bash
   docker compose down -v
   ```

---

### Méthode 3 : Développement local (sans Docker)

#### Prérequis supplémentaires
- Node.js (version 14 ou supérieure)
- MySQL Server (version 8.0 ou supérieure)

#### Étapes

1. **Configurez la base de données MySQL** :
   ```bash
   mysql -u root -p < database/init.sql
   ```

2. **Installez les dépendances Node.js** :
   ```bash
   cd app
   npm install
   ```

3. **Configurez les variables d'environnement** (optionnel) :
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_USER=user
   export DB_PASSWORD=password
   export DB_NAME=mydb
   ```

4. **Démarrez le serveur** :
   ```bash
   npm start
   ```

5. **Accédez à l'application** :
   - Ouvrez votre navigateur et allez sur : `http://localhost:3000`

## Structure du Projet

```
info910/
├── app/
│   ├── public/
│   │   ├── index.html      # Page principale
│   │   ├── styles.css      # Feuille de styles
│   │   └── app.js          # Logique JavaScript
│   ├── server.js           # Serveur Express + API
│   ├── package.json        # Dépendances Node.js
│   └── Dockerfile          # Configuration Docker pour l'app
├── database/
│   ├── init.sql            # Script d'initialisation de la base de données
│   └── Dockerfile          # Configuration Docker pour MySQL
├── k8s/
│   ├── db-secret.yaml          # Secret pour les identifiants de base de données
│   ├── app-deployment.yaml     # Deployment de l'application
│   ├── app-service.yaml        # Service de l'application
│   ├── db-deployment.yaml      # Deployment de la base de données
│   └── db-service.yaml         # Service de la base de données
├── scripts/
│   ├── deploy.sh           # Script de déploiement automatique
│   ├── stop.sh             # Script d'arrêt de l'application
│   ├── restart.sh          # Script de redémarrage
│   └── delete.sh           # Script de suppression des ressources
├── docker-compose.yml      # Orchestration Docker Compose
└── README.md               # Ce fichier
```

## API Endpoints

| Méthode | Endpoint           | Description                    |
|---------|-------------------|--------------------------------|
| GET     | `/api/pages`      | Récupère toutes les pages      |
| GET     | `/api/pages/:id`  | Récupère une page spécifique   |
| POST    | `/api/pages`      | Crée une nouvelle page         |
| PUT     | `/api/pages/:id`  | Met à jour une page existante  |
| DELETE  | `/api/pages/:id`  | Supprime une page              |

## Configuration

### Kubernetes Secrets

Pour Kubernetes, les identifiants de base de données sont stockés dans le fichier `k8s/db-secret.yaml` :

- `mysql-root-password` : Mot de passe root MySQL (par défaut : `rootpassword`)
- `mysql-database` : Nom de la base de données (par défaut : `mydb`)
- `mysql-user` : Utilisateur de la base de données (par défaut : `user`)
- `mysql-password` : Mot de passe de l'utilisateur (par défaut : `password`)

**Note de sécurité** : Ces valeurs sont référencées automatiquement par les déploiements via `secretKeyRef`.

### Variables d'environnement (Docker Compose)

Les variables suivantes peuvent être configurées dans le fichier `docker-compose.yml` :

- `DB_HOST` : Hôte de la base de données (par défaut : `database`)
- `DB_PORT` : Port de la base de données (par défaut : `3306`)
- `DB_USER` : Utilisateur de la base de données (par défaut : `user`)
- `DB_PASSWORD` : Mot de passe de la base de données (par défaut : `password`)
- `DB_NAME` : Nom de la base de données (par défaut : `mydb`)
- `PORT` : Port du serveur Node.js (par défaut : `3000`)
