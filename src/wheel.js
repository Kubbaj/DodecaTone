// wheel.js

import * as config from './config.js';

export class Wheel {
    constructor(container, animate) {
        this.currentTonic = 'C'
        this.currentLayout = 'chromatic';
        this.currentOctave = 4;
        this.container = container;
        this.animate = animate;
        this.config = config;
        this.svg = null;
        this.notesGroup = null;
        this.patternGroup = null;
        this.radius = 118;
        this.noteElements = new Map(); // Store note elements with their ids
        this.notePositions = new Map();
        this.animationCounter = 0;

        this.animationParams = {
            scale: 1.05,
            brightness: 1.6,
            originalRadius: 25,
            duration: 200 // milliseconds
        };
    }

    initialize() {
        this.createSVG();
        this.createNotes();
    }


// CREATIONS (SVG, Notes, Temp)
    createSVG() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", 300);
        this.svg.setAttribute("height", 300);
        this.svg.setAttribute("viewBox", "-150 -150 300 300");
        this.svg.setAttribute("z-index", "5");
        this.svg.setAttribute("id", "wheel-svg");
        
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("x", "-150");
        background.setAttribute("y", "-150");
        background.setAttribute("width", "300");
        background.setAttribute("height", "300");
        background.setAttribute("fill", "#00000000");
        this.svg.appendChild(background);

