// app.js

import * as config from './config.js';
import { Wheel } from './wheel.js';
import { Keyboard } from './keyboard.js';
import { TonicIndicators } from './tonicIndicators.js';
import { Pattern } from './pattern.js';

// Initialize Tone.js
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// Global state
let currentLayout = 'chromatic';
let currentPattern = 'none';
let currentTonic = 'C';
let useSharps = false;
let useColors = false;
let animate = false;
let currentlyPlayingNote = null;
let currentTonicDisplay = 'C';
let autoplayTonic = true;
let currentOctave = 4;
let isMouseDown = false;
let lastPlayedNote = null;

const layoutTransitions = {
    chromatic: { next: 'fifths', prev: 'fourths' },
    fifths: { next: 'fourths', prev: 'chromatic' },
    fourths: { next: 'chromatic', prev: 'fifths' }
};

const layoutIcons = {
    chromatic: { next: 'Chr-5ths.png', prev: 'Chr-4ths.png' },
    fifths: { next: '5ths-4ths.png', prev: '5ths-Chr.png' },
    fourths: { next: '4ths-Chr.png', prev: '4ths-5ths.png' }
};

// Initialize components
const wheelContainer = document.getElementById('wheel-container');
const keyboardWindow = document.getElementById('keyboard-window');
const tonicIndicators = new TonicIndicators(wheelContainer, keyboardWindow, useColors);
tonicIndicators.toggleVisibility(false);

const wheel = new Wheel(wheelContainer, animate);
const keyboardContainer = document.getElementById('keyboard-container');
const keyboard = new Keyboard(keyboardContainer, animate);
const pattern = new Pattern(keyboard, wheel, animate);
wheel.pattern = pattern;

// UPDATE TONIC

function updateTonicDisplay() {
    const currentTonicDisplay = document.getElementById('current-tonic');
    if (currentTonicDisplay) {
        currentTonicDisplay.textContent = config.getNoteDisplay(currentTonic, useSharps);
    }
}

function setTonic(newTonic) {
    if (config.notes.includes(newTonic)) {
        const oldIndex = config.notes.indexOf(currentTonic);
        const newIndex = config.notes.indexOf(newTonic);
        
        if (currentTonic === 'C' && newTonic === 'B' && currentOctave === 4) {
            currentOctave = 3;
        } else if (currentTonic === 'B' && newTonic === 'C' && currentOctave === 3) {
            currentOctave = 4;
        } else if (currentTonic === 'C' && newTonic === 'B' && currentOctave === 3) {
            currentOctave = 4;
        } else if (currentTonic === 'B' && newTonic === 'C' && currentOctave === 4) {
            currentOctave = 3;
        }

        currentTonic = newTonic;
        console.log(`Tonic changed to: ${currentTonic}, Octave: ${currentOctave}`);
        updateTonicDisplay();
        wheel.rotateTonic(newTonic, currentOctave);
        keyboard.translateToTonic(newTonic, currentOctave);
        updateAllNoteStates();

        // Add this line:
        updatePatternForNewTonic(newTonic, true);

        if (autoplayTonic) {
            const toneNote = getToneNote(newTonic, currentOctave);
            
            const delay = animate ? 450 : 0;
            
            setTimeout(() => {
                playNoteForDuration(toneNote);
            }, delay);
        }
    }
}

function initTonicPicker() {
    const decreaseButton = document.getElementById('decrease-tonic');
    const increaseButton = document.getElementById('increase-tonic');
    const decreaseTonic2Button = document.getElementById('decrease-tonic-2');
    const increaseTonic2Button = document.getElementById('increase-tonic-2');

    function changeTonic(direction) {
        const currentIndex = config.notes.indexOf(currentTonic);
        let newIndex;
        if (direction === 'increase') {
            newIndex = (currentIndex + 1) % config.notes.length;
        } else {
            newIndex = (currentIndex - 1 + config.notes.length) % config.notes.length;
        }
        setTonic(config.notes[newIndex]);
        pattern.drawPatternPolygon();
    }

    decreaseButton.addEventListener('click', () => changeTonic('decrease'));
    increaseButton.addEventListener('click', () => changeTonic('increase'));
    decreaseTonic2Button.addEventListener('click', () => changeTonic('decrease'));
    increaseTonic2Button.addEventListener('click', () => changeTonic('increase'));

    // Initialize display
    updateTonicDisplay();
}

// UPDATE PATTERN
function updatePattern(newPatternValue) {
    if (newPatternValue === 'none') {
        currentPattern = [];
        pattern.updatePattern([]);
        keyboard.updatePatternHighlight([]);
        wheel.updatePatternHighlight([]);
    } else {
        const [category, patternName] = newPatternValue.split('.');
        const patternNotes = config[category][patternName];

        if (patternNotes) {
            currentPattern = patternNotes;  // Store the current pattern
            pattern.updatePattern(patternNotes);
            updatePatternForNewTonic(currentTonic, false);  // false indicates it's not a tonic change
        } else {
            console.error(`Pattern not found: ${newPatternValue}`);
        }
    }

    updateAllNoteStates();
}

