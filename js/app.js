// Main App Entry Point
import { loadTreesFromStorage, updateSavedCount } from './storage.js';
import { updateOnlineStatus } from './helpers.js';
import { showWelcomeScreen, showFormScreen, showDataScreen, updateButtonLabels } from './navigation.js';
import { saveTree, resetForm, clearAllData } from './form.js';
import { getGPSLocation } from './gps.js';
import { exportToCSV, handleCSVImport } from './csv.js';
import './help.js'; // Lädt Help-System

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
    clearAllBtn.addEventListener('click', clearAllData);
    startNewRecordBtn.addEventListener('click', () => {
        resetForm();
        showFormScreen();
    });
    backToWelcomeBtn.addEventListener('click', showWelcomeScreen);
    backFromDataBtn.addEventListener('click', showWelcomeScreen);
    
    // Close help modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('helpModal');
        if (e.target === modal) {
            window.closeHelp();
        }
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
