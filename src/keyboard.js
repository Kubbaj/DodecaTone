// keyboard.js

import * as config from './config.js';

export class Keyboard {
    constructor(container, animate) {
        this.currentTonic = 'C';
        this.currentOctave = 4;
        this.container = container;
        this.window = container.parentElement; // This is the new keyboard-window element
        this.animate = animate;
        this.keyboardElement = document.createElement('div');
        this.keyboardElement.className = 'keyboard';
        this.keyElements = new Map();
        this.keyWidth = 25; // Base width for black keys
        this.keyWidths = { C: 1.5, D: 2, E: 1.5, F: 1.5, G: 2, A: 2, B: 1.5 };
    }

    initialize() {
        this.container.appendChild(this.keyboardElement);
        this.createKeys();
        this.createArrow();
        this.showArrow(false);
        this.translateToTonic('C')
    }

    createKeys() {
        let position = 0;
        
        // Extend the loop to include C5 (25 keys total)
        for (let index = 0; index < 25; index++) {
            const note = config.keyboardNotes[index % 12];
            const keyElement = document.createElement('div');
            const isBlackNote = note.includes('/');
            
            keyElement.className = `key ${isBlackNote ? 'black' : 'white'}`;
            keyElement.dataset.noteId = index;
    
            // Calculate octave (3 for first 12, 4 for next 12, 5 for the last one)
            const octave = Math.floor(index / 12) + 3;
            keyElement.dataset.toneNote = this.formatToneNote(note, octave);
    
            // Set the width and position of the key
            const width = this.keyWidth * (isBlackNote ? 1 : this.keyWidths[note.charAt(0)]);
            keyElement.style.width = `${width}px`;
            keyElement.style.left = `${position + (isBlackNote ? -this.keyWidth / 2 : 0)}px`;
            
            if (!isBlackNote) position += width;
    
            const noteDisplay = document.createElement('span');
            noteDisplay.className = 'note-display';
            noteDisplay.textContent = config.getNoteDisplay(note, false);
    
            keyElement.appendChild(noteDisplay);
            this.keyElements.set(index, keyElement);
            this.keyboardElement.appendChild(keyElement);
        }
    }

    updateKeyState(noteId, state, useColors, animate) {
        const keyElement = this.keyElements.get(noteId);
        
        if (keyElement) {
            const isBlackNote = config.keyboardNotes[noteId].includes('/');
            const noteDisplay = keyElement.querySelector('.note-display');
            keyElement.classList.toggle('active', state.active);
            noteDisplay.textContent = state.display;
    
            if (useColors) {
                keyElement.style.backgroundColor = state.color;
                noteDisplay.style.color = isBlackNote ? 'black' : 'white';
                noteDisplay.style.fontWeight = 'bold';
            } else {
                keyElement.style.backgroundColor = isBlackNote ? '#262626' : '#D8D8D8';
                noteDisplay.style.color = isBlackNote ? 'white' : 'black';
                noteDisplay.style.fontWeight = 'normal';
            }
    
            if (animate) {
                keyElement.classList.toggle('active', state.active);
            } else {
                keyElement.classList.remove('active');
            }
    
            this.arrowElement.style.opacity = '0';
        }
    }

    updatePatternHighlight(playableToneNotes) {
        console.log("Updating keyboard pattern highlight:", playableToneNotes);
        
        const hasPattern = playableToneNotes.length > 0;
        this.keyboardElement.classList.toggle('pattern-active', hasPattern);
        
        this.keyElements.forEach((keyElement, noteId) => {
            const inPattern = hasPattern && playableToneNotes.includes(keyElement.dataset.toneNote);
            keyElement.classList.toggle('in-pattern', inPattern);
            keyElement.style.pointerEvents = hasPattern ? (inPattern ? 'auto' : 'none') : 'auto';
        });
    }

    // Add this helper method to the Keyboard class
    formatToneNote(note, octave) {
        if (note.includes('/')) {
            return `${note.split('/')[0].replace('♯', '#')}${octave}`;
        }
        return `${note}${octave}`;
    }

    createArrow() {
        const arrow = document.createElement('div');
        arrow.className = 'keyboard-arrow';
        arrow.innerHTML = '→';
        arrow.style.cssText = `
            position: absolute;
            top: 60%;
            transform: translateY(-50%);
            font-size: 24px;
            font-weight: bold;
            color: #f0f0f0;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            pointer-events: none;
        `;
        this.window.appendChild(arrow);
        this.arrowElement = arrow;
    
        // Calculate initial position based on B4 key
        const b4Key = this.keyElements.get(23); // B4 is at index 23
        if (b4Key) {
            const b4Rect = b4Key.getBoundingClientRect();
            const windowRect = this.window.getBoundingClientRect();
            this.arrowBasePosition = b4Rect.right - windowRect.left + 30; // 10px to the right of B4
            this.arrowElement.style.left = `${this.arrowBasePosition}px`;
        }
    }

    showArrow(show) {
        if (this.arrowElement) {
            this.arrowElement.style.opacity = show ? '1' : '0';
        }
    }

    translateToTonic(newTonic, octave) {
        this.currentTonic = newTonic;
        this.currentOctave = octave;
        const keyWidth = this.keyWidth;
        const noteIndex = config.keyboardNotes.indexOf(newTonic);
        
        // Calculate offset: start at 11.5 keyWidths (for C4), then add 1 keyWidth per semitone
        let offset = (noteIndex + 12.5) * keyWidth;
    
        // Adjust for octave
        if (octave === 3) {
            offset -= 12 * keyWidth; // Move one octave to the left
        }
    
        // Center the tonic key
        const centerOffset = (this.keyboardElement.clientWidth + 40) / 2; // Add 40px for arrow space
        const translation = centerOffset - offset;
    
        if (this.animate) {
            this.container.style.transition = 'transform 0.5s ease-in-out';
        } else {
            this.container.style.transition = 'none';
        }
    
        this.container.style.transform = `translateX(${translation}px)`;

        // Update arrow position
        const currentTonicIndex = config.notes.indexOf(newTonic);
        const keyDiff = currentTonicIndex - config.notes.indexOf('C'); // Difference from C
        const arrowPosition = this.arrowBasePosition - (keyDiff * this.keyWidth);
        this.arrowElement.style.left = `${arrowPosition + 37.5}px`;

    }

}
