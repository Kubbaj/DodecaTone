// pattern.js
import { playNoteForDuration } from './app.js';

export class Pattern {
    constructor(keyboard, wheel, animate) {
        this.keyboard = keyboard;
        this.wheel = wheel;
        this.animate = animate;
        this.currentPattern = [];
        this.playButton = document.getElementById('play-pattern-button');
        this.bracketVisualization = new BracketVisualization(this.bracketContainer);
        this.currentRotation = 0;
        this.currentTranslation = 0;
    }

    initialize() {
        
        this.createPatternSvg();
        this.playButton.addEventListener('click', () => this.playPattern());

        this.bracketContainer = document.getElementById('bracket-svg-container');
        if (this.bracketContainer) {
            this.bracketVisualization = new BracketVisualization(this.bracketContainer);
        } else {
            console.error("Bracket container not found");
        }
        document.getElementById('shift-pattern-left').addEventListener('click', () => this.shiftPattern('left'));
        document.getElementById('shift-pattern-right').addEventListener('click', () => this.shiftPattern('right'));
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

        const shiftLeftButton = document.getElementById('shift-pattern-left');
        const shiftRightButton = document.getElementById('shift-pattern-right');
    
    if (this.currentPattern.length > 0) {
        shiftLeftButton.style.display = 'block';
        shiftRightButton.style.display = 'block';
    } else {
        shiftLeftButton.style.display = 'none';
        shiftRightButton.style.display = 'none';
    }
}

createPatternSvg() {
    this.patternSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.patternSvg.setAttribute("width", "100%");
    this.patternSvg.setAttribute("height", "100%");
    this.patternSvg.setAttribute("viewBox", "-95 -95 190 190"); // Adjust these values as needed
    this.patternSvg.style.position = "absolute";
    this.patternSvg.style.top = "0";
    this.patternSvg.style.left = "0";
    
    const polygonWindow = document.getElementById('polygon-window');
    polygonWindow.appendChild(this.patternSvg);
}
    
async animatePatternTransition(oldLayout, newLayout) {
    if (!this.animate || this.currentPattern.length === 0) return;

    const originalPolygon = this.patternSvg.querySelector('polygon');
    originalPolygon.style.display = 'none';  // Hide the original polygon

    const startPoints = this.calculatePolygonPoints(oldLayout);
    const endPoints = this.calculatePolygonPoints(newLayout);

    const tempPolygon = originalPolygon.cloneNode(true);
    tempPolygon.style.display = ''; // Ensure the cloned polygon is visible
    this.patternSvg.appendChild(tempPolygon);

    const duration = 750; // milliseconds
    const steps = 60; // For smoother animation

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const currentPoints = this.interpolatePoints(startPoints, endPoints, progress);
        tempPolygon.setAttribute('points', currentPoints.join(' '));
        await new Promise(resolve => setTimeout(resolve, duration / steps));
    }

    this.patternSvg.removeChild(tempPolygon);
    await this.drawPatternPolygon(); // Update with the final position
    originalPolygon.style.display = ''; // Show the original polygon again
}

calculatePolygonPoints(layout) {
    const tonicIndex = this.wheel.config.notes.indexOf(this.wheel.currentTonic);
    const polygonRadius = this.wheel.radius * 0.8;

    // Calculate points for all 12 positions
    const allPoints = Array(12).fill().map((_, i) => {
        const noteIndex = (i + tonicIndex) % 12;
        const notePosition = layout[noteIndex];
        const angle = (notePosition * 30) * (Math.PI / 180) - Math.PI / 2;
        const x = Math.cos(angle) * polygonRadius;
        const y = Math.sin(angle) * polygonRadius;
        return { x, y, index: i };
    });

    // Filter to only the points in our pattern
    return this.currentPattern
        .map(interval => allPoints.find(point => point.index === interval))
        .filter(point => point !== undefined);
}

