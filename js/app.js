// Main App Entry Point
import { loadTreesFromStorage, updateSavedCount } from './storage.js';
import { updateOnlineStatus, handleBaumIdInput } from './helpers.js';
import { showWelcomeScreen, showFormScreen, showDataScreen, updateButtonLabels, backFromDataScreen } from './navigation.js';
import { saveTree, resetForm, clearAllData } from './form.js';
import { getGPSLocation, requestLocationPermission } from './gps.js';
import { exportToCSV, handleCSVImport } from './csv.js';
import './help.js'; // Lädt Help-System

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTreesFromStorage();
    updateSavedCount();
    setupEventListeners();
    updateOnlineStatus();
    
    // Standortberechtigung proaktiv anfordern, damit iOS „Immer erlauben" anbietet
    // und die Berechtigung nach App-Neustart nicht erneut abgefragt wird.
    requestLocationPermission();
    
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
    
    // Live-Formatierung und Button-Labels für Baum-ID
    if (baumIdInput) {
        baumIdInput.addEventListener('input', (e) => {
            handleBaumIdInput(e);
            updateButtonLabels();
        });
        baumIdInput.addEventListener('blur', handleBaumIdInput);
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
    getLocationBtn.addEventListener('click', getGPSLocation);
    clearAllBtn.addEventListener('click', clearAllData);
    startNewRecordBtn.addEventListener('click', () => {
        resetForm();
        showFormScreen();
    });
    backToWelcomeBtn.addEventListener('click', showWelcomeScreen);
    backFromDataBtn.addEventListener('click', backFromDataScreen);
    
    // Close help modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('helpModal');
        if (e.target === modal) {
            window.closeHelp();
        }
    });
}

// Service Worker Registration + Version Info
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('Service Worker registered');
                // Warte bis ein aktiver SW vorhanden ist
                const sw = reg.active || reg.installing || reg.waiting;
                if (sw) {
                    requestVersionFromSW(sw);
                }
                // Falls der SW noch nicht aktiv ist, warte auf Aktivierung
                reg.addEventListener('updatefound', () => {
                    const newSW = reg.installing;
                    newSW.addEventListener('statechange', () => {
                        if (newSW.state === 'activated') {
                            requestVersionFromSW(newSW);
                        }
                    });
                });
            })
            .catch(err => console.log('Service Worker registration failed'));

        // Empfange Antwort vom SW
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.version) {
                const versionEl = document.getElementById('appVersion');
                const standEl = document.getElementById('appStand');
                if (versionEl) versionEl.textContent = `Version ${event.data.version}`;
                if (standEl) standEl.textContent = `Stand: ${event.data.date}`;
            }
        });
    });
}

function requestVersionFromSW(sw) {
    if (sw.state === 'activated') {
        sw.postMessage('GET_VERSION');
    } else {
        sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') {
                sw.postMessage('GET_VERSION');
            }
        });
    }
}
