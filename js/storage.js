// Storage Operations
import { trees, setTrees } from './state.js';

export function saveTreesToStorage() {
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

export function loadTreesFromStorage() {
    const stored = localStorage.getItem('baumentwicklung_trees');
    if (stored) {
        setTrees(JSON.parse(stored));
    }
}

export function checkStorageUsage() {
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

export function updateSavedCount() {
    document.getElementById('savedCount').textContent = `${trees.length} Bäume gespeichert`;
}
