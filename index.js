//boilerplate module stuff
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
//twitter library
var Twitter = require('twitter');
//secret app keys
var secret = require('./secret.js');
//put twitter lib and keys together
var client = new Twitter(secret);
//bring in markov generator
var markov = require('./markov.js');

//boilerplate bodyparser stuff.
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


//transparent because is has next function call in it.
app.use(function(req, res, next) {
	//to log every request that comes through the server
	console.log(req.url);
	next();
});

//the middle ware


//api for getting one tweet.
app.post('/api/tweets/get', function(req, res) {
	var username = req.body.user;
	if (!username) {
		//error checking for empty strings
		res.send("oh no, there was no username 🙁");
		return;
	}
	//the data the is sent to twitter to get tweets
	var params = {
		screen_name: username,//this value is given from front end.
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};
	//gets tweets from the username inputed on the frontend.
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			//runs through tweet array of objects, and filters out everything 
			//but the actual messages
			tweets = tweets.map(function(tweet) {
                return tweet.text;
            });
            for (var i = 0; i < tweets.length; i++) {
            	//send the tweet words to the generator to train out the chain object
            	markov.trainLast(tweets[i]);
            }
            //generate a random tweet and then reset the chain to be used again
            res.send(markov.generate(140));
            markov.reset();
		} else {
			console.log(error);
			res.send('oops there was an error');
		}
	}); 
});
//request that takes in two usernames
//similar endpoint as above but takes in two usernames and puts each on in 
//separete variables
app.post('/api/tweets/getTwo', function(req, res) {
	var username1 = req.body.user1;
	var username2 = req.body.user2;
	if (!username1 || !username2) {
		//error handeling to make sure two words were typed in on frontend
		res.send("oh no, there was not the correct amount of usernames 🙁");
		return;
	}
	//data to be sent to twitters API
	var params1 = {
		screen_name: username1,
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};
	//data for user2 sent to twitters API
	var params2 = {
		screen_name: username2,
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};
	//gets username1 tweets
	client.get('statuses/user_timeline', params1, function(error, tweets, response) {
		if (!error) {
			//runs through tweet array of objects, and filters out everything 
			//but the actual messages
			tweets = tweets.map(function(tweet) {
                return tweet.text;
            });
            for (var i = 0; i < tweets.length; i++) {
            	markov.train(tweets[i]);
            	//send the tweets to the markov trainer to be trained
            	//doesn't call the trainLast funciton yet.
            	//doesn't reset or generate the markov yet
            }
            //gets usernames2 tweets
            client.get('statuses/user_timeline', params2, function(error, tweets, response) {
				if (!error) {
					//runs through tweet array of objects, and filters out everything 
					//but the actual messages
					tweets = tweets.map(function(tweet) {
		                return tweet.text;
		            });
		            for (var i = 0; i < tweets.length; i++) {
		            	markov.trainLast(tweets[i]);
		            	//adds the second usersName tweets to to get trained in the markov 
		            	//chain. Calls the trainLast function that will allow the generate function
		            	//to properly execute an AI tweet!
		            }
		            res.send(markov.generate(140));
		            markov.reset();
		            //sends the combined generated markov and resets the chain.

				} else {
					//handels the error for username2
					console.log(error);
					res.send('oops there was an error 🙁');
				}
			});

		} else {
			//handels the error for username2
			console.log(error);
			res.send('oops there was an error 🙁');
		}
	}); 


});
//endpoint for saving single user tweet
app.post('/api/save/singleTweet', function(req, res) {
	//writes the AI tweet into this file with the name of their usernames.
	fs.appendFile('savedTweets.txt', req.body.user + ' Says ' + req.body.tweet + '\n', function(err) {
		if (err) {
			console.log(err);
		}
	});
	//reads the newly written tweet and sends it back to the frontend to show confirm it was saved
	fs.readFile('savedTweets.txt', function(err, data) {
		if (err) {
			console.log(err);
		}
		//do this to only send the recently added tweet.
		var splitData = data.toString().split('\n');
		res.send(splitData[splitData.length - 2] + " was saved in file!");
	});
});
//endpoint for saving couple user tweet
app.post('/api/save/coupleTweet', function(req, res) {
	//same exact process as the saveOne tweet endpoint, but saves one tweet of two users
	fs.appendFile('savedTweets.txt', req.body.users + ' Says ' + req.body.tweet + '\n' , function(err) {
		if (err) {
			console.log(err);
		}
	});
	//reads file to send back to frontend
	fs.readFile('savedTweets.txt', function(err, data) {
		if (err) {
			console.log(err);
		}
		var dataArr = data.toString().split('\n');
		//only sends the newly saved tweet.
		res.send(dataArr[dataArr.length - 2] + " was saved in file!");
	});
});


//boilerplate for root requests
app.use(express.static('public'));

//error handeling

app.use(function(req, res, next) {
	res.status(404);
	res.send("404 files not found 📃");
}); 

app.use(function(err, req, res, next) {
	res.status(500);
	res.send("500 Internal Server Error 💩");
});

//starting the express server

app.listen(8000, function() {
	console.log("Server started: http://localhost:8000 ⚡️");
});









/* endpoint for url params, commmenting this out to have for future reference.

app.get('/api/tweets/:user', function(req, res) {
	//what to do with get request that sends data through the params communication
	var username = req.params.user;
	if (!username) {
		res.send("oh no, there was no username 🙁");
		return;
	}

	var params = {
		screen_name: username,//input here what came through from the frontend
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			tweets = tweets.map(function(tweet) {
                return tweet.text;
            });
            for (var i = 0; i < tweets.length; i++) {
            	markov.trainLast(tweets[i]);
            }
            res.send(markov.generate(140));
		} else {
			console.log(error);
			res.send('oops there was an error');
		}
	}); 
});
*/
