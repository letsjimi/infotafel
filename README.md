# Digitale Infotafel

Eine professionelle, vollständig clientseitige Infotafel-Webanwendung für Display-Screens.

## Features

- **Bilder-Diashow** mit weichen Übergängen (Fade, Slide, Zoom)
- **Konfigurierbares Grid** (1×1, 2×2, 3×3)
- **Unsichtbares UI-Menü** (oberere rechte Ecke anklicken)
- **Konfiguration via JSON**
- **Uhrzeit/Datum-Anzeige**
- **Touch & Keyboard Support**
- **Responsive & Display-optimiert**
- **Dark Mode Design**

## Installation

1. Alle Dateien auf einen Webserver kopieren
2. Bilder in `assets/` ablegen
3. `config.json` anpassen
4. `index.html` im Browser öffnen

## Konfiguration (config.json)

```json
{
  "images": [
    {
      "src": "assets/beispiel.jpg",
      "text": {
        "title": "Titel",
        "text": "Beschreibung"
      }
    }
  ],
  "transition": "fade",
  "speed": 5,
  "gridLayout": 1,
  "showClock": true,
  "showTextOverlay": true
}
```

## Bedienung

| Tasten | Funktion |
|--------|----------|
| `Leertaste` | Pause/Play |
| `← / →` | Vorheriges/Nächstes Bild |
| `F` | Vollbildmodus |
| `M` | Menü ein/aus |
| `ESC` | Menü schließen |

## Touch-Gesten
- `Swipe links` → Nächstes Bild
- `Swipe rechts` → Vorheriges Bild
- `Obere rechte Ecke tippen` → Menü öffnen

## Dateistruktur

```
/tmp/infotafel/
├── index.html          # Hauptdatei
├── css/
│   └── style.css       # Stylesheet (Dark Mode)
├── js/
│   └── app.js          # Hauptanwendung
├── config.json         # Konfiguration
├── assets/             # Bilder
└── README.md           # Diese Datei
```

## Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Lizenz

MIT License - Freie Nutzung für kommerzielle und private Zwecke.
