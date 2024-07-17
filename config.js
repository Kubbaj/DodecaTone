// config.js

// Basic note array
const notes = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];

const extendedNotes = [
  'C3', 'C♯3/D♭3', 'D3', 'D♯3/E♭3', 'E3', 'F3', 'F♯3/G♭3', 'G3', 'G♯3/A♭3', 'A3', 'A♯3/B♭3', 'B3',
  'C4', 'C♯4/D♭4', 'D4', 'D♯4/E♭4', 'E4', 'F4', 'F♯4/G♭4', 'G4', 'G♯4/A♭4', 'A4', 'A♯4/B♭4', 'B4'
];

const keyboardNotes = [
  ...notes,
  ...notes.map(note => note)
];

const layouts = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  fifths: [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5],
  fourths: [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7]
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
  none: [],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
  augmented: [0, 3, 4, 7, 8, 11]
};

// Chords
const chords = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10]
};

// Modes
const modes = {
  ionian: scales.major,
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: scales.minor,
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

// Regulars
const regulars = {
  one: scales.chromatic,
  two: scales.wholeTone,
  three: chords.diminished7,
  four: chords.augmented,
  five: layouts.fourths,
  six: [0,6]
}

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
  chords, 
  modes,
  regulars, 
  noteColors, 
  getNoteDisplay,
  animationSettings
};