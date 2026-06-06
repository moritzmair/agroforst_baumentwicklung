// GPS Location Handling

// Proaktive Standortberechtigung beim App-Start anfordern.
// Auf iOS (PWA) sorgt dies dafür, dass das System die Berechtigung
// dauerhaft speichert und die Option „Immer erlauben" angeboten wird.
export function requestLocationPermission() {
    if (!navigator.geolocation) return;

    // Permissions API: Zustand prüfen ohne erneuten Prompt
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                // Berechtigung bereits erteilt – kein Prompt nötig
                return;
            }
            if (result.state === 'prompt') {
                // Einmalig still anfordern, damit iOS „Immer erlauben" anbietet
                navigator.geolocation.getCurrentPosition(
                    () => {}, // Erfolg – nichts tun
                    () => {}, // Fehler – still ignorieren
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
                );
            }
            // Bei 'denied' nichts tun – Nutzer hat explizit abgelehnt
        }).catch(() => {
            // Permissions API nicht verfügbar – direkt anfordern
            navigator.geolocation.getCurrentPosition(
                () => {},
                () => {},
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
            );
        });
    } else {
        // Kein Permissions API (ältere Browser) – direkt anfordern
        navigator.geolocation.getCurrentPosition(
            () => {},
            () => {},
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
    }
}

export function getGPSLocation() {
    const btn = document.getElementById('getLocationBtn');
    const display = document.getElementById('locationDisplay');
    
    if (!navigator.geolocation) {
        showGPSError('❌ GPS wird von diesem Gerät/Browser nicht unterstützt.\n\nBitte verwende ein Gerät mit GPS-Funktion oder gib die Koordinaten manuell ein.');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '📍 GPS wird ermittelt...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // toFixed(6) erzwingt Punkt als Dezimaltrennzeichen (locale-unabhängig)
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lon.toFixed(6);
            
            display.textContent = `📍 Position: ${lat.toFixed(6)}, ${lon.toFixed(6)} (±${Math.round(position.coords.accuracy)}m)`;
            display.classList.add('active');
            display.classList.remove('error');
            
            btn.disabled = false;
            btn.textContent = '✓ Position erfasst';
            setTimeout(() => {
                btn.textContent = '📍 GPS Position erfassen';
            }, 3000);
        },
        (error) => {
            handleGPSError(error, display);
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

function handleGPSError(error, display) {
    let errorMessage = '';
    let errorDetails = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = '🚫 GPS-Zugriff wurde verweigert';
            errorDetails = 'Bitte erlaube in den Geräte- bzw. Browser-Einstellungen den Zugriff auf deinen Standort.\n\n';
            errorDetails += '📱 iOS Safari: Einstellungen → Safari → Standort → "Beim Verwenden der App erlauben"\n';
            errorDetails += '🤖 Android Chrome: Einstellungen → Website-Einstellungen → Standort → Erlauben';
            break;
            
        case error.POSITION_UNAVAILABLE:
            errorMessage = '📡 GPS-Position nicht verfügbar';
            errorDetails = 'Das GPS-Signal kann nicht empfangen werden.\n\n';
            errorDetails += 'Mögliche Ursachen:\n';
            errorDetails += '• GPS ist am Gerät deaktiviert\n';
            errorDetails += '• Du befindest dich in einem Gebäude oder Tunnel\n';
            errorDetails += '• Schlechter Satellitenempfang\n\n';
            errorDetails += 'Bitte versuche es im Freien erneut oder aktiviere GPS in den Geräteeinstellungen.';
            break;
            
        case error.TIMEOUT:
            errorMessage = '⏱️ GPS-Timeout';
            errorDetails = 'Die GPS-Position konnte nicht innerhalb der vorgegebenen Zeit ermittelt werden.\n\n';
            errorDetails += 'Tipps:\n';
            errorDetails += '• Bewege dich ins Freie\n';
            errorDetails += '• Warte einen Moment und versuche es erneut\n';
            errorDetails += '• Stelle sicher, dass GPS aktiviert ist';
            break;
            
        default:
            errorMessage = '❌ GPS-Fehler';
            errorDetails = 'Ein unbekannter Fehler ist aufgetreten.\n\n';
            errorDetails += 'Technische Details: ' + error.message;
    }
    
    // Display error in location display
    if (display) {
        display.textContent = `${errorMessage}`;
        display.classList.add('active', 'error');
    }
    
    // Show detailed error message
    showGPSError(errorMessage + '\n\n' + errorDetails);
}

function showGPSError(message) {
    alert(message);
}
