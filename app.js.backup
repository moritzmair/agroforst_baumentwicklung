// App State
let trees = [];
let photos = [];
let editingTreeIndex = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTreesFromStorage();
    updateSavedCount();
    setupEventListeners();
    updateOnlineStatus();
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});

// Event Listeners
function setupEventListeners() {
    const form = document.getElementById('treeForm');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFileInput = document.getElementById('importFileInput');
    const viewDataBtn = document.getElementById('viewDataBtn');
    const savedCount = document.getElementById('savedCount');
    const resetBtn = document.getElementById('resetBtn');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const fotoInput = document.getElementById('foto');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const saveFinishBtn = document.getElementById('saveFinishBtn');
    const saveNextTreeBtn = document.getElementById('saveNextTreeBtn');
    const saveNextRowBtn = document.getElementById('saveNextRowBtn');
    const startNewRecordBtn = document.getElementById('startNewRecordBtn');
    const backToWelcomeBtn = document.getElementById('backToWelcomeBtn');
    const backFromDataBtn = document.getElementById('backFromDataBtn');
    const umfangInput = document.getElementById('umfang');
    const durchmesserInput = document.getElementById('durchmesser');
    const baumIdInput = document.getElementById('baumId');

    form.addEventListener('submit', (e) => e.preventDefault());
    
    // Aktualisiere Button-Labels wenn Baum-ID geändert wird
    if (baumIdInput) {
        baumIdInput.addEventListener('input', updateButtonLabels);
        baumIdInput.addEventListener('change', updateButtonLabels);
    }
    
    // Gegenseitiges Ausschluss-Verhalten für Umfang/Durchmesser
    umfangInput.addEventListener('input', () => {
        if (umfangInput.value) {
            durchmesserInput.disabled = true;
            durchmesserInput.style.opacity = '0.5';
        } else {
            durchmesserInput.disabled = false;
            durchmesserInput.style.opacity = '1';
        }
    });
    
    durchmesserInput.addEventListener('input', () => {
        if (durchmesserInput.value) {
            umfangInput.disabled = true;
            umfangInput.style.opacity = '0.5';
        } else {
            umfangInput.disabled = false;
            umfangInput.style.opacity = '1';
        }
    });
    saveFinishBtn.addEventListener('click', () => saveTree('finish'));
    saveNextTreeBtn.addEventListener('click', () => saveTree('nextTree'));
    saveNextRowBtn.addEventListener('click', () => saveTree('nextRow'));
    exportBtn.addEventListener('click', exportToCSV);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleCSVImport);
    viewDataBtn.addEventListener('click', showDataScreen);
    savedCount.addEventListener('click', showDataScreen);
    resetBtn.addEventListener('click', resetForm);
    getLocationBtn.addEventListener('click', getGPSLocation);
    fotoInput.addEventListener('change', handlePhotoUpload);
    clearAllBtn.addEventListener('click', clearAllData);
    startNewRecordBtn.addEventListener('click', () => {
        resetForm();
        showFormScreen();
    });
    backToWelcomeBtn.addEventListener('click', showWelcomeScreen);
    backFromDataBtn.addEventListener('click', showWelcomeScreen);
}

// Screen Navigation
function showWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('treeForm').style.display = 'none';
    document.getElementById('dataScreen').style.display = 'none';
    document.getElementById('backToWelcomeBtn').style.display = 'none';
    document.getElementById('backFromDataBtn').style.display = 'none';
}

function showFormScreen() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('treeForm').style.display = 'block';
    document.getElementById('dataScreen').style.display = 'none';
    document.getElementById('backToWelcomeBtn').style.display = 'inline-block';
    document.getElementById('backFromDataBtn').style.display = 'none';
    // Button-Labels aktualisieren wenn Formular angezeigt wird
    setTimeout(() => updateButtonLabels(), 50);
}

