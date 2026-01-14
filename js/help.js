// Help System
export function showHelp(topic) {
    const modal = document.getElementById('helpModal');
    const content = document.getElementById('helpContent');
    
    const helpTexts = {
        'baumId': `
            <h3>Baum-ID vergeben</h3>
            <p>Die Baum-ID ist super wichtig und ist so aufgebaut: <strong>Lokalgruppe-Baumreihe-Baum</strong></p>
            <p><strong>Beispiele:</strong></p>
            <ul>
                <li>LRO-B-09 (Lokalgruppe LRO, Reihe B, Baum 9)</li>
                <li>DA-C-02 (Lokalgruppe DA, Reihe C, Baum 2)</li>
            </ul>
            <p><strong>Bei mehrstämmigen Bäumen:</strong></p>
            <p>Füllt mehrere Formulare aus und benennt:</p>
            <ul>
                <li>Den dicksten Stämmling: LRO-B-09.1</li>
                <li>Den zweitdicksten: LRO-B-09.2</li>
                <li>usw.</li>
            </ul>
        `,
        
        'wuchshoehe': `
            <h3>Wuchshöhe messen</h3>
            <p><strong>Ist der Baum 4 m oder kleiner?</strong></p>
            <p>Messung mit dem Zollstock. Um bis 4 m zu messen, einfach den Zollstock am Stamm ansetzen und in zwei Teilen die Höhe ermitteln.</p>
            
            <p><strong>Ist der Baum größer (bis ca. 6 m)?</strong></p>
            <p>Nutzung von Teleskopstab/Dachlatte/gerade Stange mit Becher zum Überstülpen der Baumspitze.</p>
            
            <p><strong>Zu hoch für die direkte Messung?</strong></p>
            <p>Nutzung des "Försterdreiecks" (siehe Anleitung unten)</p>
            
            <h3>Anleitung Försterdreieck:</h3>
            <ol>
                <li>Geraden Stock in die Hand nehmen und Arm waagerecht ausstrecken.</li>
                <li>Stock Richtung Gesicht kippen, bis er waagerecht ist und vorsichtig in der Hand verschieben, bis seine Spitze an der Schläfe auf Augenhöhe anliegt. Dabei das Handgelenk nicht abknicken!</li>
            </ol>
            <img src="images/foerstner_kalibration.jpg" alt="Kalibrierung">
            <ol start="3">
                <li>Den Stock senkrecht Richtung Baum halten und die Griffstelle markieren für kommende Messungen.</li>
            </ol>
            <img src="images/foerstner_seite.jpg" alt="Seitenansicht">
            <ol start="4">
                <li>Mit ausgestrecktem Arm und senkrechtem Stock so lange rückwärtsgehen (möglichst nicht hangaufwärts oder -abwärts!), bis der Stock so lang wie der Baum erscheint (dabei ggf. ein Auge schließen).</li>
            </ol>
            <img src="images/foerstner_ego.jpg" alt="Ego-Perspektive">
            <ol start="5">
                <li>Von dort den Abstand zwischen dem eigenen Auge (oder auf dem Boden der Fußknöchel) und dem Baum mit dem langen Maßband messen. Diese Distanz entspricht der Baumhöhe.</li>
            </ol>
        `,
        
        'trieblaenge': `
            <h3>Trieblänge messen</h3>
            <p>Schätzt die durchschnittliche Länge der einjährigen Triebe im oberen äußeren Baumbereich (Wachstum im vergangenen Jahr).</p>
            <p>Diese beginnen an ihrem Ansatz, der "Triebbasisnarbe". Dort sitzen viele Knospen gedrungen zusammen:</p>
            <img src="images/trieb.jpg" alt="Trieb-Erklärung">
            <p><strong>Bei toten Bäumen:</strong> 0 eintragen</p>
        `,
        
        'neigung': `
            <h3>Neigung des Baums</h3>
            <p>Wie gerade steht der Baum? (gedachte Linie vom Stammfuß bis zur Baumspitze)</p>
            <img src="images/neigung.png" alt="Neigungswinkel">
            <p><strong>Kategorien:</strong></p>
            <ul>
                <li><strong>Sehr gerade:</strong> < 10° Neigung</li>
                <li><strong>Leicht geneigt:</strong> > 10° Neigung</li>
                <li><strong>Sehr geneigt:</strong> > 30° Neigung</li>
            </ul>
        `,
        
        'baumscheibe': `
            <h3>Was ist eine Baumscheibe?</h3>
            <p>Darunter verstehen wir hier den <strong>Bereich von 1 m Durchmesser</strong> um den Baum, in dem sich die Konkurrenz zu anderen Pflanzen besonders nachteilig für junge Bäume auswirken kann.</p>
            <p><strong>Wichtig:</strong> Betrachtet nur diesen Bereich, unabhängig davon, wie die Fläche drumherum aussieht.</p>
        `
    };
    
    content.innerHTML = helpTexts[topic] || '<p>Keine Hilfe verfügbar.</p>';
    modal.classList.add('active');
}

export function closeHelp() {
    document.getElementById('helpModal').classList.remove('active');
}

// Expose to window for onclick handlers
window.showHelp = showHelp;
window.closeHelp = closeHelp;
