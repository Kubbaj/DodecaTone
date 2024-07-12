// app.js

import * as config from './config.js';
import { Wheel } from './wheel.js';
import { Keyboard } from './keyboard.js';
import { TonicIndicators } from './tonicIndicators.js';
import { debugTracker, toggleDebugDashboard } from './debugPanel.js';

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


// Initialize components
const wheelContainer = document.getElementById('wheel-container');
const keyboardWindow = document.getElementById('keyboard-window');
const tonicIndicators = new TonicIndicators(wheelContainer, keyboardWindow, useColors);
tonicIndicators.toggleVisibility(false);

const wheel = new Wheel(wheelContainer, animate);
const keyboardContainer = document.getElementById('keyboard-container');
const keyboard = new Keyboard(keyboardContainer, animate);

// UPDATE TONIC

function updateTonicDisplay() {
    const currentTonicDisplay = document.getElementById('current-tonic');
    if (currentTonicDisplay) {
        currentTonicDisplay.textContent = config.getNoteDisplay(currentTonic, useSharps);
    }
}

function getToneNote(note, octave) {
    const isBlackNote = note.includes('/');
    const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
    return `${baseTone}${octave}`;
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

        if (autoplayTonic) {
            const toneNote = getToneNote(newTonic, currentOctave);
            
            const delay = animate ? 250 : 0;
            
            setTimeout(() => {
                playNoteForDuration(toneNote);
            }, delay);
        }
    }
}

function initTonicPicker() {
    const decreaseButton = document.getElementById('decrease-tonic');
    const increaseButton = document.getElementById('increase-tonic');

    function changeTonic(direction) {
        const currentIndex = config.notes.indexOf(currentTonic);
        let newIndex;
        if (direction === 'increase') {
            newIndex = (currentIndex + 1) % config.notes.length;
        } else {
            newIndex = (currentIndex - 1 + config.notes.length) % config.notes.length;
        }
        setTonic(config.notes[newIndex]);
    }

    decreaseButton.addEventListener('click', () => changeTonic('decrease'));
    increaseButton.addEventListener('click', () => changeTonic('increase'));

    // Initialize display
    updateTonicDisplay();
}

// UPDATE LAYOUT

