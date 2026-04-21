// CSV Import/Export
import { trees, setTrees } from './state.js';
import { saveTreesToStorage, updateSavedCount } from './storage.js';
import { formatDate } from './helpers.js';
import { showDataScreen } from './navigation.js';

export function exportToCSV() {
    if (trees.length === 0) {
        alert('Keine Daten zum Exportieren vorhanden.');
        return;
    }
    
    // CSV Header (neue Namen)
    const headers = [
        'CreationDate',
        'UpdatedDate',
        'x',
        'y',
        'Jahr',
        'ID',
        'Person',
        'Untersuchte Baumart',
        'Nachpflanzung',
        'Ergänzungen (Standort)',
        'Höhe in XXX cm',
        'Ergänzungen (Wuchshöhe)',
        'Umfang in mm',
        'Durchmesser in mm',
        'Ergänzungen (Umfang)',
        'Trieblänge in XXX cm',
        'Ergänzungen (Vitalität)',
        'Neigung',
        'Ästungshöhe in XXX cm',
        'Kronenansatz in XXX cm',
        'Ergänzungen (Statik)',
        'Art des Gehölzschutzes',
        'andere - Art des Gehölzschutzes',
        'Zustand des Gehölzschutzes',
        'Ist der Stamm geweißelt?',
        'Wie ist der Baum angebunden?',
        'Ergänzungen (Gehölzschutz)',
        'Art des Managements',
        'andere - Art des Managements',
        'Zustand der Baumscheibe',
        'weitere Makel - Zustand der Baumscheibe',
        'Ergänzungen (Baumscheibe)',
        'Anzahl offener Schnittwunden',
        'Erfassung weiterer Schäden und Krankheiten',
        'weitere - Erfassung weiterer Schäden und Krankheiten',
        'Beschreibung der Schäden und Krankheiten',
        'Auffälligkeiten im Freifeld notieren',
        'Ergänzungen (Schäden)',
        'Feedback zur App?'
    ];
    
    // Mapping von neuen Headern zu internen Feldnamen (mit Rückwärtskompatibilität für Import)
    const fieldMapping = {
        'CreationDate': 'createdAt',
        'UpdatedDate': 'updatedAt',
        'x': 'x',
        'y': 'y',
        'Jahr': 'createdAt',
        'ID': 'ID (z.B. "LRO-B-9")',
        'Person': 'Name(n) der durchführenden Person(en)',
        'Untersuchte Baumart': 'Untersuchte Baumart',
        'Nachpflanzung': 'Nachpflanzung',
        'Ergänzungen (Standort)': 'Ergänzungen (Standort)',
        'Höhe in XXX cm': 'Höhe in XXX cm',
        'Ergänzungen (Wuchshöhe)': 'Ergänzungen (Wuchshöhe)',
        'Umfang in mm': 'Umfang in XXX mm (Standard)',
        'Durchmesser in mm': 'Durchmesser in XXX mm (falls Umfang nicht möglich)',
        'Ergänzungen (Umfang)': 'Ergänzungen (Umfang)',
        'Trieblänge in XXX cm': 'Durchschnittliche Länge der einjährigen Triebe in XXX cm',
        'Ergänzungen (Vitalität)': 'Ergänzungen (Vitalität)',
        'Neigung': 'Neigung',
        'Ästungshöhe in XXX cm': 'Ästungshöhe in XXX cm',
        'Kronenansatz in XXX cm': 'Auf welcher Höhe befindet sich der erste Ast mit mehr als 3 cm Durchmesser? in XXX cm',
        'Ergänzungen (Statik)': 'Ergänzungen (Statik)',
        'Art des Gehölzschutzes': 'Art des Gehölzschutzes',
        'andere - Art des Gehölzschutzes': 'andere - Art des Gehölzschutzes',
        'Zustand des Gehölzschutzes': 'Zustand des Gehölzschutzes',
        'Ist der Stamm geweißelt?': 'Ist der Stamm geweißelt?',
        'Wie ist der Baum angebunden?': 'Wie ist der Baum angebunden?',
        'Ergänzungen (Gehölzschutz)': 'Ergänzungen (Gehölzschutz)',
        'Art des Managements': 'Art des Managements',
        'andere - Art des Managements': 'andere - Art des Managements',
        'Zustand der Baumscheibe': 'Zustand der Baumscheibe',
        'weitere Makel - Zustand der Baumscheibe': 'weitere Makel - Zustand der Baumscheibe',
        'Ergänzungen (Baumscheibe)': 'Ergänzungen (Baumscheibe)',
        'Anzahl offener Schnittwunden': 'Anzahl offener Schnittwunden',
        'Erfassung weiterer Schäden und Krankheiten': 'Erfassung weiterer Schäden und Krankheiten',
        'weitere - Erfassung weiterer Schäden und Krankheiten': 'weitere - Erfassung weiterer Schäden und Krankheiten',
        'Beschreibung der Schäden und Krankheiten': 'Beschreibung der Schäden und Krankheiten',
        'Auffälligkeiten im Freifeld notieren': 'Auffälligkeiten im Freifeld notieren',
        'Ergänzungen (Schäden)': 'Ergänzungen (Schäden)',
        'Feedback zur App?': 'Feedback zur App?'
    };
    
    // CSV Rows
    const separator = ';';
    let csv = headers.join(separator) + '\n';
    
    trees.forEach(tree => {
        const row = headers.map(header => {
            let value = '';
            const internalField = fieldMapping[header];
            
            // Spezielle Behandlung für Datum und Jahr
            if (header === 'CreationDate') {
                value = formatDate(tree.createdAt);
            } else if (header === 'UpdatedDate') {
                value = formatDate(tree.updatedAt);
            } else if (header === 'Jahr') {
                // Jahr aus createdAt extrahieren
                const date = new Date(tree.createdAt);
                value = date.getFullYear().toString();
            } else {
                value = tree[internalField] || '';
            }
            
            value = String(value);
            
            // Newlines entfernen
            value = value.replace(/\n/g, ' ').replace(/\r/g, '');
            
            // Escape quotes
            if (value.includes('"')) {
                value = value.replace(/"/g, '""');
            }
            
            // Wrap in quotes if contains separator or quotes
            if (value.includes(separator) || value.includes('"')) {
                value = `"${value}"`;
            }
            
            return value;
        });
        csv += row.join(separator) + '\n';
    });
    
    // Download mit BOM für Excel-Kompatibilität
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Zeitstempel mit Datum und Uhrzeit in lokaler Zeitzone: 2026-01-07_08-07-01
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Baumentwicklung_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✓ CSV-Export erfolgreich (${trees.length} Bäume)\n\n📤 Nächster Schritt:\nLaden Sie die CSV-Datei im Uploadbereich Ihrer Lokalgruppe hoch.`);
}

export function handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const csvContent = event.target.result;
            const importedTrees = parseCSV(csvContent);
            
            if (importedTrees.length === 0) {
                alert('⚠️ Keine gültigen Bäume in der CSV-Datei gefunden.');
                return;
            }
            
            // Zeige Bestätigungsdialog mit Erklärung
            const message = `📥 CSV-Import\n\n` +
                `Gefundene Bäume: ${importedTrees.length}\n\n` +
                `Verhalten bei Duplikaten:\n` +
                `• Bäume mit gleicher ID werden zusammengeführt\n` +
                `• Leere Felder werden mit importierten Daten ergänzt\n` +
                `• Bei unterschiedlichen befüllten Feldern wird ein Duplikat angelegt\n` +
                `  (zur manuellen Prüfung - keine Datenverluste)\n\n` +
                `Import fortsetzen?`;
            
            if (!confirm(message)) {
                e.target.value = ''; // Reset file input
                return;
            }
            
            const result = mergeImportedTrees(importedTrees);
            
            // Speichern und UI aktualisieren
            saveTreesToStorage();
            updateSavedCount();
            showDataScreen();
            
            // Ergebnisbericht
            let report = `✓ Import abgeschlossen!\n\n`;
            report += `Neue Bäume: ${result.added}\n`;
            report += `Zusammengeführt (ohne Konflikte): ${result.merged}\n`;
            report += `Als Duplikat angelegt (Konflikte): ${result.duplicates}\n`;
            
            if (result.conflictDetails.length > 0) {
                report += `\n⚠️ Duplikate wegen Konflikten (bitte manuell prüfen):\n`;
                result.conflictDetails.forEach(detail => {
                    report += `• ${detail}\n`;
                });
            }
            
            alert(report);
            
        } catch (error) {
            alert(`❌ Fehler beim Import: ${error.message}`);
        }
        
        // Reset file input
        e.target.value = '';
    };
    
    reader.readAsText(file, 'UTF-8');
}

function parseCSV(csvContent) {
    // BOM entfernen falls vorhanden
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }
    
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
        console.error('CSV hat weniger als 2 Zeilen');
        return [];
    }
    
    // Parse header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.trim());
    
    console.log('CSV Headers:', headers);
    console.log('Anzahl Header:', headers.length);
    
    // Finde den Index der Baum-ID Spalte
    const idHeaderIndex = headers.findIndex(h =>
        h.includes('ID') && (h.includes('LRO') || h.includes('z.B'))
    );
    
    if (idHeaderIndex === -1) {
        console.error('Baum-ID Header nicht gefunden. Verfügbare Header:', headers);
        alert('❌ Fehler: Baum-ID Spalte in CSV nicht gefunden. Bitte überprüfen Sie das Dateiformat.');
        return [];
    }
    
    const idHeader = headers[idHeaderIndex];
    console.log('Baum-ID Header gefunden:', idHeader, 'Index:', idHeaderIndex);
    
    // Parse rows
    const parsedTrees = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || values.every(v => !v.trim())) continue;
        
        const tree = {};
        headers.forEach((header, index) => {
            let value = (values[index] || '').trim();
            
            // Spezielle Behandlung für Datums-Felder
            if (header === 'Erstellt am' || header === 'Zuletzt bearbeitet') {
                // Datum im Format "DD.MM.YYYY, HH:MM" zu ISO konvertieren
                if (value) {
                    const parsed = parseDateString(value);
                    if (header === 'Erstellt am') {
                        tree.createdAt = parsed;
                    } else {
                        tree.updatedAt = parsed;
                    }
                }
            } else {
                tree[header] = value;
            }
        });
        
        // Verwende den gefundenen ID-Header
        const baumId = tree[idHeader];
        console.log(`Zeile ${i}: Baum-ID = "${baumId}"`);
        
        // Nur hinzufügen wenn Baum-ID vorhanden
        if (baumId && baumId.trim()) {
            // Stelle sicher dass die ID unter dem Standard-Key gespeichert ist
            tree['ID (z.B. "LRO-B-9")'] = baumId;
            parsedTrees.push(tree);
        }
    }
    
    console.log('Geparste Bäume:', parsedTrees.length);
    return parsedTrees;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    const separator = ';';
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add last field
    result.push(current);
    
    return result;
}

function parseDateString(dateStr) {
    if (!dateStr) return new Date().toISOString();
    
    // Format: "DD.MM.YYYY, HH:MM" -> ISO
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4}),?\s*(\d{2}):(\d{2})/);
    if (match) {
        const [, day, month, year, hour, minute] = match;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
    }
    
    // Fallback: versuche direktes Parsen
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function mergeImportedTrees(importedTrees) {
    const result = {
        added: 0,
        merged: 0,
        duplicates: 0,
        conflictDetails: []
    };
    
    importedTrees.forEach(importedTree => {
        const baumId = importedTree['ID (z.B. "LRO-B-9")'];
        const existingIndex = trees.findIndex(t => t['ID (z.B. "LRO-B-9")'] === baumId);
        
        if (existingIndex === -1) {
            // Neuer Baum
            trees.push(importedTree);
            result.added++;
        } else {
            // Baum existiert bereits - prüfen ob zusammenführbar
            const mergeResult = checkAndMergeTrees(trees[existingIndex], importedTree, baumId);
            
            if (mergeResult.hasConflicts) {
                // Konflikte gefunden - als Duplikat anlegen
                trees.push(importedTree);
                result.duplicates++;
                result.conflictDetails.push(`${baumId}: ${mergeResult.conflicts.join(', ')}`);
            } else if (mergeResult.hasChanges) {
                // Keine Konflikte - zusammenführen
                trees[existingIndex] = mergeResult.tree;
                result.merged++;
            }
            // Wenn weder hasConflicts noch hasChanges: identische Daten, nichts tun
        }
    });
    
    return result;
}

function checkAndMergeTrees(existing, imported, baumId) {
    const merged = { ...existing };
    let hasChanges = false;
    let hasConflicts = false;
    const conflicts = [];
    
    // Alle Felder durchgehen
    Object.keys(imported).forEach(key => {
        // Timestamps separat behandeln
        if (key === 'createdAt' || key === 'updatedAt') {
            return;
        }
        
        const existingValue = existing[key];
        const importedValue = imported[key];
        
        const existingEmpty = !existingValue || existingValue.trim() === '';
        const importedEmpty = !importedValue || importedValue.trim() === '';
        
        // Fall 1: Import-Wert ist leer -> nichts tun
        if (importedEmpty) {
            return;
        }
        
        // Fall 2: Existierender Wert ist leer -> ergänzen
        if (existingEmpty) {
            merged[key] = importedValue;
            hasChanges = true;
            return;
        }
        
        // Fall 3: Beide befüllt
        if (existingValue.trim() !== importedValue.trim()) {
            // Konflikt: unterschiedliche befüllte Felder
            hasConflicts = true;
            conflicts.push(key);
        }
    });
    
    // Update-Zeitstempel setzen wenn es Änderungen gab
    if (hasChanges && !hasConflicts) {
        merged.updatedAt = new Date().toISOString();
    }
    
    return { tree: merged, hasChanges, hasConflicts, conflicts };
}
