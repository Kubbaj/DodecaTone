// pattern.js
import { playNoteForDuration } from './app.js';

export class Pattern {
    constructor(wheel) {
        this.wheel = wheel;
        this.currentPattern = [];
        this.playButton = document.getElementById('play-pattern-button');
    }

    initialize() {
        this.createPatternSvg();
        this.playButton.addEventListener('click', () => this.playPattern());
    }

    updatePattern(patternNotes) {
        this.currentPattern = patternNotes;
        this.drawPatternPolygon();
        if (this.currentPattern.length > 0) {
            this.playButton.style.display = "block";
            console.log("play button visible");
        } else {
            this.playButton.style.display = "none";
            console.log("play button INvisible");
        }
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


// In pattern.js

createPlayButton() {
    const playButton = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    playButton.setAttribute("cx", "150");
    playButton.setAttribute("cy", "150");
    playButton.setAttribute("r", "20");
    playButton.setAttribute("fill", "#555555");
    playButton.style.cursor = "pointer";

    const playIcon = document.createElementNS("http://www.w3.org/2000/svg", "path");
    playIcon.setAttribute("d", "M145,140 L145,160 L160,150 Z");
    playIcon.setAttribute("fill", "white");

    const buttonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    buttonGroup.appendChild(playButton);
    buttonGroup.appendChild(playIcon);
    buttonGroup.style.display = "none";

    buttonGroup.addEventListener("click", () => this.playPattern());

    this.patternSvg.appendChild(buttonGroup);
    this.playButtonGroup = buttonGroup;
    console.log("play button created")
}

playPattern() {
    const toneNotes = this.calculateToneNotes();
    this.playToneNotes(toneNotes);
}

calculateToneNotes() {
    const tonic = this.wheel.currentTonic;
    const startingOctave = this.wheel.currentOctave;
    const tonicIndex = this.wheel.config.notes.indexOf(tonic);

    console.log(`Starting calculation for tonic: ${tonic}, octave: ${startingOctave}`);

    let currentOctave = startingOctave;
    let previousNoteIndex = tonicIndex;

    const toneNotes = this.currentPattern.map((intervalFromTonic, patternIndex) => {
        const noteIndex = (tonicIndex + intervalFromTonic) % 12;
        const note = this.wheel.config.notes[noteIndex];
        const isBlackNote = note.includes('/');
        const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);

        // Increment octave if we've wrapped around
        if (noteIndex < previousNoteIndex && patternIndex > 0) {
            currentOctave++;
        }
        previousNoteIndex = noteIndex;

        const toneNote = `${baseTone}${currentOctave}`;
        console.log(`Pattern index: ${patternIndex}, Note: ${note}, Tone note: ${toneNote}`);
        return toneNote;
    });

    // Add the tonic an octave higher than the starting octave
    const finalOctave = startingOctave + 1;
    const isTonicBlackNote = tonic.includes('/');
    const tonicBaseTone = isTonicBlackNote ? tonic.charAt(0) + '#' : tonic.charAt(0);
    const finalToneNote = `${tonicBaseTone}${finalOctave}`;
    toneNotes.push(finalToneNote);

    console.log(`Final tone notes: ${toneNotes.join(', ')}`);
    return toneNotes;
}

playToneNotes(toneNotes) {
    let index = 0;
    const playNextNote = () => {
        if (index < toneNotes.length) {
            playNoteForDuration(toneNotes[index], 350);
            
            // Animate the note on the wheel
            if (index === toneNotes.length - 1) {
                // For the last note, animate the tonic note element
                const tonicIndex = this.wheel.config.notes.indexOf(this.wheel.currentTonic);
                const tonicElement = this.wheel.noteElements.get(tonicIndex);
                if (tonicElement) {
                    this.wheel.animateNotePress(tonicElement, true);
                    setTimeout(() => {
                        this.wheel.animateNotePress(tonicElement, false);
                    }, 350);
                }
            }
            
            setTimeout(() => {
                index++;
                playNextNote();
            }, 450); // Wait a bit longer than the note duration
        }
    };
    playNextNote();
}

}