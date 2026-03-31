/* ============================================
   CONFIGURATION GLOBALE
   ============================================ */
const CONFIG = {
    // Seuils et marges pour les observers
    observerThreshold: 0.15,
    observerRootMargin: '0px 0px -50px 0px',
    
    // Durées d'animation
    scrollDuration: 800,
    
    // Points de rupture responsive
    breakpoints: {
        mobile: 576,
        tablet: 992,
        desktop: 1200
    }
};

/* ============================================
   UTILITAIRES
   ============================================ */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce pour optimiser les performances
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle pour limiter les appels
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
   NAVIGATION STICKY & ACTIVE LINKS
   ============================================ */
class Navigation {
    constructor() {
        this.nav = $('#main-nav');
        this.navToggle = $('.nav-toggle');
        this.navLinks = $('.nav-links');
        this.navItems = $$('.nav-link');
        this.sections = $$('section[id]');
        this.lastScrollTop = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.highlightActiveSection();
    }
    
    setupEventListeners() {
        // Toggle menu mobile
        this.navToggle?.addEventListener('click', () => this.toggleMenu());
        
        // Fermer le menu au clic sur un lien
        this.navItems.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = $(targetId);
                
                if (target) {
                    this.smoothScrollTo(target);
                    this.closeMenu();
                }
            });
        });
        
        // Fermer le menu en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navLinks.classList.contains('active')) {
                this.closeMenu();
            }
        });
        
        // Gérer le scroll
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
            this.highlightActiveSection();
        }, 100));
    }
    
    toggleMenu() {
        this.navToggle.classList.toggle('active');
        this.navLinks.classList.toggle('active');
        document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : '';
    }
    
    closeMenu() {
        this.navToggle.classList.remove('active');
        this.navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ajouter/retirer la classe 'scrolled'
        if (scrollTop > 50) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
        
        this.lastScrollTop = scrollTop;
    }
    
    highlightActiveSection() {
        const scrollPosition = window.pageYOffset + 100;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    smoothScrollTo(target) {
        const targetPosition = target.offsetTop - 70;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = CONFIG.scrollDuration;
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        
        requestAnimationFrame(animation);
    }
    
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
}

/* ============================================
   SCROLL TO TOP BUTTON
   ============================================ */
class ScrollTopButton {
    constructor() {
        this.button = this.createButton();
        this.init();
    }
    
    createButton() {
        const btn = document.createElement('button');
        btn.className = 'scroll-top-btn';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Retour en haut');
        document.body.appendChild(btn);
        return btn;
    }
    
    init() {
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', throttle(() => {
            this.toggleVisibility();
        }, 100));
    }
    
    toggleVisibility() {
        if (window.pageYOffset > 500) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }
}

/* ============================================
   ANIMATIONS AU SCROLL
   ============================================ */
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: CONFIG.observerThreshold,
            rootMargin: CONFIG.observerRootMargin
        };
        this.init();
    }
    
    init() {
        this.setupFadeInObserver();
        this.setupCounterAnimation();
    }
    
    setupFadeInObserver() {
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
        
        const elementsToAnimate = [
            '.module-card',
            '.debouche-card',
            '.poursuite-card',
            '.key-point',
            '.specialite',
            '.contact-item',
            '.stat-item'
        ];
        
        elementsToAnimate.forEach(selector => {
            $$(selector).forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                fadeInObserver.observe(el);
            });
        });
    }
    
    setupCounterAnimation() {
        const counters = $$('.stat-number');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
        
        counters.forEach(counter => counterObserver.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count') || element.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }
}

/* ============================================
   FORMULAIRE DE CONTACT
   ============================================ */
class ContactForm {
    constructor() {
        this.form = $('.contact-form');
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validation en temps réel
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validation complète
        if (!this.validateForm()) {
            this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }
        
        // Récupérer les données
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Simulation d'envoi (à remplacer par votre logique d'envoi)
            await this.simulateSubmit(data);
            
            this.showNotification('Votre message a été envoyé avec succès !', 'success');
            this.form.reset();
        } catch (error) {
            this.showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
            console.error('Erreur d\'envoi:', error);
        }
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Vérifier si le champ est requis
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Ce champ est requis';
        }
        
        // Validation spécifique par type
        if (value && field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Email invalide';
            }
        }
        
        if (value && field.type === 'tel') {
            const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Numéro de téléphone invalide';
            }
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearError(field);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearError(field);
        
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentElement.appendChild(errorDiv);
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    simulateSubmit(data) {
        return new Promise((resolve) => {
            console.log('Données du formulaire:', data);
            setTimeout(resolve, 1000);
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close" aria-label="Fermer">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Bouton fermer
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-fermeture après 5 secondes
        setTimeout(() => {
            if (notification.classList.contains('show')) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

/* ============================================
   LAZY LOADING DES IMAGES
   ============================================ */
class LazyLoader {
    constructor() {
        this.images = $$('img[data-src]');
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback pour les navigateurs anciens
            this.loadAllImages();
        }
        
        this.setupErrorHandling();
    }
    
    setupIntersectionObserver() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        });
        
        this.images.forEach(img => imageObserver.observe(img));
    }
    
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
    }
    
    loadAllImages() {
        this.images.forEach(img => this.loadImage(img));
    }
    
    setupErrorHandling() {
        $$('img').forEach(img => {
            img.addEventListener('error', function() {
                // Image placeholder en cas d'erreur
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="Arial" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                this.classList.add('error-image');
            });
        });
    }
}

