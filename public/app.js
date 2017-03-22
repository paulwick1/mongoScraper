//start scrape.
$.ajax({url:'/scrape', method:'GET'}).done(function(){
	//get all articles and display
	$.ajax({url:'/article', method:'GET'})
	.done(function(results){
		//loops through results and creates DOM object out of them
		results.forEach(function(article){
			var div = $('<div>').addClass('article').attr('data-id', article._id).appendTo('#articles')
			var title = $('<h2>').addClass('articleTitle').text(article.title).appendTo(div)
			var link = $('<p>').addClass('articleLink').text(article.link).css('font-style', 'italic').appendTo(div)
		})		
	})
})

//handler for when article it clicked
$(document.body).on('click', '.article', function(){
	
	//display title on label
	$('#articleTitleNote').text(($(this).children('h2').text()))

	//reveal note forms
	$('.comments').show()

	//clear note display
	$('#notedisplay').text("");
	
	//set article id in submit button
	$('#submitNote').data('id', $(this).data('id'))
	
	//clear notes dropdown and store article id
	$('#notes').empty().data('artid', $(this).data('id')).append('<option/>')

	//make ajax call to server to get article that was clicked in the database
	$.ajax(
		{
			url:'/article/'+ $(this).data('id'),
			method: 'GET'
		})
	.done(function(results){
		
		//get all notes and build dropdown menu
		results.note.forEach(function(note){
			//set each option and value
			$('<option/>').text(note.title).val(note.body).attr('data-noteid', note._id).appendTo('#notes')		
		})
	})
})

//when option is selected from drop down
$('#notes').on('change', function(){
	
	//display note contents if it exists
	if($(this).val())
		$('#notedisplay').text($(this).val());
	else
		$('#notedisplay').text("");
})

//create new note
$(document.body).on('click', '#submitNote', function(){

	//makes sure article id destination exists and note title exists
	if($(this).data('id') == "" || $('#noteTitle').val() == ""){
		
		return false;
	}

	//make ajax post call to send note
	$.ajax({
		url:'/article/'+ $(this).data('id'),
		method: 'POST',
		data:
			{
				title: $('#noteTitle').val(),
				body: $('#noteBody').val()
			}
	}).done(function(results){
		
		//push new note into notes drop down
		$('<option/>').text(results.title).val(results.body).attr('data-noteid', results._id).appendTo('#notes')
		
	})
	//clears note submission
	$('#noteTitle').val("")
	$('#noteBody').val("")
	return false

})

//for deleting note
$(document.body).on('click', '#deleteNote', function(){

	//make sure note is valid
	if($('#notes option:selected').text() == "")
		return false;

	//get the right ids
	var artId = $('#notes').data('artid')
	var noteId = $('#notes option:selected').data('noteid')

	//make ajax call for deleting note
	$.ajax({
		url:'/article/'+artId+'/'+noteId,
		method:'DELETE'
	})
	.done(function(results){})	
})