        this.notesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.patternGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        this.svg.appendChild(this.patternGroup);
        this.svg.appendChild(this.notesGroup);
        
        
        this.container.appendChild(this.svg);
    }

    createNotes() {
        const fragment = document.createDocumentFragment();
        
        // CREATE SVGS
        config.notes.forEach((note, noteId) => {
            const noteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            noteGroup.dataset.noteId = noteId;
            noteGroup.style.cursor = "pointer";
            noteGroup.style.zIndex = "5";
    
            const noteCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            noteCircle.setAttribute("r", "25");
            noteCircle.setAttribute("stroke", "black");
            noteCircle.setAttribute("stroke-width", "2");
            
            const noteText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            noteText.setAttribute("text-anchor", "middle");
            noteText.setAttribute("dominant-baseline", "central");
            
            noteGroup.append(noteCircle, noteText);
            

    

            // SET INITIAL PROPERTIES
            this.notePositions.set(noteId, noteId);
            this.noteElements.set(noteId, noteGroup);
    
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
    
        this.notePositions.forEach((_, noteId) => {
            this.updateNotePosition(noteId);
        });
    }


// UPDATES (Position, State, ToneNotes, Tonic, Layout)
    updateNotePosition(noteId) {
        const noteElement = this.noteElements.get(noteId);
        const position = this.notePositions.get(noteId);
        const angle = position * (Math.PI / 6) - Math.PI / 2;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;
        
        noteElement.setAttribute("transform", `translate(${x}, ${y})`);
    }
    
    updateNoteState(noteId, state, useColors, animate, octave) {
        const noteElement = this.noteElements.get(noteId);
        if (noteElement) {
            console.log(`Updating state for Note ${noteId}: active=${state.active}, animate=${animate}`);
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

    updateToneNotes() {
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

    formatToneNote(note, octave) {
        if (note.includes('/')) {
            return `${note.split('/')[0].replace('♯', '#')}${octave}`;
        }
        return `${note}${octave}`;
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
        this.updateToneNotes();

        // Recalculate and update pattern highlights
        if (this.pattern && this.pattern.currentPattern.length > 0) {
            const newTonicIndex = this.config.notes.indexOf(newTonic);
            const updatedPatternNotes = this.pattern.currentPattern.map(interval => 
                (interval + newTonicIndex) % 12
            );
            this.updatePatternHighlight(updatedPatternNotes);
    }
}
    
async switchLayout(newLayout) {
    if (newLayout === this.currentLayout) return;

    console.log(`Switching from ${this.currentLayout} to ${newLayout}`);
    console.log(`Current tonic: ${this.currentTonic}`);

    const oldPositions = new Map(this.notePositions);
    const newPositions = new Map();

    const tonicIndex = config.notes.indexOf(this.currentTonic);
    const tonicOldPosition = this.notePositions.get(tonicIndex);
    const tonicNewPosition = config.layouts[newLayout][tonicIndex];

    const shift = (tonicOldPosition - tonicNewPosition + 12) % 12;

    config.notes.forEach((_, i) => {
        const layoutPosition = config.layouts[newLayout][i];
        const newPosition = (layoutPosition + shift) % 12;
        newPositions.set(i, newPosition);
    });

    

    // Update the actual positions
    this.notePositions = newPositions;
    this.notePositions.forEach((position, noteId) => {
        this.updateNotePosition(noteId);
    });

    await Promise.all([
        this.animateLayoutSwitch(oldPositions, newPositions),
        this.pattern ? this.pattern.animatePatternTransition(this.config.layouts[this.currentLayout], this.config.layouts[newLayout]) : Promise.resolve()
    ]);

    this.currentLayout = newLayout;
    console.log("After switching layout, new positions:", Object.fromEntries(this.notePositions));
}

    updatePatternHighlight(patternNotes) {
        console.log("Updating pattern highlights:", patternNotes);
        
        const hasPattern = patternNotes.length > 0;
        this.container.classList.toggle('pattern-active', hasPattern);
        
        this.noteElements.forEach((noteElement, noteId) => {
            const inPattern = hasPattern && patternNotes.includes(noteId);
            noteElement.classList.toggle('in-pattern', inPattern);
            noteElement.style.pointerEvents = hasPattern ? (inPattern ? 'auto' : 'none') : 'auto';
            console.log(`Note ${noteId}: ${inPattern ? 'in pattern' : 'not in pattern'}`);
        });
    }

// ANIMATIONS (Press, Tonic, Layout, Fourths)
    animateNotePress(noteElement, isActive) {
        const noteId = noteElement.dataset.noteId;
        const animationId = ++this.animationCounter;
        
        console.log(`Animation ${animationId} started: Note ${noteId} ${isActive ? 'pressing down' : 'releasing'}`);

        const noteCircle = noteElement.querySelector('circle');
        const { scale, brightness, originalRadius, duration } = this.animationParams;

        // Get the current transform (which should be the translation)
        const currentTransform = noteElement.getAttribute('transform') || '';

        let animation;
        if (isActive) {
            animation = noteElement.animate([
                { transform: `${currentTransform} scale(1)`, filter: 'brightness(1)' },
                { transform: `${currentTransform} scale(${scale})`, filter: `brightness(${brightness})` }
            ], { duration, fill: 'forwards' });
            noteCircle.animate([
                { r: originalRadius },
                { r: originalRadius * scale }
            ], { duration, fill: 'forwards' });
        } else {
            animation = noteElement.animate([
                { transform: `${currentTransform} scale(${scale})`, filter: `brightness(${brightness})` },
                { transform: `${currentTransform} scale(1)`, filter: 'brightness(1)' }
            ], { duration, fill: 'forwards' });
            noteCircle.animate([
                { r: originalRadius * scale },
                { r: originalRadius }
            ], { duration, fill: 'forwards' });
        }

        animation.onfinish = () => {
            console.log(`Animation ${animationId} finished: Note ${noteId} ${isActive ? 'pressed down' : 'released'}`);
        };

        animation.oncancel = () => {
            console.log(`Animation ${animationId} cancelled: Note ${noteId}`);
        };
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
            rotationAngle = 210;
        } else if (isFourthsLayout) {
            rotationAngle = 150;
        } else {
            rotationAngle = 30;
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
                    currentAngle = (oldPos * 30 + (isIncreasing ? -1 : 1) * progress * rotationAngle + 360) % 360;
                } else if (isFourthsLayout) {
                    currentAngle = (oldPos * 30 + (isIncreasing ? -1 : 1) * progress * rotationAngle + 360) % 360;
                } else {
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
                duration: 400,
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
    
        // Create a new div for our temporary elements
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '0';
        tempContainer.style.left = '0';
        tempContainer.style.width = '100%';
        tempContainer.style.height = '100%';
        tempContainer.style.zIndex = '1000'; // Ensure it's above other elements
    
        // Create a new SVG inside this div
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tempSvg.setAttribute("width", "100%");
        tempSvg.setAttribute("height", "100%");
        tempSvg.setAttribute("viewBox", "-150 -150 300 300");
        
        tempContainer.appendChild(tempSvg);
    
        // Create temporary elements
        const tempGroup = this.createTemporaryElements();
        tempSvg.appendChild(tempGroup);
    
        // Add the temporary container to the wheel container
        this.container.appendChild(tempContainer);
    
        // Hide real elements
        this.notesGroup.style.opacity = '0';
    
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
                duration: 750,
                fill: 'forwards'
            }).finished;
        });
    
        return Promise.all(animations).then(() => {
            // Remove the temporary container
            this.container.removeChild(tempContainer);
    
            // Update positions of real elements
            this.notePositions.forEach((position, noteId) => {
                this.updateNotePosition(noteId);
            });
    
            // Show real elements
            this.notesGroup.style.opacity = '1';
        });
    }

   
}