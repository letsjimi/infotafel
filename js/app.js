/**
 * Digitale Infotafel - Hauptanwendung
 * Professionelle Slideshow-App für Display-Screens
 */

'use strict';

/**
 * Hauptklasse der Infotafel-Anwendung
 */
class InfoTafel {
    constructor() {
        // DOM-Elemente
        this.gridContainer = document.getElementById('grid-container');
        this.loadingIndicator = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.errorDetails = document.getElementById('error-details');
        this.controlMenu = document.getElementById('control-menu');
        this.menuTrigger = document.getElementById('menu-trigger');
        this.textOverlay = document.getElementById('text-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayText = document.getElementById('overlay-text');
        this.clockTime = document.getElementById('clock-time');
        this.clockDate = document.getElementById('clock-date');
        
        // Konfigurations-Daten
        this.config = {
            images: [],
            transition: 'fade',
            speed: 5,
            gridLayout: 1,
            showClock: true,
            showTextOverlay: true,
            defaultTexts: []
        };
        
        // Zustandsvariablen
        this.isPlaying = true;
        this.currentSlide = 0;
        this.slideTimer = null;
        this.isMenuVisible = false;
        this.menuTimeout = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // Initialisierung
        this.init();
    }
    
    /**
     * Initialisiert die Anwendung
     */
    async init() {
        try {
            // Konfiguration laden
            await this.loadConfig();
            
            // UI initialisieren
            this.initUI();
            
            // Event-Listener registrieren
            this.initEventListeners();
            
            // Uhrzeit starten
            this.initClock();
            
            // Slideshow starten
            this.initSlideshow();
            
            // Lade-Indikator ausblenden
            this.hideLoading();
            
            console.log('✓ Infotafel erfolgreich initialisiert');
        } catch (error) {
            console.error('✗ Fehler bei der Initialisierung:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Lädt die Konfiguration aus der JSON-Datei
     */
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const userConfig = await response.json();
            
            // Mit Defaults zusammenführen
            this.config = {
                ...this.config,
                ...userConfig
            };
            
            // Validiere Konfiguration
            this.validateConfig();
            
        } catch (error) {
            console.warn('Konfiguration konnte nicht geladen werden, verwende Defaults:', error);
            // Fallback für Demo-Zwecke
            this.config.images = this.getDemoImages();
        }
    }
    
    /**
     * Validiert die Konfigurationswerte
     */
    validateConfig() {
        // Geschwindigkeit validieren (3-30 Sekunden)
        this.config.speed = Math.max(3, Math.min(30, this.config.speed));
        
        // Grid-Layout validieren (1, 2 oder 3)
        const validLayouts = [1, 2, 3];
        if (!validLayouts.includes(parseInt(this.config.gridLayout))) {
            this.config.gridLayout = 1;
        }
        
        // Transition validieren
        const validTransitions = ['fade', 'slide', 'zoom'];
        if (!validTransitions.includes(this.config.transition)) {
            this.config.transition = 'fade';
        }
        
        // Sicherstellen, dass Images ein Array ist
        if (!Array.isArray(this.config.images)) {
            this.config.images = [];
        }
        
        // Falls keine Bilder, Demo-Bilder verwenden
        if (this.config.images.length === 0) {
            this.config.images = this.getDemoImages();
        }
    }
    
    /**
     * Generiert Demo-Bilder (Platzhalter)
     */
    getDemoImages() {
        const demoTexts = [
            { title: 'Willkommen', text: 'Neuen Inhalt über config.json hinzufügen' },
            { title: 'Hinweis', text: 'Bilder im /assets/ Ordner ablegen' },
            { title: 'Konfiguration', text: 'Einstellungen in config.json anpassen' }
        ];
        
        return [
            { src: 'https://picsum.photos/1920/1080?random=1', text: demoTexts[0] },
            { src: 'https://picsum.photos/1920/1080?random=2', text: demoTexts[1] },
            { src: 'https://picsum.photos/1920/1080?random=3', text: demoTexts[2] },
            { src: 'https://picsum.photos/1920/1080?random=4', text: demoTexts[0] },
            { src: 'https://picsum.photos/1920/1080?random=5', text: demoTexts[1] },
            { src: 'https://picsum.photos/1920/1080?random=6', text: demoTexts[2] }
        ];
    }
    
    /**
     * Initialisiert das UI
     */
    initUI() {
        // Grid-Layout setzen
        this.setGridLayout(this.config.gridLayout);
        
        // Grid-Items erstellen
        this.createGridItems();
        
        // Formular-Werte setzen
        document.getElementById('transition-type').value = this.config.transition;
        document.getElementById('slide-speed').value = this.config.speed;
        document.getElementById('grid-layout').value = this.config.gridLayout;
        document.getElementById('speed-value').textContent = `${this.config.speed}s`;
        
        // Uhrzeit-Widget sichtbarkeit
        if (!this.config.showClock) {
            this.clockTime.parentElement.style.display = 'none';
        }
    }
    
    /**
     * Setzt das Grid-Layout via CSS Custom Properties
     */
    setGridLayout(layout) {
        const root = document.documentElement;
        root.style.setProperty('--grid-columns', layout);
        root.style.setProperty('--grid-rows', layout);
        
        // Anzahl sichtbarer Items
        this.visibleItems = layout * layout;
        this.config.gridLayout = parseInt(layout);
    }
    
    /**
     * Erstellt die Grid-Items basierend auf dem Layout
     */
    createGridItems() {
        this.gridContainer.innerHTML = '';
        this.gridItems = [];
        
        for (let i = 0; i < this.visibleItems; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.setAttribute('data-index', i);
            
            // Slide-Container für Übergänge
            const slideContainer = document.createElement('div');
            slideContainer.className = 'slide-container';
            item.appendChild(slideContainer);
            
            this.gridContainer.appendChild(item);
            this.gridItems.push({
                element: item,
                container: slideContainer,
                currentImage: null
            });
        }
    }
    
    /**
     * Initialisiert die Slideshow
     */
    initSlideshow() {
        // Erste Bilder laden
        this.loadImages(0);
        
        // Slideshow-Timer starten
        if (this.isPlaying) {
            this.startSlideshow();
        }
    }
    
    /**
     * Lädt Bilder in die Grid-Items
     */
    loadImages(startIndex) {
        for (let i = 0; i < this.visibleItems; i++) {
            const imageIndex = (startIndex + i) % this.config.images.length;
            const imageData = this.config.images[imageIndex];
            const gridItem = this.gridItems[i];
            
            this.displayImage(gridItem, imageData, i === 0);
        }
    }
    
    /**
     * Zeigt ein Bild in einem Grid-Item an
     */
    displayImage(gridItem, imageData, showText = false) {
        // Altes Bild ausblenden
        const oldImage = gridItem.container.querySelector('img');
        
        if (oldImage) {
            oldImage.style.opacity = '0';
            setTimeout(() => {
                if (oldImage.parentNode) {
                    oldImage.parentNode.removeChild(oldImage);
                }
            }, 800);
        }
        
        // Neues Bild erstellen
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.text?.title || 'Infotafel Bild';
        img.loading = 'eager';
        
        // Übergangs-Klasse setzen
        gridItem.element.className = `grid-item ${this.config.transition}-transition`;
        
        // Bild laden
        img.onload = () => {
            gridItem.container.appendChild(img);
            
            // Kleiner Delay für Animation
            requestAnimationFrame(() => {
                gridItem.element.classList.add('active');
            });
        };
        
        img.onerror = () => {
            console.warn('Bild konnte nicht geladen werden:', imageData.src);
            // Fallback-Bild oder Platzhalter
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23161b22" width="400" height="300"/%3E%3Ctext fill="%238b949e" x="50%25" y="50%25" text-anchor="middle" font-family="sans-serif" font-size="16"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
            gridItem.container.appendChild(img);
        };
        
        // Text-Overlay aktualisieren
        if (showText && this.config.showTextOverlay && imageData.text) {
            this.showTextOverlay(imageData.text);
        }
        
        gridItem.currentImage = imageData;
    }
    
    /**
     * Zeigt das Text-Overlay an
     */
    showTextOverlay(textData) {
        if (!textData) return;
        
        this.overlayTitle.textContent = textData.title || '';
        this.overlayText.textContent = textData.text || '';
        
        this.textOverlay.classList.add('visible');
        
        // Automatisch ausblenden nach gewisser Zeit
        if (this.textTimeout) {
            clearTimeout(this.textTimeout);
        }
        
        this.textTimeout = setTimeout(() => {
            this.textOverlay.classList.remove('visible');
        }, (this.config.speed - 1) * 1000);
    }
    
    /**
     * Startet die automatische Slideshow
     */
    startSlideshow() {
        this.stopSlideshow();
        this.slideTimer = setInterval(() => {
            this.nextSlide();
        }, this.config.speed * 1000);
    }
    
    /**
     * Stoppt die automatische Slideshow
     */
    stopSlideshow() {
        if (this.slideTimer) {
            clearInterval(this.slideTimer);
            this.slideTimer = null;
        }
    }
    
    /**
     * Zeigt den nächsten Slide
     */
    nextSlide() {
        this.currentSlide = (this.currentSlide + this.visibleItems) % this.config.images.length;
        this.loadImages(this.currentSlide);
    }
    
    /**
     * Zeigt den vorherigen Slide
     */
    prevSlide() {
        const prevIndex = this.currentSlide - this.visibleItems;
        this.currentSlide = prevIndex < 0 
            ? this.config.images.length - (Math.abs(prevIndex) % this.config.images.length || this.visibleItems)
            : prevIndex;
        this.loadImages(this.currentSlide);
    }
    
    /**
     * Pausiert/Startet die Slideshow
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('toggle-play');
        
        if (this.isPlaying) {
            this.startSlideshow();
            btn.textContent = '⏸ Pause';
        } else {
            this.stopSlideshow();
            btn.textContent = '▶ Play';
        }
    }
    
    /**
     * Initialisiert Event-Listener
     */
    initEventListeners() {
        // Menü-Trigger (obere rechte Ecke)
        this.menuTrigger.addEventListener('click', () => this.toggleMenu());
        
        // Menü schließen
        document.getElementById('close-menu').addEventListener('click', () => this.hideMenu());
        
        // Steuerungs-Buttons
        document.getElementById('toggle-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('next-slide').addEventListener('click', () => {
            this.stopSlideshow();
            this.nextSlide();
            if (this.isPlaying) this.startSlideshow();
        });
        document.getElementById('prev-slide').addEventListener('click', () => {
            this.stopSlideshow();
            this.prevSlide();
            if (this.isPlaying) this.startSlideshow();
        });
        
        // Einstellungen
        document.getElementById('transition-type').addEventListener('change', (e) => {
            this.config.transition = e.target.value;
        });
        
        document.getElementById('slide-speed').addEventListener('input', (e) => {
            this.config.speed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${this.config.speed}s`;
            
            if (this.isPlaying) {
                this.startSlideshow();
            }
        });
        
        document.getElementById('grid-layout').addEventListener('change', (e) => {
            const newLayout = parseInt(e.target.value);
            this.setGridLayout(newLayout);
            this.createGridItems();
            this.loadImages(this.currentSlide);
        });
        
        // Vollbild
        document.getElementById('toggle-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Tastatur-Steuerung
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Touch-Steuerung (Swipe)
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        // Menü bei Inaktivität ausblenden
        document.addEventListener('mousemove', () => {
            if (this.isMenuVisible) {
                this.resetMenuTimeout();
            }
        });
        
        // Klick außerhalb des Menüs schließt es
        document.addEventListener('click', (e) => {
            if (this.isMenuVisible && 
                !this.controlMenu.contains(e.target) && 
                e.target !== this.menuTrigger) {
                this.hideMenu();
            }
        });
    }
    
    /**
     * Behandelt Tastatur-Eingaben
     */
    handleKeydown(e) {
        switch (e.key) {
            case ' ': // Leertaste - Pause/Play
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowRight': // Rechte Pfeiltaste - Nächstes Bild
                this.stopSlideshow();
                this.nextSlide();
                if (this.isPlaying) this.startSlideshow();
                break;
            case 'ArrowLeft': // Linke Pfeiltaste - Vorheriges Bild
                this.stopSlideshow();
                this.prevSlide();
                if (this.isPlaying) this.startSlideshow();
                break;
            case 'f': // F - Vollbild
            case 'F':
                this.toggleFullscreen();
                break;
            case 'Escape': // ESC - Menü schließen
                if (this.isMenuVisible) {
                    this.hideMenu();
                }
                break;
            case 'm': // M - Menü umschalten
            case 'M':
                this.toggleMenu();
                break;
        }
    }
    
    /**
     * Behandelt Swipe-Gesten
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            this.stopSlideshow();
            
            if (swipeDistance > 0) {
                // Swipe nach rechts = vorheriges Bild
                this.prevSlide();
            } else {
                // Swipe nach links = nächstes Bild
                this.nextSlide();
            }
            
            if (this.isPlaying) {
                this.startSlideshow();
            }
        }
    }
    
    /**
     * Schaltet das Menü um
     */
    toggleMenu() {
        if (this.isMenuVisible) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
    }
    
    /**
     * Zeigt das Menü an
     */
    showMenu() {
        this.controlMenu.classList.remove('hidden');
        this.isMenuVisible = true;
        this.resetMenuTimeout();
    }
    
    /**
     * Versteckt das Menü
     */
    hideMenu() {
        this.controlMenu.classList.add('hidden');
        this.isMenuVisible = false;
        
        if (this.menuTimeout) {
            clearTimeout(this.menuTimeout);
        }
    }
    
    /**
     * Setzt den Timeout für automatisches Schließen zurück
     */
    resetMenuTimeout() {
        if (this.menuTimeout) {
            clearTimeout(this.menuTimeout);
        }
        
        this.menuTimeout = setTimeout(() => {
            this.hideMenu();
        }, 10000); // 10 Sekunden Inaktivität
    }
    
    /**
     * Schaltet den Vollbildmodus um
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn('Vollbild nicht möglich:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    /**
     * Initialisiert die Uhr
     */
    initClock() {
        this.updateClock();
        
        // Jede Sekunde aktualisieren
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    /**
     * Aktualisiert die Uhrzeit-Anzeige
     */
    updateClock() {
        const now = new Date();
        
        // Zeit formatieren (HH:MM)
        const timeString = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Datum formatieren
        const dateString = now.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // In das DOM schreiben
        this.clockTime.textContent = timeString;
        this.clockTime.setAttribute('datetime', now.toISOString());
        
        this.clockDate.textContent = dateString;
        this.clockDate.setAttribute('datetime', now.toISOString());
    }
    
    /**
     * Blendet den Lade-Indikator aus
     */
    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }
    
    /**
     * Zeigt eine Fehlermeldung an
     */
    showError(message) {
        this.loadingIndicator.classList.add('hidden');
        this.errorDetails.textContent = message;
        this.errorMessage.hidden = false;
    }
}

// Anwendung starten, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    window.infoTafel = new InfoTafel();
});
