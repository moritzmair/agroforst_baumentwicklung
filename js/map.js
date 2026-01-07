// Tree Map Visualization with pan, zoom and click support
import { trees } from './state.js';
import { getColorFromString } from './helpers.js';

// Map transform state
let mapState = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    minScale: 0.5,
    maxScale: 5,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    // Touch-spezifisch
    isPinching: false,
    lastTouchDistance: 0
};

// Baum-Positionen für Hit-Detection
let treePositions = [];

// Canvas-Referenz
let canvas = null;
let ctx = null;

export function drawTreeMap() {
    canvas = document.getElementById('treeMapCanvas');
    ctx = canvas.getContext('2d');
    const legend = document.getElementById('mapLegend');
    
    // Set canvas size - ensure minimum width
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(rect.width, 300);
    canvas.height = 400;
    
    // Event-Listeners nur einmal hinzufügen
    if (!canvas.dataset.listenersAdded) {
        setupEventListeners();
        canvas.dataset.listenersAdded = 'true';
    }
    
    // Reset transform
    mapState.offsetX = 0;
    mapState.offsetY = 0;
    mapState.scale = 1;
    
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
        return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
    });
    
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
    
    // Berechne Bounds und speichere Tree-Daten
    prepareTreeData(validTrees);
    
    // Count trees by species
    const speciesCounts = {};
    validTrees.forEach(tree => {
        const species = tree['Untersuchte Baumart'] || 'Unbekannt';
        speciesCounts[species] = (speciesCounts[species] || 0) + 1;
    });
    
    // Draw map
    redrawMap();
    
    // Create legend
    legend.innerHTML = '<p style="margin-bottom:0.5rem;font-weight:500;">🖱️ Klicke Bäume an | Verschieben & Zoomen</p>' +
        Object.entries(speciesCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([species, count]) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${getColorFromString(species)}"></div>
                <span>${species}</span>
                <span class="legend-count">(${count})</span>
            </div>
        `).join('');
}

function prepareTreeData(validTrees) {
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
    
    // Beide Achsen gleich skalieren
    const maxRange = Math.max(latRange, lonRange);
    const scale = Math.min(
        (canvas.width - 2 * padding) / maxRange,
        (canvas.height - 2 * padding) / maxRange
    );
    
    // Zentriere die Karte
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    // Speichere Tree-Positionen für Hit-Detection
    treePositions = validTrees.map(tree => {
        const lat = parseFloat(tree.y);
        const lon = parseFloat(tree.x);
        const species = tree['Untersuchte Baumart'] || 'Unbekannt';
        const id = tree['ID (z.B. "LRO-B-9")'];
        
        // Basis-Koordinaten (ohne Transform)
        const baseX = canvas.width / 2 + (lon - centerLon) * scale;
        const baseY = canvas.height / 2 - (lat - centerLat) * scale;
        
        return {
            baseX,
            baseY,
            species,
            id,
            tree
        };
    });
}

function redrawMap() {
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context
    ctx.save();
    
    // Apply transform
    ctx.translate(mapState.offsetX, mapState.offsetY);
    ctx.scale(mapState.scale, mapState.scale);
    
    // Draw trees
    treePositions.forEach((pos, idx) => {
        const { baseX, baseY, species, id } = pos;
        
        // Draw tree point
        ctx.beginPath();
        ctx.arc(baseX, baseY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = getColorFromString(species);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // ID Label wenn nur wenige Bäume oder wenn gezoomt
        if (treePositions.length <= 10 || mapState.scale > 1.5) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(id, baseX, baseY - 16);
        }
    });
    
    // Restore context
    ctx.restore();
    
    // Draw axes labels (nicht transformiert)
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('West ← → Ost', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Süd ← → Nord', 0, 0);
    ctx.restore();
}

// Transform canvas coordinates to tree space
function screenToTree(screenX, screenY) {
    return {
        x: (screenX - mapState.offsetX) / mapState.scale,
        y: (screenY - mapState.offsetY) / mapState.scale
    };
}

// Hit-Test: Finde angeklickten Baum
function findTreeAtPosition(x, y) {
    const treeCoords = screenToTree(x, y);
    const hitRadius = 15 / mapState.scale; // Größerer Hit-Radius bei Zoom
    
    for (let i = treePositions.length - 1; i >= 0; i--) {
        const pos = treePositions[i];
        const distance = Math.sqrt(
            Math.pow(treeCoords.x - pos.baseX, 2) + 
            Math.pow(treeCoords.y - pos.baseY, 2)
        );
        
        if (distance <= hitRadius) {
            return pos;
        }
    }
    
    return null;
}

// Scroll zu Baum in der Liste
function scrollToTree(treeId) {
    const dataList = document.getElementById('dataList');
    if (!dataList) return;
    
    // Finde die Gruppe mit dieser ID
    const groups = dataList.querySelectorAll('.data-group');
    for (const group of groups) {
        const header = group.querySelector('.data-group-header');
        if (header && header.textContent.includes(treeId)) {
            group.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Highlight-Effekt
            group.style.transition = 'background-color 0.5s';
            group.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                group.style.backgroundColor = '';
            }, 2000);
            break;
        }
    }
}

// Event-Listener Setup
function setupEventListeners() {
    // Maus-Events
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);
    
    // Touch-Events
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    
    // Cursor-Style
    canvas.style.cursor = 'grab';
}

// Maus-Events
function onMouseDown(e) {
    mapState.isDragging = true;
    mapState.lastX = e.offsetX;
    mapState.lastY = e.offsetY;
    canvas.style.cursor = 'grabbing';
}

function onMouseMove(e) {
    if (!mapState.isDragging) {
        // Check if over tree for cursor change
        const tree = findTreeAtPosition(e.offsetX, e.offsetY);
        canvas.style.cursor = tree ? 'pointer' : 'grab';
        return;
    }
    
    const deltaX = e.offsetX - mapState.lastX;
    const deltaY = e.offsetY - mapState.lastY;
    
    mapState.offsetX += deltaX;
    mapState.offsetY += deltaY;
    
    mapState.lastX = e.offsetX;
    mapState.lastY = e.offsetY;
    
    redrawMap();
}

function onMouseUp() {
    mapState.isDragging = false;
    canvas.style.cursor = 'grab';
}

function onClick(e) {
    // Nur wenn nicht gedraggt wurde
    if (mapState.isDragging) return;
    
    const tree = findTreeAtPosition(e.offsetX, e.offsetY);
    if (tree) {
        scrollToTree(tree.id);
    }
}

function onWheel(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Zoom-Faktor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(mapState.minScale, Math.min(mapState.maxScale, mapState.scale * zoomFactor));
    
    if (newScale !== mapState.scale) {
        // Zoom zum Mauszeiger
        const treeCoordsBefore = screenToTree(mouseX, mouseY);
        
        mapState.scale = newScale;
        
        const treeCoordsAfter = screenToTree(mouseX, mouseY);
        
        // Offset anpassen damit Punkt unter Maus konstant bleibt
        mapState.offsetX += (treeCoordsAfter.x - treeCoordsBefore.x) * mapState.scale;
        mapState.offsetY += (treeCoordsAfter.y - treeCoordsBefore.y) * mapState.scale;
        
        redrawMap();
    }
}

// Touch-Events
function onTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
        // Single touch: Pan
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mapState.isDragging = true;
        mapState.lastX = touch.clientX - rect.left;
        mapState.lastY = touch.clientY - rect.top;
    } else if (e.touches.length === 2) {
        // Two fingers: Pinch to zoom
        mapState.isPinching = true;
        mapState.isDragging = false;
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        mapState.lastTouchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
    }
}

function onTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 1 && mapState.isDragging && !mapState.isPinching) {
        // Single touch: Pan
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        const deltaX = touchX - mapState.lastX;
        const deltaY = touchY - mapState.lastY;
        
        mapState.offsetX += deltaX;
        mapState.offsetY += deltaY;
        
        mapState.lastX = touchX;
        mapState.lastY = touchY;
        
        redrawMap();
    } else if (e.touches.length === 2 && mapState.isPinching) {
        // Pinch to zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const rect = canvas.getBoundingClientRect();
        
        const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (mapState.lastTouchDistance > 0) {
            const zoomFactor = distance / mapState.lastTouchDistance;
            const newScale = Math.max(mapState.minScale, Math.min(mapState.maxScale, mapState.scale * zoomFactor));
            
            if (newScale !== mapState.scale) {
                // Zoom zum Mittelpunkt zwischen den Fingern
                const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
                const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
                
                const treeCoordsBefore = screenToTree(centerX, centerY);
                
                mapState.scale = newScale;
                
                const treeCoordsAfter = screenToTree(centerX, centerY);
                
                mapState.offsetX += (treeCoordsAfter.x - treeCoordsBefore.x) * mapState.scale;
                mapState.offsetY += (treeCoordsAfter.y - treeCoordsBefore.y) * mapState.scale;
                
                redrawMap();
            }
        }
        
        mapState.lastTouchDistance = distance;
    }
}

function onTouchEnd(e) {
    e.preventDefault();
    
    if (e.touches.length === 0) {
        // Alle Finger weg
        if (!mapState.isPinching && !mapState.isDragging) {
            // War ein Tap - prüfe auf Tree-Click
            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            const tree = findTreeAtPosition(touchX, touchY);
            if (tree) {
                scrollToTree(tree.id);
            }
        }
        
        mapState.isDragging = false;
        mapState.isPinching = false;
        mapState.lastTouchDistance = 0;
    } else if (e.touches.length === 1) {
        // Ein Finger übrig - zurück zu Pan
        mapState.isPinching = false;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mapState.lastX = touch.clientX - rect.left;
        mapState.lastY = touch.clientY - rect.top;
    }
}