interpolatePoints(startPoints, endPoints, progress) {
    return startPoints.map((start, index) => {
        const end = endPoints[index];
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress;
        return `${x},${y}`;
    });
}

    drawPatternPolygon() {
        this.patternSvg.innerHTML = ''; // Clear previous content

        if (!this.currentPattern || this.currentPattern.length === 0) return;

        console.log('Current Pattern:', this.currentPattern);
        console.log('Current Tonic:', this.wheel.currentTonic);

        const polygonRadius = this.wheel.radius * 0.8; // Adjust this factor as needed

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
        polygon.setAttribute("fill", "#222222");
        polygon.setAttribute("stroke", "white");
        polygon.setAttribute("stroke-width", "4");
        this.patternSvg.appendChild(polygon);
    }

    async shiftPattern(direction) {
        if (this.currentPattern.length < 2) {
            console.log("Pattern is too short to shift");
            return;
        }
    
        let shiftAmount;
        if (direction === 'right') {
            shiftAmount = this.currentPattern[1] - this.currentPattern[0];
        } else if (direction === 'left') {
            shiftAmount = 12 - (this.currentPattern[this.currentPattern.length - 1] - this.currentPattern[0]);
        } else {
            console.error("Invalid shift direction");
            return;
        }
    
        console.log(`Shifting pattern ${direction} by ${shiftAmount} steps`);
    
        // Calculate the new pattern
        const newPattern = this.currentPattern.map(interval => {
            let newInterval = direction === 'right' 
                ? (interval - shiftAmount + 12) % 12
                : (interval + shiftAmount) % 12;
            return newInterval;
        });
    
        // Sort the new pattern
        newPattern.sort((a, b) => a - b);
    
        console.log("Original pattern:", this.currentPattern);
        console.log("New pattern:", newPattern);
    
        console.log("PATTERNNN ANIMATE:", this.animate)
        // Animate the changes
        if (this.animate) {
            console.log("ANIMATING TRANSITION")
            await Promise.all([
                this.animatePolygon(direction, shiftAmount),
                this.bracketVisualization.animateBracket(direction, shiftAmount)
            ]);
        }
    
        // Update the current pattern
        this.currentPattern = newPattern;
    
        // Update visuals
        this.updatePattern(this.currentPattern);
        this.updateKeyboardHighlight();
    }

    getCurrentPattern() {
        return this.currentPattern;
    }
    
    updateKeyboardHighlight() {
        const tonicIndex = this.wheel.config.notes.indexOf(this.wheel.currentTonic);
        const playableToneNotes = this.currentPattern.map(interval => {
            const noteIndex = (interval + tonicIndex) % 12;
            const note = this.wheel.config.notes[noteIndex];
            const octave = this.wheel.currentOctave + (noteIndex < tonicIndex ? 1 : 0);
            return this.wheel.formatToneNote(note, octave);
        });
         // Add the top note (one octave above the tonic)
    const topNote = this.wheel.formatToneNote(this.wheel.currentTonic, this.wheel.currentOctave + 1);
    playableToneNotes.push(topNote);

    this.keyboard.updatePatternHighlight(playableToneNotes);
    }
    
    async animatePolygon(direction, shiftAmount) {
        const tempPolygon = this.patternSvg.querySelector('polygon').cloneNode(true);
        this.patternSvg.appendChild(tempPolygon);
    
        const originalPolygon = this.patternSvg.querySelector('polygon');
        originalPolygon.style.opacity = '0';
    
        const duration = 450; // milliseconds
        const steps = 60; // For smoother animation
        const totalRotation = shiftAmount * 30; // 30 degrees per step
        const rotationPerStep = totalRotation / steps;
    
        for (let i = 0; i <= steps; i++) {
            const rotation = i * rotationPerStep * (direction === 'right' ? -1 : 1);
            tempPolygon.setAttribute('transform', `rotate(${rotation})`);
            await new Promise(resolve => setTimeout(resolve, duration / steps));
        }
    
        this.patternSvg.removeChild(tempPolygon);
        originalPolygon.style.opacity = '1';
    }

// PLAYBACK FUNCTIONS

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
            this.patternGroup = this.createPatternGroup();
            this.horizontalLine = this.createHorizontalLine();
        }
    }

    createSVG() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "325");
        svg.setAttribute("height", "40");
        this.container.appendChild(svg);
        return svg;
    }

    createPatternGroup() {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(group);
        return group;
    }

    createHorizontalLine() {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "10.5");
        line.setAttribute("y1", "15");
        line.setAttribute("x2", "314.5");
        line.setAttribute("y2", "15");
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "4");
        line.setAttribute("class", "horizontal-line");
        line.setAttribute("display", "none"); // Initially hidden
        this.patternGroup.appendChild(line);
        return line;
    }

    updatePattern(pattern) {
        this.patternGroup.innerHTML = '';
        this.patternGroup.appendChild(this.horizontalLine);
        
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
        line.setAttribute("y1", 15);
        line.setAttribute("x2", 12.5 + noteIndex * 25);
        line.setAttribute("y2", 35);
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "4");
        this.patternGroup.appendChild(line);
    }

    async animateBracket(direction, shiftAmount) {
        const duration = 450; // milliseconds
        const steps = 60; // For smoother animation
        const totalShift = shiftAmount * 25; // 25 pixels per step
        const shiftPerStep = totalShift / steps;

        const tempGroup = this.patternGroup.cloneNode(true);
        this.svg.appendChild(tempGroup);
        this.patternGroup.style.opacity = '0';

        for (let i = 0; i <= steps; i++) {
            const shift = i * shiftPerStep * (direction === 'right' ? -1 : 1);
            tempGroup.setAttribute('transform', `translate(${shift} 0)`);
            tempGroup.setAttribute('easing', `ease-in-out`);
            await new Promise(resolve => setTimeout(resolve, duration / steps));
        }

        this.svg.removeChild(tempGroup);
        this.patternGroup.style.opacity = '1';
    }
}