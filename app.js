// App State
let trees = [];
let photos = [];

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
    const copyPrevBtn = document.getElementById('copyPrevBtn');
    const exportBtn = document.getElementById('exportBtn');
    const viewDataBtn = document.getElementById('viewDataBtn');
    const resetBtn = document.getElementById('resetBtn');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const fotoInput = document.getElementById('foto');
    const modal = document.getElementById('dataModal');
    const closeBtn = document.querySelector('#dataModal .close');
    const clearAllBtn = document.getElementById('clearAllBtn');

    form.addEventListener('submit', handleSubmit);
    copyPrevBtn.addEventListener('click', copyPreviousData);
    exportBtn.addEventListener('click', exportToCSV);
    viewDataBtn.addEventListener('click', () => {
        showDataModal();
    });
    resetBtn.addEventListener('click', resetForm);
    getLocationBtn.addEventListener('click', getGPSLocation);
    fotoInput.addEventListener('change', handlePhotoUpload);
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    clearAllBtn.addEventListener('click', clearAllData);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Form Submit
function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const tree = {};
    
    // Datum und Zeit
    const now = new Date();
    tree.CreationDate = now.toISOString().split('T')[0];
    tree.Jahr = now.getFullYear();
    
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
    tree['Auffälligkeiten im Freifeld notieren'] = formData.get('ergaenzungen_s9') || '';
    tree['Ergänzungen/Problembeschreibungen (S.9)'] = formData.get('ergaenzungen_s9') || '';
    
    // Fotos
    if (photos.length > 0) {
        tree._photos = photos;
    }
    
    // Speichern
    trees.push(tree);
    saveTreesToStorage();
    updateSavedCount();
    
    // Feedback
    alert(`✓ Baum ${tree['ID (z.B. "LRO-B-9")']} erfolgreich gespeichert!`);
    
    // Form zurücksetzen aber Name behalten
    const currentName = formData.get('name');
    const currentBaumart = formData.get('baumart');
    resetForm();
    document.getElementById('name').value = currentName;
    document.getElementById('baumart').value = currentBaumart;
    photos = [];
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Copy Previous Data
function copyPreviousData() {
    if (trees.length === 0) {
        alert('Noch keine Bäume gespeichert.');
        return;
    }
    
    const lastTree = trees[trees.length - 1];
    
    // Felder ausfüllen
    document.getElementById('name').value = lastTree['Name(n) der durchführenden Person(en)'] || '';
    document.getElementById('baumart').value = lastTree['Untersuchte Baumart'] || '';
    
    // Gehölzschutz
    if (lastTree['Art des Gehölzschutzes']) {
        const schutzTypes = lastTree['Art des Gehölzschutzes'].split(',');
        document.querySelectorAll('input[name="schutz"]').forEach(cb => {
            cb.checked = schutzTypes.includes(cb.value);
        });
    }
    document.getElementById('schutz_zustand').value = lastTree['Zustand des Gehölzschutzes'] || '';
    document.getElementById('stamm_geweisselt').value = lastTree['Ist der Stamm geweißelt?'] || '';
    
    // Anbindung
    if (lastTree['Wie ist der Baum angebunden?']) {
        const anbindung = lastTree['Wie ist der Baum angebunden?'].split(',');
        document.querySelectorAll('input[name="anbindung"]').forEach(cb => {
            cb.checked = anbindung.includes(cb.value);
        });
    }
    
    // Management
    if (lastTree['Art des Managements']) {
        const management = lastTree['Art des Managements'].split(',');
        document.querySelectorAll('input[name="management"]').forEach(cb => {
            cb.checked = management.includes(cb.value);
        });
    }
    
    // Neigung
    document.getElementById('neigung').value = lastTree['Neigung'] || '';
    
    alert('✓ Daten vom vorherigen Baum übernommen!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset Form
function resetForm() {
    document.getElementById('treeForm').reset();
    document.getElementById('locationDisplay').classList.remove('active');
    document.getElementById('photoPreview').innerHTML = '';
    photos = [];
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
    localStorage.setItem('baumentwicklung_trees', JSON.stringify(trees));
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

// CSV Export
function exportToCSV() {
    if (trees.length === 0) {
        alert('Keine Daten zum Exportieren vorhanden.');
        return;
    }
    
    // CSV Header
    const headers = [
        'CreationDate', 'x', 'y', 'Jahr',
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
    let csv = headers.join('\t') + '\n';
    
    trees.forEach(tree => {
        const row = headers.map(header => {
            let value = tree[header] || '';
            // Escape tabs and newlines
            value = String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
            return value;
        });
        csv += row.join('\t') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Baumentwicklung_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✓ CSV-Export erfolgreich (${trees.length} Bäume)`);
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
        
        dataList.innerHTML = trees.map((tree, index) => `
            <div class="data-item">
                <h3>${tree['ID (z.B. "LRO-B-9")']}</h3>
                <p><strong>Baumart:</strong> ${tree['Untersuchte Baumart']}</p>
                <p><strong>Datum:</strong> ${tree.CreationDate}</p>
                <p><strong>Höhe:</strong> ${tree['Höhe in XXX cm']} cm</p>
                <p><strong>Position:</strong> ${tree.y && tree.x && parseFloat(tree.y) !== 0 ? `${tree.y}, ${tree.x}` : 'Keine GPS-Daten'}</p>
                <p><strong>Person:</strong> ${tree['Name(n) der durchführenden Person(en)']}</p>
                <div class="data-item-actions">
                    <button class="btn btn-secondary" onclick="deleteTree(${index})">🗑️ Löschen</button>
                </div>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
    
    // Canvas nach Modal-Öffnung neu zeichnen für korrekte Größe
    if (trees.length > 0) {
        setTimeout(() => drawTreeMap(), 100);
    }
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
        showDataModal();
    }
}

function clearAllData() {
    if (confirm('Wirklich ALLE gespeicherten Bäume löschen? Dies kann nicht rückgängig gemacht werden!')) {
        if (confirm('Letzte Warnung: Alle ' + trees.length + ' Bäume werden gelöscht!')) {
            trees = [];
            saveTreesToStorage();
            updateSavedCount();
            document.getElementById('dataModal').classList.remove('active');
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
                <li><strong>Sehr gerade:</strong> &lt; 10° Neigung</li>
                <li><strong>Leicht geneigt:</strong> &gt; 10° Neigung</li>
                <li><strong>Sehr geneigt:</strong> &gt; 30° Neigung</li>
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