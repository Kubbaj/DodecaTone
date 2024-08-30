// config.js

// config.js (basic data and helper functions)

const NOTE_C = 'C'
const NOTE_CSharp = 'C#'
const NOTE_DFlat = 'Db'

// //NOTE DATA
// export const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// export const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// export const noteNames = sharpNames;

// export const allTonics = [...noteNames.map(note => `${note}3`), ...noteNames.map(note => `${note}4`)];

// export const allNotes = Array.from({ length: 4 }, (_, i) => noteNames.map(note => `${note}${i + 3}`)).flat();

// export const noteWidths = [1.5, 1, 2, 1, 1.5, 1.5, 1, 2, 1, 2, 1, 1.5]

// //VISUAL DATA
// export const b = '#000000';
// export const w = '#FFFFFF';

// export const rainbowColors = ['#E25A5A','#5AA1E2','#E2E25A','#9E5AE2','#5AE25A','#E25AA1','#5AE2E2','#E29E5A','#5A5AE2','#A1E25A','#E25AE2','#5AE29E'];
// export const bwColors = [w, b, w, b, w, w, b, w, b, w, b, w];

// //PATTERN + LAYOUT DATA
// export const regulars = {
//   one:    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//   two:    [0, 2, 4, 6, 8, 10],
//   three:  [0, 3, 6, 9],
//   four:   [0, 4, 8],
//   five:   [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7],
//   six:    [0,6],
//   seven:  [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5],
//   eight:  [0, 8, 4],
//   nine:   [0, 9, 6, 3],
//   ten:    [0, 10, 8, 6, 4, 2],
//   eleven: [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
// }

// export const scales = {
//   major: [0, 2, 4, 5, 7, 9, 11],
//   minor: [0, 2, 3, 5, 7, 8, 10],
//   harmMinor: [0, 2, 3, 5, 7, 8, 11],
//   melMinor: [0, 2, 3, 5, 7, 9, 11],
//   majPent: [0, 2, 4, 7, 9],
//   minPent: [0, 3, 5, 7, 10],
//   blues: [0, 3, 5, 6, 7, 10],
//   chromatic: regulars.one,
//   wholeTone: regulars.two,
//   dimWH: [0, 2, 3, 5, 6, 8, 9, 11],
//   dimHW: [0, 1, 3, 4, 6, 7, 9, 10],
//   diminished: [0, 2, 3, 5, 6, 8, 9, 11],
//   augmented: [0, 3, 4, 7, 8, 11],
//   sixthDim: [0, 2, 4, 5, 7, 8, 9, 11]
// };

// export const exoticScales ={
//   harmonicMajor: [0, 2, 4, 5, 7, 8, 11],
//   doubleHarmonic: [0, 1, 4, 5, 7, 8, 11],
//   prometheus: [0, 2, 4, 6, 9],
//   egyptian: [0, 2, 5, 7, 10],
//   hirajoshi: [0, 2, 3, 7, 8],
//   neapolitanMinor: [0, 1, 3, 5, 7, 8, 11],
//   neapolitanMajor: [0, 1, 4, 5, 7, 9, 11],
//   arabian: [0, 2, 4, 5, 6, 8, 10],
//   balinese: [0, 1, 3, 7, 8],
//   charhargan: [0, 1, 4, 5, 6, 8, 10],
//   kurdish: [0, 2, 3, 7, 8, 10],
//   spanish: [0, 1, 4, 5, 7, 8, 10],
//   gypsy: [0, 1, 4, 5, 7, 8, 10],
//   hungarian: [0, 2, 3, 6, 7, 8, 11]
// };

// export const triads = {
//   major: [0, 4, 7],
//   minor: [0, 3, 7],
//   sus2: [0, 2, 7],
//   sus4: [0, 5, 7],
//   diminished: [0, 3, 6],
//   augmented: regulars.four
// };

// export const extChords = {
//   major7: [0, 4, 7, 11],
//   minor7: [0, 3, 7, 10],
//   dominant7: [0, 4, 7, 10],
//   diminished7: regulars.three,
//   halfDiminished7: [0, 3, 6, 10],
//   minor13: [0, 3, 7, 10, 14, 17, 21],
//   major13sh11: [0, 4, 7, 11, 14, 18, 21],
//   dom13: [0, 4, 7, 10, 14, 17, 21]
// };

// export const layouts = {
//   chromatic: regulars.one,
//   fifths: regulars.seven,
//   fourths: regulars.five
// }


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

// Function to get note display based on sharp/flat preference
const getNoteDisplay = (note, useSharps) => {
  if (note.includes('/')) {
    return useSharps ? note.slice(0, 2) : note.slice(-2);
  }
  return note;
};

const layouts = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  fifths:    [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5],
  fourths:   [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7]
};

// Scales
const scales = {
  "Major Scale": [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Minor Pentatonic": [0, 3, 5, 7, 10],
  "Blues": [0, 3, 5, 6, 7, 10],
  "Chromatic": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  "Whole Tone": [0, 2, 4, 6, 8, 10],
  "Harmonic Major": [0, 2, 4, 5, 7, 8, 11],
  "Double Harmonic": [0, 1, 4, 5, 7, 8, 11],
  "Diminished (Whole-Half)": [0, 2, 3, 5, 6, 8, 9, 11],
  "Diminished (Half-Whole)": [0, 1, 3, 4, 6, 7, 9, 10],
};

const exotics = {

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
  "Major 7th": [0, 4, 7, 11],
  "Minor 7th": [0, 3, 7, 10],
  "Dominant 7th": [0, 4, 7, 10],
};

const extendeds = {
  
  "Diminished 7th": [0, 3, 6, 9],
  "Half-Diminished 7th": [0, 3, 6, 10],
  "Minor 13": [0, 3, 7, 10, 14, 17, 21],
  "Major 13 (#11)": [0, 4, 7, 11, 14, 18, 21],
  "Dominant 13": [0, 4, 7, 10, 14, 17, 21],
  "Dominant 13 (b9)": [0, 4, 7, 10, 13, 17, 21],
  "Dominant 13 (b9 #11)": [0, 4, 7, 10, 13, 18, 21]
};

const intervals = {
  "1: min2<sup>nd</sup>/Maj7<sup>th</sup>": [0, 1],
  "2: Maj2<sup>nd</sup>/min7<sup>th</sup>": [0, 2],
  "3: min3<sup>rd</sup>/Maj6<sup>th</sup>": [0, 3],
  "4: Maj3<sup>rd</sup>/min6<sup>th</sup>": [0, 4],
  "5: Per4<sup>th</sup>/Per5<sup>th</sup>": [0, 5],
  "6: TRITONE": [0, 6],
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