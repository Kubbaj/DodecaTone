// app.js

import * as config from './config.js';
import { Wheel } from './wheel.js';
import { Keyboard } from './keyboard.js';
import { TonicIndicators } from './tonicIndicators.js';
import { Pattern } from './pattern.js';

// Initialize Tone.js
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
Tone.start().then(() => {
    keepAudioContextAlive();
    console.log('Audio is ready');
});

// Global state
let currentLayout = 'chromatic';
let currentPattern = 'none';
let currentTonic = 'C';
let currentOctave = 4;
let useSharps = false;
let useColors = true;
let useIntervalColors = false;
let animate = false;
let autoplayTonic = true;
let reverseArrowDirection = false;

let isMouseDown = false;
let lastPlayedNote = null;

// probably better data structure
// const layouts = ["chromatic", "fifths", "fourths"]
// maybe different for icons
// const layoutIcons = ["chromatic", "fifths", "fourths"]
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
const tonicIndicators = new TonicIndicators(wheelContainer, keyboardWindow);
tonicIndicators.toggleVisibility();

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
    const wheelTonicLEFT = document.getElementById('wheel-tonicL');
    const wheelTonicRIGHT = document.getElementById('wheel-tonicR');
    const keysTonicLEFT = document.getElementById('keys-tonicL');
    const keysTonicRIGHT = document.getElementById('keys-tonicR');

    wheelTonicLEFT.addEventListener('click', () => changeTonic(-1));
    wheelTonicRIGHT.addEventListener('click', () => changeTonic(1));
    keysTonicLEFT.addEventListener('click', () => changeTonic(-1));
    keysTonicRIGHT.addEventListener('click', () => changeTonic(1));

    // Initialize display
    updateTonicDisplay();
}

function changeTonic(direction) {
    const currentIndex = config.notes.indexOf(currentTonic);
    let newIndex;
    if ((!reverseArrowDirection && direction === 1) || (reverseArrowDirection && direction === -1)) {
        newIndex = (currentIndex + 1) % config.notes.length;
    } else {
        newIndex = (currentIndex - 1 + config.notes.length) % config.notes.length;
    }
    setTonic(config.notes[newIndex]);
    pattern.drawPatternPolygon();
}


