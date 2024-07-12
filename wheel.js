// wheel.js

import * as config from './config.js';

export class Wheel {
    constructor(container, animate) {
        this.currentTonic = 'C'
        this.container = container;
        this.animate = animate;
        this.svg = null;
        this.notesGroup = null;
        this.patternGroup = null;
        this.radius = 120;
        this.positions = Array.from({length: 12}, (_, i) => i);
        this.noteElements = new Map(); // Store note elements with their ids
        this.notePositions = new Map(); // Map note IDs to position IDs
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
        this.createWheelPositions();
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

    createWheelPositions() {
        const angleStep = (Math.PI * 2) / 12;
        const fragment = document.createDocumentFragment();
    
        this.positions.forEach(positionId => {
            const angle = positionId * angleStep - Math.PI / 2;
            const [x, y] = [Math.cos(angle), Math.sin(angle)].map(coord => coord * this.radius);
            
            const positionGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            positionGroup.setAttribute("transform", `translate(${x}, ${y})`);
            positionGroup.dataset.positionId = positionId;
            
            fragment.appendChild(positionGroup);
        });
    
        this.notesGroup.appendChild(fragment);
    }

    createNotes() {
        const fragment = document.createDocumentFragment();
        const angleStep = (Math.PI * 2) / 12;
    
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
    
            // Calculate position
            const angle = noteId * angleStep - Math.PI / 2;
            const x = Math.cos(angle) * this.radius;
            const y = Math.sin(angle) * this.radius;
           
            const transform = `translate(${x.toFixed(2)}, ${y.toFixed(2)})`;
            noteGroup.setAttribute("transform", transform);
            noteGroup.setAttribute("data-original-transform", transform);
            
            // Calculate toneNote
            const isBlackNote = note.includes('/');
            const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
            const toneNote = `${baseTone}${this.currentOctave}`;
            noteGroup.dataset.toneNote = toneNote;

            fragment.appendChild(noteGroup);
            this.noteElements.set(noteId, noteGroup);
    
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
    }

    animateNote(noteElement, isActive) {
        const noteCircle = noteElement.querySelector('circle');
        const { scale, brightness, originalRadius, duration } = this.animationParams;
    
        // Get the original transform (which should be the translation)
        const originalTransform = noteElement.getAttribute('data-original-transform') || noteElement.getAttribute('transform');
    
        // Store the original transform if we haven't already
        if (!noteElement.hasAttribute('data-original-transform')) {
            noteElement.setAttribute('data-original-transform', originalTransform);
        }
    
        // Set transition
        noteElement.style.transition = `filter ${duration}ms ease`;
        noteCircle.style.transition = `r ${duration}ms ease`;
    
        if (isActive) {
            noteElement.setAttribute('transform', `${originalTransform} scale(${scale})`);
            noteElement.style.filter = `brightness(${brightness})`;
            noteCircle.setAttribute('r', originalRadius * scale);
        } else {
            noteElement.setAttribute('transform', originalTransform);
            noteElement.style.filter = 'brightness(1)';
            noteCircle.setAttribute('r', originalRadius);
        }
    
        console.log('Note data:', {
            noteId: noteElement.dataset.noteId,
            toneNote: noteElement.dataset.toneNote,
            isActive,
            transform: noteElement.getAttribute('transform'),
            filter: noteElement.style.filter,
            radius: noteCircle.getAttribute('r')
        });
    }

    updateNoteState(noteId, state, useColors, animate) {
        const noteElement = this.noteElements.get(noteId);
        if (noteElement) {
            const noteCircle = noteElement.querySelector('circle');
            const noteText = noteElement.querySelector('text');
            const note = config.notes[noteId];
            const isBlackNote = note.includes('/');
            noteElement.classList.toggle('active', state.active);
            noteCircle.setAttribute('fill', state.color);
            noteText.textContent = state.display;
    
            noteText.setAttribute('fill', useColors ? (isBlackNote ? 'black' : 'white') : (isBlackNote ? 'white' : 'black'));
            noteText.setAttribute('font-weight', useColors ? 'bold' : 'normal');
    
            if (animate) {
                this.animateNote(noteElement, state.active);
            }
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

    rotateTonic(newTonic, newOctave) {
        const oldTonicIndex = config.notes.indexOf(this.currentTonic);
        const newTonicIndex = config.notes.indexOf(newTonic);
        
        let rotationAngle;
    
        // Handle the special cases
        if (this.currentTonic === 'B' && newTonic === 'C') {
            rotationAngle = -30;
        } else if (this.currentTonic === 'C' && newTonic === 'B') {
            rotationAngle = 30;
        } else {
            rotationAngle = (oldTonicIndex - newTonicIndex) * 30; // 30 degrees per note
        }
    
        const rotate = () => {
            if (this.animate) {
                this.notesGroup.style.transition = 'transform 0.3s ease-in-out';
                this.noteElements.forEach(noteElement => {
                    const textElement = noteElement.querySelector('text');
                    textElement.style.transition = 'transform 0.3s ease-in-out';
                });
            } else {
                this.notesGroup.style.transition = 'none';
                this.noteElements.forEach(noteElement => {
                    const textElement = noteElement.querySelector('text');
                    textElement.style.transition = 'none';
                });
            }
    
            // Get the current rotation
            const currentRotation = this.getCurrentRotation();
            
            // Calculate the new rotation
            const newRotation = currentRotation + rotationAngle;
    
            this.notesGroup.style.transform = `rotate(${newRotation}deg)`;
    
            // Counter-rotate the text to keep it upright
            this.noteElements.forEach(noteElement => {
                const textElement = noteElement.querySelector('text');
                textElement.style.transform = `rotate(${-newRotation}deg)`;
            });
        };
    
        requestAnimationFrame(rotate);
        
        // Update the current tonic and octave
        this.currentTonic = newTonic;
        this.currentOctave = newOctave;
    
        // Update all note tone notes
        this.updateNoteToneNotes();
    }
    
        updateNoteToneNotes() {
            this.noteElements.forEach((noteElement, noteId) => {
                const note = config.notes[noteId];
                const isBlackNote = note.includes('/');
                const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
                const toneNote = `${baseTone}${this.currentOctave}`;
                noteElement.dataset.toneNote = toneNote;
            });
        }
}