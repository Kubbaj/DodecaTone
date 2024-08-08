// config.js

// Basic note array
const notes = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];

const extendedNotes = [
  'C3', 'C♯3/D♭3', 'D3', 'D♯3/E♭3', 'E3', 'F3', 'F♯3/G♭3', 'G3', 'G♯3/A♭3', 'A3', 'A♯3/B♭3', 'B3',
  'C4', 'C♯4/D♭4', 'D4', 'D♯4/E♭4', 'E4', 'F4', 'F♯4/G♭4', 'G4', 'G♯4/A♭4', 'A4', 'A♯4/B♭4', 'B4'
];

const keyboardNotes = [
  'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B',
  'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B', 'C'
];

const layouts = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  fifths:    [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5],
  fourths:   [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7]
};

// Function to get note display based on sharp/flat preference
const getNoteDisplay = (note, useSharps) => {
  if (note.includes('/')) {
    return useSharps ? note.slice(0, 2) : note.slice(-2);
  }
  return note;
};

// Scales
const scales = {
  "Chromatic": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  "Major": [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Minor Pentatonic": [0, 3, 5, 7, 10],
  "Blues": [0, 3, 5, 6, 7, 10],
  "Whole Tone": [0, 2, 4, 6, 8, 10],
};

const exotics = {
  "Harmonic Major": [0, 2, 4, 5, 7, 8, 11],
  "Double Harmonic": [0, 1, 4, 5, 7, 8, 11],
  "Prometheus": [0, 2, 4, 6, 9],
  "Egyptian": [0, 2, 5, 7, 10],
  "Hirajoshi": [0, 2, 3, 7, 8],
  "Neapolitan Minor": [0, 1, 3, 5, 7, 8, 11],
  "Neapolitan Major": [0, 1, 4, 5, 7, 9, 11],
  "Arabian": [0, 2, 4, 5, 6, 8, 10],
  "Balinese": [0, 1, 3, 7, 8],
  "Charhargan": [0, 1, 4, 5, 6, 8, 10],
  "Kurdish": [0, 2, 3, 7, 8, 10],
  "Spanish": [0, 1, 4, 5, 7, 8, 10],
  "Hungarian": [0, 2, 3, 6, 7, 8, 11],

  "Diminished (Whole-Half)": [0, 2, 3, 5, 6, 8, 9, 11],
  "Diminished (Half-Whole)": [0, 1, 3, 4, 6, 7, 9, 10],
  "Augmented": [0, 3, 4, 7, 8, 11],
  "Sixth Diminished (Bebop)": [0, 2, 4, 5, 7, 8, 9, 11],
  "Dorian Bebop": [0, 2, 3, 4, 5, 7, 9, 10],
  "Melodic Bebop": [0, 2, 3, 5, 7, 8, 9, 11],
  "Harmonic Bebop": [0, 2, 3, 5, 7, 8, 10, 11],
  "Dominant Bebop": [0, 2, 4, 5, 7, 9, 10, 11],
  "Altered": [0, 1, 3, 4, 6, 8, 10]
};

const triads = {
  "Major Triad": [0, 4, 7],
  "Minor Triad": [0, 3, 7],
  "Diminished Triad": [0, 3, 6],
  "Augmented Triad": [0, 4, 8],
  "Sus2": [0, 2, 7],
  "Sus4": [0, 5, 7],
};

const extendeds = {
  "Major 7th": [0, 4, 7, 11],
  "Minor 7th": [0, 3, 7, 10],
  "Dominant 7th": [0, 4, 7, 10],
  "Diminished 7th": [0, 3, 6, 9],
  "Half-Diminished 7th": [0, 3, 6, 10],
  "Minor 13": [0, 3, 7, 10, 14, 17, 21],
  "Major 13 (#11)": [0, 4, 7, 11, 14, 18, 21],
  "Dominant 13": [0, 4, 7, 10, 14, 17, 21],
  "Dominant 13 (b9)": [0, 4, 7, 10, 13, 17, 21],
  "Dominant 13 (b9 #11)": [0, 4, 7, 10, 13, 18, 21]
};

const intervals = {
  "minor 2nd": [0, 1],
  "Major 2nd": [0, 2],
  "minor 3rd": [0, 3],
  "Major 3rd": [0, 4],
  "Perfect 4th": [0, 5],
  "Tritone": [0, 6],
  "Perfect 5th": [0, 7]
};

// Modes
const modes = {
  "Ionian": scales["Major"],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
  "Aeolian": scales["Natural Minor"],
  "Locrian": [0, 1, 3, 5, 6, 8, 10]
};

const regulars = {
  "1: Chromatic": scales["Chromatic"],
  "2: Whole Tone": scales["Whole Tone"],
  "3: Diminished": extendeds["Diminished 7th"],
  "4: Augmented": triads["Augmented Triad"],
  "5: Fourths": layouts.fourths,
  "6: Tritone": [0, 6],
  "4,3: Thirds": [0, 4, 7, 11, 14, 18, 21, 25, 28, 32, 35, 39, 42, 46, 49, 53, 56, 60, 63, 67, 70, 74, 77, 81, 84]
};


// Note colors (ordered chromatically)
const noteColors = {
  'C': '#E25A5A',
  'C♯/D♭': '#5AA1E2',
  'D': '#E2E25A',
  'D♯/E♭': '#9E5AE2',
  'E': '#5AE25A',
  'F': '#E25AA1',
  'F♯/G♭': '#5AE2E2',
  'G': '#E29E5A',
  'G♯/A♭': '#5A5AE2',
  'A': '#A1E25A',
  'A♯/B♭': '#E25AE2',
  'B': '#5AE29E'
};

// Animation settings
const animationSettings = {
  duration: 500, // milliseconds
  easing: 'ease-in-out'
};

export { 
  notes, 
  keyboardNotes,
  extendedNotes,
  layouts, 
  scales, 
  triads, 
  modes,
  regulars,
  intervals,
  extendeds,
  exotics,
  noteColors, 
  getNoteDisplay,
  animationSettings
};