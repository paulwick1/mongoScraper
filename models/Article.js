var mongoose =  require('mongoose');

var Schema = mongoose.Schema;

var articleSchema = new Schema({
	title:{
		type:String,
		required:true
	},
	//article links should be unique
	link:{
		type:String,
		required:true,
		unique:true
	},
	//one to many
	note:[{
		type: Schema.Types.ObjectId,
		ref: 'Note'
	}]
});

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;