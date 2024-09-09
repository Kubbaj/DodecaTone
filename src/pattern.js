// pattern.js
import { playNoteForDuration, reverseArrowDirection } from './app.js';
import { intColors } from './config.js';  // Make sure this import is at the top of the file

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
        this.useIntervalColors = false; // Initialize useIntervalColors to false
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
        document.getElementById('shift-pattern-left-curved').addEventListener('click', () => this.shiftPattern('left'));
        document.getElementById('shift-pattern-right-curved').addEventListener('click', () => this.shiftPattern('right'));
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
    if (!this.currentPattern.length) return;

    if (!this.animate) {
        this.drawPatternPolygon();
        return;
    }

    const originalGroup = this.patternSvg.querySelector('g');
    originalGroup.style.display = 'none';

    const startSegments = this.calculatePolygonSegments(oldLayout);
    const endSegments = this.calculatePolygonSegments(newLayout);

    const tempGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const tempLines = this.createTemporaryLines(startSegments);
    tempLines.forEach(line => tempGroup.appendChild(line));
    this.patternSvg.appendChild(tempGroup);

    const duration = 750;
    const steps = 60;

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const currentSegments = this.interpolateSegments(startSegments, endSegments, progress);
        this.updateLines(tempLines, currentSegments);
        await new Promise(resolve => setTimeout(resolve, duration / steps));
    }

    this.patternSvg.removeChild(tempGroup);
    await this.drawPatternPolygon();
    originalGroup.style.display = '';
}

calculatePolygonSegments(layout) {
    const tonicIndex = this.wheel.config.notes.indexOf(this.wheel.currentTonic);
    const polygonRadius = this.wheel.radius * 0.8;

    const allPoints = Array(12).fill().map((_, i) => {
        const notePosition = layout[i];
        const angle = (notePosition * 30) * (Math.PI / 180) - Math.PI / 2;
        const x = Math.cos(angle) * polygonRadius;
        const y = Math.sin(angle) * polygonRadius;
        return { x, y, index: i };
    });

    const segments = [];
    for (let i = 0; i < this.currentPattern.length; i++) {
        const startIndex = this.currentPattern[i];
        const endIndex = this.currentPattern[(i + 1) % this.currentPattern.length];
        const start = allPoints.find(point => point.index === startIndex);
        const end = allPoints.find(point => point.index === endIndex);
        if (start && end) {
            segments.push({ start, end });
        }
    }
    return segments;
}

interpolateSegments(startSegments, endSegments, progress) {
    return startSegments.map((startSeg, index) => {
        const endSeg = endSegments[index];
        return {
            start: {
                x: startSeg.start.x + (endSeg.start.x - startSeg.start.x) * progress,
                y: startSeg.start.y + (endSeg.start.y - startSeg.start.y) * progress
            },
            end: {
                x: startSeg.end.x + (endSeg.end.x - startSeg.end.x) * progress,
                y: startSeg.end.y + (endSeg.end.y - startSeg.end.y) * progress
            }
        };
    });
}

createTemporaryLines(segments) {
    return segments.map((segment, index) => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", segment.start.x);
        line.setAttribute("y1", segment.start.y);
        line.setAttribute("x2", segment.end.x);
        line.setAttribute("y2", segment.end.y);
        
        if (this.useIntervalColors) {
            const startIndex = this.currentPattern[index];
            const endIndex = this.currentPattern[(index + 1) % this.currentPattern.length];
            const interval = (endIndex - startIndex + 12) % 12;
            line.setAttribute("stroke", intColors[interval] || "white");
        } else {
            line.setAttribute("stroke", "white");
        }
        
        line.setAttribute("stroke-width", "4");
        return line;
    });
}

