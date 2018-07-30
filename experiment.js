// Dual N-Back task experiment

/*** Far to many global variables ***/

var stimTime = 2000;
var restTime = 1000;

var trialCount = 10;

var N = 1; // LEQ 9 for now - makes sense, if grid of 9 squares
var sliderN = 1;
var modalityChoice = "both";

// var audio_matches = 0;	// correct
// var visual_matches = 0;	// correct
// var audio_fnegs = 0;	// false negative
// var visual_fnegs = 0;	// false negative
// var audio_fpos = 0;		// false positive
// var visual_fpos = 0;	// false positive


var audio_q = [];	// queue
var visual_q = [];	// queue

var letters_audio = ['sounds/A.mp3', 'sounds/C.mp3', 'sounds/F.mp3', 
					'sounds/G.mp3', 'sounds/K.mp3', 'sounds/M.mp3', 
					'sounds/P.mp3', 'sounds/T.mp3', 'sounds/X.mp3'];

var cardinals = ["0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

var big_table_glob = "<table id='visualStimTable'>	<tr>"+
"		<td><div id='sp1' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"		<td><div id='sp2' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"		<td><div id='sp3' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"	</tr>"+
"	<tr>"+
"		<td><div id='sp4' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"		<td><div id='sp5' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"		<td><div id='sp6' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"	</tr>"+
"	<tr>"+
"		<td><div id='sp7' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"		<td><div id='sp8' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"		<td><div id='sp9' style='background-color:red; visibility:hidden'>&nbsp;</div></td>"+
"	</tr>"+
"</table>";

/*** Helper functions ***/


/*** jsPsych block setup ***/

// intro block
// Explain what this task is, hit Enter to continue

var instructions_block; var testing_block; var dual_n_back_experiment;

// To be called from the start button
function setUpExperiment(){ 
	instructions_block = {
	  type: 'instructions',
	  data: {
		trial_id: 'instruction'
	  },
	  pages: [
		'This is a dual-modality N-back memory task, also known as "dual n-back".',
		'You will receive visual and aural stimuli, and must indicate if either stimulus matches what it was several times previously.'
	  ],
	  allow_keys: false,
	  show_clickable_nav: true,
	  post_trial_gap: 1000,
	};

	// training
	// Just like testing, but shorter
	// Need a way to define N?


	// testing
	// Just like training, but longer
	// Need a way to define N?

	var timeline_reps = [];

	for(var i=0; i<trialCount; i++){ // todo: variable
		timeline_reps.push( { trial_number : i } );
	}

	testing_block = {
		type : 'dual-n-back',
		data : {
			trial_id : 'testing'
		},
		allow_keys : true,
		show_clickable_nav : true,
		trials_total : trialCount,
		trials_n_back : N,
		audio_stimuli : letters_audio,
		visual_stimulus_html : big_table_glob,
		visual_stimuli : ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7", "sp8", "sp9"],
		trial_duration : stimTime,
		trial_fixation_time : restTime,
		prev_audio : audio_q,
		prev_visual : visual_q,
		modality_choice : "both",
		timeline : timeline_reps, // many!
	}

	// feedback
	// Seems like a good thing to include

	/** experiment definition array **/

	dual_n_back_experiment = [testing_block];
}

