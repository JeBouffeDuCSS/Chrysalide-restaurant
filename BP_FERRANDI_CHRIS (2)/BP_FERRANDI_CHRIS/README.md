# Chrysalide — Site internet

Site vitrine bilingue (FR/EN) du restaurant gastronomique **Chrysalide**, situé au 11 rue Chavanne, 69001 Lyon. Approche modernisée de la cuisson en croûte. Ouverture prévue en octobre 2026.

> *Concentrer, transformer, révéler.*

---

## Choix techniques

**Stack : HTML5 + CSS3 + JavaScript vanilla, sans framework.**

Le brief recommandait une solution légère, performante et facile à maintenir. Pour un site vitrine de 8 pages bilingues, sans contenu dynamique côté client, le HTML/CSS/JS pur s'impose : il est servi en pages statiques (idéal pour Lighthouse), n'introduit aucune dépendance, ne nécessite pas de build, et reste lisible par toute personne sachant éditer un fichier HTML. Pas de jQuery, pas de Bootstrap : CSS custom aligné sur la charte, JS isolé dans un seul fichier.

L'i18n est gérée par duplication de fichiers (FR à la racine, EN dans `/en/`). Les chaînes communes sont également externalisées dans `i18n/fr.json` et `i18n/en.json` comme **source de vérité** pour la maintenance — utile lors d'une future migration vers un build (Astro, 11ty…).

---

## Prérequis

- Un navigateur récent (Chrome / Firefox / Safari / Edge).
- Pour servir localement : Node.js (`npx serve`) ou Python (`python -m http.server`).

---

## Lancement local

Aucun build nécessaire. Depuis la racine du projet :

```bash
# Option 1 — Node.js
npx serve .

# Option 2 — Python
python -m http.server 8000

# Option 3 — VSCode : extension "Live Server" sur index.html
```

Le site est ensuite accessible à `http://localhost:3000` ou `http://localhost:8000`.

---

## Déploiement

Tous les fichiers étant statiques, le déploiement se fait par simple upload :

