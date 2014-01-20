$(function(){
	var $body = $('body');
	var $results = $('#results');
	var $frames = $('#frames');
	var $done = $('#done');
	
	var gif;
	
	var newGif = function(){
		gif = new GIF({
			workers: 2,
			quality: 10
		});
	};
	newGif();
	
	
	$done.on('click',function(e){
		$done.addClass('working').text('Working...');
		
		if(!gif){
			
			return;
		}
		gif.on('finished', function(blob){
			var src = URL.createObjectURL(blob);
			var $gif = $('<img>').appendTo($frames);
			$gif.attr('src',src);
			
			$done.removeClass('working').text('Done');
		});
		try {
			gif.render();
		}catch(e){
			$done.addClass('failed').text('Failed');
			console.error(e);
		}
	});
	
	//Drag and Drop
	var prevent = function(e){
		e.preventDefault();
		e.stopPropagation();
		//console.debug(e.type);
	};
	$('body')
		.on('dragover dragenter',prevent)
		.on('drop',function(e){prevent(e);
			var dt = e.originalEvent.dataTransfer;
			if(dt && dt.files.length){
				console.debug("dropped files: ",dt.files);
				var i=0;
				var next = function(){
					var file = dt.files[i++];
					if(!file){return;}
					
					var reader = new FileReader();
					reader.onload = function(e){
						var $img = $('<img>').appendTo($results);
						$img.attr('src',reader.result);
						$img.on('load',function(e){
							gif.addFrame($img.get(0));
							next();
						});
					};
					reader.onerror = function(e){
						console.error(reader.result,e);
					};
					reader.readAsDataURL(file);
				};
				next();
				/*
				dt.files.forEach(function(i,file,files){
					console.log(i,file,files);
					
					var reader = new FileReader();
					reader.onload = function(e){
						var $img = $('<img>').appendTo($results);
						$img.attr('src',reader.result);
						
						gif.addFrame($img.get(0));
					};
				});*/
			}
		});
});