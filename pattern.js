// pattern.js
import { playNoteForDuration } from './app.js';

export class Pattern {
    constructor(wheel) {
        this.wheel = wheel;
        this.currentPattern = [];
        this.playButton = document.getElementById('play-pattern-button');
        this.bracketVisualization = new BracketVisualization(this.bracketContainer);
    }

    initialize() {
        this.createPatternSvg();
        this.playButton.addEventListener('click', () => this.playPattern());

        this.bracketContainer = document.getElementById('bracket-window');
        if (this.bracketContainer) {
            this.bracketVisualization = new BracketVisualization(this.bracketContainer);
        } else {
            console.error("Bracket container not found");
        }
    }
    updatePattern(patternNotes) {
        this.currentPattern = patternNotes;
        this.drawPatternPolygon();
        this.bracketVisualization.updatePattern(patternNotes);
    
        const tonicIndex = this.wheel.config.notes.indexOf(this.wheel.currentTonic);
        const updatedPatternNotes = patternNotes.map(interval => 
            (interval + tonicIndex) % 12
        );
        this.wheel.updatePatternHighlight(updatedPatternNotes);
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
        this.wheel.svg.insertBefore(this.patternSvg, this.wheel.notesGroup);
    }

    drawPatternPolygon() {
        this.patternSvg.innerHTML = ''; // Clear previous content

        if (!this.currentPattern || this.currentPattern.length === 0) return;

        console.log('Current Pattern:', this.currentPattern);
        console.log('Current Tonic:', this.wheel.currentTonic);

        const polygonRadius = this.wheel.radius * 0.83; // Adjust this factor as needed

        const points = this.currentPattern.map(noteIndex => {
            const actualNoteIndex = (noteIndex + this.wheel.config.notes.indexOf(this.wheel.currentTonic)) % 12;
            const notePosition = this.wheel.notePositions.get(actualNoteIndex);
            console.log(`Note ${actualNoteIndex}: Position ${notePosition}`);

            const angle = (notePosition * 30) * (Math.PI / 180) - Math.PI / 2;
            const x = Math.cos(angle) * polygonRadius;
            const y = Math.sin(angle) * polygonRadius;
            return `${x},${y}`;
        }).join(' ');

        // Draw the pattern polygon
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points);
        polygon.setAttribute("fill", "rgba(230, 230, 230, 0.3)");
        polygon.setAttribute("stroke", "white");
        polygon.setAttribute("stroke-width", "4");
        this.patternSvg.appendChild(polygon);
    }


// In pattern.js

createPlayButton() {
    const playButton = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    playButton.setAttribute("cx", "150");
    playButton.setAttribute("cy", "150");
    playButton.setAttribute("r", "20");
    playButton.setAttribute("fill", "#f5f5f5");
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

class BracketVisualization {
    constructor(container) {
        if (!container) {
            console.error("No container provided for BracketVisualization");
            return;
        }
        this.container = container;
        this.svg = this.createSVG();
        if (this.svg) {
            this.horizontalLine = this.createHorizontalLine();
            this.patternGroup = this.createPatternGroup();
        }
    }

    createSVG() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "325");
        svg.setAttribute("height", "40");
        this.container.appendChild(svg);
        return svg;
    }

    createHorizontalLine() {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "10.5"); // Shifted 2px to the left
        line.setAttribute("y1", "15"); // 20px from the bottom
        line.setAttribute("x2", "314.5"); // 4px longer (2px on each side)
        line.setAttribute("y2", "15"); // 20px from the bottom
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "4");
        line.setAttribute("display", "none"); // Initially hidden
        this.svg.appendChild(line);
        return line;
    }

    createPatternGroup() {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(group);
        return group;
    }

    updatePattern(pattern) {
        this.patternGroup.innerHTML = '';
        
        if (pattern.length > 0) {
            this.horizontalLine.setAttribute("display", "inline"); // Show horizontal line
            
            pattern.forEach(noteIndex => {
                this.createVerticalLine(noteIndex);
            });
            
            // Add extra line for the octave
            this.createVerticalLine(12);
        } else {
            this.horizontalLine.setAttribute("display", "none"); // Hide horizontal line
        }
    }

    createVerticalLine(noteIndex) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 12.5 + noteIndex * 25);
        line.setAttribute("y1", 15); // Start at horizontal line (20px from bottom)
        line.setAttribute("x2", 12.5 + noteIndex * 25);
        line.setAttribute("y2", 35); // End at bottom of bracket
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "4");
        this.patternGroup.appendChild(line);
    }

    slidePattern(amount) {
        // Implement sliding animation here
    }
}