/* ============================================
   GESTION DES ONGLETS (si nécessaire)
   ============================================ */
class TabManager {
    constructor(selector) {
        this.tabContainers = $$(selector);
        if (this.tabContainers.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('[data-tab]');
            const panels = container.querySelectorAll('[data-panel]');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = tab.getAttribute('data-tab');
                    
                    // Désactiver tous les onglets et panneaux
                    tabs.forEach(t => t.classList.remove('active'));
                    panels.forEach(p => p.classList.remove('active'));
                    
                    // Activer l'onglet et le panneau ciblés
                    tab.classList.add('active');
                    const panel = container.querySelector(`[data-panel="${target}"]`);
                    if (panel) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }
}

/* ============================================
   MODAL / LIGHTBOX
   ============================================ */
class Modal {
    constructor() {
        this.modal = null;
        this.init();
    }
    
    init() {
        // Créer la structure de la modal
        this.createModal();
        
        // Attacher les événements aux éléments déclencheurs
        $$('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const content = trigger.getAttribute('data-modal');
                this.open(content);
            });
        });
    }
    
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Fermer">&times;</button>
                <div class="modal-body"></div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Événements de fermeture
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
        
        // Fermer avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }
    
    open(content) {
        const body = this.modal.querySelector('.modal-body');
        body.innerHTML = content;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ============================================
   RECHERCHE / FILTRAGE (optionnel)
   ============================================ */
class SearchFilter {
    constructor(inputSelector, itemsSelector) {
        this.input = $(inputSelector);
        this.items = $$(itemsSelector);
        
        if (this.input && this.items.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.input.addEventListener('input', debounce((e) => {
            this.filter(e.target.value);
        }, 300));
    }
    
    filter(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        this.items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(term)) {
                item.style.display = '';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
                item.classList.remove('fade-in');
            }
        });
        
        // Afficher un message si aucun résultat
        const visibleItems = Array.from(this.items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0 && term) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }
    
    showNoResults() {
        let noResultsMsg = $('.no-results-message');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.textContent = 'Aucun résultat trouvé';
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.style.padding = '2rem';
            noResultsMsg.style.color = 'var(--gray)';
            this.items[0].parentElement.appendChild(noResultsMsg);
        }
    }
    
    hideNoResults() {
        const noResultsMsg = $('.no-results-message');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

/* ============================================
   ACCORDÉON (optionnel)
   ============================================ */
class Accordion {
    constructor(selector) {
        this.accordions = $$(selector);
        if (this.accordions.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.accordions.forEach(accordion => {
            const header = accordion.querySelector('.accordion-header');
            const content = accordion.querySelector('.accordion-content');
            
            if (header && content) {
                header.addEventListener('click', () => {
                    const isActive = accordion.classList.contains('active');
                    
                    // Fermer tous les autres accordéons (optionnel)
                    // this.closeAll();
                    
                    if (isActive) {
                        this.close(accordion);
                    } else {
                        this.open(accordion);
                    }
                });
            }
        });
    }
    
    open(accordion) {
        const content = accordion.querySelector('.accordion-content');
        accordion.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
    }
    
    close(accordion) {
        const content = accordion.querySelector('.accordion-content');
        accordion.classList.remove('active');
        content.style.maxHeight = '0';
    }
    
    closeAll() {
        this.accordions.forEach(accordion => this.close(accordion));
    }
}

/* ============================================
   GESTION DES COOKIES (RGPD)
   ============================================ */
class CookieConsent {
    constructor() {
        this.cookieName = 'cookie_consent';
        this.cookieValue = localStorage.getItem(this.cookieName);
        
        if (!this.cookieValue) {
            this.showBanner();
        }
    }
    
    showBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>Ce site utilise des cookies pour améliorer votre expérience. En continuant à naviguer, vous acceptez notre utilisation des cookies.</p>
                <div class="cookie-actions">
                    <button class="btn btn-primary btn-accept">Accepter</button>
                    <button class="btn btn-secondary btn-decline">Refuser</button>
                </div>
            </div>
        `;
        
        // Styles inline pour le banner
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--dark);
            color: var(--white);
            padding: 1.5rem;
            z-index: var(--z-modal);
            box-shadow: var(--shadow-xl);
        `;
        
        document.body.appendChild(banner);
        
        // Événements
        banner.querySelector('.btn-accept').addEventListener('click', () => {
            this.accept();
            banner.remove();
        });
        
        banner.querySelector('.btn-decline').addEventListener('click', () => {
            this.decline();
            banner.remove();
        });
    }
    
    accept() {
        localStorage.setItem(this.cookieName, 'accepted');
        console.log('Cookies acceptés');
        // Ici, vous pouvez activer Google Analytics, etc.
    }
    
    decline() {
        localStorage.setItem(this.cookieName, 'declined');
        console.log('Cookies refusés');
    }
}

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */
class PerformanceMonitor {
    constructor() {
        if ('PerformanceObserver' in window) {
            this.observePerformance();
        }
    }
    
    observePerformance() {
        // Surveiller les métriques de performance
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('Performance metric:', entry.name, entry.startTime);
            }
        });
        
        perfObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    }
}