function updatePatternForNewTonic(newTonic, isTonicChange = false) {
    const currentPattern = pattern.getCurrentPattern();
    if (currentPattern && currentPattern.length > 0) {
        const tonicIndex = config.notes.indexOf(newTonic);
        const adjustedPattern = currentPattern.map(interval => 
            (interval + tonicIndex) % 12
        );
        
        // Calculate the new octave
        let newOctave = currentOctave;
        if (isTonicChange) {
            if (newTonic === 'C' && currentTonic === 'B') newOctave++;
            else if (newTonic === 'B' && currentTonic === 'C') newOctave--;
        }

        const playableToneNotes = adjustedPattern.map(noteIndex => {
            const note = config.notes[noteIndex];
            const octave = noteIndex < tonicIndex ? newOctave + 1 : newOctave;
            return formatToneNote(note, octave);
        });

        // Add the top note (one octave above the tonic)
        playableToneNotes.push(formatToneNote(newTonic, newOctave + 1));

        console.log("Playable tone notes:", playableToneNotes);

        wheel.updatePatternHighlight(adjustedPattern);

        if (isTonicChange && animate) {
            setTimeout(() => {
                keyboard.updatePatternHighlight(playableToneNotes);
            }, 500);
        } else {
            keyboard.updatePatternHighlight(playableToneNotes);
        }
    }
}

// Helper function to format tone notes consistently
function formatToneNote(note, octave) {
    if (note.includes('/')) {
        return `${note.split('/')[0].replace('♯', '#')}${octave}`;
    }
    return `${note}${octave}`;
}


// UPDATE LAYOUT

function updateLayout(newLayout) {
    if (config.layouts.hasOwnProperty(newLayout)) {
        currentLayout = newLayout;
        wheel.switchLayout(newLayout);
        updateAllNoteStates();
        updateLayoutButtons();
    }
}

function updateLayoutButtons() {
    const prevButton = document.getElementById('prev-layout');
    const nextButton = document.getElementById('next-layout');
    
    const transitions = layoutTransitions[currentLayout];
    const icons = layoutIcons[currentLayout];
    
    if (transitions.prev) {
        prevButton.style.display = 'flex';
        prevButton.querySelector('img').src = `resources/${icons.prev}`;
        prevButton.querySelector('.top').textContent = 'change to';
        prevButton.querySelector('.bottom').textContent = transitions.prev;
        prevButton.onclick = () => updateLayout(transitions.prev);
    } else {
        prevButton.style.display = 'none';
    }
    
    if (transitions.next) {
        nextButton.style.display = 'flex';
        nextButton.querySelector('img').src = `resources/${icons.next}`;
        nextButton.querySelector('.top').textContent = 'change to';
        nextButton.querySelector('.bottom').textContent = transitions.next;
        nextButton.onclick = () => updateLayout(transitions.next);
    } else {
        nextButton.style.display = 'none';
    }
}

// TOGGLES

function toggleSharps() {
    useSharps = !useSharps;
    console.log("Toggled sharps. New value:", useSharps);
    updateTonicDisplay(); // Add this line
    updateAllNoteStates();
}

function toggleIndicators() {
    tonicIndicators.toggleVisibility();
}

function toggleColors() {
    useColors = !useColors;
    updateAllNoteStates();
    tonicIndicators.updateIndicatorColor();
}

function toggleAnimation() {
    animate = !animate;
    wheel.animate = animate;
    keyboard.animate = animate;
    pattern.animate = animate;
}

function toggleAutoplay() {
    autoplayTonic = !autoplayTonic;
}



function updateAllNoteStates() {
    config.keyboardNotes.forEach((note, noteId) => {
        const baseNoteId = noteId % 12;
        const isActive = wheel.noteElements.get(baseNoteId)?.classList.contains('active') || 
                         keyboard.keyElements.get(noteId)?.classList.contains('active');
        const state = getNoteState(config.notes[baseNoteId], isActive);
        if (noteId < 12) {
            wheel.updateNoteState(noteId, state, useColors, animate, currentOctave);
        }
        keyboard.updateKeyState(noteId, state, useColors, animate, currentOctave);
    });
}

function getNoteState(note, isActive = false) {
    const baseNote = note || config.notes[config.notes.indexOf(note) % 12];
    return {
        display: config.getNoteDisplay(baseNote, useSharps),
        color: useColors ? config.noteColors[baseNote] : (baseNote.includes('/') ? '#262626' : '#D8D8D8'),
        active: isActive
    };
}