function showDataScreen() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('treeForm').style.display = 'none';
    document.getElementById('dataScreen').style.display = 'block';
    document.getElementById('backToWelcomeBtn').style.display = 'none';
    document.getElementById('backFromDataBtn').style.display = 'inline-block';
    
    const dataList = document.getElementById('dataList');
    
    if (trees.length === 0) {
        dataList.innerHTML = '<p style="text-align:center;color:#757575;">Noch keine Bäume gespeichert.</p>';
        document.getElementById('treeMap').style.display = 'none';
    } else {
        document.getElementById('treeMap').style.display = 'block';
        
        // Gruppiere Bäume nach ID
        const grouped = {};
        trees.forEach((tree, index) => {
            const id = tree['ID (z.B. "LRO-B-9")'];
            if (!grouped[id]) {
                grouped[id] = [];
            }
            grouped[id].push({ tree, index });
        });
        
        // Sortiere IDs
        const sortedIds = Object.keys(grouped).sort();
        
        // HTML generieren
        dataList.innerHTML = sortedIds.map(id => {
            const entries = grouped[id];
            const isDuplicate = entries.length > 1;
            
            return `
                <div class="data-group${isDuplicate ? ' duplicate-group' : ''}">
                    <h3 class="data-group-header">${id}${isDuplicate ? ` <span style="color:#f44336;font-size:0.9em;">(${entries.length}x erfasst)</span>` : ''}</h3>
                    <div class="data-group-items">
                        ${entries.map(({ tree, index }) => {
                            const currentId = tree['ID (z.B. "LRO-B-9")'];
                            const nextTreeId = incrementTreeId(currentId);
                            const nextRowId = incrementRowId(currentId);
                            const nextTreeExists = treeExists(nextTreeId);
                            const nextRowExists = treeExists(nextRowId);
                            
                            const nextTreeLabel = nextTreeExists ? '✏️ Nächsten bearbeiten' : '➡️ Nächsten anlegen';
                            const nextRowLabel = nextRowExists ? '✏️ Nächste Reihe bearbeiten' : '⏩ Nächste Reihe anlegen';
                            
                            return `
                            <div class="data-item${isDuplicate ? ' duplicate-item' : ''}">
                                <p><strong>Baumart:</strong> ${tree['Untersuchte Baumart']}</p>
                                <p><strong>Erfasst:</strong> ${formatDate(tree.createdAt)}</p>
                                <p><strong>Bearbeitet:</strong> ${formatDate(tree.updatedAt)}</p>
                                <p><strong>Höhe:</strong> ${tree['Höhe in XXX cm']} cm</p>
                                <p><strong>Position:</strong> ${tree.y && tree.x && parseFloat(tree.y) !== 0 ? `${tree.y}, ${tree.x}` : 'Keine GPS-Daten'}</p>
                                <p><strong>Person:</strong> ${tree['Name(n) der durchführenden Person(en)']}</p>
                                <div class="data-item-actions">
                                    <button class="btn btn-primary" onclick="editTree(${index})">✏️ Bearbeiten</button>
                                    <button class="btn btn-primary" onclick="nextTreeInRow(${index})">${nextTreeLabel}</button>
                                    <button class="btn btn-primary" onclick="nextTreeInNextRow(${index})">${nextRowLabel}</button>
                                    <button class="btn btn-secondary" onclick="deleteTree(${index})">🗑️ Löschen</button>
                                </div>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Canvas nach Screen-Wechsel neu zeichnen für korrekte Größe
    if (trees.length > 0) {
        setTimeout(() => drawTreeMap(), 100);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Form Submit
function saveTree(action) {
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
        trees[editingTreeIndex] = tree;
    } else {
        trees.push(tree);
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
            
            photos = [];
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
            
            photos = [];
            updateButtonLabels();
        }
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ID-Hilfsfunktionen
function incrementTreeId(baumId) {
    // z.B. "LRO-B-9" -> "LRO-B-10"
    const match = baumId.match(/^([A-ZÄÖÜ]+-[A-ZÄÖÜ]+-)(\d+)(\.\d+)?$/);
    if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]) + 1;
        const suffix = match[3] || '';
        return prefix + number + suffix;
    }
    return baumId;
}

function incrementRowId(baumId) {
    // z.B. "LRO-B-9" -> "LRO-C-1"
    const match = baumId.match(/^([A-ZÄÖÜ]+-)([A-ZÄÖÜ]+)(-)(\d+)(\.\d+)?$/);
    if (match) {
        const prefix = match[1];
        const row = match[2];
        const separator = match[3];
        const suffix = match[5] || '';
        const nextRow = String.fromCharCode(row.charCodeAt(row.length - 1) + 1);
        return prefix + (row.slice(0, -1) + nextRow) + separator + '1' + suffix;
    }
    return baumId;
}

// Reset Form
function resetForm() {
    editingTreeIndex = null;
    document.getElementById('treeForm').reset();
    document.getElementById('locationDisplay').classList.remove('active');
    document.getElementById('photoPreview').innerHTML = '';
    photos = [];
    
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

// GPS Location
function getGPSLocation() {
    const btn = document.getElementById('getLocationBtn');
    const display = document.getElementById('locationDisplay');
    
    if (!navigator.geolocation) {
        alert('GPS wird von diesem Gerät nicht unterstützt.');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '📍 GPS wird ermittelt...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lon;
            
            display.textContent = `📍 Position: ${lat}, ${lon} (±${Math.round(position.coords.accuracy)}m)`;
            display.classList.add('active');
            
            btn.disabled = false;
            btn.textContent = '✓ Position erfasst';
            setTimeout(() => {
                btn.textContent = '📍 GPS Position erfassen';
            }, 3000);
        },
        (error) => {
            alert('GPS-Position konnte nicht ermittelt werden: ' + error.message);
            btn.disabled = false;
            btn.textContent = '📍 GPS Position erfassen';
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Photo Upload
function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('photoPreview');
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            photos.push(event.target.result);
            
            const img = document.createElement('img');
            img.src = event.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Storage
function saveTreesToStorage() {
    try {
        localStorage.setItem('baumentwicklung_trees', JSON.stringify(trees));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('⚠️ Speicher ist voll! Bitte exportieren Sie Ihre Daten als CSV und löschen Sie alte Einträge.');
        } else {
            alert('Fehler beim Speichern: ' + e.message);
        }
    }
}

// LocalStorage-Nutzung prüfen
function checkStorageUsage() {
    try {
        const totalSize = new Blob([JSON.stringify(trees)]).size;
        const maxSize = 5 * 1024 * 1024; // 5MB geschätzte Grenze
        const usagePercent = (totalSize / maxSize) * 100;
        
        if (usagePercent > 80) {
            alert(`⚠️ Speicherwarnung: ${usagePercent.toFixed(0)}% des Speichers belegt.\n\nBitte erstellen Sie bald ein CSV-Backup und löschen Sie alte Einträge.`);
        }
    } catch (e) {
        console.error('Fehler bei Speicherprüfung:', e);
    }
}

function loadTreesFromStorage() {
    const stored = localStorage.getItem('baumentwicklung_trees');
    if (stored) {
        trees = JSON.parse(stored);
    }
}

function updateSavedCount() {
    document.getElementById('savedCount').textContent = `${trees.length} Bäume gespeichert`;
}

// Helper for Date Formatting
function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// CSV Export
function exportToCSV() {
    if (trees.length === 0) {
        alert('Keine Daten zum Exportieren vorhanden.');
        return;
    }
    
    // CSV Header
    const headers = [
        'Erstellt am', 'Zuletzt bearbeitet', 'x', 'y',
        'ID (z.B. "LRO-B-9")',
        'Name(n) der durchführenden Person(en)',
        'Untersuchte Baumart',
        'Ergänzungen/Problembeschreibungen (S. 2)',
        'Höhe in XXX cm',
        'Ergänzungen/Problembeschreibungen (S. 3)',
        'Umfang in XXX mm (Standard)',
        'Durchmesser in XXX mm (falls Umfang nicht möglich)',
        'Ergänzungen/Problembeschreibungen (S. 4)',
        'Durchschnittliche Länge der einjährigen Triebe in XXX cm',
        'Ergänzungen/Problembeschreibungen (S.5)',
        'Neigung',
        'Ästungshöhe in XXX cm',
        'Auf welcher Höhe befindet sich der erste Ast mit mehr als 3 cm Durchmesser? in XXX cm',
        'Anzahl der > 3 cm dicken Äste bis zur Höhe von 2 m',
        'Ergänzungen/Problembeschreibungen (S. 6)',
        'Art des Gehölzschutzes',
        'andere - Art des Gehölzschutzes',
        'Zustand des Gehölzschutzes',
        'Ist der Stamm geweißelt?',
        'Wie ist der Baum angebunden?',
        'Ergänzungen/Problembeschreibungen (S. 7)',
        'Art des Managements',
        'andere - Art des Managements',
        'Zustand der Baumscheibe',
        'weitere Makel - Zustand der Baumscheibe',
        'Ergänzungen/Problembeschreibungen (S.8)',
        'Anzahl offener Schnittwunden',
        'Erfassung weiterer Schäden und Krankheiten',
        'weitere - Erfassung weiterer Schäden und Krankheiten',
        'Beschreibung der Schäden und Krankheiten',
        'Auffälligkeiten im Freifeld notieren',
        'Ergänzungen/Problembeschreibungen (S.9)',
        'Feedback zur App?'
    ];
    
    // CSV Rows
    const separator = ';';
    let csv = headers.join(separator) + '\n';
    
    trees.forEach(tree => {
        const row = headers.map(header => {
            let value = tree[header];
            
            // Spezielle Behandlung für Datum
            if (header === 'Erstellt am') value = formatDate(tree.createdAt);
            else if (header === 'Zuletzt bearbeitet') value = formatDate(tree.updatedAt);
            else value = value || '';
            
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
    
    // Zeitstempel mit Datum und Uhrzeit: 2026-01-07_08-07-01
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Baumentwicklung_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✓ CSV-Export erfolgreich (${trees.length} Bäume)`);
}

// CSV Import
function handleCSVImport(e) {
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

// CSV Parser
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
    const trees = [];
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
            trees.push(tree);
        }
    }
    
    console.log('Geparste Bäume:', trees.length);
    return trees;
}

// Parse single CSV line (handles quoted fields with delimiters)
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

// Parse date string to ISO format
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

// Merge imported trees with existing trees
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

// Check and merge two tree records
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

// Data Modal
function showDataModal() {
    const modal = document.getElementById('dataModal');
    const dataList = document.getElementById('dataList');
    
    if (trees.length === 0) {
        dataList.innerHTML = '<p style="text-align:center;color:#757575;">Noch keine Bäume gespeichert.</p>';
        document.getElementById('treeMap').style.display = 'none';
    } else {
        document.getElementById('treeMap').style.display = 'block';
        
        // Gruppiere Bäume nach ID
        const grouped = {};
        trees.forEach((tree, index) => {
            const id = tree['ID (z.B. "LRO-B-9")'];
            if (!grouped[id]) {
                grouped[id] = [];
            }
            grouped[id].push({ tree, index });
        });
        
        // Sortiere IDs
        const sortedIds = Object.keys(grouped).sort();
        
        // HTML generieren
        dataList.innerHTML = sortedIds.map(id => {
            const entries = grouped[id];
            const isDuplicate = entries.length > 1;
            
            return `
                <div class="data-group${isDuplicate ? ' duplicate-group' : ''}">
                    <h3 class="data-group-header">${id}${isDuplicate ? ` <span style="color:#f44336;font-size:0.9em;">(${entries.length}x erfasst)</span>` : ''}</h3>
                    <div class="data-group-items">
                        ${entries.map(({ tree, index }) => {
                            const currentId = tree['ID (z.B. "LRO-B-9")'];
                            const nextTreeId = incrementTreeId(currentId);
                            const nextRowId = incrementRowId(currentId);
                            const nextTreeExists = treeExists(nextTreeId);
                            const nextRowExists = treeExists(nextRowId);
                            
                            const nextTreeLabel = nextTreeExists ? '✏️ Nächsten bearbeiten' : '➡️ Nächsten anlegen';
                            const nextRowLabel = nextRowExists ? '✏️ Nächste Reihe bearbeiten' : '⏩ Nächste Reihe anlegen';
                            
                            return `
                            <div class="data-item${isDuplicate ? ' duplicate-item' : ''}">
                                <p><strong>Baumart:</strong> ${tree['Untersuchte Baumart']}</p>
                                <p><strong>Erfasst:</strong> ${formatDate(tree.createdAt)}</p>
                                <p><strong>Bearbeitet:</strong> ${formatDate(tree.updatedAt)}</p>
                                <p><strong>Höhe:</strong> ${tree['Höhe in XXX cm']} cm</p>
                                <p><strong>Position:</strong> ${tree.y && tree.x && parseFloat(tree.y) !== 0 ? `${tree.y}, ${tree.x}` : 'Keine GPS-Daten'}</p>
                                <p><strong>Person:</strong> ${tree['Name(n) der durchführenden Person(en)']}</p>
                                <div class="data-item-actions">
                                    <button class="btn btn-primary" onclick="editTree(${index})">✏️ Bearbeiten</button>
                                    <button class="btn btn-primary" onclick="nextTreeInRow(${index})">${nextTreeLabel}</button>
                                    <button class="btn btn-primary" onclick="nextTreeInNextRow(${index})">${nextRowLabel}</button>
                                    <button class="btn btn-secondary" onclick="deleteTree(${index})">🗑️ Löschen</button>
                                </div>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    modal.classList.add('active');
    
    // Canvas nach Modal-Öffnung neu zeichnen für korrekte Größe
    if (trees.length > 0) {
        setTimeout(() => drawTreeMap(), 100);
    }
}

// Baum bearbeiten
function editTree(index) {
    editingTreeIndex = index;
    const tree = trees[index];
    loadTreeToForm(tree, true);
    showFormScreen();
    updateButtonLabels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Prüft ob eine Baum-ID bereits existiert
function treeExists(baumId) {
    return trees.some(tree => tree['ID (z.B. "LRO-B-9")'] === baumId);
}

// Aktualisiert Button-Texte basierend auf der aktuellen Baum-ID
function updateButtonLabels() {
    const baumIdInput = document.getElementById('baumId');
    if (!baumIdInput || !baumIdInput.value) return;
    
    const currentId = baumIdInput.value;
    const nextTreeId = incrementTreeId(currentId);
    const nextRowId = incrementRowId(currentId);
    
    const nextTreeExists = treeExists(nextTreeId);
    const nextRowExists = treeExists(nextRowId);
    
    const saveNextTreeBtn = document.getElementById('saveNextTreeBtn');
    const saveNextRowBtn = document.getElementById('saveNextRowBtn');
    
    if (saveNextTreeBtn) {
        if (nextTreeExists) {
            saveNextTreeBtn.innerHTML = '✏️ Speichern und nächsten Baum bearbeiten';
        } else {
            saveNextTreeBtn.innerHTML = '➡️ Speichern und nächsten Baum anlegen';
        }
    }
    
    if (saveNextRowBtn) {
        if (nextRowExists) {
            saveNextRowBtn.innerHTML = '✏️ Speichern und nächste Reihe bearbeiten';
        } else {
            saveNextRowBtn.innerHTML = '⏩ Speichern und nächste Reihe anlegen';
        }
    }
}

// Nächster Baum in Reihe
function nextTreeInRow(index) {
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

// Nächster Baum in nächster Reihe
function nextTreeInNextRow(index) {
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

// Baumdaten ins Formular laden
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

// Generate color from string
function getColorFromString(str) {
    if (!str) return '#666666';
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color (varying hue, fixed saturation and lightness for good contrast)
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Tree Map Visualization
function drawTreeMap() {
    const canvas = document.getElementById('treeMapCanvas');
    const ctx = canvas.getContext('2d');
    const legend = document.getElementById('mapLegend');
    
    // Set canvas size - ensure minimum width
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(rect.width, 300);
    canvas.height = 400;
    
    console.log('Canvas Größe:', canvas.width, 'x', canvas.height);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Show all trees if no GPS coordinates
    if (trees.length === 0) {
        ctx.fillStyle = '#757575';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Noch keine Bäume gespeichert', canvas.width / 2, canvas.height / 2);
        legend.innerHTML = '';
        return;
    }
    
    // Filter trees with valid coordinates
    const validTrees = trees.filter(tree => {
        const lat = parseFloat(tree.y);
        const lon = parseFloat(tree.x);
        const hasCoords = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
        if (hasCoords) {
            console.log('Baum mit GPS:', tree['ID (z.B. "LRO-B-9")'], 'Lat:', lat, 'Lon:', lon);
        }
        return hasCoords;
    });
    
    console.log('Bäume mit GPS:', validTrees.length, 'von', trees.length);
    
    if (validTrees.length === 0) {
        ctx.fillStyle = '#757575';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Keine Bäume mit GPS-Positionen vorhanden', canvas.width / 2, canvas.height / 2);
        ctx.fillText(`(${trees.length} Bäume ohne GPS-Daten)`, canvas.width / 2, canvas.height / 2 + 25);
        
        // Show legend for all trees anyway
        const speciesCounts = {};
        trees.forEach(tree => {
            const species = tree['Untersuchte Baumart'] || 'Unbekannt';
            speciesCounts[species] = (speciesCounts[species] || 0) + 1;
        });
        
        legend.innerHTML = '<p style="margin-bottom:0.5rem;font-weight:500;">Baumarten (ohne GPS):</p>' +
            Object.entries(speciesCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([species, count]) => `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${getColorFromString(species)}"></div>
                    <span>${species}</span>
                    <span class="legend-count">(${count})</span>
                </div>
            `).join('');
        return;
    }
    
    // Find bounds
    const lats = validTrees.map(t => parseFloat(t.y));
    const lons = validTrees.map(t => parseFloat(t.x));
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Add padding
    const padding = 40;
    const latRange = maxLat - minLat || 0.001;
    const lonRange = maxLon - minLon || 0.001;
    
    // Korrektur für Seitenverhältnis - beide Achsen gleich skalieren
    // Verwende das größere Range für beide Achsen damit Proportionen stimmen
    const maxRange = Math.max(latRange, lonRange);
    const scale = Math.min(
        (canvas.width - 2 * padding) / maxRange,
        (canvas.height - 2 * padding) / maxRange
    );
    
    // Zentriere die Karte
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    // Count trees by species
    const speciesCounts = {};
    validTrees.forEach(tree => {
        const species = tree['Untersuchte Baumart'] || 'Unbekannt';
        speciesCounts[species] = (speciesCounts[species] || 0) + 1;
    });
    
    // Draw trees
    validTrees.forEach((tree, idx) => {
        const lat = parseFloat(tree.y);
        const lon = parseFloat(tree.x);
        const species = tree['Untersuchte Baumart'] || 'Unbekannt';
        
        // Map coordinates to canvas mit korrektem Seitenverhältnis
        const x = canvas.width / 2 + (lon - centerLon) * scale;
        const y = canvas.height / 2 - (lat - centerLat) * scale;
        
        console.log(`Baum ${idx + 1}: Canvas Position x=${x.toFixed(1)}, y=${y.toFixed(1)}`);
        
        // Draw tree point - größerer Radius für bessere Sichtbarkeit
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = getColorFromString(species);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // ID Label wenn nur wenige Bäume
        if (validTrees.length <= 10) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(tree['ID (z.B. "LRO-B-9")'], x, y - 16);
        }
    });
    
    // Draw axes labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('West ← → Ost', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Süd ← → Nord', 0, 0);
    ctx.restore();
    
    // Create legend
    legend.innerHTML = Object.entries(speciesCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([species, count]) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${getColorFromString(species)}"></div>
                <span>${species}</span>
                <span class="legend-count">(${count})</span>
            </div>
        `).join('');
}

function deleteTree(index) {
    if (confirm(`Baum ${trees[index]['ID (z.B. "LRO-B-9")']} wirklich löschen?`)) {
        trees.splice(index, 1);
        saveTreesToStorage();
        updateSavedCount();
        showDataScreen();
    }
}

function clearAllData() {
    if (confirm('Wirklich ALLE gespeicherten Bäume löschen? Dies kann nicht rückgängig gemacht werden!')) {
        if (confirm('Letzte Warnung: Alle ' + trees.length + ' Bäume werden gelöscht!')) {
            trees = [];
            saveTreesToStorage();
            updateSavedCount();
            showWelcomeScreen();
            alert('Alle Daten wurden gelöscht.');
        }
    }
}

// Online Status
function updateOnlineStatus() {
    const status = document.getElementById('onlineStatus');
    if (navigator.onLine) {
        status.className = 'online';
        status.textContent = '●';
    } else {
        status.className = 'offline';
        status.textContent = '●';
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}

// Help System
function showHelp(topic) {
    const modal = document.getElementById('helpModal');
    const content = document.getElementById('helpContent');
    
    const helpTexts = {
        'baumId': `
            <h3>Baum-ID vergeben</h3>
            <p>Die Baum-ID ist super wichtig und ist so aufgebaut: <strong>Lokalgruppe-Baumreihe-Baum</strong></p>
            <p><strong>Beispiele:</strong></p>
            <ul>
                <li>LRO-B-9 (Lokalgruppe LRO, Reihe B, Baum 9)</li>
                <li>DA-C-2 (Lokalgruppe DA, Reihe C, Baum 2)</li>
            </ul>
            <p><strong>Bei mehrstämmigen Bäumen:</strong></p>
            <p>Füllt mehrere Formulare aus und benennt:</p>
            <ul>
                <li>Den dicksten Stämmling: LRO-B-9.1</li>
                <li>Den zweitdicksten: LRO-B-9.2</li>
                <li>usw.</li>
            </ul>
        `,
        
        'wuchshoehe': `
            <h3>Wuchshöhe messen</h3>
            <p><strong>Ist der Baum 4 m oder kleiner?</strong></p>
            <p>Messung mit dem Zollstock. Um bis 4 m zu messen, einfach den Zollstock am Stamm ansetzen und in zwei Teilen die Höhe ermitteln.</p>
            
            <p><strong>Ist der Baum größer (bis ca. 6 m)?</strong></p>
            <p>Nutzung von Teleskopstab/Dachlatte/gerade Stange mit Becher zum Überstülpen der Baumspitze.</p>
            
            <p><strong>Zu hoch für die direkte Messung?</strong></p>
            <p>Nutzung des "Försterdreiecks" (siehe Anleitung unten)</p>
            
            <h3>Anleitung Försterdreieck:</h3>
            <ol>
                <li>Geraden Stock in die Hand nehmen und Arm waagerecht ausstrecken.</li>
                <li>Stock Richtung Gesicht kippen, bis er waagerecht ist und vorsichtig in der Hand verschieben, bis seine Spitze an der Schläfe auf Augenhöhe anliegt. Dabei das Handgelenk nicht abknicken!</li>
            </ol>
            <img src="images/foerstner_kalibration.jpg" alt="Kalibrierung">
            <ol start="3">
                <li>Den Stock senkrecht Richtung Baum halten und die Griffstelle markieren für kommende Messungen.</li>
            </ol>
            <img src="images/foerstner_seite.jpg" alt="Seitenansicht">
            <ol start="4">
                <li>Mit ausgestrecktem Arm und senkrechtem Stock so lange rückwärtsgehen (möglichst nicht hangaufwärts oder -abwärts!), bis der Stock so lang wie der Baum erscheint (dabei ggf. ein Auge schließen).</li>
            </ol>
            <img src="images/foerstner_ego.jpg" alt="Ego-Perspektive">
            <ol start="5">
                <li>Von dort den Abstand zwischen dem eigenen Auge (oder auf dem Boden der Fußknöchel) und dem Baum mit dem langen Maßband messen. Diese Distanz entspricht der Baumhöhe.</li>
            </ol>
        `,
        
        'trieblaenge': `
            <h3>Trieblänge messen</h3>
            <p>Schätzt die durchschnittliche Länge der einjährigen Triebe im oberen äußeren Baumbereich (Wachstum im vergangenen Jahr).</p>
            <p>Diese beginnen an ihrem Ansatz, der "Triebbasisnarbe". Dort sitzen viele Knospen gedrungen zusammen:</p>
            <img src="images/trieb.jpg" alt="Trieb-Erklärung">
            <p><strong>Bei toten Bäumen:</strong> 0 eintragen</p>
        `,
        
        'neigung': `
            <h3>Neigung des Baums</h3>
            <p>Wie gerade steht der Baum? (gedachte Linie vom Stammfuß bis zur Baumspitze)</p>
            <img src="images/neigung.png" alt="Neigungswinkel">
            <p><strong>Kategorien:</strong></p>
            <ul>
                <li><strong>Sehr gerade:</strong> < 10° Neigung</li>
                <li><strong>Leicht geneigt:</strong> > 10° Neigung</li>
                <li><strong>Sehr geneigt:</strong> > 30° Neigung</li>
            </ul>
        `,
        
        'baumscheibe': `
            <h3>Was ist eine Baumscheibe?</h3>
            <p>Darunter verstehen wir hier den <strong>Bereich von 1 m Durchmesser</strong> um den Baum, in dem sich die Konkurrenz zu anderen Pflanzen besonders nachteilig für junge Bäume auswirken kann.</p>
            <p><strong>Wichtig:</strong> Betrachtet nur diesen Bereich, unabhängig davon, wie die Fläche drumherum aussieht.</p>
        `
    };
    
    content.innerHTML = helpTexts[topic] || '<p>Keine Hilfe verfügbar.</p>';
    modal.classList.add('active');
}

function closeHelp() {
    document.getElementById('helpModal').classList.remove('active');
}

// Close help modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('helpModal');
    if (e.target === modal) {
        closeHelp();
    }
});