// wheel.js

// wheel.js

import * as config from './config.js';

export class Wheel {
    constructor(container, animate) {
        this.currentTonic = 'C'
        this.currentLayout = 'chromatic';
        this.container = container;
        this.animate = animate;
        this.config = config;
        this.svg = null;
        this.notesGroup = null;
        this.patternGroup = null;
        this.radius = 120;
        this.noteElements = new Map(); // Store note elements with their ids
        this.notePositions = new Map(); // Map note IDs to their current positions
        this.currentOctave = 4;

        this.animationParams = {
            scale: 0.95,
            brightness: 0.8,
            originalRadius: 20,
            duration: 200 // milliseconds
        };
    }

    initialize() {
        this.createSVG();
        this.createNotes();
    }
    
    createSVG() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", 300);
        this.svg.setAttribute("height", 300);
        this.svg.setAttribute("viewBox", "-150 -150 300 300");
        
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("x", "-150");
        background.setAttribute("y", "-150");
        background.setAttribute("width", "300");
        background.setAttribute("height", "300");
        background.setAttribute("fill", "#f0f0f0");
        this.svg.appendChild(background);

        this.notesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.patternGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        this.svg.appendChild(this.notesGroup);
        this.svg.appendChild(this.patternGroup);
        
        this.container.appendChild(this.svg);
    }

    createNotes() {
        const fragment = document.createDocumentFragment();
    
        config.notes.forEach((note, noteId) => {
            const noteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            noteGroup.dataset.noteId = noteId;
            noteGroup.style.cursor = "pointer";
    
            const noteCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            noteCircle.setAttribute("r", "20");
            noteCircle.setAttribute("stroke", "black");
            
            const noteText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            noteText.setAttribute("text-anchor", "middle");
            noteText.setAttribute("dominant-baseline", "central");
            
            noteGroup.append(noteCircle, noteText);
    
            this.notePositions.set(noteId, noteId); // Initially, position matches noteId
            this.noteElements.set(noteId, noteGroup);  // Add this line here
    
            // Calculate toneNote
            const isBlackNote = note.includes('/');
            const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
            const toneNote = `${baseTone}${this.currentOctave}`;
            noteGroup.dataset.toneNote = toneNote;
    
            fragment.appendChild(noteGroup);
    
            // Set initial state
            const initialState = {
                display: config.getNoteDisplay(note, false),
                color: isBlackNote ? 'black' : 'white',
                active: false,
                inPattern: false
            };
            
            this.updateNoteState(noteId, initialState, false, false);
        });
    
        this.notesGroup.appendChild(fragment);
    
        // Move this loop outside of the forEach
        this.notePositions.forEach((_, noteId) => {
            this.updateNotePosition(noteId);
        });
    }

    updateNotePosition(noteId) {
        const noteElement = this.noteElements.get(noteId);
        const position = this.notePositions.get(noteId);
        const angle = position * (Math.PI / 6) - Math.PI / 2;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;
        
        noteElement.setAttribute("transform", `translate(${x}, ${y})`);
    }

    animateNotePress(noteElement, isActive) {
        const noteCircle = noteElement.querySelector('circle');
        const { scale, brightness, originalRadius, duration } = this.animationParams;
    
        // Get the current transform (which should be the translation)
        const currentTransform = noteElement.getAttribute('transform') || '';
    
        if (isActive) {
            noteElement.animate([
                { transform: `${currentTransform} scale(1)`, filter: 'brightness(1)' },
                { transform: `${currentTransform} scale(${scale})`, filter: `brightness(${brightness})` }
            ], { duration, fill: 'forwards' });
            noteCircle.animate([
                { r: originalRadius },
                { r: originalRadius * scale }
            ], { duration, fill: 'forwards' });
        } else {
            noteElement.animate([
                { transform: `${currentTransform} scale(${scale})`, filter: `brightness(${brightness})` },
                { transform: `${currentTransform} scale(1)`, filter: 'brightness(1)' }
            ], { duration, fill: 'forwards' });
            noteCircle.animate([
                { r: originalRadius * scale },
                { r: originalRadius }
            ], { duration, fill: 'forwards' });
        }
    }
    
    updateNoteState(noteId, state, useColors, animate, octave) {
        const noteElement = this.noteElements.get(noteId);
        if (noteElement) {
            const noteCircle = noteElement.querySelector('circle');
            const noteText = noteElement.querySelector('text');
            const note = this.config.notes[noteId];
            const isBlackNote = note.includes('/');
            
            noteCircle.setAttribute('fill', state.color);
            noteText.textContent = state.display;
    
            noteText.setAttribute('fill', useColors ? (isBlackNote ? 'black' : 'white') : (isBlackNote ? 'white' : 'black'));
            noteText.setAttribute('font-weight', useColors ? 'bold' : 'normal');
    
            // Preserve the current octave
            const currentOctave = noteElement.dataset.toneNote ? noteElement.dataset.toneNote.slice(-1) : this.currentOctave;
            const baseTone = isBlackNote ? note.split('/')[0].replace('♯', '#') : note;
            const toneNote = `${baseTone}${currentOctave}`;
            noteElement.dataset.toneNote = toneNote;
    
            if (animate) {
                this.animateNotePress(noteElement, state.active);
            }
            
            noteElement.classList.toggle('active', state.active);
        }
    }

    getCurrentRotation() {
        const transform = this.notesGroup.style.transform;
        if (transform) {
            const match = transform.match(/rotate\(([-\d.]+)deg\)/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    }

    async rotateTonic(newTonic, newOctave) {
        const oldTonicIndex = config.notes.indexOf(this.currentTonic);
        const newTonicIndex = config.notes.indexOf(newTonic);
        let shift;
        const isIncreasing = (newTonicIndex - oldTonicIndex + 12) % 12 <= 6;
    
        if (this.currentLayout === 'chromatic') {
            shift = (oldTonicIndex - newTonicIndex + 12) % 12;
        } else if (this.currentLayout === 'fifths') {
            shift = ((oldTonicIndex - newTonicIndex) * 7 + 12) % 12;
        } else if (this.currentLayout === 'fourths') {
            shift = ((oldTonicIndex - newTonicIndex) * 5 + 12) % 12;
        }
    
        const oldPositions = new Map(this.notePositions);
        const newPositions = new Map();
    
        this.notePositions.forEach((position, noteId) => {
            const newPosition = (position + shift + 12) % 12;
            newPositions.set(noteId, newPosition);
        });
    
        await this.animateTonicChange(oldPositions, newPositions, isIncreasing);
    
        // Update the actual positions
        this.notePositions = newPositions;
        this.notePositions.forEach((position, noteId) => {
            this.updateNotePosition(noteId);
        });
    
        this.currentTonic = newTonic;
        this.currentOctave = newOctave;
        this.updateNoteToneNotes();
    }
    
    async switchLayout(newLayout) {
        if (newLayout === this.currentLayout) return;
    
        console.log(`Switching from ${this.currentLayout} to ${newLayout}`);
        console.log(`Current tonic: ${this.currentTonic}`);
    
        if ((this.currentLayout === 'chromatic' && newLayout === 'fourths') ||
            (this.currentLayout === 'fourths' && newLayout === 'chromatic')) {
            // First switch to fifths, then to the desired layout
            await this.switchLayout('fifths');
            return this.switchLayout(newLayout);
        }
    
        const oldPositions = new Map(this.notePositions);
        const newPositions = new Map();
    
        const tonicIndex = config.notes.indexOf(this.currentTonic);
        const tonicOldPosition = this.notePositions.get(tonicIndex);
        const tonicNewPosition = this.getPositionsForLayout(newLayout)[tonicIndex];
    
        const shift = (tonicOldPosition - tonicNewPosition + 12) % 12;
    
        config.notes.forEach((note, i) => {
            const layoutPosition = this.getPositionsForLayout(newLayout)[i];
            const newPosition = (layoutPosition + shift) % 12;
            newPositions.set(i, newPosition);
        });
    
        await this.animateLayoutSwitch(oldPositions, newPositions);
    
        // Update the actual positions
        this.notePositions = newPositions;
        this.notePositions.forEach((position, noteId) => {
            this.updateNotePosition(noteId);
        });
    
        this.currentLayout = newLayout;
        console.log("After switching layout, new positions:", Object.fromEntries(this.notePositions));

        if (this.pattern) this.pattern.drawPatternPolygon();
    }

    getPositionsForLayout(layout) {
        switch (layout) {
            case 'chromatic':
                return config.notes.map((_, i) => i);
            case 'fifths':
                return config.notes.map(note => (config.notes.indexOf(note) * 7) % 12);
            case 'fourths':
                return config.notes.map(note => (config.notes.indexOf(note) * 5) % 12);
            default:
                throw new Error('Invalid layout');
        }
    }

    updateNoteToneNotes() {
        const tonicIndex = this.config.notes.indexOf(this.currentTonic);
        
        this.noteElements.forEach((noteElement, noteId) => {
            const note = this.config.notes[noteId];
            const isBlackNote = note.includes('/');
            const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
            
            // Calculate the octave
            let octave = this.currentOctave;
            if (noteId < tonicIndex) {
                octave++;
            }
    
            const toneNote = `${baseTone}${octave}`;
            noteElement.dataset.toneNote = toneNote;
        });
    }

    createTemporaryElements() {
        const tempGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.noteElements.forEach((noteElement, noteId) => {
            const tempElement = noteElement.cloneNode(true);
            tempElement.id = `temp-${noteId}`;
            tempGroup.appendChild(tempElement);
        });
        return tempGroup;
    }

    animateTonicChange(oldPositions, newPositions, isIncreasing) {
        if (!this.animate) return Promise.resolve();
    
        // Hide real elements
        this.notesGroup.style.opacity = '0';
    
        const tempGroup = this.createTemporaryElements();
        this.svg.appendChild(tempGroup);
    
        const isFifthsLayout = this.currentLayout === 'fifths';
        const isFourthsLayout = this.currentLayout === 'fourths';
        let rotationAngle;
    
        if (isFifthsLayout) {
            rotationAngle = 210; // 210 degrees CCW when increasing, 210 degrees CW when decreasing
        } else if (isFourthsLayout) {
            rotationAngle = 150; // 30 degrees for chromatic layout
        } else {
            rotationAngle = 30; // 30 degrees for chromatic layout
        }
    
        const animations = Array.from(tempGroup.children).map((tempElement, index) => {
            const oldPos = oldPositions.get(index);
            const newPos = newPositions.get(index);
            
            const steps = 60; // More steps for smoother animation
            const frames = [];
    
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                let currentAngle;
                
                if (isFifthsLayout) {
                    // Rotate based on whether we're increasing or decreasing
                    currentAngle = (oldPos * 30 + (isIncreasing ? -1 : 1) * progress * rotationAngle + 360) % 360;
                } else if (isFourthsLayout) {
                    // Rotate based on whether we're increasing or decreasing
                    currentAngle = (oldPos * 30 + (isIncreasing ? -1 : 1) * progress * rotationAngle + 360) % 360;
                } else {
                    // Use shortest path for chromatic layout
                    let direction = newPos - oldPos;
                    if (Math.abs(direction) > 6) {
                        direction = direction > 0 ? direction - 12 : direction + 12;
                    }
                    currentAngle = ((oldPos + direction * progress) * 30 + 360) % 360;
                }
    
                const radians = (currentAngle - 90) * (Math.PI / 180);
                const x = Math.cos(radians) * this.radius;
                const y = Math.sin(radians) * this.radius;
                frames.push({ transform: `translate(${x}px, ${y}px)` });
            }
    
            tempElement.setAttribute("transform", frames[0].transform);
    
            return tempElement.animate(frames, {
                duration: 500,
                easing: 'ease-in-out',
                fill: 'forwards'
            }).finished;
        });
    
        return Promise.all(animations).then(() => {
            this.svg.removeChild(tempGroup);
            // Show real elements
            this.notesGroup.style.opacity = '1';
        });
    }
    
    animateLayoutSwitch(oldPositions, newPositions) {
        if (!this.animate) return Promise.resolve();
    
        if ((this.currentLayout === 'fifths' && this.nextLayout === 'fourths') ||
            (this.currentLayout === 'fourths' && this.nextLayout === 'fifths')) {
            return this.animateFifthsFourthsSwitch(oldPositions, newPositions);
        }
    
        // Hide real elements
        this.notesGroup.style.opacity = '0';
    
        const tempGroup = this.createTemporaryElements();
        this.svg.appendChild(tempGroup);
    
        const animations = Array.from(tempGroup.children).map((tempElement, index) => {
            const oldPos = oldPositions.get(index);
            const newPos = newPositions.get(index);
            const oldAngle = oldPos * (Math.PI / 6) - Math.PI / 2;
            const newAngle = newPos * (Math.PI / 6) - Math.PI / 2;
            const oldX = Math.cos(oldAngle) * this.radius;
            const oldY = Math.sin(oldAngle) * this.radius;
            const newX = Math.cos(newAngle) * this.radius;
            const newY = Math.sin(newAngle) * this.radius;
    
            tempElement.setAttribute("transform", `translate(${oldX}, ${oldY})`);
    
            return tempElement.animate([
                { transform: `translate(${oldX}px, ${oldY}px)` },
                { transform: `translate(${newX}px, ${newY}px)` }
            ], {
                duration: 500,
                easing: 'ease-in-out',
                fill: 'forwards'
            }).finished;
        });
    
        return Promise.all(animations).then(() => {
            this.svg.removeChild(tempGroup);
            // Show real elements
            this.notesGroup.style.opacity = '1';
        });
    }

    animateFifthsFourthsSwitch(oldPositions, newPositions) {
        if (!this.animate) return Promise.resolve();
    
        // Hide real elements
        this.notesGroup.style.opacity = '0';
    
        const tempGroup = this.createTemporaryElements();
        this.svg.appendChild(tempGroup);
    
        const tonicIndex = config.notes.indexOf(this.currentTonic);
        const tritoneIndex = (tonicIndex + 6) % 12;
    
        const animations = Array.from(tempGroup.children).map((tempElement, index) => {
            const oldPos = oldPositions.get(index);
            const newPos = newPositions.get(index);
    
            // If it's the tonic or tritone, don't move
            if (index === tonicIndex || index === tritoneIndex) {
                return Promise.resolve();
            }
    
            const oldAngle = oldPos * (Math.PI / 6) - Math.PI / 2;
            const newAngle = newPos * (Math.PI / 6) - Math.PI / 2;
            const oldX = Math.cos(oldAngle) * this.radius;
            const oldY = Math.sin(oldAngle) * this.radius;
            const newX = Math.cos(newAngle) * this.radius;
            const newY = Math.sin(newAngle) * this.radius;
    
            tempElement.setAttribute("transform", `translate(${oldX}, ${oldY})`);
    
            return tempElement.animate([
                { transform: `translate(${oldX}px, ${oldY}px)` },
                { transform: `translate(${newX}px, ${newY}px)` }
            ], {
                duration: 500,
                easing: 'ease-in-out',
                fill: 'forwards'
            }).finished;
        });
    
        return Promise.all(animations).then(() => {
            this.svg.removeChild(tempGroup);
            // Show real elements
            this.notesGroup.style.opacity = '1';
        });
    }
}