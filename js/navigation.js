// Screen Navigation
import { trees, previousScreen, setPreviousScreen } from './state.js';
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
    // WICHTIG: Kein 'smooth' hier - auf Firefox Android bewirkt eine laufende
    // Scroll-Animation dass die Tastatur sofort wieder geschlossen wird
    window.scrollTo(0, 0);
}

// ── Hilfsfunktion: Bäume filtern und sortieren ──────────────────────────────

function getSortedFilteredTrees(searchTerm, sortKey) {
    // Jeder Eintrag bekommt seinen ursprünglichen Index mitgeliefert
    let entries = trees.map((tree, index) => ({ tree, index }));

    // Filtern
    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        entries = entries.filter(({ tree }) => {
            const id      = (tree['ID (z.B. "LRO-B-9")'] || '').toLowerCase();
            const species = (tree['Untersuchte Baumart'] || '').toLowerCase();
            const person  = (tree['Name(n) der durchführenden Person(en)'] || '').toLowerCase();
            return id.includes(q) || species.includes(q) || person.includes(q);
        });
    }

    // Sortieren
    entries.sort((a, b) => {
        const tA = a.tree;
        const tB = b.tree;
        switch (sortKey) {
            case 'id-asc':
                return (tA['ID (z.B. "LRO-B-9")'] || '').localeCompare(tB['ID (z.B. "LRO-B-9")'] || '', 'de', { numeric: true });
            case 'id-desc':
                return (tB['ID (z.B. "LRO-B-9")'] || '').localeCompare(tA['ID (z.B. "LRO-B-9")'] || '', 'de', { numeric: true });
            case 'date-desc':
                return new Date(tB.createdAt || 0) - new Date(tA.createdAt || 0);
            case 'date-asc':
                return new Date(tA.createdAt || 0) - new Date(tB.createdAt || 0);
            case 'species-asc':
                return (tA['Untersuchte Baumart'] || '').localeCompare(tB['Untersuchte Baumart'] || '', 'de');
            default:
                return 0;
        }
    });

    return entries;
}

// ── Datenliste rendern (wird auch bei Suche/Sortierung erneut aufgerufen) ───

function renderDataList(searchTerm = '', sortKey = 'id-asc') {
    const dataList = document.getElementById('dataList');
    const resultInfo = document.getElementById('searchResultInfo');

    if (trees.length === 0) {
        dataList.innerHTML = '<p style="text-align:center;color:#757575;">Noch keine Bäume gespeichert.</p>';
        document.getElementById('treeMap').style.display = 'none';
        resultInfo.style.display = 'none';
        return;
    }

    document.getElementById('treeMap').style.display = 'block';

    const entries = getSortedFilteredTrees(searchTerm, sortKey);

    // Suchergebnis-Info
    if (searchTerm) {
        resultInfo.style.display = 'block';
        if (entries.length === 0) {
            resultInfo.textContent = `Keine Bäume für „${searchTerm}" gefunden.`;
            resultInfo.className = 'search-result-info search-no-results';
        } else {
            resultInfo.textContent = `${entries.length} von ${trees.length} Bäumen gefunden.`;
            resultInfo.className = 'search-result-info';
        }
    } else {
        resultInfo.style.display = 'none';
    }

    if (entries.length === 0) {
        dataList.innerHTML = '<p style="text-align:center;color:#757575;">Keine Bäume entsprechen der Suche.</p>';
        return;
    }

    // Gruppiere nach ID (Reihenfolge der Gruppen folgt der gewählten Sortierung)
    const groupOrder = [];
    const grouped = {};
    entries.forEach(({ tree, index }) => {
        const id = tree['ID (z.B. "LRO-B-9")'];
        if (!grouped[id]) {
            grouped[id] = [];
            groupOrder.push(id);
        }
        grouped[id].push({ tree, index });
    });

    // HTML generieren
    dataList.innerHTML = groupOrder.map(id => {
        const grpEntries = grouped[id];
        const isDuplicate = grpEntries.length > 1;

        return `
            <div class="data-group${isDuplicate ? ' duplicate-group' : ''}">
                <h3 class="data-group-header">${id}${isDuplicate ? ` <span style="color:#f44336;font-size:0.9em;">(${grpEntries.length}x erfasst)</span>` : ''}</h3>
                <div class="data-group-items">
                    ${grpEntries.map(({ tree, index }) => {
                        const currentId   = tree['ID (z.B. "LRO-B-9")'];
                        const nextTreeId  = incrementTreeId(currentId);
                        const nextRowId   = incrementRowId(currentId);
                        const nextTreeExists = treeExists(nextTreeId);
                        const nextRowExists  = treeExists(nextRowId);

                        const nextTreeLabel = nextTreeExists ? '✏️ Nächsten bearbeiten' : '➡️ Nächsten anlegen';
                        const nextRowLabel  = nextRowExists  ? '✏️ Nächste Reihe bearbeiten' : '⏩ Nächste Reihe anlegen';

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

// ── Suche & Sortierung initialisieren (einmalig beim ersten Öffnen) ──────────

let searchSortInitialized = false;

function initSearchSort() {
    if (searchSortInitialized) return;
    searchSortInitialized = true;

    const searchInput   = document.getElementById('treeSearchInput');
    const clearBtn      = document.getElementById('clearSearchBtn');
    const sortSelect    = document.getElementById('treeSortSelect');

    function refresh() {
        renderDataList(searchInput.value.trim(), sortSelect.value);
    }

    searchInput.addEventListener('input', () => {
        clearBtn.style.display = searchInput.value ? 'flex' : 'none';
        refresh();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        refresh();
        searchInput.focus();
    });

    sortSelect.addEventListener('change', refresh);
}

export function showDataScreen() {
    // Speichere, von welchem Screen wir kommen
    const welcomeVisible = document.getElementById('welcomeScreen').style.display !== 'none';
    const formVisible = document.getElementById('treeForm').style.display !== 'none';
    
    if (formVisible) {
        setPreviousScreen('form');
    } else if (welcomeVisible) {
        setPreviousScreen('welcome');
    }
    
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('treeForm').style.display = 'none';
    document.getElementById('dataScreen').style.display = 'block';
    document.getElementById('backToWelcomeBtn').style.display = 'none';
    document.getElementById('backFromDataBtn').style.display = 'inline-block';
    document.getElementById('viewDataBtn').style.display = 'none';

    // Suche/Sortierung einmalig verdrahten
    initSearchSort();

    // Aktuelle Suche/Sortierung auslesen und Liste rendern
    const searchInput = document.getElementById('treeSearchInput');
    const sortSelect  = document.getElementById('treeSortSelect');
    renderDataList(searchInput.value.trim(), sortSelect.value);

    // Canvas nach Screen-Wechsel neu zeichnen für korrekte Größe
    if (trees.length > 0) {
        setTimeout(() => drawTreeMap(), 100);
    }
    
    window.scrollTo(0, 0);
}

export function backFromDataScreen() {
    // Gehe zurück zum vorherigen Screen
    if (previousScreen === 'form') {
        showFormScreen();
    } else {
        showWelcomeScreen();
    }
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