- **Netlify** : déposer le dossier complet via [drop.netlify.com](https://drop.netlify.com/) ou connecter le dépôt Git.
- **Vercel** : `vercel --prod` à la racine, framework détecté = « Other ».
- **OVH / hébergement classique** : transfert FTP vers `www/`.

Le fichier `robots.txt` et `sitemap.xml` sont fournis à la racine.

---

## Structure du projet

```
chrysalide-site/
├── index.html              # Accueil — récit narratif numéroté I·II·III·IV (FR)
├── maison.html             # La maison — concept + équipe + 6 producteurs (FR)
├── table.html              # La table — menus + carte + boissons (onglets) (FR)
├── reservation.html        # Formulaire de réservation (FR)
├── contact.html            # Coordonnées (FR)
├── presse.html             # Communiqué de presse — accès via footer (FR)
│
├── en/                     # Versions anglaises (mêmes pages)
│   ├── index.html
│   ├── maison.html
│   ├── table.html
│   └── ...
│
├── assets/
│   └── logo/
│       ├── chrysalide-logo.svg    # Wordmark + croûte brisée
│       └── favicon.svg
│
├── css/
│   └── styles.css          # Feuille de style unique (variables CSS)
│
├── js/
│   └── main.js             # Menu mobile, onglets, validation formulaire
│
├── i18n/
│   ├── fr.json             # Source de vérité des chaînes (FR)
│   └── en.json             # Source de vérité des chaînes (EN)
│
├── robots.txt
├── sitemap.xml
├── .env.example            # Variables pour la fonction d'envoi d'email
├── CHANGELOG.md
└── README.md
```

---

## Charte graphique

Variables CSS définies dans `css/styles.css` :

| Variable           | Couleur   | Rôle                              |
|--------------------|-----------|-----------------------------------|
| `--brun-profond`   | `#611b08` | Titres, accents forts             |
| `--beige-mineral`  | `#bea183` | Lignes, séparateurs, texte soutien|
| `--terracotta`     | `#c46a4a` | CTA, liens, hover, picto          |
| `--beige-dore`     | `#e8d3b8` | Fond principal                    |
| `--beige-clair`    | `#f3e8d4` | Sections claires (utilitaire)     |

> **Note** — le brief initial mentionnait `#e82ccb` pour le « beige doré », valeur erronée (magenta vif, incompatible avec l'identité). La valeur corrigée `#e8d3b8` est utilisée dans tout le projet. À reconfirmer formellement avec l'équipe.

**Typographies** : *Cormorant Garamond* (fallback de The Seasons) pour les titres, *Inter* pour le corps de texte — toutes deux via Google Fonts.

---

## Bilinguisme

- FR à la racine, EN dans `/en/`.
- Sélecteur **FR | EN** en haut à droite, sur toutes les pages.
- Détection automatique de la langue navigateur au premier accès (uniquement à la racine).
- Persistance du choix utilisateur via `localStorage`.
- Balises `hreflang` déclarées dans chaque `<head>`.

### Ajouter une langue (ex. italien)

1. Dupliquer le dossier `en/` en `it/`, traduire chaque page.
2. Ajouter `i18n/it.json` comme source de vérité.
3. Ajouter le lien dans le sélecteur de langue de chaque page (header).
4. Ajouter les balises `<link rel="alternate" hreflang="it" ...>` dans tous les `<head>`.
5. Mettre à jour `sitemap.xml`.

---

## Maintenance du contenu

### Changer un plat du menu

Éditer le fichier `menus.html` (FR) **et** `en/menus.html` (EN), bloc `<div class="menu-plat">`. Mettre à jour également `i18n/fr.json` et `i18n/en.json` si la chaîne est référencée.

### Changer un prix sur la carte

Éditer `carte.html` (FR) **et** `en/carte.html` (EN), bloc `<div class="carte-item-prix">`.

### Ajouter un producteur

Dans `maison.html` (FR) et `en/maison.html` (EN), copier un bloc `<article class="producteur">` existant et adapter nom, lieu, description, catégorie.

### Ajouter un article de presse

Dans `presse.html` (FR) et `en/presse.html` (EN), dupliquer un bloc `<article class="producteur">` et remplacer titre, média, date, extrait et lien.

### Changer l'email destinataire des réservations

Éditer le fichier `.env` (variable `MAIL_TO`). À reconfigurer côté plateforme de déploiement (Netlify Functions / Vercel Functions).

### Ajouter un créneau horaire

Dans `reservation.html` et `en/reservation.html`, ajouter une nouvelle balise `<option>` dans le `<select id="horaire">`.

---

## Formulaire de réservation

### Comportement actuel

Le formulaire (`<form id="reservation-form">`) utilise l'attribut `action="#"` par défaut : le JavaScript intercepte l'envoi, simule un succès et affiche un message de confirmation. **Aucun email réel n'est envoyé dans cette configuration locale.**

### Branchement à une fonction d'envoi

Deux options recommandées :

#### Option A — Netlify Forms (le plus simple)

1. Ajouter `data-netlify="true"` et `name="reservation"` sur la balise `<form>` (dans les deux versions de la page).
2. Ajouter un input caché pour le honeypot Netlify : `<input type="hidden" name="form-name" value="reservation">`.
3. Renseigner l'email destinataire dans le dashboard Netlify (Settings → Forms → Notifications).
4. Netlify gère automatiquement le stockage des soumissions et l'envoi d'email.

#### Option B — Fonction serverless (Netlify Functions / Vercel Functions)

1. Créer `/api/reservation` (Vercel) ou `/.netlify/functions/reservation` (Netlify).
2. Y implémenter l'envoi via Nodemailer / Resend / SendGrid — variables d'env dans `.env`.
3. Renseigner cet endpoint dans l'attribut `action` du formulaire.
4. Ajouter la vérification du honeypot (champ `website` doit rester vide), le rate limiting (3 soumissions / IP / heure), et l'envoi d'un email de confirmation au client.

Le template d'email destinataire attendu :
```
Sujet : [Réservation] {prenom} {nom} — {date} à {horaire} — {convives} convives
Corps : tous les champs + langue d'origine + horodatage + IP.
```

---

## SEO &amp; accessibilité

- Balises `<title>` et `<meta description>` uniques par page (FR &amp; EN).
- Open Graph configuré sur chaque page.
- Schema.org `Restaurant` en JSON-LD sur la home.
- `hreflang` FR/EN/x-default.
- `sitemap.xml` et `robots.txt` à la racine.
- Skip-link, focus visible, `aria-label`, `lang` correctement déclarés.
- Hiérarchie sémantique stricte (un seul `<h1>` par page).
- `prefers-reduced-motion` respecté.

---

## Placeholders « À CONFIRMER » / « À AJOUTER »

Les éléments suivants sont visibles sur le site sous forme de pastille terracotta et **doivent être complétés avant mise en ligne** :

- [ ] **Numéro de téléphone** (affiché sur `contact.html`, `reservation.html`)
- [ ] **Accessibilité PMR** (affiché sur `contact.html`)
- [ ] **Ligne de métro / d'accès** à valider (affiché sur `contact.html`)
- [ ] **Logo SVG officiel** à intégrer dans `/assets/logo/` (le SVG actuel est un placeholder reproduisant la composition du brief)
- [ ] **Photos professionnelles** : actuellement remplacées par des dégradés CSS. À intégrer dès le shooting reçu.
- [ ] **Mentions légales** et **politique de confidentialité** : pages à créer (les liens du footer pointent vers `contact.html` en attendant).

---

## Hors-scope (volontairement non implémenté)

Conformément au brief :

- Pas de système de paiement / e-commerce.
- Pas de blog ni d'actualités.
- Pas d'espace client.
- Pas de CMS (contenu directement dans le HTML, source de vérité dans `i18n/`).
- Pas d'intégration TheFork / Zenchef.
- Pas d'offre hiver, ni de carte des vins détaillée, ni d'accords mets-vins.
- Les grossistes (Transgourmet, Metro) n'apparaissent volontairement pas sur le site public.

---

## Contact projet

**Équipe Chrysalide** — Marc Boullier de Branche, Capucine Thoral, Romain Huc, Basile Foucteau, Christophe Goniakowski
[chrysalidelyon@outlook.fr](mailto:chrysalidelyon@outlook.fr) · [@chrysalide.lyon](https://instagram.com/chrysalide.lyon)
