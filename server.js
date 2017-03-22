var express = require('express');
var exphbs = require('express-handlebars');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var request = require('request');
var bodyParser = require('body-parser')

var app = express();

var port = process.env.PORT || 3000;
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(process.cwd() + '/public'));

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// mongoose.connect("mongodb://localhost/week18hw");
mongoose.connect("mongodb://heroku_mwjgtfrn:f5d9mqtu7t5j0qfgup1uakmbmg@ds021650.mlab.com:21650/heroku_mwjgtfrn")
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

//scrape articles
app.get("/scrape", function(req, res){


	request('http://www.usatoday.com/' ,function(error, response, html){
		var $ = cheerio.load(html)

		 // console.log(html);

		$('article').each(function(i, element){
			// save an empty result object
			var result = {};
			var path = $(this).children('a').attr('href')
			
			// add the text and href of every link, 
			// and save them as properties of the result obj
			result.title = $(this).children('a').children('h3').text();
			result.link = 'http://www.usatoday.com/'+path

			//create new article model
			var article = new Article(result)

			//saves if unique
			article.save(function(err, docs){
				if(err && (11000 === err.code || 11001 === err.code))
					console.log("Duplicate Found");
				else
					console.log(docs);
			})
		})
	})

	//redirects to home page
	res.send({result:true})
})


//get all articles in database
app.get("/article", function(req, res){
	Article.find({}, function(err, docs){
		if(err)
			res.send(err)
		else
			res.send(docs)
	})
})

//get article in database
app.get("/article/:id", function(req, res){
	var articleId = req.params.id;

	Article.findOne({_id:articleId})
	.populate("note")
	.exec(function(err, docs){
		if(err){
			console.log('err')
			res.send(err)
		}
		else{
			console.log('docs')
			res.send(docs)
		}
	})
})

//push note
app.post("/article/:id", function(req, res){
	var note = req.body;
	console.log(note);
	Note.create(note, function(err, note){

		Article.findOneAndUpdate({"_id": req.params.id},{$push:{'note': note._id}} ,function(err){
			if(err) res.send({result:false})

			res.send(note);
		});
	})
	
})

//deletes note
app.delete("/article/:articleid/:noteid", function(req, res){
	Article.findOneAndUpdate({"_id": req.params.articleid}, {$pull:{'note':req.params.noteid}}, function(){
		Note.findOne({"_id": req.params.noteid}).remove().exec()
	})
})


//go to index
app.use("/", function(req,res){})

//run server
app.listen(port, function(){
	console.log("Im running on port", port);
})