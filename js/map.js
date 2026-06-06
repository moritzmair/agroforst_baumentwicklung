// Tree Map Visualization with pan, zoom and click support
import { trees } from './state.js';
import { getColorFromString } from './helpers.js';

// Map transform state
let mapState = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    minScale: 0.5,
    maxScale: 20,
    isDragging: false,
    mouseDown: false,
    hasDragged: false,
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

// OSM Tile Cache: key → Promise<HTMLImageElement>
const tileCache = new Map();
// Resolved image cache: key → HTMLImageElement (for synchronous drawing)
const tileImgCache = new Map();
let osmEnabled = false;
// Letzter verwendeter Tile-Zoom-Level – bei Wechsel werden Caches geleert
let lastTileZoom = -1;

// Geo-Bounds der aktuellen Bäume
let geoBounds = null;

// ── Web Mercator Helpers ──────────────────────────────────────────────────────
// OSM tiles use Web Mercator (EPSG:3857). We must use the same projection
// for tree positions so they align perfectly with the tile background.

// Latitude → Mercator Y (normalised, same unit as longitude)
function latToMercY(lat) {
    const rad = lat * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + rad / 2)) * (180 / Math.PI);
}

// ── OSM Tile Helpers ──────────────────────────────────────────────────────────

function lon2tile(lon, zoom) {
    return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
    return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}

// Tile-Koordinate → Geo-Koordinate (NW-Ecke des Tiles)
function tile2lon(x, zoom) {
    return x / Math.pow(2, zoom) * 360 - 180;
}