function updateLayout(newLayout) {
    if (config.layouts.hasOwnProperty(newLayout)) {
        currentLayout = newLayout;
        wheel.updateLayout(config.layouts[newLayout]);
        // We're not updating the keyboard layout, as it should remain chromatic
        updateAllNoteStates();
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
    console.log("Toggled colors. New value:", useColors);
    updateAllNoteStates();
    tonicIndicators.updateIndicatorColor();
}

function toggleAnimation() {
    animate = !animate;
    console.log("Toggled animation. New value:", animate);
    wheel.animate = animate;
    keyboard.animate = animate;
}

function toggleAutoplay() {
    autoplayTonic = !autoplayTonic;
    console.log("Toggled autoplay. New value:", autoplayTonic);
}



function updateAllNoteStates() {
    config.keyboardNotes.forEach((note, noteId) => {
        const baseNoteId = noteId % 12;
        const isActive = wheel.noteElements.get(baseNoteId)?.classList.contains('active') || 
                         keyboard.keyElements.get(noteId)?.classList.contains('active');
        const state = getNoteState(config.notes[baseNoteId], isActive);
        if (noteId < 12) {
            wheel.updateNoteState(noteId, state, useColors, animate);
        }
        keyboard.updateKeyState(noteId, state, useColors, animate);
    });
}

function getNoteState(note, isActive = false) {
    const baseNote = note || config.notes[config.notes.indexOf(note) % 12];
    return {
        display: config.getNoteDisplay(baseNote, useSharps),
        color: useColors ? config.noteColors[baseNote] : (baseNote.includes('/') ? 'black' : 'white'),
        active: isActive
    };
}

// PLAYBACK

// In app.js
function playNote(toneNote) {
    synth.triggerAttack(toneNote);
    updateNoteState(toneNote, true);  // Always set to active when playing
}

function stopNote(toneNote) {
    synth.triggerRelease(toneNote);
    console.log("stopping", toneNote)
    updateNoteState(toneNote, false);  // Always set to inactive when stopping
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

function updateNoteState(toneNote, isActive) {
    // Update keyboard
    const keyElement = document.querySelector(`.keyboard [data-tone-note="${toneNote}"]`);
    if (keyElement) {
        const noteId = parseInt(keyElement.dataset.noteId);
        const baseNoteId = noteId % 12;
        const state = getNoteState(config.notes[baseNoteId], isActive);
        keyboard.updateKeyState(noteId, state, useColors, animate);
    }

    // Update wheel
    const wheelElement = document.querySelector(`.wheel [data-tone-note="${toneNote}"]`);
    if (wheelElement) {
        const noteId = parseInt(wheelElement.dataset.noteId);
        const state = getNoteState(config.notes[noteId], isActive);
        wheel.updateNoteState(noteId, state, useColors, animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    wheel.initialize();
    keyboard.initialize();
    initTonicPicker();
    updateTonicDisplay();
    setupDebugTracker();

    // updateLayout(currentLayout);

    // Event listeners
    document.getElementById('layout-select').addEventListener('change', (e) => updateLayout(e.target.value));
    document.getElementById('toggle-animate').addEventListener('change', toggleAnimation);
    document.getElementById('toggle-sharps').addEventListener('change', toggleSharps);
    document.getElementById('toggle-colors').addEventListener('change', toggleColors);
    document.getElementById('toggle-debug').addEventListener('click', toggleDebugDashboard);
    document.getElementById('toggle-indicators').addEventListener('change', toggleIndicators);
    document.getElementById('toggle-autoplay').addEventListener('change', toggleAutoplay);

    
    // PLAYBACK

    // For the wheel
wheel.container.addEventListener('mousedown', (e) => {
    const noteElement = e.target.closest('[data-tone-note]');
    if (noteElement) {
        const toneNote = noteElement.getAttribute('data-tone-note');
        currentlyPlayingNote = toneNote;
        playNote(toneNote);
    }
});

wheel.container.addEventListener('mouseup', () => {
    if (currentlyPlayingNote) {
        stopNote(currentlyPlayingNote);
        currentlyPlayingNote = null;
    }
});

wheel.container.addEventListener('mouseleave', () => {
    if (currentlyPlayingNote) {
        stopNote(currentlyPlayingNote);
        currentlyPlayingNote = null;
    }
});

// For the keyboard
keyboard.keyboardElement.addEventListener('mousedown', (e) => {
    const keyElement = e.target.closest('[data-tone-note]');
    if (keyElement) {
        const toneNote = keyElement.getAttribute('data-tone-note');
        currentlyPlayingNote = toneNote;
        playNote(toneNote);
    }
});

keyboard.keyboardElement.addEventListener('mouseup', () => {
    if (currentlyPlayingNote) {
        stopNote(currentlyPlayingNote);
        currentlyPlayingNote = null;
    }
});

keyboard.keyboardElement.addEventListener('mouseleave', () => {
    if (currentlyPlayingNote) {
        stopNote(currentlyPlayingNote);
        currentlyPlayingNote = null;
    }
});

});
// DEBUG STUFF

function setupDebugTracker() {
    debugTracker.track('useSharps', () => useSharps);
    debugTracker.track('useColors', () => useColors);
    debugTracker.track('animate', () => animate);
    debugTracker.track('wheelNoteElements', () => wheel.noteElements.size);
    debugTracker.track('wheelNotePositions', () => wheel.notePositions.size);
    debugTracker.track('keyboardKeyElements', () => keyboard.keyElements.size);
}



export { playNote, stopNote, useColors };