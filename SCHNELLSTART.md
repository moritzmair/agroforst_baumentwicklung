# 🚀 Schnellstart - Baumentwicklung App

## Sofort loslegen (3 Schritte)

### 1. Lokalen Server starten

**Option A - Python (meist vorinstalliert):**
```bash
cd /Users/moritzmair/code/agroforst_baumentwicklung
python -m http.server 8000
```

**Option B - Node.js:**
```bash
npx serve
```

### 2. App im Browser öffnen

Browser öffnen und eingeben:
```
http://localhost:8000
```

### 3. Testen!

- Formular ausfüllen
- "Baum speichern" klicken
- "Vorherige Daten" testen
- "CSV Export" ausprobieren

## 📱 Als App auf Handy installieren

### Voraussetzung: HTTPS erforderlich!

1. **App auf Webserver hochladen** (z.B. GitHub Pages, Netlify)
2. **Auf Smartphone öffnen:**
   - Android Chrome: Menü → "Zum Startbildschirm"
   - iOS Safari: Teilen → "Zum Home-Bildschirm"

## ✅ Funktionen checken

- [ ] Formular ausfüllen funktioniert
- [ ] Daten werden gespeichert
- [ ] "Vorherige Daten" kopiert Felder
- [ ] CSV Export erstellt Datei
- [ ] GPS-Button (nur mit HTTPS)
- [ ] Foto-Upload funktioniert
- [ ] Offline-Modus (nach einmaligem Laden)

## 🔧 Häufige Probleme

**GPS funktioniert nicht?**
→ Nur mit HTTPS! Lokal kein GPS möglich.

**Service Worker Fehler?**
→ Normal bei lokalem Test ohne HTTPS.

**Daten weg nach Browser-Neustart?**
→ Browser-Cache nicht löschen! CSV-Export als Backup.

**Icons werden nicht angezeigt?**
→ PNG-Icons noch erstellen (siehe TODO.md)

## 📊 CSV Daten exportieren

1. Mehrere Bäume erfassen
2. Button "💾 CSV Export" klicken
3. Datei wird heruntergeladen
4. In Excel/LibreOffice öffnen
5. Trennzeichen: Tabulator

## 🎯 Workflow für Feldarbeit

1. **Vorbereitung:**
   - App einmal online öffnen (lädt Service Worker)
   - Danach funktioniert alles offline

2. **Im Feld:**
   - Formular für ersten Baum ausfüllen
   - Speichern
   - "Vorherige Daten" für nächsten Baum
   - Nur ID und abweichende Werte ändern
   - Weiter so für alle Bäume

3. **Nach der Arbeit:**
   - CSV exportieren
   - Per E-Mail an agroforst-monitoring@posteo.de
   - Oder lokal archivieren

## 💡 Tipps

- **Name einmal eingeben**, wird automatisch behalten
- **Baumart** wird ebenfalls behalten
- **Standard-Werte** wie Gehölzschutz etc. mit "Vorherige Daten" übernehmen
- **Fotos sparsam** verwenden (begrenzt durch Browser-Speicher)
- **Regelmäßig exportieren** als Backup

## 📧 Support

Bei Problemen: agroforst-monitoring@posteo.de