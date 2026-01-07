// Form Handling
import { trees, photos, editingTreeIndex, setEditingTreeIndex, updateTree, addTree, deleteTreeAtIndex, clearAllTrees } from './state.js';
import { saveTreesToStorage, updateSavedCount, checkStorageUsage } from './storage.js';
import { incrementTreeId, incrementRowId, treeExists } from './helpers.js';
import { showWelcomeScreen, showFormScreen, updateButtonLabels } from './navigation.js';
import { exportToCSV } from './csv.js';
import { clearPhotos } from './photos.js';

export function saveTree(action) {
    const form = document.getElementById('treeForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Plausibilitätsprüfungen
    const hoehe = parseInt(document.getElementById('hoehe').value);
    const astungshoehe = document.getElementById('astungshoehe').value;
    const ersterAst = document.getElementById('erster_ast').value;
    
    if (astungshoehe && parseInt(astungshoehe) > hoehe) {
        if (!confirm(`⚠️ Die Ästungshöhe (${astungshoehe} cm) ist größer als die Baumhöhe (${hoehe} cm). Trotzdem speichern?`)) {
            return;
        }
    }
    
    if (ersterAst && parseInt(ersterAst) > hoehe) {
        if (!confirm(`⚠️ Die Höhe des ersten Astes (${ersterAst} cm) ist größer als die Baumhöhe (${hoehe} cm). Trotzdem speichern?`)) {
            return;
        }
    }
    
    // Umfang und Durchmesser Warnung
    const umfang = document.getElementById('umfang').value;
    const durchmesser = document.getElementById('durchmesser').value;
    if (umfang && durchmesser) {
        if (!confirm(`⚠️ Sowohl Umfang als auch Durchmesser wurden angegeben. In der Regel sollte nur eines der Felder ausgefüllt werden. Trotzdem speichern?`)) {
            return;
        }
    }
    
    const formData = new FormData(form);
    const tree = {};
    
    // Zeitstempel
    const now = new Date().toISOString();
    
    if (editingTreeIndex !== null) {
        // Bearbeiten: Altes Erstellungsdatum behalten, Update-Datum setzen
        tree.createdAt = trees[editingTreeIndex].createdAt || now;
        tree.updatedAt = now;
    } else {
        // Neu: Beides auf jetzt
        tree.createdAt = now;
        tree.updatedAt = now;
    }
    
    // Standard-Felder
    tree.x = formData.get('longitude') || '0';
    tree.y = formData.get('latitude') || '0';
    tree['ID (z.B. "LRO-B-9")'] = formData.get('baumId');
    tree['Name(n) der durchführenden Person(en)'] = formData.get('name');
    tree['Untersuchte Baumart'] = formData.get('baumart');
    tree['Höhe in XXX cm'] = formData.get('hoehe');
    tree['Umfang in XXX mm (Standard)'] = formData.get('umfang') || '';
    tree['Durchmesser in XXX mm (falls Umfang nicht möglich)'] = formData.get('durchmesser') || '';
    tree['Durchschnittliche Länge der einjährigen Triebe in XXX cm'] = formData.get('trieblaenge');
    tree['Neigung'] = formData.get('neigung');
    tree['Ästungshöhe in XXX cm'] = formData.get('astungshoehe') || '';
    tree['Auf welcher Höhe befindet sich der erste Ast mit mehr als 3 cm Durchmesser? in XXX cm'] = formData.get('erster_ast') || '';
    tree['Anzahl offener Schnittwunden'] = formData.get('schnittwunden') || '0';
    
    // Checkboxen - Gehölzschutz
    const schutzTypes = Array.from(formData.getAll('schutz'));
    tree['Art des Gehölzschutzes'] = schutzTypes.join(',');
    tree['andere - Art des Gehölzschutzes'] = formData.get('schutz_andere') || '';
    tree['Zustand des Gehölzschutzes'] = formData.get('schutz_zustand') || '';
    tree['Ist der Stamm geweißelt?'] = formData.get('stamm_geweisselt') || '';
    
    // Checkboxen - Anbindung
    const anbindung = Array.from(formData.getAll('anbindung'));
    tree['Wie ist der Baum angebunden?'] = anbindung.join(',');
    
    // Checkboxen - Management
    const management = Array.from(formData.getAll('management'));
    tree['Art des Managements'] = management.join(',');
    tree['andere - Art des Managements'] = formData.get('management_andere') || '';
    
    // Checkboxen - Baumscheibe
    const baumscheibeZustand = Array.from(formData.getAll('baumscheibe_zustand'));
    tree['Zustand der Baumscheibe'] = baumscheibeZustand.join(',');
    tree['weitere Makel - Zustand der Baumscheibe'] = formData.get('baumscheibe_makel') || '';
    
    // Checkboxen - Schäden
    const schaeden = Array.from(formData.getAll('schaeden'));
    tree['Erfassung weiterer Schäden und Krankheiten'] = schaeden.join(',');
    tree['weitere - Erfassung weiterer Schäden und Krankheiten'] = formData.get('schaeden_weitere') || '';
    tree['Beschreibung der Schäden und Krankheiten'] = formData.get('schaeden_beschreibung') || '';
    
    // Ergänzungen
    tree['Ergänzungen/Problembeschreibungen (S. 2)'] = formData.get('ergaenzungen_s2') || '';
    tree['Ergänzungen/Problembeschreibungen (S. 3)'] = formData.get('ergaenzungen_s3') || '';
    tree['Ergänzungen/Problembeschreibungen (S. 4)'] = formData.get('ergaenzungen_s4') || '';
    tree['Ergänzungen/Problembeschreibungen (S.5)'] = formData.get('ergaenzungen_s5') || '';
    tree['Ergänzungen/Problembeschreibungen (S. 6)'] = formData.get('ergaenzungen_s6') || '';
    tree['Ergänzungen/Problembeschreibungen (S. 7)'] = formData.get('ergaenzungen_s7') || '';
    tree['Ergänzungen/Problembeschreibungen (S.8)'] = formData.get('ergaenzungen_s8') || '';
    tree['Ergänzungen/Problembeschreibungen (S.9)'] = formData.get('ergaenzungen_s9') || '';
    
    // Fotos
    if (photos.length > 0) {
        tree._photos = photos;
    }
    
    // Speichern
    if (editingTreeIndex !== null) {
        updateTree(editingTreeIndex, tree);
    } else {
        addTree(tree);
    }
    saveTreesToStorage();
    updateSavedCount();
    
    // LocalStorage Warnung
    checkStorageUsage();
    
    // Backup-Reminder
    if (trees.length % 50 === 0 && trees.length > 0) {
        setTimeout(() => {
            if (confirm(`💾 Sie haben jetzt ${trees.length} Bäume erfasst!\n\nMöchten Sie jetzt ein Backup (CSV-Export) erstellen?`)) {
                exportToCSV();
            }
        }, 500);
    }
    
    // Feedback
    const baumId = tree['ID (z.B. "LRO-B-9")'];
    alert(`✓ Baum ${baumId} erfolgreich gespeichert!`);
    
    // Je nach Aktion unterschiedlich verhalten
    const currentName = formData.get('name');
    const currentBaumart = formData.get('baumart');
    
    // Gehölzschutz-Werte speichern
    const currentSchutz = Array.from(formData.getAll('schutz'));
    const currentSchutzAndere = formData.get('schutz_andere');
    const currentSchutzZustand = formData.get('schutz_zustand');
    const currentStammGeweisselt = formData.get('stamm_geweisselt');
    const currentAnbindung = Array.from(formData.getAll('anbindung'));
    
    // Baumscheibe-Werte speichern
    const currentManagement = Array.from(formData.getAll('management'));
    const currentManagementAndere = formData.get('management_andere');
    const currentBaumscheibeZustand = Array.from(formData.getAll('baumscheibe_zustand'));
    const currentBaumscheibeMakel = formData.get('baumscheibe_makel');
    
    if (action === 'finish') {
        // Zurück zur Startseite
        showWelcomeScreen();
    } else if (action === 'nextTree') {
        // Baum-ID hochzählen und prüfen ob er existiert
        const nextId = incrementTreeId(baumId);
        const nextTreeIndex = trees.findIndex(t => t['ID (z.B. "LRO-B-9")'] === nextId);
        
        if (nextTreeIndex !== -1) {
            // Nächster Baum existiert bereits - laden zum Bearbeiten
            editTree(nextTreeIndex);
        } else {
            // Nächster Baum existiert noch nicht - neuen anlegen
            resetForm();
            document.getElementById('name').value = currentName;
            document.getElementById('baumart').value = currentBaumart;
            document.getElementById('baumId').value = nextId;
            
            // Gehölzschutz wiederherstellen
            document.querySelectorAll('input[name="schutz"]').forEach(cb => {
                cb.checked = currentSchutz.includes(cb.value);
            });
            document.getElementById('schutz_andere').value = currentSchutzAndere || '';
            document.getElementById('schutz_zustand').value = currentSchutzZustand || '';
            document.getElementById('stamm_geweisselt').value = currentStammGeweisselt || '';
            document.querySelectorAll('input[name="anbindung"]').forEach(cb => {
                cb.checked = currentAnbindung.includes(cb.value);
            });
            
            // Baumscheibe wiederherstellen
            document.querySelectorAll('input[name="management"]').forEach(cb => {
                cb.checked = currentManagement.includes(cb.value);
            });
            document.getElementById('management_andere').value = currentManagementAndere || '';
            document.querySelectorAll('input[name="baumscheibe_zustand"]').forEach(cb => {
                cb.checked = currentBaumscheibeZustand.includes(cb.value);
            });
            document.getElementById('baumscheibe_makel').value = currentBaumscheibeMakel || '';
            
            clearPhotos();
            updateButtonLabels();
        }
    } else if (action === 'nextRow') {
        // Reihe hochzählen und prüfen ob er existiert
        const nextId = incrementRowId(baumId);
        const nextTreeIndex = trees.findIndex(t => t['ID (z.B. "LRO-B-9")'] === nextId);
        
        if (nextTreeIndex !== -1) {
            // Baum in nächster Reihe existiert bereits - laden zum Bearbeiten
            editTree(nextTreeIndex);
        } else {
            // Baum in nächster Reihe existiert noch nicht - neuen anlegen
            resetForm();
            document.getElementById('name').value = currentName;
            document.getElementById('baumart').value = currentBaumart;
            document.getElementById('baumId').value = nextId;
            
            // Gehölzschutz wiederherstellen
            document.querySelectorAll('input[name="schutz"]').forEach(cb => {
                cb.checked = currentSchutz.includes(cb.value);
            });
            document.getElementById('schutz_andere').value = currentSchutzAndere || '';
            document.getElementById('schutz_zustand').value = currentSchutzZustand || '';
            document.getElementById('stamm_geweisselt').value = currentStammGeweisselt || '';
            document.querySelectorAll('input[name="anbindung"]').forEach(cb => {
                cb.checked = currentAnbindung.includes(cb.value);
            });
            
            // Baumscheibe wiederherstellen
            document.querySelectorAll('input[name="management"]').forEach(cb => {
                cb.checked = currentManagement.includes(cb.value);
            });
            document.getElementById('management_andere').value = currentManagementAndere || '';
            document.querySelectorAll('input[name="baumscheibe_zustand"]').forEach(cb => {
                cb.checked = currentBaumscheibeZustand.includes(cb.value);
            });
            document.getElementById('baumscheibe_makel').value = currentBaumscheibeMakel || '';
            
            clearPhotos();
            updateButtonLabels();
        }
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function resetForm() {
    setEditingTreeIndex(null);
    document.getElementById('treeForm').reset();
    document.getElementById('locationDisplay').classList.remove('active');
    clearPhotos();
    
    // Umfang/Durchmesser Felder wieder aktivieren
    const umfangInput = document.getElementById('umfang');
    const durchmesserInput = document.getElementById('durchmesser');
    if (umfangInput) {
        umfangInput.disabled = false;
        umfangInput.style.opacity = '1';
    }
    if (durchmesserInput) {
        durchmesserInput.disabled = false;
        durchmesserInput.style.opacity = '1';
    }
}

export function editTree(index) {
    setEditingTreeIndex(index);
    const tree = trees[index];
    loadTreeToForm(tree, true);
    showFormScreen();
    updateButtonLabels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function nextTreeInRow(index) {
    const tree = trees[index];
    const baumId = tree['ID (z.B. "LRO-B-9")'];
    const nextId = incrementTreeId(baumId);
    
    // Prüfe ob der nächste Baum existiert
    const nextTreeIndex = trees.findIndex(t => t['ID (z.B. "LRO-B-9")'] === nextId);
    
    if (nextTreeIndex !== -1) {
        // Baum existiert bereits - laden zum Bearbeiten
        editTree(nextTreeIndex);
    } else {
        // Baum existiert noch nicht - neuen anlegen
        loadTreeToForm(tree, false);
        document.getElementById('baumId').value = nextId;
        showFormScreen();
        updateButtonLabels();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

export function nextTreeInNextRow(index) {
    const tree = trees[index];
    const baumId = tree['ID (z.B. "LRO-B-9")'];
    const nextId = incrementRowId(baumId);
    
    // Prüfe ob der Baum in der nächsten Reihe existiert
    const nextTreeIndex = trees.findIndex(t => t['ID (z.B. "LRO-B-9")'] === nextId);
    
    if (nextTreeIndex !== -1) {
        // Baum existiert bereits - laden zum Bearbeiten
        editTree(nextTreeIndex);
    } else {
        // Baum existiert noch nicht - neuen anlegen
        loadTreeToForm(tree, false);
        document.getElementById('baumId').value = nextId;
        showFormScreen();
        updateButtonLabels();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function loadTreeToForm(tree, loadMeasurements = true) {
    // Basis-Felder
    document.getElementById('name').value = tree['Name(n) der durchführenden Person(en)'] || '';
    document.getElementById('baumart').value = tree['Untersuchte Baumart'] || '';
    document.getElementById('baumId').value = tree['ID (z.B. "LRO-B-9")'] || '';
    
    // Messungen nur laden wenn gewünscht (beim Bearbeiten, nicht beim nächsten Baum)
    if (loadMeasurements) {
        document.getElementById('hoehe').value = tree['Höhe in XXX cm'] || '';
        document.getElementById('umfang').value = tree['Umfang in XXX mm (Standard)'] || '';
        document.getElementById('durchmesser').value = tree['Durchmesser in XXX mm (falls Umfang nicht möglich)'] || '';
        document.getElementById('trieblaenge').value = tree['Durchschnittliche Länge der einjährigen Triebe in XXX cm'] || '';
        document.getElementById('neigung').value = tree['Neigung'] || '';
        document.getElementById('astungshoehe').value = tree['Ästungshöhe in XXX cm'] || '';
        document.getElementById('erster_ast').value = tree['Auf welcher Höhe befindet sich der erste Ast mit mehr als 3 cm Durchmesser? in XXX cm'] || '';
        document.getElementById('schnittwunden').value = tree['Anzahl offener Schnittwunden'] || '0';
    } else {
        document.getElementById('hoehe').value = '';
        document.getElementById('umfang').value = '';
        document.getElementById('durchmesser').value = '';
        document.getElementById('trieblaenge').value = '';
        document.getElementById('astungshoehe').value = '';
        document.getElementById('erster_ast').value = '';
        document.getElementById('schnittwunden').value = '0';
    }
    
    // GPS
    document.getElementById('latitude').value = tree.y || '';
    document.getElementById('longitude').value = tree.x || '';
    if (tree.y && tree.x && parseFloat(tree.y) !== 0) {
        const display = document.getElementById('locationDisplay');
        display.textContent = `📍 Position: ${tree.y}, ${tree.x}`;
        display.classList.add('active');
    }
    
    // Gehölzschutz
    if (tree['Art des Gehölzschutzes']) {
        const schutzTypes = tree['Art des Gehölzschutzes'].split(',').filter(v => v);
        document.querySelectorAll('input[name="schutz"]').forEach(cb => {
            cb.checked = schutzTypes.includes(cb.value);
        });
    }
    document.getElementById('schutz_andere').value = tree['andere - Art des Gehölzschutzes'] || '';
    document.getElementById('schutz_zustand').value = tree['Zustand des Gehölzschutzes'] || '';
    document.getElementById('stamm_geweisselt').value = tree['Ist der Stamm geweißelt?'] || '';
    
    // Anbindung
    if (tree['Wie ist der Baum angebunden?']) {
        const anbindung = tree['Wie ist der Baum angebunden?'].split(',').filter(v => v);
        document.querySelectorAll('input[name="anbindung"]').forEach(cb => {
            cb.checked = anbindung.includes(cb.value);
        });
    }
    
    // Management
    if (tree['Art des Managements']) {
        const management = tree['Art des Managements'].split(',').filter(v => v);
        document.querySelectorAll('input[name="management"]').forEach(cb => {
            cb.checked = management.includes(cb.value);
        });
    }
    document.getElementById('management_andere').value = tree['andere - Art des Managements'] || '';
    
    // Baumscheibe
    if (tree['Zustand der Baumscheibe']) {
        const baumscheibeZustand = tree['Zustand der Baumscheibe'].split(',').filter(v => v);
        document.querySelectorAll('input[name="baumscheibe_zustand"]').forEach(cb => {
            cb.checked = baumscheibeZustand.includes(cb.value);
        });
    }
    document.getElementById('baumscheibe_makel').value = tree['weitere Makel - Zustand der Baumscheibe'] || '';
    
    // Schäden
    if (tree['Erfassung weiterer Schäden und Krankheiten']) {
        const schaeden = tree['Erfassung weiterer Schäden und Krankheiten'].split(',').filter(v => v);
        document.querySelectorAll('input[name="schaeden"]').forEach(cb => {
            cb.checked = schaeden.includes(cb.value);
        });
    }
    document.getElementById('schaeden_weitere').value = tree['weitere - Erfassung weiterer Schäden und Krankheiten'] || '';
    document.getElementById('schaeden_beschreibung').value = tree['Beschreibung der Schäden und Krankheiten'] || '';
    
    // Ergänzungen
    document.getElementById('ergaenzungen_s2').value = tree['Ergänzungen/Problembeschreibungen (S. 2)'] || '';
    document.getElementById('ergaenzungen_s3').value = tree['Ergänzungen/Problembeschreibungen (S. 3)'] || '';
    document.getElementById('ergaenzungen_s4').value = tree['Ergänzungen/Problembeschreibungen (S. 4)'] || '';
    document.getElementById('ergaenzungen_s5').value = tree['Ergänzungen/Problembeschreibungen (S.5)'] || '';
    document.getElementById('ergaenzungen_s6').value = tree['Ergänzungen/Problembeschreibungen (S. 6)'] || '';
    document.getElementById('ergaenzungen_s7').value = tree['Ergänzungen/Problembeschreibungen (S. 7)'] || '';
    document.getElementById('ergaenzungen_s8').value = tree['Ergänzungen/Problembeschreibungen (S.8)'] || '';
    document.getElementById('ergaenzungen_s9').value = tree['Ergänzungen/Problembeschreibungen (S.9)'] || tree['Auffälligkeiten im Freifeld notieren'] || '';
}

export function deleteTree(index) {
    if (confirm(`Baum ${trees[index]['ID (z.B. "LRO-B-9")']} wirklich löschen?`)) {
        deleteTreeAtIndex(index);
        saveTreesToStorage();
        updateSavedCount();
        // Reload data screen after deletion
        import('./navigation.js').then(({ showDataScreen }) => {
            showDataScreen();
        });
    }
}

export function clearAllData() {
    if (confirm('Wirklich ALLE gespeicherten Bäume löschen? Dies kann nicht rückgängig gemacht werden!')) {
        if (confirm('Letzte Warnung: Alle ' + trees.length + ' Bäume werden gelöscht!')) {
            clearAllTrees();
            saveTreesToStorage();
            updateSavedCount();
            showWelcomeScreen();
            alert('Alle Daten wurden gelöscht.');
        }
    }
}