updateLines(lines, segments) {
    lines.forEach((line, index) => {
        const segment = segments[index];
        line.setAttribute("x1", segment.start.x);
        line.setAttribute("y1", segment.start.y);
        line.setAttribute("x2", segment.end.x);
        line.setAttribute("y2", segment.end.y);
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
            return { x, y };
        });

        // Create a group for the polygon lines
        const polygonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Draw individual lines
        for (let i = 0; i < points.length; i++) {
            const start = points[i];
            const end = points[(i + 1) % points.length];

            // Calculate the angle of the line
            const angle = Math.atan2(end.y - start.y, end.x - start.x);

            // Extend the line by 2 pixels on each end
            const extendedStart = {
                x: start.x - 2 * Math.cos(angle),
                y: start.y - 2 * Math.sin(angle)
            };
            const extendedEnd = {
                x: end.x + 2 * Math.cos(angle),
                y: end.y + 2 * Math.sin(angle)
            };

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", extendedStart.x);
            line.setAttribute("y1", extendedStart.y);
            line.setAttribute("x2", extendedEnd.x);
            line.setAttribute("y2", extendedEnd.y);

            // Calculate the interval and set the stroke color
            const startIndex = this.currentPattern[i];
            const endIndex = this.currentPattern[(i + 1) % this.currentPattern.length];
            const interval = (endIndex - startIndex + 12) % 12;
            const strokeColor = this.useIntervalColors ? (intColors[interval] || "white") : "white";

            line.setAttribute("stroke", strokeColor);
            line.setAttribute("stroke-width", "4");

            polygonGroup.appendChild(line);
        }

        this.patternSvg.appendChild(polygonGroup);
    }

    updateIntervalColors(useIntervalColors) {
        this.useIntervalColors = useIntervalColors;
        this.drawPatternPolygon();
        this.bracketVisualization.updateIntervalColors(useIntervalColors);
        console.log("Pattern updated interval colors:", useIntervalColors); // Add this for debugging
    }

    shiftPattern(direction) {
    
        let shiftAmount;
        // Reverse the direction if reverseArrowDirection is true
        const effectiveDirection = reverseArrowDirection ? (direction === 'right' ? 'left' : 'right') : direction;
    
        if (this.wheel.currentLayout === 'chromatic') {
            if (effectiveDirection === 'right') {
                shiftAmount = this.currentPattern[1] - this.currentPattern[0];
            } else {
                shiftAmount = 12 - (this.currentPattern[this.currentPattern.length - 1] - this.currentPattern[0]);
            }
        } else {
            // For fifths and fourths layouts
            shiftAmount = 1; // Always shift by 1 step in these layouts
        }
    
        console.log(`Shifting pattern ${effectiveDirection} by ${shiftAmount} steps`);
    
        // Calculate the new pattern
        const newPattern = this.currentPattern.map(interval => {
            let newInterval;
            if (this.wheel.currentLayout === 'chromatic') {
                newInterval = effectiveDirection === 'right' 
                    ? (interval - shiftAmount + 12) % 12
                    : (interval + shiftAmount) % 12;
            } else {
                // For fifths and fourths layouts
                const notePositions = Array.from(this.wheel.notePositions.entries())
                    .sort((a, b) => a[1] - b[1])
                    .map(entry => entry[0]);
                const currentIndex = notePositions.indexOf(interval);
                const newIndex = effectiveDirection === 'right'
                    ? (currentIndex - 1 + 12) % 12
                    : (currentIndex + 1) % 12;
                newInterval = notePositions[newIndex];
            }
            return newInterval;
        });
    
        // Sort the new pattern
        newPattern.sort((a, b) => a - b);
    
        console.log("Original pattern:", this.currentPattern);
        console.log("New pattern:", newPattern);
    
        // Animate the changes
        if (this.animate) {
            console.log("ANIMATING TRANSITION")
            Promise.all([
                this.animatePolygon(effectiveDirection, shiftAmount),
                this.bracketVisualization.animateBracket(effectiveDirection, shiftAmount)
            ]).then(() => {
                // Update the current pattern after animation
                this.currentPattern = newPattern;
                // Update visuals
                this.updatePattern(this.currentPattern);
                this.updateKeyboardHighlight();
            });
        } else {
            // Update the current pattern immediately if not animating
            this.currentPattern = newPattern;
            // Update visuals
            this.updatePattern(this.currentPattern);
            this.updateKeyboardHighlight();
        }
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

    getRotationAngleForLayout() {
        switch (this.wheel.currentLayout) {
            case 'fifths':
                return -150;
            case 'fourths':
                return 150;
            default: // chromatic
                return 30;
        }
    }
    
    async animatePolygon(direction, shiftAmount) {
        const originalGroup = this.patternSvg.querySelector('g');
        if (!originalGroup) return;  // Exit if there's no group (i.e., no pattern)
    
        originalGroup.style.display = 'none';  // Hide the original group
    
        const tempGroup = originalGroup.cloneNode(true);
        tempGroup.style.display = ''; // Ensure the cloned group is visible
        this.patternSvg.appendChild(tempGroup);
    
        const duration = 450; // milliseconds
        const steps = 60; // For smoother animation
        const rotationPerStep = this.getRotationAngleForLayout();
        const totalRotation = (shiftAmount * Math.abs(rotationPerStep)) % 360;
    
        for (let i = 0; i <= steps; i++) {
            const rotation = i * (totalRotation / steps) * (direction === 'right' ? -1 : 1) * Math.sign(rotationPerStep);
            tempGroup.setAttribute('transform', `rotate(${rotation})`);
            await new Promise(resolve => setTimeout(resolve, duration / steps));
        }
    
        this.patternSvg.removeChild(tempGroup);
        originalGroup.style.display = '';  // Show the original group again
    
        // Redraw the polygon with the new pattern
        this.drawPatternPolygon();
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
        this.patternGroup = this.createPatternGroup();
        this.useIntervalColors = false;
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

    updatePattern(pattern) {
        this.patternGroup.innerHTML = '';
        this.currentPattern = pattern;
        
        if (pattern.length > 0) {
            this.drawVerticalLines(pattern);
            this.drawHorizontalLines(pattern);
        }
    }

    drawHorizontalLines(pattern) {
        for (let i = 0; i < pattern.length; i++) {
            const start = pattern[i];
            let end, interval;
            
            if (i === pattern.length - 1) {
                // For the last segment, we want to draw to the end of the bracket
                end = 12;
                interval = (end - start + 12) % 12;
            } else {
                end = pattern[i + 1];
                interval = (end - start + 12) % 12;
            }
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            if (this.useIntervalColors) {
                line.setAttribute("x1", 12.5 + start * 25);
                line.setAttribute("x2", 12.5 + end * 25);
            } else {
                // Extend the line by 2px on each end when colors are off
                line.setAttribute("x1", 12.5 + start * 25 - 2);
                line.setAttribute("x2", 12.5 + end * 25 + 2);
            }
            line.setAttribute("y1", "14");
            line.setAttribute("y2", "14");
            line.setAttribute("stroke", this.useIntervalColors ? intColors[interval] : "white");
            line.setAttribute("stroke-width", "4");
            this.patternGroup.appendChild(line);
        }
    }

    drawVerticalLines(pattern) {
        for (let i = 0; i <= pattern.length; i++) {
            const noteIndex = i < pattern.length ? pattern[i] : 12; // Use 12 for the last line
            let prevInterval, nextInterval;
    
            if (i === 0) {
                // First vertical line
                nextInterval = (pattern[1] - pattern[0] + 12) % 12; // And this line
            } else if (i === pattern.length) {
                // Last vertical line
                prevInterval = (12 - pattern[pattern.length - 1] + 12) % 12;
            } else {
                // Middle vertical lines
                prevInterval = (pattern[i] - pattern[i-1] + 12) % 12;
                nextInterval = (pattern[(i+1) % pattern.length] - pattern[i] + 12) % 12;
            }
    
            if (this.useIntervalColors) {
                // Left half of the vertical line when colors are on
                const leftLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                leftLine.setAttribute("x1", 12.5 + noteIndex * 25 - 2);
                leftLine.setAttribute("y1", "15");
                leftLine.setAttribute("x2", 12.5 + noteIndex * 25 - 2);
                leftLine.setAttribute("y2", "35");
                leftLine.setAttribute("stroke", intColors[prevInterval]);
                leftLine.setAttribute("stroke-width", "4");
                this.patternGroup.appendChild(leftLine);
    
                // Right half of the vertical line when colors are on
                const rightLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                rightLine.setAttribute("x1", 12.5 + noteIndex * 25 + 2);
                rightLine.setAttribute("y1", "15");
                rightLine.setAttribute("x2", 12.5 + noteIndex * 25 + 2);
                rightLine.setAttribute("y2", "35");
                rightLine.setAttribute("stroke", intColors[nextInterval]);
                rightLine.setAttribute("stroke-width", "4");
                this.patternGroup.appendChild(rightLine);
            } else {
                // Single vertical line when colors are off
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", 12.5 + noteIndex * 25);
                line.setAttribute("y1", "15");
                line.setAttribute("x2", 12.5 + noteIndex * 25);
                line.setAttribute("y2", "35");
                line.setAttribute("stroke", "white");
                line.setAttribute("stroke-width", "4");
                this.patternGroup.appendChild(line);
            }
        }
    }

    updateIntervalColors(useIntervalColors) {
        this.useIntervalColors = useIntervalColors;
        this.updatePattern(this.currentPattern);
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