// keyboard.js

import * as config from './config.js';

export class Keyboard {
    constructor(container, animate) {
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
        this.translateToTonic('C')
    }

    createKeys() {
        let position = 0;
        
        config.keyboardNotes.forEach((note, index) => {
            const keyElement = document.createElement('div');
            const isBlackNote = note.includes('/');
            
            keyElement.className = `key ${isBlackNote ? 'black' : 'white'}`;
            keyElement.dataset.noteId = index;

            // Calculate toneNote
            const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
            keyElement.dataset.toneNote = `${baseTone}${index < 12 ? 3 : 4}`;

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
        });
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
                keyElement.style.backgroundColor = isBlackNote ? 'black' : 'white';
                noteDisplay.style.color = isBlackNote ? 'white' : 'black';
                noteDisplay.style.fontWeight = 'normal';
            }
    
            if (animate) {
                keyElement.classList.toggle('active', state.active);
            } else {
                keyElement.classList.remove('active');
            }
        }
    }

    translateToTonic(newTonic, octave) {
        const keyWidth = this.keyWidth;
        const noteIndex = config.keyboardNotes.indexOf(newTonic);
        
        // Calculate offset: start at 11.5 keyWidths (for C4), then add 1 keyWidth per semitone
        let offset = (noteIndex + 12.75) * keyWidth;
    
        // Adjust for octave
        if (octave === 3) {
            offset -= 12 * keyWidth; // Move one octave to the left
        }
    
        // Center the tonic key
        const centerOffset = this.keyboardElement.clientWidth / 2;
        const translation = centerOffset - offset;
    
        console.log(`Translating keyboard to ${newTonic}, Octave: ${octave}, offset: ${translation}px`);
    
        if (this.animate) {
            this.container.style.transition = 'transform 0.3s ease-in-out';
        } else {
            this.container.style.transition = 'none';
        }
    
        this.container.style.transform = `translateX(${translation}px)`;
    }

}
