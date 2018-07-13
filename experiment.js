// Dual N-Back task experiment

/*** Helper functions ***/

function addIDtoQueue(arr, id){
	// maxlen = 10
	arr.push(id);
	while arr.length > 10 {
		arr.shift();
	}
}

function peekNBack(arr, N){ // arrays push & pop at the end (highest index)
	return arr[10 - N];
}


/*** Experimental variables ***/

var letters_audio = ['sounds/A.mp3', 'sounds/C.mp3', 'sounds/F.mp3', 
						'sounds/G.mp3', 'sounds/K.mp3', 'sounds/M.mp3', 
						'sounds/P.mp3', 'sounds/T.mp3', 'sounds/X.mp3'];
					

var N = 1; // LEQ 9 for now - makes sense, if grid of 9 squares

var audio_ids = [];		// queue
var spatial_ids = [];	// queue

/*** jsPsych block setup ***/

// intro

// training

// testing

// feedback

/** experiment definition array **//

var dual_n_back_experiment = [];
// push all the blocks to it