function tile2lat(y, zoom) {
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

// Geo → Canvas-Pixel (Basis-Koordinaten, ohne mapState-Transform)
// Uses Web Mercator so the projection matches OSM tiles exactly.
function geoToBase(lat, lon) {
    if (!geoBounds) return { x: 0, y: 0 };
    const { centerMercY, centerLon, scale } = geoBounds;
    const mercY = latToMercY(lat);
    return {
        x: canvas.width / 2 + (lon - centerLon) * scale,
        y: canvas.height / 2 - (mercY - centerMercY) * scale
    };
}

// Wähle den OSM-Zoom-Level basierend auf dem aktuellen Canvas-Maßstab.
// Ein OSM-Tile ist 256×256 px. Bei Zoom z deckt die gesamte Welt 256×2^z Pixel ab.
// Wir wählen den Zoom so, dass ein Tile ungefähr seiner nativen Auflösung entspricht.
function chooseTileZoom() {
    if (!geoBounds) return 16;
    const TILE_SIZE = 256;
    // Wie viele Längengrad-Einheiten sind aktuell auf dem Canvas sichtbar?
    const visibleLonRange = canvas.width / (geoBounds.scale * mapState.scale);
    // zoom = log2((canvas.width / TILE_SIZE) × (360 / visibleLonRange))
    // +1 damit Tiles immer eine Stufe schärfer als nötig geladen werden
    const zoom = Math.floor(Math.log2((canvas.width / TILE_SIZE) * (360 / visibleLonRange))) + 1;
    // Clamp: min 1, max 19 (OSM-Limit)
    return Math.max(1, Math.min(19, zoom));
}

// Lade ein einzelnes OSM-Tile; speichert das Bild nach dem Laden auch in tileImgCache
function loadTile(x, y, zoom) {
    const key = `${zoom}/${x}/${y}`;
    if (tileCache.has(key)) return tileCache.get(key);

    const promise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // Verteile Requests auf a/b/c Subdomains
        const sub = ['a', 'b', 'c'][(x + y) % 3];
        img.src = `https://${sub}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
        img.onload = () => {
            tileImgCache.set(key, img); // sofort synchron verfügbar
            resolve(img);
            // Neu zeichnen sobald ein Tile geladen ist
            redrawMap();
        };
        img.onerror = () => resolve(null);
    });

    tileCache.set(key, promise);
    return promise;
}

// Zeichne alle im tileImgCache vorhandenen Tiles für den aktuellen Viewport synchron
function drawCachedTiles() {
    if (!osmEnabled || !geoBounds || !canvas || !ctx) return;

    const zoom = chooseTileZoom();
    const topLeft     = screenToGeo(0, 0);
    const bottomRight = screenToGeo(canvas.width, canvas.height);

    const tileMinX = lon2tile(topLeft.lon, zoom)     - 1;
    const tileMaxX = lon2tile(bottomRight.lon, zoom) + 1;
    const tileMinY = lat2tile(topLeft.lat, zoom)     - 1;
    const tileMaxY = lat2tile(bottomRight.lat, zoom) + 1;

    for (let tx = tileMinX; tx <= tileMaxX; tx++) {
        for (let ty = tileMinY; ty <= tileMaxY; ty++) {
            const key = `${zoom}/${tx}/${ty}`;
            const img = tileImgCache.get(key);
            if (!img) continue;

            const nwLat = tile2lat(ty, zoom);
            const nwLon = tile2lon(tx, zoom);
            const seLat = tile2lat(ty + 1, zoom);
            const seLon = tile2lon(tx + 1, zoom);

            const nw = geoToBase(nwLat, nwLon);
            const se = geoToBase(seLat, seLon);

            const screenX = nw.x * mapState.scale + mapState.offsetX;
            const screenY = nw.y * mapState.scale + mapState.offsetY;
            const screenW = (se.x - nw.x) * mapState.scale;
            const screenH = (se.y - nw.y) * mapState.scale;

            ctx.drawImage(img, screenX, screenY, screenW, screenH);
        }
    }
}

// Konvertiere Canvas-Screenkoordinaten zurück in Geo-Koordinaten (Längengrad, Mercator-Y)
function screenToGeo(screenX, screenY) {
    const { centerLon, centerMercY, scale } = geoBounds;
    const baseX = (screenX - mapState.offsetX) / mapState.scale;
    const baseY = (screenY - mapState.offsetY) / mapState.scale;
    const lon    = centerLon   + (baseX - canvas.width  / 2) / scale;
    const mercY  = centerMercY - (baseY - canvas.height / 2) / scale;
    // Mercator-Y → Latitude
    const lat = 2 * Math.atan(Math.exp(mercY * Math.PI / 180)) * 180 / Math.PI - 90;
    return { lat, lon };
}

// Starte Tile-Requests für den aktuellen Viewport (ohne auf Ergebnis zu warten)
function fetchVisibleTiles() {
    if (!osmEnabled || !geoBounds || !canvas) return;

    const zoom = chooseTileZoom();

    // Zoom-Level hat sich geändert → alte Tiles aus dem Speicher entfernen
    // damit drawCachedTiles() keine veralteten, unscharfen Tiles zeichnet
    if (zoom !== lastTileZoom) {
        tileCache.clear();
        tileImgCache.clear();
        lastTileZoom = zoom;
    }

    const topLeft     = screenToGeo(0, 0);
    const bottomRight = screenToGeo(canvas.width, canvas.height);

    const tileMinX = lon2tile(topLeft.lon, zoom)     - 1;
    const tileMaxX = lon2tile(bottomRight.lon, zoom) + 1;
    const tileMinY = lat2tile(topLeft.lat, zoom)     - 1;
    const tileMaxY = lat2tile(bottomRight.lat, zoom) + 1;

    // Sicherheits-Limit
    if ((tileMaxX - tileMinX + 1) > 10 || (tileMaxY - tileMinY + 1) > 10) return;

    for (let tx = tileMinX; tx <= tileMaxX; tx++) {
        for (let ty = tileMinY; ty <= tileMaxY; ty++) {
            loadTile(tx, ty, zoom); // startet Download; onload ruft redrawMap() auf
        }
    }
}

// ── Haupt-Zeichenfunktionen ───────────────────────────────────────────────────

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

    // Online-Status prüfen und OSM-Tiles laden
    osmEnabled = navigator.onLine;
    
    // Count trees by species
    const speciesCounts = {};
    validTrees.forEach(tree => {
        const species = tree['Untersuchte Baumart'] || 'Unbekannt';
        speciesCounts[species] = (speciesCounts[species] || 0) + 1;
    });
    
    // Draw map (mit oder ohne OSM-Tiles)
    redrawMap();
    
    // Create legend
    legend.innerHTML = `<p style="margin-bottom:0.5rem;font-weight:500;">🖱️ Klicke Bäume an | Verschieben & Zoomen</p>` +
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
    // Find geographic bounds
    const lats = validTrees.map(t => parseFloat(t.y));
    const lons = validTrees.map(t => parseFloat(t.x));
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Convert latitudes to Web Mercator Y (same unit as longitude degrees)
    // This ensures the canvas projection matches OSM tiles exactly.
    const minMercY = latToMercY(minLat);
    const maxMercY = latToMercY(maxLat);

    const lonRange  = maxLon  - minLon  || 0.001;
    const mercYRange = maxMercY - minMercY || 0.001;

    // Scale so the larger extent fits within the canvas with padding
    const padding = 40;
    const scale = Math.min(
        (canvas.width  - 2 * padding) / lonRange,
        (canvas.height - 2 * padding) / mercYRange
    );

    // Centre of the view in Mercator space
    const centerLon   = (minLon  + maxLon)  / 2;
    const centerMercY = (minMercY + maxMercY) / 2;

    // Speichere Geo-Bounds für OSM-Tiles und geoToBase()
    geoBounds = {
        minLat, maxLat, minLon, maxLon,
        minMercY, maxMercY,
        lonRange, mercYRange,
        centerLon, centerMercY,
        scale
    };

    // Speichere Tree-Positionen für Hit-Detection
    // Use geoToBase() so tree positions use the same Mercator math as tile drawing.
    treePositions = validTrees.map(tree => {
        const lat     = parseFloat(tree.y);
        const lon     = parseFloat(tree.x);
        const species = tree['Untersuchte Baumart'] || 'Unbekannt';
        const id      = tree['ID (z.B. "LRO-B-9")'];

        const { x: baseX, y: baseY } = geoToBase(lat, lon);

        return { baseX, baseY, species, id, tree };
    });
}

// Debounce-Timer für neue Tile-Requests
let tileDebounceTimer = null;

function redrawMap() {
    if (!canvas || !ctx) return;

    // 1. Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (osmEnabled) {
        // 2. Bereits geladene Tiles sofort synchron zeichnen (kein Flackern)
        drawCachedTiles();

        // 3. Fehlende Tiles mit Debounce nachladen
        clearTimeout(tileDebounceTimer);
        tileDebounceTimer = setTimeout(fetchVisibleTiles, 120);
    }

    // 4. Bäume immer oben drauf zeichnen
    drawTrees();
}

function drawTrees() {
    if (!canvas || !ctx) return;

    const TREE_RADIUS = 8;
    const LABEL_OFFSET = TREE_RADIUS + 4;
    
    // Draw trees in screen space so size stays constant regardless of zoom
    treePositions.forEach((pos) => {
        const { baseX, baseY, species, id } = pos;
        
        // Convert base coordinates to screen coordinates
        const screenX = baseX * mapState.scale + mapState.offsetX;
        const screenY = baseY * mapState.scale + mapState.offsetY;
        
        // Draw tree circle (fixed size)
        ctx.beginPath();
        ctx.arc(screenX, screenY, TREE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = getColorFromString(species);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // ID Label – always shown, always same size
        // Weißer Halo für bessere Lesbarkeit auf Kartenhintergrund
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 3;
        ctx.strokeText(id, screenX, screenY - LABEL_OFFSET);
        ctx.fillStyle = '#222';
        ctx.fillText(id, screenX, screenY - LABEL_OFFSET);
    });
    
    // OSM-Attribution HTML-Link ein-/ausblenden
    const osmAttr = document.getElementById('osmAttribution');
    if (osmAttr) osmAttr.style.display = osmEnabled ? 'block' : 'none';

    if (!osmEnabled) {
        // Achsenbeschriftung nur ohne OSM-Tiles (wäre auf Karte störend)
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
    const hitRadius = 12; // Fixed pixel hit radius matching drawn circle size
    
    for (let i = treePositions.length - 1; i >= 0; i--) {
        const pos = treePositions[i];
        // Convert base coords to screen coords (same as drawing)
        const screenX = pos.baseX * mapState.scale + mapState.offsetX;
        const screenY = pos.baseY * mapState.scale + mapState.offsetY;
        const distance = Math.sqrt(
            Math.pow(x - screenX, 2) +
            Math.pow(y - screenY, 2)
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

    // Online/Offline-Wechsel → Karte neu zeichnen
    window.addEventListener('online', () => {
        osmEnabled = true;
        tileCache.clear(); // Alten Cache leeren
        redrawMap();
    });
    window.addEventListener('offline', () => {
        osmEnabled = false;
        redrawMap();
    });
}

// Maus-Events
function onMouseDown(e) {
    mapState.isDragging = false; // wird erst bei tatsächlicher Bewegung gesetzt
    mapState.hasDragged = false;
    mapState.lastX = e.offsetX;
    mapState.lastY = e.offsetY;
    mapState.mouseDown = true;
    canvas.style.cursor = 'grabbing';
}

function onMouseMove(e) {
    if (!mapState.mouseDown) {
        // Check if over tree for cursor change
        const tree = findTreeAtPosition(e.offsetX, e.offsetY);
        canvas.style.cursor = tree ? 'pointer' : 'grab';
        return;
    }

    const deltaX = e.offsetX - mapState.lastX;
    const deltaY = e.offsetY - mapState.lastY;

    // Erst ab 3px Bewegung als Drag werten
    if (!mapState.isDragging && Math.abs(deltaX) + Math.abs(deltaY) > 3) {
        mapState.isDragging = true;
        mapState.hasDragged = true;
    }

    if (mapState.isDragging) {
        mapState.offsetX += deltaX;
        mapState.offsetY += deltaY;
        mapState.lastX = e.offsetX;
        mapState.lastY = e.offsetY;
        redrawMap();
    }
}

function onMouseUp() {
    mapState.mouseDown = false;
    mapState.isDragging = false;
    canvas.style.cursor = 'grab';
}

function onClick(e) {
    // Nur auslösen wenn nicht gedraggt wurde
    if (mapState.hasDragged) {
        mapState.hasDragged = false;
        return;
    }
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
