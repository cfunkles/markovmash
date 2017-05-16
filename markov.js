var chain = {};

		function addToChain(firstWord, secondWord) {
			//if we haven't seen the first word before
			//add a new object to hold it
			if (chain[firstWord] === undefined) {
				chain[firstWord] = {};
			}
			// if we haven't seen the second word before
			// add a new object to hold it	
			if (chain[firstWord][secondWord] === undefined) {
				chain[firstWord][secondWord] = 0;
			}
			// mark that we've seen the first -> second chain again.
			chain[firstWord][secondWord] ++;
		}

		//sanitize input text words
		function sanitize(words) {
			return words.toLowerCase().replace(/[^a-z]/g, '');
		}

		//reads input text, and creates chain object
		function trainLast(text) {
			var words = text.split(/[ \n]+/);
			words.push("[EOT]");//add accryn at end of array meaning end of text
			words.unshift("[SOT]");//add accryn at beginning of array meaning start of text
			for (var i = 0; i < words.length - 1; i++) {
				//makes chain object of word appearances after first word
				addToChain(
					sanitize(words[i]), //firstWord argument
					sanitize(words[i + 1])); //secondWord argument
			}
		}
		
		//use this function if not complete on the training
		function train(text) {
			var words = text.split(/[ \n]+/);
			for (var i = 0; i < words.length - 1; i++) {
				//makes chain object of word appearances after first word
				addToChain(
					sanitize(words[i]), //firstWord argument
					sanitize(words[i + 1])); //secondWord argument
			}
		}

		function pickRandomNext(firstWord) {
			var temp = [];
			//for each potential next word
			for (var secondWord in chain[firstWord]) {
				//push copies of that word into temp, equal to probability
				for (var i = 0; i < chain[firstWord][secondWord]; i++){
					temp.push(secondWord);//if second word appears 10 times this happens 10 times.
				}
			}
			// return a random pick from temp, random number more likely to pick word shown up the most in the array.
			return temp[Math.floor(Math.random() * temp.length)];
		}

		function generate(characterLimit) {
			var currentWord = "sot";//sot never gets placed as secondWord.
			var output = '';
			while (currentWord !== "eot" && output.length < characterLimit + 3) {
				output += currentWord + ' ';
				currentWord = pickRandomNext(currentWord);
			}
			var noSOT = output.slice(3);
			return noSOT;
		}

		//function is called to clear out chain data when node server is running
		function resetChain() {
			chain = {};
		}

		module.exports = {
			train: train,
			generate: generate,
			reset: resetChain,
			trainLast: trainLast
		};