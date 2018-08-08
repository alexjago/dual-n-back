// Dual N-Back task experiment

/*** Far to many global variables ***/

var stimTime = 800; // presentation interval
var restTime = 1000; // ISI but it happens *before* the main event

var trialCount = 10;

//var N = 1; // LEQ 9 for now - makes sense, if grid of 9 squares
//var sliderN = 1;
//var modalityChoice = "both";

var Ns = [3, 4, 5];
var modalityChoices = ["audio", "visual", "both"];

var timeoutNoMatch = false; // 'timeout' means 'no-match'; default to false

var audio_q = [];	// queue
var visual_q = [];	// queue

var letters_audio = ['sounds/A.mp3', 'sounds/C.mp3', 'sounds/F.mp3',
					'sounds/G.mp3', 'sounds/K.mp3', 'sounds/M.mp3',
					'sounds/P.mp3', 'sounds/T.mp3', 'sounds/X.mp3'];

// var cardinals = ["0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

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

// audio stimuli A, C, F, G, K, M, P, T, X


/*** Helper functions ***/


/*** jsPsych block setup ***/


var instructions_block; var testing_block;
var dual_n_back_experiment = [];

// Instructions block

var start_instructions_block = {
  type: 'instructions',
  data: {
		trial_id: 'start_instruction'
  },
  pages: [
		'This is a set of single and dual-modality N-back memory tasks, also known as "[dual] n-back".',
		'You will receive visual and/or aural stimuli, and must indicate if either stimulus matches what it was at some point previously. (You will be told this point for each run.)',
		'Your aural stimulus will be the recording of one of 9 letter names: A, C, F, G, K, M, P, T, X.',
		'Your visual stimulus will be the position of a red square somewhere  on a 3x3 grid.',
		'You will perform 9 series of '+trialCount+' trials: aural-only, visual-only, both aural and visual; for N=3, N=4 and N=5.',
		'For example, if N=3, then for a sequence of aural stimuli <em>A, C, M, P, T, M, X, K, T, X</em>, you should indicate a match for the second M and X, but not the second T.',
		'The entire experiment should take about '+ Math.round( 1 + (trialCount*9*(stimTime+restTime)/60000))+' minutes.',
  ],
  allow_keys: false,
	allow_backward: true,
  show_clickable_nav: true,
  post_trial_gap: 1000,
};

dual_n_back_experiment.push(start_instructions_block);

// Testing block pre-setup.

var timeline_reps = [];
for(var i=0; i<trialCount; i++){ // todo: variable
	timeline_reps.push( { trial_number : i } );
}


// Lay out the 9 testing blocks (and their instruction blocks) using two loops.

for(i=0; i < Ns.length; i++){ // iterate over N
	for(j=0; j < modalityChoices.length; j++){ // iterate over modalities

		var instrPages = [];
		var thisPrompt = '';

		// Figure out what we're doing
		switch(modalityChoices[j]){
			case "audio":
				timeoutNoMatch = false;
				thisPrompt = 'Press the "X" key if the stimulus matches what it was '+Ns[i]+' times ago. <br> Press the "Z" key if it doesn\'t.';
				instrPages = [
					'This set is aural-only and N = '+Ns[i]+'.',
					thisPrompt,
				];
				break;
			case "visual":
				timeoutNoMatch = false;
				thisPrompt = 'Press the "M" key if the stimulus matches what it was '+Ns[i]+' times ago. <br> Press the "N" key if it doesn\'t.';
				instrPages = [
					'This set is visual-only and N = '+Ns[i]+'.',
					thisPrompt,
				];
				break;
			case "both":
				timeoutNoMatch = true;
				thisPrompt = 'Press the "X" key if the aural stimulus matches what it was '+Ns[i]+' times ago.<br>' +
										'Press the "M" key if the visual stimulus matches what it was '+Ns[i]+' times ago.<br>' +
										'(You do not need to indicate if either stimulus does not match.)';
				instrPages = [
					'This set is both aural and visual; N = '+Ns[i]+'.',
					thisPrompt,
				];
				break;
		}

		// instructions
		var block_instructions = {
			type: 'instructions',
		  data: {
				trial_id: modalityChoices[j]+'_'+Ns[i]+'_instruction'
		  },
		  pages: instrPages,
		  allow_keys: false,
			allow_backward: true,
		  show_clickable_nav: true,
		  post_trial_gap: 1000,
		}

		// trials
		var block_tests = {
			type : 'dual-n-back',
			data : {
				trial_id : modalityChoices[j]+'_'+Ns[i]+'_testing'
			},
			allow_keys : true,
			show_clickable_nav : true,
			trials_total : trialCount,
			trial_n_back : Ns[i],
			audio_stimuli : letters_audio,
			visual_stimulus_html : big_table_glob,
			visual_stimuli : ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7", "sp8", "sp9"],
			trial_duration : stimTime,
			trial_fixation_time : restTime,
			timeout_is_nomatch : timeoutNoMatch,
			prev_audio : audio_q,
			prev_visual : visual_q,
			modality_choice : modalityChoices[j],
			prompt: thisPrompt,
			timeline : timeline_reps, // many!
		}

		dual_n_back_experiment.push(block_instructions);
		dual_n_back_experiment.push(block_tests);

	} // inner for loop
}	// outer for loop

// feedback block?
// Seems like a good thing to include
// TODO: copy over from PRP.

/*** End of experiment definition ***/
