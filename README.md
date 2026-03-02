# 📚 UNILIB — Bibliothèque Académique e-FRI(MVP Version 1.0)

Plateforme centralisée de ressources académiques destinée à l’ensemble des étudiants de l’Université d'Abomey-Calavi (UAC), facilitant l’accès aux supports de cours, documents pédagogiques et outils collaboratifs au sein des instituts de l’université.

## Liens utiles

Lien du cahier des charges : [Cahier des charges](https://docs.google.com/document/d/1sUvlyNgEHQm84dlpt3OQy4fFTZoAFhOnq76wpMOnKqw/edit?tab=t.0)

Lien vers l'application : [Unilib App](https://unilib-win5.vercel.app)

## Un glisser-deposer depuis votre file manager vers le readme dans github pour charger la video

## 🗂 Table des matières

1. [Présentation](#présentation)
2. [Stack Technique](#stack-technique)
3. [Installation & Démarrage](#installation--démarrage)
4. [Build & Production](#build--production)
5. [Structure du Projet](#structure-du-projet)
6. [Fonctionnalités](#fonctionnalités)
7. [Rôles & Accès](#rôles--accès)
8. [Identifiants de Test](#identifiants-de-test)
9. [Se connecter / S'inscrire](#se-connecter--sinscrire)
10. [Créer un compte Responsable](#créer-un-compte-responsable)
11. [Notes de développement](#notes-de-développement)

## Présentation

**UNILIB / e-FRI** est une application web monopage (SPA) permettant à la communauté de l'IFRI :

- d'accéder à des ressources académiques (cours, TDs, TPs, examens, projets) filtrées par filière et type ;
- de soumettre et modérer des ressources pédagogiques ;
- de consulter un emploi du temps interactif ;
- de dialoguer avec un assistant IA intégré ;
- de gérer les utilisateurs et les codes d'accès (espace admin).

**Mode actuel :** La plateforme fonctionne en **en ligne** : [https://unilib-win5.vercel.app/e-fri]

## Stack Technique

| Couche          | Technologie              |
| --------------- | ------------------------ |
| Framework UI    | React 18 + TypeScript    |
| Build           | Vite 5                   |
| Routage         | React Router DOM 6       |
| UI Components   | shadcn/ui (Radix UI)     |
| Style           | Tailwind CSS 3           |
| State / Session | Base de données + hooks  |
| Formulaires     | React Hook Form + Zod    |
| Backend         | Django Rest Framework    |
| Formulaires     | React Hook Form + Zod    |
| Requêtes        | TanStack Query           |
| Tests           | Vitest + Testing Library |


## Installation & Démarrage

### Prérequis

- **Node.js** ≥ 18 ([télécharger](https://nodejs.org/))
- **npm** ≥ 9 (inclus avec Node.js)

### Étapes

# 1. Cloner le dépôt

git clone <URL_DU_REPO>
cd UNILIB

# 2. Installer les dépendances

npm install

# 3. Lancer le serveur de développement

npm run dev

L'application sera accessible sur **http://localhost:8080** (ou le port affiché dans le terminal).

### Autres commandes utiles

# Vérifier les types TypeScript

npx tsc --noEmit

# Analyser le code (ESLint)

npm run lint

# Lancer les tests unitaires

npm test

# Lancer les tests en mode watch

npm run test:watch

## Build & Production

# Générer le bundle de production (dossier /dist)

npm run build

# Prévisualiser le build en local

npm run preview

## Structure du Projet

UNILIB/
├── public/ # Assets statiques publics
├── src/
│ ├── assets/ # Images, logos, photos
│ ├── components/ # Composants réutilisables (UI, landing, layout)
│ ├── data/ # Données fictives (mockData.ts)
│ ├── hooks/ # Hooks custom (useSession, useUserStats, etc.)
│ ├── layouts/ # DashboardLayout (sidebar, header, notifications)
│ ├── pages/ # Pages principales (EFriLanding, EFriSignup, etc.)
│ └── App.tsx # Routeur principal
├── unilib_backend
│ ├── authentication/
│ ├── backend_project
│ ├── media
│ ├── resources
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md # Ce fichier

## Fonctionnalités

| Module                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| 🏠 **Landing**         | Présentation de la plateforme, accès connexion/inscription    |
| 📂 **Ressources**      | Téléchargement, filtrage par filière et type, favoris         |
| 🗂 **Cours Pratiques** | Projets pratiques avec suivi de progression                   |
| 📅 **Emploi du Temps** | Calendrier hebdomadaire interactif                            |
| 🤖 **IA Assistant**    | Chat IA pour aide aux révisions (pas encore fonctionnel)                              |
| ⬆️ **Téléversement**   | Soumission de nouvelles ressources (responsable/admin)        |
| 👤 **Profil**          | Gestion des informations, statistiques, préférences, sécurité |
| 🔔 **Notifications**   | Suivi en temps réel, marquage lu au clic                      |
| 🛡 **Administration**  | Gestion des utilisateurs, ressources, codes responsable       |

## Rôles & Accès

| Rôle            | Inscription                                   | Accès                                                            |
| --------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| **Étudiant**    | Libre, tout email valide                      | Ressources, cours pratiques, emploi du temps, IA, profil         |
| **Responsable** | Code d'invitation requis (fourni par l'admin) | Tout + publication et gestion de ressources                      |
| **Admin**       | Compte créé manuellement                      | Contrôle total : modération, gestion utilisateurs, codes d'accès |

## Identifiants de Test

Ces comptes sont pré-enregistrés dans l'admin django et fonctionnent immédiatement sans configuration.

| Rôle           | Email                     | Mot de passe  |
| -------------- | ------------------------- | ------------- |
| 🎓 Étudiant    | `will@ifri.edu`           | `Wh@tever`    |
| 🧑‍🏫 Responsable | `marie.coord@outlook.com` | `C@ntusee` |
| 🛡 Admin       | `admin@unilib.bj`          | `admin123`    |

## Se connecter / S'inscrire

### Connexion

1. Accéder à `/e-fri` (page d'accueil e-FRI)
2. Cliquer sur **"Se connecter"**
3. Saisir l'**email** et le **mot de passe**
4. Cliquer sur **"Se connecter"** → redirection vers le tableau de bord

💡 **Mot de passe oublié ?** Cliquer sur le lien _"Mot de passe oublié"_ sur la page de connexion → `/e-fri/mot-de-passe-oublie`

🔵 **Connexion Google** : un bouton de connexion Google est également disponible sur la page de connexion (simulation).

### Inscription — Étudiant

1. Accéder à `/e-fri/inscription`
2. Sélectionner le rôle **"Étudiant"**
3. Remplir : **Nom**, **Prénom**, **Email**, **Filière**, **Mot de passe**
4. Accepter les CGU
5. Cliquer sur **"Créer mon compte"**

### Inscription — Responsable

1. Récupérer un **code d'invitation** valide auprès de l'administrateur (format `RESP-XXXX1234`)
2. Accéder à `/e-fri/inscription`
3. Sélectionner le rôle **"Responsable"**
4. Saisir le code d'invitation dans le champ dédié
5. Remplir les autres champs et valider

## Créer un compte Responsable (Workflow Admin)

1. Se connecter avec le compte **Admin** → aller dans **Administration → onglet "Codes Responsable"**
2. Cliquer sur **"Générer un code"** → un code unique `RESP-XXXX1234` est créé
3. **Copier et transmettre** le code au futur responsable (email, message, etc.)
4. Le responsable s'inscrit via `/e-fri/inscription` avec ce code
5. Le code est automatiquement marqué **"Utilisé"** et ne peut plus être réutilisé
6. L'admin peut consulter l'historique complet des codes (disponibles / utilisés)

## Notes de développement

- **Stockage :** toutes les données utilisateur, ressources, notifications et statistiques sont persistées dans le `localStorage` du navigateur. Aucune API externe n'est nécessaire.
- **Mode sombre :** disponible via le bouton ☀️/🌙 sur la page de profil (enregistré dans `localStorage`, clé `theme`).
- **Filières disponibles :** Genie Logiciel · Intelligence Artificielle · Securite Informatique · SEiot · Internet Multimedia
- **Types de ressources :** Cours · TD · TP · Examen · Correction · Projet

Le backend est construit avec **Python 3** et le framework **Django**. Il utilise **Django REST Framework (DRF)** pour fournir une API et **SimpleJWT** pour l'authentification.

## 🏗️ Architecture du Projet

Le dossier `unilib_backend/` est structuré comme suit :

### 1. Dossier `backend_project/`
C'est le dossier de configuration principale.
- `settings.py` : Contient toute la configuration (Apps, Middleware, JWT, CORS, et Base de données).
- `urls.py` : Définit les routes de base.

### 2. Dossier `authentication/`
Gère les comptes utilisateurs et les profils.
- `models.py` : Contient le modèle `User` (voir section base de données).
- `serializers.py` : Prépare les données pour être envoyées au Frontend (JSON).
- `views.py` : Logique de traitement des requêtes (Inscription, Connexion, Profil).

### 3. Dossier `resources/`
Gère les ressources.
- `models.py` : Contient le modèle `Resource` (voir section base de données).
- `serializers.py` : Prépare les données pour être envoyées au Frontend (JSON).
- `views.py` : Logique de traitement des requêtes (Affichage des fichiers, etc).

## 🗄️ Base de Données

### Type de Base de Données 
Pour la phase de développement, nous utilisons **SQLite**.
- **Fichier** : `unilib_backend/db.sqlite3`
- **Pourquoi ?** : SQLite est une base de données légère, sans serveur, qui stocke tout dans un seul fichier. C'est idéal pour le développement rapide et le partage de projet.

Pour le déploiement en production, nous utilisons **PostgreSQL** sur render.

### Schéma de la Table Utilisateur (`authentication_user`)
Nous utilisons un modèle utilisateur personnalisé qui remplace le modèle par défaut de Django. Voici les colonnes principales :

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | String | Identifiant unique (Email ou matricule). |
| `email` | String | Email institutionnel (@ifri.uac.bj). |
| `nom` | String | Nom de famille de l'étudiant. |
| `prenom` | String | Prénom de l'étudiant. |
| `filiere` | String | Branche d'étude (ex: Génie Logiciel). |
| `promotion` | String | Niveau d'étude (L1, L2, L3...). |
| `semestre` | String | Semestre actuel (S1, S2...). |
| `role` | Choice | `etudiant` (défaut) ou `admin`. |
| `avatar` | Image | Photo de profil (stockée dans `media/avatars/`). |

### Migrations
Toute modification du fichier `models.py` doit être récutée sur la base de données via :
1. `python manage.py makemigrations` (Prépare le changement).
2. `python manage.py migrate` (Applique le changement au fichier `.sqlite3` et à la base de données `PostgreSQL` lorsqu'on déploie).

## 🔐 Accès et Administration

### Django Admin
L'interface d'administration est accessible pour gérer directement les données.
- **URL** : [http://127.0.0.1:8000/admin/]
- **Super Utilisateur créés** :
  - **Login** : `admin`
  - **Mot de passe** : `admin123`

### Commandes Utiles
- **Lancer le serveur** : `python manage.py runserver`
- **Créer un nouveau super-admin** : `python manage.py createsuperuser`

## ⚙️ Configuration Spéciale (Settings)
- **CORS** : Configuré pour autoriser les requêtes provenant du Frontend (Vite/React).
- **JWT** : Les tokens expirent après 24h pour la sécurité.
- **MEDIA_URL** : Configuré pour servir les avatars téléchargés.

_Développé dans le cadre du Hackathon IFRI 2026 · © IFRI-UAC · Tous droits réservés_

