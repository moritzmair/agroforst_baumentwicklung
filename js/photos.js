// Photo Upload Handling
import { photos, setPhotos } from './state.js';

export function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('photoPreview');
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            photos.push(event.target.result);
            
            const img = document.createElement('img');
            img.src = event.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

export function clearPhotos() {
    setPhotos([]);
    const preview = document.getElementById('photoPreview');
    if (preview) {
        preview.innerHTML = '';
    }
}
