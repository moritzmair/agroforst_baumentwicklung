// Helper Functions
import { trees } from './state.js';

export function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

export function incrementTreeId(baumId) {
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

export function incrementRowId(baumId) {
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

export function treeExists(baumId) {
    return trees.some(tree => tree['ID (z.B. "LRO-B-9")'] === baumId);
}

export function getColorFromString(str) {
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

export function updateOnlineStatus() {
    const status = document.getElementById('onlineStatus');
    if (navigator.onLine) {
        status.className = 'online';
        status.textContent = '●';
    } else {
        status.className = 'offline';
        status.textContent = '●';
    }
}
