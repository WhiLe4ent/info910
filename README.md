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

- **Docker** : Version 20.10 ou supérieure
- **Docker Compose** : Version 1.29 ou supérieure

## Installation et Démarrage

### Méthode 1 : Avec Docker Compose (Recommandé)

1. **Clonez le projet** (si ce n'est pas déjà fait) :
   ```bash
   git clone <url-du-projet>
   cd info910
   ```

2. **Démarrez l'application** :
   ```bash
   docker-compose up --build
   ```

3. **Accédez à l'application** :
   - Ouvrez votre navigateur et allez sur : `http://localhost:3000`

4. **Arrêter l'application** :
   ```bash
   # Appuyez sur Ctrl+C dans le terminal, puis :
   docker-compose down
   ```

### Méthode 2 : Développement local (sans Docker)

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
├── docker-compose.yml      # Orchestration des services
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

### Variables d'environnement

Les variables suivantes peuvent être configurées dans le fichier `docker-compose.yml` :

- `DB_HOST` : Hôte de la base de données (par défaut : `database`)
- `DB_PORT` : Port de la base de données (par défaut : `3306`)
- `DB_USER` : Utilisateur de la base de données (par défaut : `user`)
- `DB_PASSWORD` : Mot de passe de la base de données (par défaut : `password`)
- `DB_NAME` : Nom de la base de données (par défaut : `mydb`)
- `PORT` : Port du serveur Node.js (par défaut : `3000`)

## Utilisation de Markdown

Note Manager supporte le format Markdown pour la rédaction de vos notes. Voici quelques exemples de syntaxe :

### Titres
```markdown
# Titre niveau 1
## Titre niveau 2
### Titre niveau 3
```

### Formatage de texte
```markdown
**Texte en gras**
*Texte en italique*
`Code inline`
```

### Listes
```markdown
- Item 1
- Item 2
  - Sous-item

1. Premier élément
2. Deuxième élément
```

### Code
```markdown
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`
```

### Liens et images
```markdown
[Texte du lien](https://example.com)
![Alt text](url-de-image.jpg)
```

### Autres
```markdown
> Citation

---
Séparateur horizontal

| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Données   | Données   |
```

Pour prévisualiser votre Markdown, cliquez simplement sur le bouton **"Preview"** dans l'éditeur. Cliquez sur **"Edit"** pour revenir en mode édition.

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla JS), Marked.js (rendu Markdown)
- **Backend** : Node.js, Express.js
- **Base de données** : MySQL 8.0
- **Conteneurisation** : Docker, Docker Compose

## Contribution

Pour contribuer au projet :

1. Créez une branche pour votre fonctionnalité
2. Effectuez vos modifications
3. Testez l'application
4. Soumettez une pull request

## Licence

Ce projet est à but éducatif.
