// Screen Navigation
import { trees } from './state.js';
import { formatDate, incrementTreeId, incrementRowId, treeExists } from './helpers.js';
import { drawTreeMap } from './map.js';
import { editTree, nextTreeInRow, nextTreeInNextRow, deleteTree } from './form.js';

export function showWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('treeForm').style.display = 'none';
    document.getElementById('dataScreen').style.display = 'none';
    document.getElementById('backToWelcomeBtn').style.display = 'none';
    document.getElementById('backFromDataBtn').style.display = 'none';
    document.getElementById('viewDataBtn').style.display = 'inline-block';
}

export function showFormScreen() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('treeForm').style.display = 'block';
    document.getElementById('dataScreen').style.display = 'none';
    document.getElementById('backToWelcomeBtn').style.display = 'inline-block';
    document.getElementById('backFromDataBtn').style.display = 'none';
    document.getElementById('viewDataBtn').style.display = 'inline-block';
    // Button-Labels aktualisieren wenn Formular angezeigt wird
    setTimeout(() => updateButtonLabels(), 50);
    // Nach oben scrollen damit alle Felder sichtbar sind
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showDataScreen() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('treeForm').style.display = 'none';
    document.getElementById('dataScreen').style.display = 'block';
    document.getElementById('backToWelcomeBtn').style.display = 'none';
    document.getElementById('backFromDataBtn').style.display = 'inline-block';
    document.getElementById('viewDataBtn').style.display = 'none';
    
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
                                    <button class="btn btn-primary" onclick="window.editTree(${index})">✏️ Bearbeiten</button>
                                    <button class="btn btn-primary" onclick="window.nextTreeInRow(${index})">${nextTreeLabel}</button>
                                    <button class="btn btn-primary" onclick="window.nextTreeInNextRow(${index})">${nextRowLabel}</button>
                                    <button class="btn btn-secondary" onclick="window.deleteTree(${index})">🗑️ Löschen</button>
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

export function updateButtonLabels() {
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

// Expose functions to window for onclick handlers
window.editTree = editTree;
window.nextTreeInRow = nextTreeInRow;
window.nextTreeInNextRow = nextTreeInNextRow;
window.deleteTree = deleteTree;
