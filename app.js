$(function(){
	var $head = $('head');
	var $body = $('body');
	var $results = $('#results');
	var $frames = $('#frames');
	var $done = $('#done');
	var $error = $('#error');
	var $delay = $('#delay');
	
	var icon;
	(function(){
		var $c = $('<canvas width=16 height=16/>');
		var c = $c.get(0);
		var ctx = c.getContext('2d');
		var $link = $('<link rel="icon">').appendTo($head);
		icon = function(f){
			f(ctx,c);
			$link.attr('href',c.toDataURL('image/png'));
		};
	})();
	
	var gif;
	var clearIt = false;
	
	var delay = $delay.val();
	$delay.on('change',function(){
		delay = $delay.val();
	});
	
	var newGif = function(){
		console.debug('Making a GIF();');
		gif = new GIF({
			workers: 2,
			quality: 10
		});
		clearIt = true;
	};
	newGif();
	
	
	$done.on('click',function(e){
		$error.text('');
		
		if(!gif){
			console.warn('no gif');
			newGif();
			return;
		}
		if(!gif.frames.length){
			$error.text('Add some images first!');
			return;
		}
		gif.on('finished', function(blob){
			var src = URL.createObjectURL(blob);
			var $gif = $('<img>').appendTo($results);
			$gif.attr('src',src);
			
			$done.removeClass('working').text('Create GIF');
		});
		try {
			gif.render();
			$done.addClass('working').text('Working...');
		}catch(e){
			$done.addClass('failed').text('Failed');
			$error.text(e.message);
			console.error(e);
		}finally{
			newGif();
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
			if(clearIt){
				var $oldFrames = $(".frame");
				$oldFrames.addClass("poof");
				setTimeout(function(){
					//$oldFrames.remove();
				},1000);
				clearIt = false;
			}
			var dt = e.originalEvent.dataTransfer;
			var files;
			if(dt && (files=dt.files) && files.length){
				//console.debug("dropped files: ",files);
				var i=0;
				var next = function(){
					var file = files[i++];
					if(!file){return;}
					//console.debug(i,'out of',files.length,':',file);
					
					var reader = new FileReader();
					reader.onload = function(e){
						var $img = $('<img class="frame animated flipInY"/>').appendTo($frames);
						$img.attr('src',reader.result);
						$img.on('load',function(e){
							var img = $img[0];
							gif.options.width = img.naturalWidth;
							gif.options.height = img.naturalHeight;
							gif.addFrame(img, {delay: delay});
							icon(function(ctx){
								ctx.drawImage(img,0,0,16,16);
							});
							next();
						});
					};
					reader.onerror = function(e){
						$error.text(e.message);
						console.error(reader.result,e);
					};
					reader.readAsDataURL(file);
				};
				next();
			}
		});
});