// UPDATE PATTERN
function updatePattern(newPatternValue) {
    if (newPatternValue === 'none') {
        currentPattern = 'none';
        pattern.updatePattern([]);
        keyboard.updatePatternHighlight([]);
        wheel.updatePatternHighlight([]);
    } else {
        const [category, patternName] = newPatternValue.split(/[\[\]]+/);
        const patternNotes = config[category][patternName.replace(/"/g, '')];

        if (patternNotes) {
            currentPattern = newPatternValue;  // Store the current pattern value
            pattern.updatePattern(patternNotes);
            updatePatternForNewTonic(currentTonic, false);
        } else {
            console.error(`Pattern not found: ${newPatternValue}`);
        }
    }

    updatePatternDisplay(newPatternValue);
    const isPatternActive = newPatternValue !== 'none';
    document.getElementById('content-container').classList.toggle('pattern-active', isPatternActive);

    updateAllNoteStates();
}

function getAllPatterns() {
    const patterns = ['none'];
    const selectItems = document.querySelectorAll('.select-subitem');
    selectItems.forEach(item => patterns.push(item.dataset.value));
    return patterns;
}

function getCurrentPatternIndex() {
    const allPatterns = getAllPatterns();
    console.log(allPatterns.indexOf(currentPattern))
    return allPatterns.indexOf(currentPattern);
}

function changePattern(direction) {
    const allPatterns = getAllPatterns();
    const currentIndex = getCurrentPatternIndex();
    let newIndex;

    if ((!reverseArrowDirection && direction === 'next') || (reverseArrowDirection && direction === 'previous')) {
        newIndex = (currentIndex + 1) % allPatterns.length;
    } else {
        newIndex = (currentIndex - 1 + allPatterns.length) % allPatterns.length;
    }

    const newPattern = allPatterns[newIndex];
    updatePattern(newPattern);
    updatePatternDisplay(newPattern);
}

function updatePatternDisplay(patternValue) {
    const selectSelected = document.querySelector('.select-selected');
    if (patternValue === 'none') {
        selectSelected.textContent = '[NONE]';
    } else {
        const [category, patternName] = patternValue.split(/[\[\]]+/);
        selectSelected.innerHTML = patternName.replace(/"/g, '');
    }
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

function populatePatternMenu() {
    const selectItems = document.querySelector('#pattern-select .select-items');
    
    // Add [NONE] option
    const noneOption = document.createElement('div');
    noneOption.className = 'select-item none-option';
    noneOption.textContent = '[NONE]';
    noneOption.dataset.value = 'none';
    selectItems.appendChild(noneOption);
  
    const patterns = {
      'Intervals': config.intervals,
      'Regulars': config.regulars,
      'Scales': config.scales,
      'Triads': config.triads,
      'Modes': config.modes
    };
  
    for (const [category, patternSet] of Object.entries(patterns)) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'select-item';
      categoryDiv.textContent = category;
  
      const submenu = document.createElement('div');
      submenu.className = 'submenu';
  
      for (const [patternName, pattern] of Object.entries(patternSet)) {
        const patternDiv = document.createElement('div');
        patternDiv.className = 'select-subitem';
        patternDiv.innerHTML = patternName;
        patternDiv.dataset.value = `${category.toLowerCase()}["${patternName}"]`;
        submenu.appendChild(patternDiv);
      }
  
      categoryDiv.appendChild(submenu);
      selectItems.appendChild(categoryDiv);
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

function triggerLayoutChange(direction) {
    const transitions = layoutTransitions[currentLayout];
    const newLayout = transitions[direction];
    if (newLayout) {
        updateLayout(newLayout);
    }
}

function updateLayoutButtons() {
    const prevButton = document.getElementById('prev-layout');
    const nextButton = document.getElementById('next-layout');
    
    const transitions = layoutTransitions[currentLayout];
    const icons = layoutIcons[currentLayout];
    
    if (transitions.prev) {
        prevButton.style.display = 'flex';
        prevButton.querySelector('img').src = `../resources/${icons.prev}`;
        prevButton.querySelector('.top').textContent = 'change to';
        prevButton.querySelector('.bottom').textContent = transitions.prev;
        prevButton.onclick = () => updateLayout(transitions.prev);
    } else {
        prevButton.style.display = 'none';
    }
    
    if (transitions.next) {
        nextButton.style.display = 'flex';
        nextButton.querySelector('img').src = `../resources/${icons.next}`;
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
}

function toggleIntervalColors() {
    useIntervalColors = !useIntervalColors;
    pattern.updateIntervalColors(useIntervalColors);
    console.log('interval colors:', useIntervalColors)
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

function toggleArrowDirection() {
    reverseArrowDirection = document.getElementById('toggle-arrow-direction').checked;
    
    const arrows = document.querySelectorAll('.tonic-arrow, .pattern-arrow');
    arrows.forEach(arrow => {
        const currentDirection = parseInt(arrow.dataset.direction);
        arrow.dataset.direction = (-currentDirection).toString();
    });

    updateArrowTooltips();
}

function updateArrowTooltips() {
    const arrows = document.querySelectorAll('.tonic-arrow, .pattern-arrow');
    arrows.forEach(arrow => {
        const arrowType = arrow.dataset.arrowType;
        const title = arrow.querySelector('title');
        if (title) {
            let newText;
            if (reverseArrowDirection) {
                switch (arrowType) {
                    case 'tonic-left':
                        newText = arrow.classList.contains('curved-arrow') ? 'Shift WHEEL Left' : 'Shift KEYBOARD Left';
                        break;
                    case 'tonic-right':
                        newText = arrow.classList.contains('curved-arrow') ? 'Shift WHEEL Right' : 'Shift KEYBOARD Right';
                        break;
                    case 'pattern-left':
                        newText = arrow.classList.contains('curved-arrow') ? 'Shift POLYGON Left' : 'Shift BRACKET Left';
                        break;
                    case 'pattern-right':
                        newText = arrow.classList.contains('curved-arrow') ? 'Shift POLYGON Right' : 'Shift BRACKET Right';
                        break;
                }
            } else {
                switch (arrowType) {
                    case 'tonic-left':
                        newText = `Shift TONIC Left`;
                        break;
                    case 'pattern-left':
                        newText = `Shift START-POINT Left`;
                        break;
                    case 'tonic-right':
                        newText = `Shift TONIC Right`;
                        break;
                    case 'pattern-right':
                        newText = `Shift START-POINT Right`;
                        break;
                }
            }
            title.textContent = newText;
        } else {
            console.log("No title element found for this arrow");
        }
    });
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

function keepAudioContextAlive() {
    const pingInterval = 15000; // 15 seconds

    setInterval(() => {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        const pingOsc = new Tone.Oscillator().toDestination();
        pingOsc.volume.value = -Infinity;  // Make it silent
        pingOsc.start();
        pingOsc.stop('+0.001');  // Stop after 1ms
    }, pingInterval);
}

function getToneNote(note, octave) {
    const isBlackNote = note.includes('/');
    const baseTone = isBlackNote ? note.charAt(0) + '#' : note.charAt(0);
    return `${baseTone}${octave}`;
}

async function playNote(toneNote) {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    await Tone.context.resume();
    synth.triggerAttack(toneNote);
    updateNoteState(toneNote, true, currentOctave);
}

async function stopNote(toneNote) {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    await Tone.context.resume();
    synth.triggerRelease(toneNote);
    updateNoteState(toneNote, false, currentOctave);
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

async function playNoteForDuration(toneNote, duration = 250) {
    try {
        await playNote(toneNote);
        setTimeout(async () => {
            await stopNote(toneNote);
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
    toggleIndicators();
    updateTonicDisplay();
    updateLayoutButtons();
    populatePatternMenu();

    document.getElementById('toggle-interval-colors').addEventListener('change', toggleIntervalColors);

    document.getElementById('toggle-arrow-direction').checked = reverseArrowDirection;
    updateArrowTooltips();

    const startAudioButton = document.createElement('button');
    startAudioButton.textContent = 'Start Audio';
    startAudioButton.style.position = 'fixed';
    startAudioButton.style.top = '10px';
    startAudioButton.style.left = '10px';
    startAudioButton.style.zIndex = '1000';
    document.body.appendChild(startAudioButton);

    startAudioButton.addEventListener('click', async () => {
        await Tone.start();
        keepAudioContextAlive();
        console.log('Audio is ready');
        startAudioButton.remove();
    });

  const customSelect = document.querySelector('.custom-select');
  const selectSelected = customSelect.querySelector('.select-selected');
  const selectItems = customSelect.querySelector('.select-items');

  selectSelected.addEventListener('click', function(e) {
    e.stopPropagation();
    selectItems.style.display = selectItems.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', function() {
    selectItems.style.display = 'none';
  });

  // Use event delegation for dynamically created elements
  selectItems.addEventListener('click', function(e) {
    if (e.target.classList.contains('select-subitem') || e.target.dataset.value === 'none') {
      e.stopPropagation();
      const value = e.target.dataset.value;
      selectSelected.textContent = e.target.textContent;
      selectItems.style.display = 'none';
      // Call your existing updatePattern function here
      updatePattern(value);
    }
  });


    // Event listeners
    document.getElementById('toggle-animate').addEventListener('change', toggleAnimation);
    document.getElementById('toggle-sharps').addEventListener('change', toggleSharps);
    document.getElementById('toggle-colors').addEventListener('change', toggleColors);
    document.getElementById('toggle-indicators').addEventListener('change', toggleIndicators);
    document.getElementById('toggle-autoplay').addEventListener('change', toggleAutoplay);
    document.getElementById('toggle-arrow-direction').addEventListener('change', toggleArrowDirection);
    document.getElementById('pattern-select').addEventListener('change', (e) => updatePattern(e.target.value));
    document.addEventListener('keydown', handleKeyboardShortcuts);

    
    // MANUAL PLAYBACK

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

function resetToDefaults() {
    // Reset pattern
    updatePattern('none');

    // Reset tonic to C
    setTonic('C');

    // Reset layout to chromatic
    if (currentLayout !== 'chromatic') {
        updateLayout('chromatic');
    }
}




function handleKeyboardShortcuts(event) {
    // Prevent default behavior for some keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
        event.preventDefault();
    }

    const isShiftPressed = event.shiftKey;
    console.log(isShiftPressed)
    switch (event.key) {
        case 'ArrowLeft':
            if (isShiftPressed) {
                pattern.shiftPattern(-1);
            } else {
                changeTonic(-1);
            }
            break;
        case 'ArrowRight':
            if (isShiftPressed) {
                pattern.shiftPattern(1);
            } else {
                changeTonic(1);
            }
            break;
            case 'ArrowUp':
                if (isShiftPressed) {
                    changePattern('next');
                } else {
                    triggerLayoutChange('next');
                }
                break;
            case 'ArrowDown':
                if (isShiftPressed) {
                    changePattern('previous');
                } else {
                    triggerLayoutChange('prev');
                }
                break;
        case 'Escape':
            resetToDefaults();
            break;
        case ' ': // Space key
            pattern.playPattern();
            break;
        }

        if (isShiftPressed) {
            switch (event.key.toLowerCase()) {
                case 'c':
                    event.preventDefault();
                    toggleColors();
                    return;
                case 'a':
                    event.preventDefault();
                    toggleAnimation();
                    return;
                case 's':
                    event.preventDefault();
                    toggleSharps();
                    return;
            }
        }
}
export { playNote, stopNote, useColors, playNoteForDuration, reverseArrowDirection };