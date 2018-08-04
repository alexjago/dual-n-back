# Dual N-Back

This is an implementation of a dual-modality n-back task.

The visual modality stimulus is achieved by making one of a set of specified HTML
elements visible. This project uses squares arranged in a 3x3 grid.

The audio modality stimulus is achieved by playing one of a set of specified
audio files. This project uses computer-generated audio of the letter names
`A C F G K M P T X`.

The bulk of the implementation can be found in `jspsych-dual-n-back.js` which is
a jsPsych plugin (adapted from `jspsych-audio-keyboard-response`). 

The format of the project mostly follows the Experiment Factory, although at
present this isn't set up to be usable as such.
