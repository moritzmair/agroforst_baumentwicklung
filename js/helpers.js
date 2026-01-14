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
    // z.B. "LRO-B-09" -> "LRO-B-10"
    // Mehrstämmig: "DA-B-02.1" -> "DA-B-03" (Suffix wird NICHT übernommen)
    const match = baumId.match(/^([A-ZÄÖÜ]+-[A-ZÄÖÜ]+-)(\d+)(\.\d+)?$/);
    if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]) + 1;
        // Suffix wird beim Hochzählen nicht übernommen
        // Führende 0 für einstellige Zahlen
        const formattedNumber = number < 10 ? '0' + number : number;
        return prefix + formattedNumber;
    }
    return baumId;
}

export function incrementRowId(baumId) {
    // z.B. "LRO-B-09" -> "LRO-C-01"
    // Mehrstämmig: "DA-B-02.2" -> "DA-C-01" (Suffix wird NICHT übernommen)
    const match = baumId.match(/^([A-ZÄÖÜ]+-)([A-ZÄÖÜ]+)(-)(\d+)(\.\d+)?$/);
    if (match) {
        const prefix = match[1];
        const row = match[2];
        const separator = match[3];
        // Suffix wird beim Hochzählen nicht übernommen
        const nextRow = String.fromCharCode(row.charCodeAt(row.length - 1) + 1);
        return prefix + (row.slice(0, -1) + nextRow) + separator + '01';
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

export function formatBaumId(value) {
    // Formatiert die Baum-ID mit führender 0 für einstellige Zahlen
    // z.B. "LRO-B-3" -> "LRO-B-03"
    // Mehrstämmig: "DA-B-2.1" -> "DA-B-02.1"
    const match = value.match(/^([A-ZÄÖÜ]+-[A-ZÄÖÜ]+-)(\d+)(\.\d+)?$/i);
    if (match) {
        const prefix = match[1].toUpperCase();
        const number = parseInt(match[2]);
        const suffix = match[3] || ''; // z.B. ".1" oder ".2" für mehrstämmige Bäume
        // Führende 0 für einstellige Zahlen
        const formattedNumber = number < 10 ? '0' + number : number;
        return prefix + formattedNumber + suffix;
    }
    return value.toUpperCase();
}

export function handleBaumIdInput(event) {
    const input = event.target;
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;
    const newValue = formatBaumId(oldValue);
    
    if (oldValue !== newValue) {
        input.value = newValue;
        // Cursor-Position beibehalten oder anpassen
        const diff = newValue.length - oldValue.length;
        input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    }
}