/* ============================================
   INITIALISATION GLOBALE
   ============================================ */
class App {
    constructor() {
        this.init();
    }
    
    init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }
    
    initComponents() {
        console.log('🚀 Initialisation de l\'application...');
        
        try {
            // Composants principaux
            new Navigation();
            new ScrollTopButton();
            new ScrollAnimations();
            new ContactForm();
            new LazyLoader();
            
            // Composants optionnels
            // new Modal();
            // new TabManager('.tabs-container');
            // new Accordion('.accordion');
            // new CookieConsent();
            // new PerformanceMonitor();
            
            // Initialiser les statistiques avec l'attribut data-count
            this.initStatsData();
            
            console.log('✅ Application initialisée avec succès !');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
        }
    }
    
    initStatsData() {
        // Ajouter l'attribut data-count aux statistiques
        const statNumbers = $$('.stat-number');
        statNumbers.forEach(stat => {
            if (!stat.hasAttribute('data-count')) {
                stat.setAttribute('data-count', stat.textContent);
            }
        });
    }
}

/* ============================================
   DÉMARRAGE DE L'APPLICATION
   ============================================ */
new App();

/* ============================================
   GESTION DES ERREURS GLOBALES
   ============================================ */
window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejetée:', e.reason);
});

/* ============================================
   EXPOSER CERTAINES FONCTIONS GLOBALEMENT
   ============================================ */
window.BTS_SIO = {
    version: '1.0.0',
    scrollToElement: (selector) => {
        const element = $(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    showNotification: (message, type = 'info') => {
        const form = new ContactForm();
        form.showNotification(message, type);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");
    const rejectBtn = document.getElementById("reject-cookies");
  
    // 1. Vérifie si l'utilisateur a déjà donné ou refusé son consentement
    if (!localStorage.getItem("cookieConsent")) {
      // Si aucun choix n'est fait, on affiche la bannière
      cookieBanner.classList.remove("hidden");
    } else if (localStorage.getItem("cookieConsent") === "accepted") {
      // Si déjà accepté, on charge les scripts d'analyse (ex: Google Analytics)
      loadAnalytics();
    }
  
    // 2. Action au clic sur "Tout accepter"
    acceptBtn.addEventListener("click", function() {
      localStorage.setItem("cookieConsent", "accepted"); // Sauvegarde le choix
      cookieBanner.classList.add("hidden"); // Cache la bannière
      loadAnalytics(); // Lance les cookies de suivi
      console.log("Les cookies ont été acceptés.");
    });
  
    // 3. Action au clic sur "Tout refuser"
    rejectBtn.addEventListener("click", function() {
      localStorage.setItem("cookieConsent", "rejected"); // Sauvegarde le refus
      cookieBanner.classList.add("hidden"); // Cache la bannière
      console.log("Les cookies ont été refusés.");
    });
  });
  
  // Fonction pour charger les scripts qui nécessitent un consentement (Analytics, etc.)
  function loadAnalytics() {
    console.log("Chargement des scripts Google Analytics / Matomo...");
    // C'est ici que tu inséreras la balise <script> de ton outil d'analyse
    // Par exemple, en créant un élément script dynamiquement et en l'ajoutant au head.
  }
  

console.log('%c🎓 BTS SIO - Lycée Saint-Louis', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('%cVersion: ' + window.BTS_SIO.version, 'color: #10b981;');
