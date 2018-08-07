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
				pretty_name: 'Load Factor',
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
				default: ['z', 'x', 'n', 'm', 'q'],
				description: 'The keys the subject is allowed to press to respond to the stimuli.'
			},  // commented out because these choices aren't actually editable
			prompt: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Prompt',
				default: 'This is a dual-modality N-Back test. </br> Press X if the audio stimulus matches; press Z if it does not. <br/> Press M if the visual stimulus matches; press N if it does not.',
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
			timeout_is_nomatch: {
				type: jsPsych.plugins.parameterType.BOOLEAN,
				pretty_name: 'Timeout is no-match',
				default: false,
				description: 'Whether to treat no-responses as "no-match" (default is "no-response"). ' +
					'NOTE: the "no-match" buttons will still work if not disabled in `choices`.'
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
			which_response: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Which response to use',
				default: "last",
				description: 'If multiple responses are given for a modality, should the '+
								'first or last such response be taken?'
			},
			modality_choice: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Choice of stimulus modality',
				default: "both",
				description: 'Use `audio`, `visual` or `both` stimulus modalities?'
			}
		}
	};


	/*** Bulk of the trial function
	/*** Run the trial (on eventual callback) ***/
	function runMainTrial(display_element, trial) {

		// Set up trial-local variables

		var audioFlag = false;	var visualFlag = false; // var quitFlag = false;
		var audio_i = getRndInt();	var visual_i = getRndInt();
		var audioResponse = "true negative"; var visualResponse = "true negative";
		var audioResponses = []; var visualResponses = [];
		var audioRTs = [];	var visualRTs = [];

		// Assorted helper functions


		function peekNBack(arr, N){ // arrays push & pop at the end (highest index)
			// one back is the last element in the array
			return arr[arr.length - (N)];
		}
		function getRndInt(){
			return Math.floor((Math.random() * 9));
		}

		/* Helper function to analyse the response */
		function determineResponse(trial, previous_stims, stimulus_i, current_responses, which_response){
			if(current_responses.length > 0){
				var response_i;
				var response;
				switch(which_response){
					case "first":
						response_i = 0;
						break;
					case "last": // see also "default"
					default: // make default "last"
						response_i = current_responses.length - 1;
						break;
					}
				// Four possible responses: true/false; positive/negative.
				if(trial.trial_number >= trial.trial_n_back){
					if(peekNBack(previous_stims, trial.trial_n_back) == stimulus_i) {
						// true positive if 'match' selected, else false negative
						return current_responses[response_i] ? "true positive" : "false negative";
					} else {
						// true negative if 'no-match' selected, else false positive
						// (but 'no-match' is coded as `false`)
						return current_responses[response_i] ? "false positive" : "true negative";
					}
				} else {
					// false no matter what, we're too early
					return "false " + (current_responses[response_i] ? "positive" : "negative");
				}

			} else if (trial.timeout_is_nomatch) { // timeout is no-match
				if(peekNBack(previous_stims, trial.trial_n_back) == stimulus_i){
					return "false negative";
				} else {
					return "true negative";
				}
			} else { // no response at all, timeout is not no-match
				return "no response";
			}
		}


		// function to handle responses by the subject
		// This gets called on all keypresses
		var after_response = function(info) {
			//console.log(info);
			var keyChar = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key);
			switch(keyChar) {
				case 'Z':
				case 'z': // audio 'no match'
					audioResponses.push(false);
					audioRTs.push(Math.floor(info.rt*1000));
					break;
				case 'X':
				case 'x': // audio 'yes match'
					audioResponses.push(true);
					audioRTs.push(Math.floor(info.rt*1000));
					break;
				case 'N':
				case 'n': // visual 'no match'
					visualResponses.push(false);
					visualRTs.push(Math.floor(info.rt*1000));
					break;
				case 'M':
				case 'm': // visual 'yes match'
					visualResponses.push(true);
					visualRTs.push(Math.floor(info.rt*1000));
					break;
				case 'Q':
				case 'q': // quit early
					quitFlag = true;
					break;
			}

		}



		// setup audio stimulus
		if((trial.modality_choice == "both") || (trial.modality_choice == "audio")){
			var context = jsPsych.pluginAPI.audioContext();
			if(context !== null){
				var source = context.createBufferSource();
				source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.audio_stimuli[audio_i]);
				source.connect(context.destination);
			} else {
				var audio = jsPsych.pluginAPI.getAudioBuffer(trial.audio_stimuli[audio_i]);
				audio.currentTime = 0;
			}
		}

		// define function run at end of trial
		function end_trial() {

			// kill any remaining setTimeout handlers
			jsPsych.pluginAPI.clearAllTimeouts();

			// stop the audio file if it is playing
			// remove end event listeners if they exist
			if((trial.modality_choice == "both") || (trial.modality_choice == "audio")){
				if(context !== null){
					source.stop();
					source.onended = function() { }
				} else {
					audio.pause();
					audio.removeEventListener('ended', end_trial);
				}
			}
			// kill keyboard listeners
			jsPsych.pluginAPI.cancelAllKeyboardResponses();


			// Figure out what the audio response was
			audioResponse = determineResponse(trial, audio_q, audio_i, audioResponses, "last");

			// Figure out what the visual response was
			visualResponse = determineResponse(trial, visual_q, visual_i, visualResponses, "last");

			// Set trial data!
			// Combined items... (and blank specifics)
			var trial_data = {
//				"rt": response.rt,
				"n-back" : trial.trial_n_back,
				"modality_choice": trial.modality_choice,
				"timeout_is_nomatch" : trial.timeout_is_nomatch,
				"audio_stimulus": '',
				"audio_response": '',
				"audio_i" : '',
				"all_audio_responses" : '',
				"all_audio_RTs" : '',
				"visual_stimulus": '',
				"visual_response": '',
				"visual_i" : '',
				"all_visual_responses" : '',
				"all_visual_RTs" : '',
			};
			// non-blank specifics
			if((trial.modality_choice == "both") || (trial.modality_choice == "audio")){
				trial_data.audio_stimulus = trial.audio_stimuli[audio_i];
				trial_data.audio_response = audioResponse;
				trial_data.audio_i = audio_i;
				trial_data.all_audio_responses = audioResponses;
				trial_data.all_audio_RTs = audioRTs;
			} // definitely not an `else!`
			if((trial.modality_choice == "both") || (trial.modality_choice == "visual")){
				trial_data.visual_stimulus = trial.visual_stimuli[visual_i];
				trial_data.visual_response = visualResponse;
				trial_data.visual_i = visual_i;
				trial_data.all_visual_responses = visualResponses;
				trial_data.all_visual_RTs = visualRTs;
			}

			// clear the display but only if last trial
			if(trial.trial_number == trial.trials_total){
				display_element.innerHTML = '';
			} else {
				// reset visual to hidden
				if((trial.modality_choice == "both") || (trial.modality_choice == "visual")){
					document.getElementById(trial.visual_stimuli[visual_i]).style.visibility = 'hidden';
				}
			}
			// move on to the next trial
			jsPsych.finishTrial(trial_data);
		}

		/*** Actually do things! ***/

		// enact visual stimulus
		if((trial.modality_choice == "both") || (trial.modality_choice == "visual")){
			document.getElementById(trial.visual_stimuli[visual_i]).style.visibility = 'visible';
		}
		//else {
		//	display_element.innerHTML = '';
		//}

		// start audio
		if((trial.modality_choice == "both") || (trial.modality_choice == "audio")){
			if(context !== null){
				startTime = context.currentTime;
				source.start(startTime);
			} else {
				audio.play();
			}
		}
		// start the response listener
		if( (context !== null) &&
			((trial.modality_choice == "both") ||
				(trial.modality_choice == "audio")) ) { // don't use this way if visual-only!
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
		//display_element.focus();

		// end trial if time limit is set
		if (trial.trial_duration !== null) {
			jsPsych.pluginAPI.setTimeout(function() {
				end_trial();
			}, trial.trial_duration);
		}

	}

	plugin.trial = function(display_element, trial){

		console.log(trial);
		// console.log(display_element);
		// console.log(trial.prev_audio, trial.prev_visual);

		// Set up Display Element to have slots for both the visual stimulus and the prompt

		var prompt_slot = "<div id='promptSlot'></div>";

		if((trial.modality_choice == "both") || (trial.modality_choice == "visual")){
			display_element.innerHTML = trial.visual_stimulus_html + prompt_slot;
		} else {
			display_element.innerHTML = prompt_slot;
		}

		// show prompt if there is one
		if (trial.prompt !== null) {
			document.getElementById("promptSlot").innerHTML = trial.prompt;
		}

		// spam this everywhere
		display_element.tabIndex = -1;
		window.scrollTo(0,document.body.scrollHeight);
		display_element.focus();

		// After a short delay, move on to the main trial
		jsPsych.pluginAPI.setTimeout(function(){
				display_element.tabIndex = -1;
				window.scrollTo(0,document.body.scrollHeight);
				display_element.focus();
				runMainTrial(display_element, trial);
			}, trial.trial_fixation_time);
	}

	return plugin;
})();
