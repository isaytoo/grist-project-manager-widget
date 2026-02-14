# Grist Project Manager Widget

> **Author:** Said Hamadou
> **License:** Apache-2.0

---

*[English](#english) | [Français](#français)*

---

<a id="english"></a>

## 🇬🇧 English

Project management widget for Grist with Kanban board, table view, Gantt chart, and task templates.

**Widget URL:** `https://grist-project-manager-widget.vercel.app/index.html`

### 🚀 Quick Start

1. In Grist, click **"Add widget to page"**
2. Select **"Custom"** as the widget type
3. Enter the custom widget URL:
   ```
   https://grist-project-manager-widget.vercel.app/index.html
   ```
4. Set the access level to **"Full document access"**
5. Done! Start managing your projects.

### 📋 Features

- **Kanban board**: Drag & drop tasks between columns (To Do, In Progress, Done)
- **Table view**: Advanced inline editing with search, sort, and filters
- **Gantt chart**: Timeline visualization with year navigation, zoom levels (days, weeks, months, full year)
- **Task templates**: Create and reuse pre-formatted task models
- **Task management**: Title, status, priority, assignee, start date, due date
- **Statistics dashboard**: Total, to do, in progress, completed counts
- **Search & filter**: By status, priority, and keywords
- **Bilingual interface** (French / English, auto-detected)

### 🔒 Security

- XSS protection on all user inputs
- Identifier sanitization for Grist compatibility
- Input validation before submission

### 🛠️ Local Development

```bash
git clone https://github.com/isaytoo/grist-project-manager-widget.git
cd grist-project-manager-widget
python3 -m http.server 8091
```

Then in Grist, use: `http://localhost:8091/index.html`

### ⚙️ Required Configuration

The widget requires **Full document access** to:
- Create and manage task tables
- Read and write task data
- Manage task templates

### 📁 File Structure

```
grist-project-manager-widget/
├── index.html       # Widget UI (HTML + CSS)
├── widget.js        # JavaScript logic (Kanban, Table, Gantt, i18n)
├── package.json     # Metadata
├── vercel.json      # Vercel config (iframe headers)
├── .gitignore
└── README.md
```

---

<a id="français"></a>

## 🇫🇷 Français

Widget de gestion de projets pour Grist avec tableau Kanban, vue tableau, diagramme de Gantt et templates de tâches.

**URL du widget :** `https://grist-project-manager-widget.vercel.app/index.html`

### 🚀 Utilisation rapide

1. Dans Grist, cliquez sur **"Ajouter un widget à la page"**
2. Sélectionnez **"Personnalisé"** comme type de widget
3. Entrez l'URL :
   ```
   https://grist-project-manager-widget.vercel.app/index.html
   ```
4. Définissez le niveau d'accès sur **"Full document access"**
5. C'est prêt ! Commencez à gérer vos projets.

### 📋 Fonctionnalités

- **Tableau Kanban** : Glisser-déposer les tâches entre colonnes (À faire, En cours, Terminé)
- **Vue tableau** : Édition inline avancée avec recherche, tri et filtres
- **Diagramme de Gantt** : Visualisation timeline avec navigation par année, niveaux de zoom (jours, semaines, mois, année complète)
- **Templates de tâches** : Créez et réutilisez des modèles de tâches préformatés
- **Gestion des tâches** : Titre, statut, priorité, assigné, date de début, échéance
- **Tableau de bord** : Statistiques total, à faire, en cours, terminées
- **Recherche & filtres** : Par statut, priorité et mots-clés
- **Interface bilingue** (Français / Anglais, détection automatique)

### 🔒 Sécurité

- Protection XSS sur toutes les entrées utilisateur
- Sanitization des identifiants pour compatibilité Grist
- Validation des entrées avant soumission

### 🛠️ Développement local

```bash
git clone https://github.com/isaytoo/grist-project-manager-widget.git
cd grist-project-manager-widget
python3 -m http.server 8091
```

Puis dans Grist, utilisez : `http://localhost:8091/index.html`

### ⚙️ Configuration requise

Le widget nécessite un **accès complet au document** pour :
- Créer et gérer les tables de tâches
- Lire et écrire les données des tâches
- Gérer les templates de tâches

### 📁 Structure des fichiers

```
grist-project-manager-widget/
├── index.html       # Interface HTML + CSS du widget
├── widget.js        # Logique JavaScript (Kanban, Tableau, Gantt, i18n)
├── package.json     # Métadonnées
├── vercel.json      # Configuration Vercel (headers iframe)
├── .gitignore
└── README.md
```

---

## 🔗 Resources / Ressources

- [Grist Custom Widgets Documentation](https://support.getgrist.com/widget-custom/)
- [Grist Plugin API](https://support.getgrist.com/code/modules/grist_plugin_api/)
- [GristUp Widget Marketplace](https://www.gristup.fr)
