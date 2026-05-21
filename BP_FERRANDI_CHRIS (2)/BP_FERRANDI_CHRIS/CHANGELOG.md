# Changelog

Toutes les évolutions notables du site Chrysalide.

## [1.0.0] — 2026-05-11

### Choix techniques majeurs

- **Stack** : HTML5 + CSS3 + JavaScript vanilla — pas de framework, pas de build.
  Justification : site vitrine 8 pages bilingues, sans contenu dynamique → solution la plus légère et la plus performante.
- **Bilinguisme** : duplication des pages (`/` pour FR, `/en/` pour EN), source de vérité dans `i18n/*.json`.
- **Formulaire de réservation** : `action="#"` par défaut, intercepté par JS. À brancher sur Netlify Forms ou fonction serverless avant production (cf. README).
- **Cartographie** : iframe OpenStreetMap (pas de tracking Google).
- **Charte** : la couleur « beige doré » fournie dans le brief (`#e82ccb`, magenta vif) a été corrigée en `#e8d3b8` — cohérente avec le moodboard.
  À reconfirmer formellement avec l'équipe.

### Inclus

- 8 pages × 2 langues = 16 pages HTML statiques.
- Charte graphique respectée : palette, typographies (Cormorant Garamond + Inter), wabi-sabi.
- Logo SVG (placeholder reproduisant la composition du brief — wordmark + croûte brisée).
- Schema.org Restaurant en JSON-LD.
- Hreflang FR/EN/x-default sur chaque page.
- `sitemap.xml`, `robots.txt`.
- Skip-link, focus visible, contrastes WCAG AA, `prefers-reduced-motion`.
- Honeypot anti-bot dans le formulaire.
- Compteurs de caractères automatiques sur les textarea avec `data-max`.
- Validation côté client : minlength, date ≥ J+1, exclusion dimanche/lundi, consentement RGPD.
- Onglets accessibles (rôles ARIA) sur la page Menus.

### À compléter avant mise en ligne

Cf. section « Placeholders » du README — horaires précis, téléphone, accessibilité PMR, logo officiel, photos pro, mentions légales, branchement de la fonction d'envoi d'email.
