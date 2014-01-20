$(function(){
	var $head = $('head');
	var $body = $('body');
	var $results = $('#results');
	var $frames = $('#frames');
	var $done = $('#done');
	
	var icon = function(f){
		var $c = $('<canvas width=16 height=16/>');
		var c = $c.get(0);
		var ctx = c.getContext('2d');
		f(ctx,c,0,null,5,false,undefined,NaN,'NaNaN');
		var $link = $('<link rel="icon">').appendTo($head);
		$link.attr('href',c.toDataURL('image/png'));
	};
	
	var gif;
	
	var newGif = function(){
		console.debug('Making a GIF();');
		gif = new GIF({
			workers: 2,
			quality: 10
		});
	};
	newGif();
	
	
	$done.on('click',function(e){
		$done.addClass('working').text('Working...');
		
		if(!gif){
			console.warn('no gif');
			newGif();
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
			var files;
			if(dt && (files=dt.files) && files.length){
				console.debug("dropped files: ",files);
				var i=0;
				var next = function(){
					var file = files[i++];
					if(!file){return;}
					console.debug(i,'out of',files.length,':',file);
					
					var reader = new FileReader();
					reader.onload = function(e){
						var $img = $('<img>').appendTo($results);
						$img.attr('src',reader.result);
						$img.on('load',function(e){
							var img = $img[0];
							gif.addFrame(img);
							icon(function(ctx){
								ctx.drawImage(img,0,0,16,16);
							});
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