// PLAYBACK

function getToneNote(note, octave) {
    const isBlackNote = note.includes('/');
    const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
    return `${baseTone}${octave}`;
}

function playNote(toneNote) {
    synth.triggerAttack(toneNote);
    console.log("starting", toneNote)
    updateNoteState(toneNote, true, currentOctave);  // Always set to active when playing
}

function stopNote(toneNote) {
    synth.triggerRelease(toneNote);
    console.log("stopping", toneNote)
    updateNoteState(toneNote, false, currentOctave);  // Always set to inactive when stopping
}

function updateNoteState(toneNote, isActive) {
    const [noteName, octave] = toneNote.split(/(\d+)/);
    // Show arrow for notes in octave 5 or higher
    if (animate){
    keyboard.showArrow(parseInt(octave) >= 5 && isActive);
    }
    // Update keyboard
    const keyElement = document.querySelector(`.keyboard [data-tone-note="${toneNote}"]`);
    if (keyElement) {
        const noteId = parseInt(keyElement.dataset.noteId);
        const baseNoteId = noteId % 12;
        const state = getNoteState(config.notes[baseNoteId], isActive);
        keyboard.updateKeyState(noteId, state, useColors, animate, currentOctave);
    }

    // Update wheel
    const wheelElement = document.querySelector(`.wheel [data-tone-note="${toneNote}"]`);
    if (wheelElement) {
        const noteId = parseInt(wheelElement.dataset.noteId);
        const state = getNoteState(config.notes[noteId], isActive);
        wheel.updateNoteState(noteId, state, useColors, animate, currentOctave);
    }
}

function playNoteForDuration(toneNote, duration = 250) {
    try {
        playNote(toneNote);
        setTimeout(() => {
            stopNote(toneNote);
        }, duration);
    } catch (error) {
        console.error(`Error playing note ${toneNote}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    wheel.initialize();
    keyboard.initialize();
    pattern.initialize();
    toggleColors();
    toggleAnimation();
    initTonicPicker();
    updateTonicDisplay();
    updateLayoutButtons();

    // updateLayout(currentLayout);

    // Event listeners
    // document.getElementById('layout-select').addEventListener('change', (e) => updateLayout(e.target.value));
    document.getElementById('toggle-animate').addEventListener('change', toggleAnimation);
    document.getElementById('toggle-sharps').addEventListener('change', toggleSharps);
    document.getElementById('toggle-colors').addEventListener('change', toggleColors);
    document.getElementById('toggle-indicators').addEventListener('change', toggleIndicators);
    document.getElementById('toggle-autoplay').addEventListener('change', toggleAutoplay);
    document.getElementById('pattern-select').addEventListener('change', (e) => updatePattern(e.target.value));

    
    // PLAYBACK

    function handleNotePlay(element) {
        if (element && element.hasAttribute('data-tone-note')) {
            const toneNote = element.getAttribute('data-tone-note');
            if (toneNote !== lastPlayedNote) {
                if (lastPlayedNote) {
                    stopNote(lastPlayedNote);
                }
                playNote(toneNote);
                lastPlayedNote = toneNote;
            }
        } else if (lastPlayedNote) {
            stopNote(lastPlayedNote);
            lastPlayedNote = null;
        }
    }
    
    // For the wheel
    wheel.container.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        handleNotePlay(e.target.closest('[data-tone-note]'));
    });
    
    wheel.container.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            handleNotePlay(e.target.closest('[data-tone-note]'));
        }
    });
    
    wheel.container.addEventListener('mouseup', () => {
        isMouseDown = false;
        if (lastPlayedNote) {
            stopNote(lastPlayedNote);
            lastPlayedNote = null;
        }
    });
    
    wheel.container.addEventListener('mouseleave', () => {
        isMouseDown = false;
        if (lastPlayedNote) {
            stopNote(lastPlayedNote);
            lastPlayedNote = null;
        }
    });
    
    // For the keyboard
    keyboard.keyboardElement.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        handleNotePlay(e.target.closest('[data-tone-note]'));
    });
    
    keyboard.keyboardElement.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            handleNotePlay(e.target.closest('[data-tone-note]'));
        }
    });
    
    keyboard.keyboardElement.addEventListener('mouseup', () => {
        isMouseDown = false;
        if (lastPlayedNote) {
            stopNote(lastPlayedNote);
            lastPlayedNote = null;
        }
    });
    
    keyboard.keyboardElement.addEventListener('mouseleave', () => {
        isMouseDown = false;
        if (lastPlayedNote) {
            stopNote(lastPlayedNote);
            lastPlayedNote = null;
        }
    });
});

export { playNote, stopNote, useColors, playNoteForDuration };