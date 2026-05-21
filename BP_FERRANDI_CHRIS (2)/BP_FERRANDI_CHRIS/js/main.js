/* =============================================================
   Chrysalide — script principal
   - Menu mobile
   - Détection de langue / persistance localStorage
   - Onglets sur la page Menus
   - Validation et soumission du formulaire de réservation
     (Netlify Forms par défaut, avec fallback de simulation locale)
   - Compteurs de caractères
   - Honeypot anti-bot
   ============================================================= */

(function () {
    'use strict';

    /* ---------- Menu mobile ---------- */
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        });

        // Fermeture quand on clique sur un lien (mobile)
        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Persistance du choix de langue ---------- */
    // Au premier accès à la racine du site, on tente de détecter la langue
    // navigateur ; ensuite on respecte le choix utilisateur via localStorage.
    try {
        const path = window.location.pathname;
        const isEnglish = path.startsWith('/en/') || path.includes('/en/');
        const stored = localStorage.getItem('chrysalide-lang');

        // Mémorise le choix courant
        localStorage.setItem('chrysalide-lang', isEnglish ? 'en' : 'fr');

        // Détection automatique uniquement à la racine, sans choix déjà stocké
        if (!stored && (path === '/' || path === '/index.html' || path.endsWith('/index.html'))) {
            const nav = (navigator.language || 'fr').toLowerCase();
            if (nav.startsWith('en') && !isEnglish) {
                window.location.replace('en/index.html');
            }
        }
    } catch (e) {
        // localStorage indisponible (mode privé Safari) : on ignore silencieusement.
    }

    /* ---------- Onglets : page Menus + page Table (mêmes mécaniques) ---------- */
    function setupTabs(tabSel, panelSel) {
        const tabs = document.querySelectorAll(tabSel);
        const panels = document.querySelectorAll(panelSel);
        if (!tabs.length || !panels.length) return;
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('aria-controls');
                tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
                panels.forEach((p) => p.classList.remove('is-active'));
                tab.setAttribute('aria-selected', 'true');
                const panel = document.getElementById(target);
                if (panel) panel.classList.add('is-active');
            });
        });
    }
    setupTabs('.menu-tab', '.menu-panel');
    setupTabs('.table-tab', '.table-panel');

    /* Sélection d'onglet via le hash de l'URL (#menus, #carte, #boissons, etc.) */
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const tab = document.querySelector(`.table-tab[aria-controls="${hash}"]`);
        if (tab) tab.click();
    }

    /* ---------- Compteurs de caractères ---------- */
    document.querySelectorAll('textarea[data-max]').forEach((ta) => {
        const max = parseInt(ta.dataset.max, 10);
        const counter = document.createElement('div');
        counter.className = 'form-counter';
        counter.textContent = `0 / ${max}`;
        ta.insertAdjacentElement('afterend', counter);
        ta.addEventListener('input', () => {
            if (ta.value.length > max) ta.value = ta.value.slice(0, max);
            counter.textContent = `${ta.value.length} / ${max}`;
        });
    });

    /* ---------- Date minimale = lendemain ---------- */
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    /* ---------- Validation dynamique date / horaire ----------
       Adapte le sélecteur d'horaire au jour choisi :
       - Lundi (1) et dimanche (0) : restaurant fermé → on bloque la date.
       - Mercredi (3) et jeudi (4) : pas de service du midi → on désactive
         le déjeuner et on alerte l'utilisateur.
       - Autres : tous les créneaux disponibles.
       Met aussi à jour l'état du bouton de soumission. */
    const horaireSelect = document.getElementById('horaire');
    const submitBtn = document.querySelector('.btn-submit');
    const dateNote = document.getElementById('date-note');
    const horaireNote = document.getElementById('horaire-note');
    const menuPressentiSelect = document.getElementById('menu_pressenti');
    const menuPressentiNote = document.getElementById('menu-pressenti-note');

    /* Active/désactive le sélecteur "Menu pressenti" selon le créneau choisi.
       Les menus dégustation ne sont servis que le soir : le midi, c'est l'offre
       à la carte uniquement. */
    function refreshMenuPressentiForHoraire() {
        if (!horaireSelect || !menuPressentiSelect) return;
        const isEn = document.documentElement.lang === 'en';
        const v = horaireSelect.value;
        const isLunch = v && (v.startsWith('12:') || v.startsWith('13:'));

        if (isLunch) {
            menuPressentiSelect.value = '';
            menuPressentiSelect.disabled = true;
            if (menuPressentiNote) {
                menuPressentiNote.textContent = isEn
                    ? 'Tasting menus are served at dinner only. Lunch service is à la carte.'
                    : 'Les menus dégustation sont servis uniquement au dîner. Le service du midi propose la carte à la carte.';
                menuPressentiNote.dataset.visible = 'true';
            }
        } else {
            menuPressentiSelect.disabled = false;
            if (menuPressentiNote) {
                menuPressentiNote.textContent = '';
                menuPressentiNote.dataset.visible = 'false';
            }
        }
    }

    if (horaireSelect) {
        horaireSelect.addEventListener('change', refreshMenuPressentiForHoraire);
    }

    function refreshSlotsForDate() {
        if (!dateInput || !horaireSelect) return;
        const v = dateInput.value;
        const isEn = document.documentElement.lang === 'en';

        // Réinitialise toutes les options
        horaireSelect.querySelectorAll('option, optgroup').forEach((el) => {
            el.disabled = false;
        });
        if (dateNote) { dateNote.dataset.visible = 'false'; dateNote.textContent = ''; }
        if (horaireNote) { horaireNote.dataset.visible = 'false'; horaireNote.textContent = ''; }
        if (submitBtn) submitBtn.disabled = false;

        if (!v) return;

        const day = new Date(v + 'T12:00:00').getDay(); // 0 = dim, 1 = lun

        // Fermé : bloque la sélection et le bouton
        if (day === 0 || day === 1) {
            if (dateNote) {
                dateNote.textContent = isEn
                    ? (day === 0 ? 'The restaurant is closed on Sundays. Please choose another date.'
                                 : 'The restaurant is closed on Mondays. Please choose another date.')
                    : (day === 0 ? 'Le restaurant est fermé le dimanche. Merci de choisir une autre date.'
                                 : 'Le restaurant est fermé le lundi. Merci de choisir une autre date.');
                dateNote.dataset.visible = 'true';
            }
            if (submitBtn) submitBtn.disabled = true;
            return;
        }

        // Mercredi ou jeudi : pas de déjeuner → désactive les options 12:xx et 13:xx
        if (day === 3 || day === 4) {
            const lunchGroup = horaireSelect.querySelector('optgroup:first-of-type');
            if (lunchGroup) lunchGroup.disabled = true;
            horaireSelect.querySelectorAll('option').forEach((opt) => {
                if (opt.value && (opt.value.startsWith('12:') || opt.value.startsWith('13:'))) {
                    opt.disabled = true;
                }
            });
            // Si une heure de midi était déjà choisie, on la réinitialise
            const v2 = horaireSelect.value;
            if (v2 && (v2.startsWith('12:') || v2.startsWith('13:'))) {
                horaireSelect.value = '';
            }
            if (horaireNote) {
                horaireNote.textContent = isEn
                    ? 'Dinner service only on this day.'
                    : 'Service uniquement le soir ce jour-là.';
                horaireNote.dataset.visible = 'true';
            }
        }

        // Synchronise l'état du sélecteur "Menu pressenti" avec le créneau courant
        refreshMenuPressentiForHoraire();
    }

    if (dateInput) {
        dateInput.addEventListener('change', refreshSlotsForDate);
        dateInput.addEventListener('input', refreshSlotsForDate);
    }

    /* ---------- Soumission du formulaire de réservation ---------- */
    const form = document.getElementById('reservation-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = document.getElementById('form-message');
            const isEn = document.documentElement.lang === 'en';

            // Honeypot : si rempli, on simule un succès silencieux (anti-bot).
            const honey = form.querySelector('input[name="website"]');
            if (honey && honey.value.trim() !== '') {
                form.reset();
                showMessage(message, 'success', isEn
                    ? 'Thank you, we will get back to you within 24 hours.'
                    : 'Merci, nous reviendrons vers vous sous 24h.');
                return;
            }

            // Validation : date hors dimanche/lundi
            const data = new FormData(form);
            const dateVal = data.get('date');
            if (dateVal) {
                const d = new Date(dateVal);
                const day = d.getDay(); // 0 = dimanche, 1 = lundi
                if (day === 0 || day === 1) {
                    showMessage(message, 'error', isEn
                        ? 'The restaurant is closed on Sundays and Mondays. Please choose another date.'
                        : 'Le restaurant est fermé le dimanche et le lundi. Merci de choisir une autre date.');
                    return;
                }
            }

            // Validation : consentement RGPD
            if (!data.get('consent')) {
                showMessage(message, 'error', isEn
                    ? 'Please accept the privacy notice to send your request.'
                    : 'Merci d\'accepter la mention RGPD pour envoyer votre demande.');
                return;
            }

            // Envoi : Netlify Forms (data-netlify) ou fetch JSON serverless.
            const action = form.getAttribute('action');
            try {
                if (action && action !== '#') {
                    // Envoi POST classique vers fonction serverless / Netlify Forms
                    const res = await fetch(action, {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' },
                        body: new URLSearchParams(data).toString().length
                            ? new URLSearchParams(data)
                            : data
                    });
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                } else {
                    // Mode démo : aucune fonction backend configurée.
                    // L'équipe technique doit raccorder ce formulaire à un endpoint
                    // (Netlify Functions / Vercel / SMTP via Nodemailer) — cf. README.
                    await new Promise((r) => setTimeout(r, 400));
                }

                form.reset();
                document.querySelectorAll('.form-counter').forEach((c) => {
                    const ta = c.previousElementSibling;
                    if (ta && ta.dataset.max) c.textContent = `0 / ${ta.dataset.max}`;
                });
                showMessage(message, 'success', isEn
                    ? 'Thank you, we will get back to you within 24 hours.'
                    : 'Merci, nous reviendrons vers vous sous 24h.');
            } catch (err) {
                showMessage(message, 'error', isEn
                    ? 'An error occurred. Please contact us directly at chrysalidelyon@outlook.fr.'
                    : 'Une erreur est survenue, contactez-nous directement à chrysalidelyon@outlook.fr.');
            }
        });
    }

    function showMessage(el, state, text) {
        if (!el) return;
        el.dataset.state = state;
        el.textContent = text;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ---------- Animations subtiles : fade-in des sections au scroll ----------
       On observe les sections principales (hors hero / page-header qui sont
       au-dessus de la ligne de flottaison) et on leur ajoute la classe
       `.is-visible` au moment où elles entrent dans la fenêtre. La CSS gère
       la transition. Le `prefers-reduced-motion` est respecté côté CSS. */
    if ('IntersectionObserver' in window) {
        const targets = document.querySelectorAll(
            'main > section:not(.hero):not(.page-header)'
        );
        targets.forEach((el) => el.classList.add('reveal'));
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
        );
        targets.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- Effet d'ombre sur le header au scroll ---------- */
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => {
            if (window.pageYOffset > 30) {
                header.style.boxShadow = '0 2px 20px rgba(97, 27, 8, 0.08)';
            } else {
                header.style.boxShadow = 'none';
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
})();
