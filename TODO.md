# TODO - Baumentwicklung App

## ✅ Erledigt

- [x] Anforderungsanalyse
- [x] HTML-Struktur mit allen Formularfeldern
- [x] Responsive CSS Design
- [x] JavaScript Kernfunktionen
- [x] LocalStorage Datenpersistenz
- [x] Auto-Fill vorherige Baumdaten
- [x] CSV Export Funktion
- [x] Service Worker für Offline-Funktionalität
- [x] PWA Manifest
- [x] GPS/Position Erfassung
- [x] Foto-Upload Funktion (Base64)
- [x] Daten ansehen/löschen Modal
- [x] **Hilfe-System mit Popups** - Fragezeichen-Buttons für Anleitungen
- [x] **Bilder integriert** - Alle Anleitungsbilder heruntergeladen und eingebunden
- [x] **Offline-Bilder** - Bilder im Service Worker Cache

## 🔧 Noch zu erledigen

### Kritisch (vor Produktiveinsatz)

- [ ] **App Icons erstellen** (192x192 und 512x512 PNG)
  - Einfaches Baum-Icon mit grünem Hintergrund
  - Für PWA Installation erforderlich

- [ ] **Testing auf Zielgeräten**
  - Android Smartphone testen
  - iOS iPhone/iPad testen
  - Offline-Funktionalität prüfen
  - GPS-Funktion im Feld testen
  - CSV Export validieren

- [ ] **CSV Import Funktion**
  - Vorjahres-Daten importieren
  - Auto-Fill mit Vorjahresdaten
  - Matching über Baum-ID

### Wichtig (Verbesserungen)

- [ ] **Validierung verbessern**
  - Plausibilitätsprüfungen (z.B. Höhe < Ästungshöhe)
  - Warnungen bei fehlenden Standardfeldern
  - Baum-ID Format-Validierung erweitern

- [ ] **Daten-Backup**
  - Automatischer Export bei X Bäumen
  - Cloud-Backup Option (optional)
  - E-Mail Export direkt aus App

- [ ] **Usability**
  - Fortschrittsanzeige (Baum X von Y)
  - Sprungmarken zwischen Sektionen
  - Tastatur-Shortcuts für schnellere Eingabe
  - "Speichern & Nächster" Button

- [ ] **Datenvisualisierung**
  - Einfache Statistiken (Durchschnittshöhen etc.)
  - Grafische Übersicht der erfassten Bäume
  - Karten-Ansicht mit GPS-Positionen

### Optional (Nice to have)

- [ ] **Multi-Language Support**
  - Englische Version
  - i18n Framework einbinden

- [ ] **Erweiterte Foto-Funktionen**
  - Foto-Kompression vor Speicherung
  - Mehrere Fotos pro Sektion
  - Foto-Galerie Ansicht

- [ ] **Offline-Karten**
  - Integration von OpenStreetMap
  - Offline verfügbare Kartenbereiche
  - Baum-Positionen auf Karte anzeigen

- [ ] **Synchronisation**
  - Daten zwischen Geräten synchronisieren
  - Server-Backend für Team-Kollaboration
  - Konflikt-Auflösung bei paralleler Erfassung

- [ ] **Erweiterte Features**
  - Barcode-Scanner für Baum-IDs
  - Sprachnotizen
  - Wetter-Daten automatisch erfassen
  - QR-Code Generator für Baum-Tags

## 🐛 Bekannte Probleme

- [ ] LocalStorage Limitierung (~5-10MB)
  - Bei vielen Fotos evtl. Index DB verwenden
  - Foto-Kompression implementieren

- [ ] iOS Safari Einschränkungen
  - GPS-Permission muss bei jedem Besuch neu erteilt werden
  - Service Worker begrenzte Funktionalität

- [ ] Browser-Cache löschen = Datenverlust
  - Warnung in UI einbauen
  - Backup-Reminder implementieren

## 📝 Hinweise für Entwicklung

### Lokaler Test-Server
```bash
python -m http.server 8000
# oder
npx serve
```

### HTTPS für GPS/PWA erforderlich
Für Produktion HTTPS verwenden oder lokalen Test:
```bash
npx http-server -S -C cert.pem -o
```

### Testing Checkliste
- [ ] Formular vollständig ausfüllen & speichern
- [ ] "Vorherige Daten" kopieren funktioniert
- [ ] CSV Export enthält alle Felder
- [ ] GPS-Position wird erfasst
- [ ] Fotos werden gespeichert
- [ ] Offline-Modus funktioniert
- [ ] PWA Installation möglich
- [ ] Responsive Design auf verschiedenen Geräten

## 📧 Kontakt

Fragen/Feedback: agroforst-monitoring@posteo.de