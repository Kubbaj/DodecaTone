// pattern.js

export class Pattern {
    constructor(wheel) {
        this.wheel = wheel;
        this.currentPattern = [];
        this.patternSvg = null;
    }

    initialize() {
        this.createPatternSvg();
    }

    createPatternSvg() {
        if (!this.wheel.svg) {
            console.error("Wheel SVG not yet created");
            return;
        }
        this.patternSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.patternSvg.setAttribute("width", "300");
        this.patternSvg.setAttribute("height", "300");
        this.patternSvg.setAttribute("viewBox", "0 0 300 300");
        this.patternSvg.style.position = "absolute";
        this.patternSvg.style.top = "0";
        this.patternSvg.style.left = "0";
        this.patternSvg.style.overflow = "visible";
        this.patternSvg.style.pointerEvents = "none";
        this.wheel.svg.appendChild(this.patternSvg);
    }

    updatePattern(patternNotes) {
        this.currentPattern = patternNotes;
        this.drawPatternPolygon();
    }

    drawPatternPolygon() {
        this.patternSvg.innerHTML = ''; // Clear previous content

        if (!this.currentPattern || this.currentPattern.length === 0) return;

        console.log('Current Pattern:', this.currentPattern);
        console.log('Current Tonic:', this.wheel.currentTonic);
        console.log('Wheel Radius:', this.wheel.radius);

        const polygonRadius = this.wheel.radius * 0.82; // Adjust this factor as needed

        const points = this.currentPattern.map(noteIndex => {
            const actualNoteIndex = (noteIndex + this.wheel.config.notes.indexOf(this.wheel.currentTonic)) % 12;
            const notePosition = this.wheel.notePositions.get(actualNoteIndex);
            console.log(`Note ${actualNoteIndex}: Position ${notePosition}`);

            const angle = (notePosition * 30) * (Math.PI / 180) - Math.PI / 2;
            const x = Math.cos(angle) * polygonRadius;
            const y = Math.sin(angle) * polygonRadius;
            console.log(`Calculated point: (${x}, ${y})`);
            return `${x},${y}`;
        }).join(' ');

        console.log('Polygon Points:', points);

        // Draw the pattern polygon
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points);
        polygon.setAttribute("fill", "rgba(0, 0, 0, 0.1)");
        polygon.setAttribute("stroke", "black");
        polygon.setAttribute("stroke-width", "2");
        this.patternSvg.appendChild(polygon);

        console.log('Pattern SVG after drawing:', this.patternSvg.outerHTML);
    }
}