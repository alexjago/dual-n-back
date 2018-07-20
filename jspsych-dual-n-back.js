/**
 * jspsych-dual-n-back
 * Alex Jago
 * plugin for running a dual modality n-back experiment
 *
 **/

/**
 * Based on...
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins['dual-n-back'] = (function() {

	var plugin = {};

	jsPsych.pluginAPI.registerPreload('dual-n-back', 'stimulus', 'audio');

	plugin.info = {
		name: 'dual-n-back',
		description: '',
		parameters: {
			trial_number: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Trial number',
				default: 1,
				description: 'N-backs come in a series. Which in the series is this?'
			},
			trials_total: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Total number of trials',
				default: 1,
				description: 'N-backs come in a series. How long is this series?'
			},
			trial_n_back: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'N',
				default: 1,
				description: 'This is an N-back test. What is N?'
			},			
			audio_stimuli: {
				type: jsPsych.plugins.parameterType.AUDIO,
				array: true,
				pretty_name: 'Audio stimulus paths',
				default: undefined,
				description: 'The audio files to be played.'
			},
			visual_stimulus_html: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Visual stimulus HTML',
				default: undefined,
				description: 'An HTML string describing all the visual stimulus elements, to be shown or hidden by their `visibility` property. Should be hidden by default.'
			},
			visual_stimuli: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Visual stimulus IDs',
				array: true,
				default: undefined,
				description: 'An array of HTML IDs of the visual stimuli.'
			},
			choices: {
				type: jsPsych.plugins.parameterType.KEYCODE,
				pretty_name: 'Choices',
				array: true,
				default: ['a', 'l', 'q'],
				description: 'The keys the subject is allowed to press to respond to the stimuli.'
			},
			prompt: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Prompt',
				default: 'This is a dual-modality N-Back test. </br> Press A if the audio stimulus matches. <br/> Press L if the visual stimulus matches.',
				description: 'Any content here will be displayed below the stimulus.'
			},
			trial_fixation_time: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Trial fixation time',
				default: 0,
				description: 'Display a blank visual stimulus-area for this many milliseconds before presenting the real stimuli.'
			},
			trial_duration: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Trial duration',
				default: 3000,
				description: 'End trial this many milliseconds after stimulus.'
			},
			prev_audio: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Audio previous queue',
				array: true,
				default: undefined,
				description: 'An array containing previous audio stimuli indices.'
			},
			prev_visual: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Visual previous queue',
				array: true,
				default: undefined,
				description: 'An array containing previous visual stimuli indices.'
			},
		}
	};


	/*** Bulk of the trial function
	/*** Run the trial (on eventual callback) ***/
	function runMainTrial(display_element, trial) {
	
		// Set up trial-local variables
		
		var audioFlag = false;	var visualFlag = false; // var quitFlag = false;
		var audio_i = getRndInt();	var visual_i = getRndInt();
		var audioResponse = "true negative"; var visualResponse = "true negative";
	
		// Assorted helper functions
		
// 		function updateVisualI(){
// 			addIDtoQueue(visual_q, visual_i);
// 			visual_i = getRndInt();
// 		}
// 		function updateAudioI(){
// 			addIDtoQueue(audio_q, audio_i);
// 			audio_i = getRndInt();
// 		}
		function peekNBack(arr, N){ // arrays push & pop at the end (highest index)
			// one back is the last element in the array
			return arr[arr.length - (N)];
		}
		function getRndInt(){
			return Math.floor((Math.random() * 9));
		}
	
		// function to handle responses by the subject
		// This gets called on all keypresses
		var after_response = function(info) {
			console.log(info);
			var keyChar = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key);
			//console.log(keyChar);
			switch (keyChar) {
				case 'A':
				case 'a': // audio stim match selected
					audioFlag = true;
					break;
				case 'L':
				case 'l': // visual stim match selected
					visualFlag = true;
					break;
				case 'Q':
				case 'q': // quit early
					quitFlag = true;
					break;
			}
		};	
	
		// setup audio stimulus
		var context = jsPsych.pluginAPI.audioContext();
		if(context !== null){
			var source = context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.audio_stimuli[audio_i]);
			source.connect(context.destination);
		} else {
			var audio = jsPsych.pluginAPI.getAudioBuffer(trial.audio_stimuli[audio_i]);
			audio.currentTime = 0;
		}

		// define function run at end of trial
		function end_trial() {

			// kill any remaining setTimeout handlers
			jsPsych.pluginAPI.clearAllTimeouts();

			// stop the audio file if it is playing
			// remove end event listeners if they exist
			if(context !== null){
				source.stop();
				source.onended = function() { }
			} else {
				audio.pause();
				audio.removeEventListener('ended', end_trial);
			}

			// kill keyboard listeners
			jsPsych.pluginAPI.cancelAllKeyboardResponses();


			// gather the data to store for the trial
//			 if(context !== null && response.rt !== null){
//				 response.rt = Math.round(response.rt * 1000);
//			 }

			// Figure out what the audio response was
			if(audioFlag){
				if((trial.trial_number >= trial.trial_n_back) && 
						(peekNBack(audio_q, trial.trial_n_back) == audio_i)){
					// both not too early and a correct match 
					audioResponse = "true positive";
				} else {
					// either too early or an incorrect match
					audioResponse = "false positive";
				}
			} else if((trial.trial_number >= trial.trial_n_back) && 
						(peekNBack(audio_q, trial.trial_n_back) == audio_i)){ 
				// no claim but instead a false negative
				audioResponse = "false negative";
			}

			// Figure out what the video response was
			if(visualFlag){
				if((trial.trial_number >= trial.trial_n_back) && 
						(peekNBack(visual_q, trial.trial_n_back) == visual_i)){
					// both not too early and a correct match 
					visualResponse = "true positive";
				} else {
					// either too early or an incorrect match
					visualResponse = "false positive";
				}
			} else if((trial.trial_number >= trial.trial_n_back) && 
						(peekNBack(visual_q, trial.trial_n_back) == visual_i)){ 
				// a false negative
				visualResponse = "false negative";
			}



			var trial_data = {
//				"rt": response.rt,
				"n-back" : trial.trial_n_back,
				"audio_stimulus": trial.audio_stimuli[audio_i],
				"audio_response": audioResponse,
				"visual_stimulus": trial.visual_stimuli[visual_i],
				"visual_response": visualResponse,
				"audio_i" : audio_i,
				"visual_i" : visual_i,
//				"key_press": response.key
			};

			// clear the display but only if last trial
			if(trial.trial_number == trial.trials_total){
				display_element.innerHTML = '';
			} else {
				// reset visual to hidden
				document.getElementById(trial.visual_stimuli[visual_i]).style.visibility = 'hidden';
			}
			// move on to the next trial
			jsPsych.finishTrial(trial_data);
		}

		/*** Actually do things! ***/

		// enact visual stimulus
		document.getElementById(trial.visual_stimuli[visual_i]).style.visibility = 'visible';
		
		// start audio
		if(context !== null){
			startTime = context.currentTime;
			source.start(startTime);
		} else {
			audio.play();
		}

		// start the response listener
		if(context !== null) {
			var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
				callback_function: after_response,
				valid_responses: trial.choices,
				rt_method: 'audio',
				persist: true,
				allow_held_key: true,
				audio_context: context,
				audio_context_start_time: startTime
			});
		} else {
			var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
				callback_function: after_response,
				valid_responses: trial.choices,
				rt_method: 'date',
				persist: true,
				allow_held_key: true
			});
		}
		// ensure focus		
		display_element.focus();

		// end trial if time limit is set
		if (trial.trial_duration !== null) {
			jsPsych.pluginAPI.setTimeout(function() {
				end_trial();
			}, trial.trial_duration);
		} 

	}
	
	plugin.trial = function(display_element, trial){
	
		console.log(trial.prev_audio, trial.prev_visual);
			
		// Set up Display Element to have slots for both the visual stimulus and the prompt
	
		var prompt_slot = "<div id='promptSlot'></div>";
	
		display_element.innerHTML = trial.visual_stimulus_html + prompt_slot;
	
		// show prompt if there is one
		 if (trial.prompt !== null) {
			 document.getElementById("promptSlot").innerHTML = trial.prompt; 
		 }
	
		// After a short delay, move on to the main trial
		jsPsych.pluginAPI.setTimeout(function(){runMainTrial(display_element, trial)}, trial.trial_fixation_time);
		
	}

	return plugin;
})();
