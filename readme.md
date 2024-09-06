BUGS TO FIX:
 - STICKY NOTES:
   when cycling through tonics too quickly, some note-press animations don't complete properly...
- PLAYBACK TIMEOUT:
   when audio is triggered after not having been for some (surprisingly short) period, there's a delay before it kicks back in again (@__drewface [fixed this](https://gist.github.com/ajroberts0417/4381eddf9bf88ab49c5a92fcc88e8d5f#file-tone-html-L65-L72) but i havent been able to implement it for some reason... (actually, i just tried again and (at least in my browser) the problem still remains even in drew's fix...))
 - MULTI-OCTAVE HANDLING:
   various bugs occur when a pattern is chosen that extends beyond a single octave
   (pattern shifting breaks, and playback gets piercingly high for larger patterns, also the final note is still only 1oct above the tonic bc we trigger it manually)
 - LAYOUT CHANGE DE-SYNC
   when a pattern is selected and the layout is changed, both the notes and the polygon smoothly animate between them, but are occasionally out-of-sync with each other...


FEATURES TO ADD ASAP:
 - MOBILE OPTIMISATION:
   implement dynamic layout for small screens, and allow touch inputs (w/o mouse hovering)
 - UPGRADED PATTERN PICKER:
   a fully visual grid of patterns, with various layout options and advanced toggles (based on [PatternCalc](https://github.com/Kubbaj/PatternCalc))
 - EXPANDED COLOURING CHOICES
   choose between colour-coded NOTES, INTERVALS or PATTERNS (perhaps multiple??)
   (also potentially set a custom pallette for each)
 - DYNAMIC PATTERN NAMING
   named modes of a scale should be declared (Major Scale[-3] (Aeolian))
 - CUSTOM PATTERN CREATION
   pick a selection of notes and a custom name to add to your menu
 - ALTERNATE SOUNDFONTS
   pick between basic waves (sine, square, triangle) or instruments (piano, guitar, flute) (potentially upload custom soundfont as well??)
 - DYNAMIC SHIFTING
   allow arrows to shift by 4ths/5ths when layout is changed
 - ALTERNATE INPUTS
   add keyboard playback + eventually MIDI playback as well (and display shapes?)
 - INTERVAL LABELS
   text labels on each interval of the brackets and polygons
 - OCTAVE LABELLING
   extra circle/line denoting octave AND/OR numbers incl. in note labels
 - DOUBLE BRACKET / CONJOINED TONIC+PATTERN LABEL
   move pattern picker next to tonic label so you get "C Harmonic Minor" in one space (allows room for 2oct bracket above keys too, maybe toggleable?)
 - MULTI-PATTERN SELECTION
   allow overlaying of up to 3 patterns at once


*BIG* FEATURES TO WORK TOWARDS ADDING:

 - #PATTERN BREAKDOWNS#
   ability to split patterns into smaller components of other patterns, e.g: Major Scale = Whole-Tone + Whole-Tone, Altered Scale = Diminished + Whole-Tone etc.

 - #ARTICLES/WIKI#
   for each pattern, an article on its construction, historical usage & cultural significance. w/ links to songs that use it + exercises to practice it (could initially just link to wikipedia if an article exists...)

 - #TUTORIAL/LESSONS#
   walkthrough of basic app features on startup, plus custom, interactive lessons in intermediate-advanced theory concepts accessible from menu

 - #ADDITIONAL VISUALISATIONS#
   to complement (or replace) keyboard/wheel. things like guitar tabs & standard notation

 - #PROGRESSIONS/SONGS#
   something like ultimate guitar or other chord apps

 - #ALTERNATE WHEEL CONFIGS#
   based on certain patterns, OR entirely different tuning systems...




...




And then, there's the far-future dreams of an all-in one music education app that builds knowledge from the ground up...
With everything from:

 1. Sound waves/basic physics
 2. Frequency/Wavelength
 3. Overtones/Harmonic Sequence
 4. Freq ratios/Intervals
 5. Consonance/Dissonance
 6. Harmony/Melody/Rhythm
 8. Tuning/Temperament
 9. DODECATONE
 10. Timbre/Waveforms/Additive Synthesis
 11. Instrument construction/operation
 12. Vocal anatomy/sound production
 13. Western and Non-Western Writing Systems
 14. Global Music History and Culture
