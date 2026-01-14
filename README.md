# 🌳 Baumentwicklung Monitor

Progressive Web App für das Agroforst-Monitoring zur Erfassung von Baumentwicklungsdaten.

## Features

✅ **Offline-fähig** - Funktioniert komplett ohne Internet
✅ **Progressive Web App** - Installierbar auf Android & iOS
✅ **Auto-Fill** - Daten vom vorherigen Baum übernehmen
✅ **CSV Export** - Alle Daten als CSV exportieren
✅ **GPS Integration** - Automatische Standorterfassung
✅ **Foto-Upload** - Dokumentation von Auffälligkeiten
✅ **Local Storage** - Alle Daten werden lokal gespeichert
✅ **Integrierte Hilfe** - Anleitungen mit Bildern per Klick auf ? Button

## Installation

### Lokal testen
1. Alle Dateien in einen Ordner kopieren
2. Mit einem lokalen Webserver öffnen:
   ```bash
   python -m http.server 8000
   ```
   oder
   ```bash
   npx serve
   ```
3. Browser öffnen: `http://localhost:8000`

### Auf Webserver
1. Alle Dateien auf einen Webserver hochladen
2. HTTPS ist erforderlich für:
   - GPS-Funktionalität
   - Service Worker (Offline-Modus)
   - PWA-Installation

### Als App installieren

**Android:**
1. Webseite im Chrome Browser öffnen
2. Menü → "Zum Startbildschirm hinzufügen"

**iOS (Safari):**
1. Webseite im Safari Browser öffnen
2. Teilen-Button tippen
3. Auf "mehr" tippen (oben im Teilen-Menü) um nach unten scrollen zu können
4. "Zum Home-Bildschirm" auswählen

**iOS (Chrome):**
1. Webseite im Chrome Browser öffnen
2. Teilen-Button tippen
3. "Zum Startbildschirm hinzufügen" auswählen

## Verwendung

### Workflow
1. **Formular ausfüllen** - Alle relevanten Baumdaten erfassen
2. **GPS erfassen** (optional) - Position mit einem Klick speichern
3. **Fotos hinzufügen** (optional) - Auffälligkeiten dokumentieren
4. **Baum speichern** - Daten werden lokal gespeichert
5. **Nächster Baum** - Button "Vorherige Daten" für schnelles Ausfüllen
6. **CSV Export** - Am Ende alle Daten exportieren

### Baum-ID Format
Format: `LOKALGRUPPE-REIHE-NUMMER`
- Beispiel: `LRO-B-09`
- Mehrstämmig: `LRO-B-09.1`, `LRO-B-09.2` etc.

### Datenfelder
- **Pflichtfelder** sind mit * markiert
- **Auto-Fill** übernimmt wiederkehrende Daten
- **Checkboxen** für Mehrfachauswahl
- **Ergänzungsfelder** für Freitext

## Datenschutz

Alle Daten werden **nur lokal** im Browser gespeichert:
- Keine Cloud-Synchronisation
- Keine externe Datenübertragung
- Daten bleiben auf dem Gerät

**Wichtig:** 
- Regelmäßig CSV exportieren als Backup
- Browser-Cache löschen = Datenverlust
- Bei Gerätewechsel: CSV exportieren & importieren

## Technische Details

- **Frontend:** Vanilla JavaScript (keine Dependencies)
- **Storage:** LocalStorage API
- **Offline:** Service Worker
- **Format:** CSV Export (Tab-getrennt)
- **GPS:** Geolocation API
- **Fotos:** Base64-kodiert in LocalStorage

## Browser-Kompatibilität

✅ Chrome/Edge (empfohlen)
✅ Safari (iOS/macOS)
✅ Firefox
⚠️ Ältere Browser könnten Einschränkungen haben

## Support

Bei Fragen: agroforst-monitoring@posteo.de