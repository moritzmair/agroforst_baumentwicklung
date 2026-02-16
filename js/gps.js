// GPS Location Handling
export function getGPSLocation() {
    const btn = document.getElementById('getLocationBtn');
    const display = document.getElementById('locationDisplay');
    
    if (!navigator.geolocation) {
        showGPSError('❌ GPS wird von diesem Gerät/Browser nicht unterstützt.\n\nBitte verwenden Sie ein Gerät mit GPS-Funktion oder geben Sie die Koordinaten manuell ein.');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '📍 GPS wird ermittelt...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lon;
            
            display.textContent = `📍 Position: ${lat}, ${lon} (±${Math.round(position.coords.accuracy)}m)`;
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
            errorDetails = 'Bitte erlauben Sie in den Geräte- bzw. Browser-Einstellungen den Zugriff auf Ihren Standort.\n\n';
            errorDetails += '📱 iOS Safari: Einstellungen → Safari → Standort → "Beim Verwenden der App erlauben"\n';
            errorDetails += '🤖 Android Chrome: Einstellungen → Website-Einstellungen → Standort → Erlauben';
            break;
            
        case error.POSITION_UNAVAILABLE:
            errorMessage = '📡 GPS-Position nicht verfügbar';
            errorDetails = 'Das GPS-Signal kann nicht empfangen werden.\n\n';
            errorDetails += 'Mögliche Ursachen:\n';
            errorDetails += '• GPS ist am Gerät deaktiviert\n';
            errorDetails += '• Sie befinden sich in einem Gebäude oder Tunnel\n';
            errorDetails += '• Schlechter Satellitenempfang\n\n';
            errorDetails += 'Bitte versuchen Sie es im Freien erneut oder aktivieren Sie GPS in den Geräteeinstellungen.';
            break;
            
        case error.TIMEOUT:
            errorMessage = '⏱️ GPS-Timeout';
            errorDetails = 'Die GPS-Position konnte nicht innerhalb der vorgegebenen Zeit ermittelt werden.\n\n';
            errorDetails += 'Tipps:\n';
            errorDetails += '• Bewegen Sie sich ins Freie\n';
            errorDetails += '• Warten Sie einen Moment und versuchen Sie es erneut\n';
            errorDetails += '• Stellen Sie sicher, dass GPS aktiviert ist';
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
