# Grist Project Manager Widget

> **Author:** Said Hamadou
> **License:** Apache-2.0

---

*[English](#english) | [Français](#français)*

---

<a id="english"></a>

## 🇬🇧 English

Project management widget for Grist with Kanban board, table view, Gantt chart, and task templates.

**Widget URL:** `https://isaytoo.github.io/grist-project-manager-widget/`

### 🚀 Quick Start

1. In Grist, click **"Add widget to page"**
2. Select **"Custom"** as the widget type
3. Enter the custom widget URL:
   ```
   https://isaytoo.github.io/grist-project-manager-widget/
   ```
4. Set the access level to **"Full document access"**
5. Done! Start managing your projects.

### 📋 Features

- **Kanban board**: Drag & drop tasks between columns (To Do, In Progress, Done)
- **Table view**: Advanced inline editing with search, sort, and filters
- **Gantt chart**: Timeline with days, weeks, months, 2-year and 10-year views, plus a custom period with zoom +/- from 6 weeks up to 20 years
- **Task templates**: Create and reuse pre-formatted task models
- **Task management**: Title, status, priority, assignee, start date, due date
- **Statistics dashboard**: Total, to do, in progress, completed counts
- **Search & filter**: By status, priority, and keywords
- **Multi-select filters**: Role, person, group, category, tag, task health and custom fields — several values per filter
- **Several tags per task**, and a **task health** sign on the card (☀️ on track, ☁️ at risk, ⛈️ stalled)
- **Subtasks in the calendar**, unfolded under their task, and a **per-task subtask archive**
- **Personal default view**: each user saves the tab, filters and sorting they want on opening
- **Templates with a project and subtasks**; a person can belong to **several groups**
- **Bilingual interface** (French / English, auto-detected)
- **🆕 Column mapping system**: Map your own existing Grist tables and columns (see [GUIDE_MAPPING.md](GUIDE_MAPPING.md))

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

Tests run the real page and script against an in-memory Grist document:

```bash
cd tests && npm install && node tout.js
```

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

**URL du widget :** `https://isaytoo.github.io/grist-project-manager-widget/`

### 🚀 Utilisation rapide

1. Dans Grist, cliquez sur **"Ajouter un widget à la page"**
2. Sélectionnez **"Personnalisé"** comme type de widget
3. Entrez l'URL :
   ```
   https://isaytoo.github.io/grist-project-manager-widget/
   ```
4. Définissez le niveau d'accès sur **"Full document access"**
5. C'est prêt ! Commencez à gérer vos projets.

### 📋 Fonctionnalités

- **Tableau Kanban** : Glisser-déposer les tâches entre colonnes (À faire, En cours, Terminé)
- **Vue tableau** : Édition inline avancée avec recherche, tri et filtres
- **Diagramme de Gantt** : vues jours, semaines, mois, 2 ans et 10 ans, plus une période libre avec zoom +/- de 6 semaines à 20 ans
- **Templates de tâches** : Créez et réutilisez des modèles de tâches préformatés
- **Gestion des tâches** : Titre, statut, priorité, assigné, date de début, échéance
- **Tableau de bord** : Statistiques total, à faire, en cours, terminées
- **Recherche & filtres** : Par statut, priorité et mots-clés
- **Filtres à choix multiples** : rôle, personne, groupe, catégorie, tag, météo et champs personnalisés — plusieurs valeurs par filtre
- **Plusieurs tags par tâche**, et une **météo** affichée sur la carte (☀️ avance bien, ☁️ risque de s'arrêter, ⛈️ arrêtée)
- **Sous-tâches dans le calendrier**, dépliées sous leur tâche, et une **archive de sous-tâches propre à chaque tâche**
- **Vue par défaut personnelle** : chacun enregistre l'onglet, les filtres et les tris qu'il veut retrouver à l'ouverture
- **Modèles avec projet et sous-tâches** ; une personne peut appartenir à **plusieurs groupes**
- **Interface bilingue** (Français / Anglais, détection automatique)
- **🆕 Système de mapping de colonnes** : Mappez vos propres tables et colonnes Grist existantes (voir [GUIDE_MAPPING.md](GUIDE_MAPPING.md))

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

Les tests exécutent la vraie page et le vrai script face à un document Grist tenu en mémoire :

```bash
cd tests && npm install && node tout.js
```

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

## 🔔 Notifications & e-mails

Notifications dans l'app (automatiques) + e-mail optionnel quand un utilisateur est concerné par l'ajout/modification d'une tâche → **guide complet : [EMAIL-NOTIFICATIONS.md](EMAIL-NOTIFICATIONS.md)**
(webhook Grist → n8n ou Power Automate ; workflows prêts à l'emploi pour Gmail / Outlook / Zimbra-SMTP, valable auto-hébergé et grist.com).

## 🔗 Resources / Ressources

- [Notifications & e-mails (guide)](EMAIL-NOTIFICATIONS.md) · [Guide Power Automate](POWER-AUTOMATE-GUIDE.md)
- [Grist Custom Widgets Documentation](https://support.getgrist.com/widget-custom/)
- [Grist Plugin API](https://support.getgrist.com/code/modules/grist_plugin_api/)
- [GristUp Widget Marketplace](https://www.gristup.fr)
