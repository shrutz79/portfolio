var gLeftMargin = '122px'; /* Main page left margin */		
var gMarginInBetween = '35px'; /* Space between thumbnail blocs on main page */

/***************** Main page animation behaviour *****************/
var arrAnimTimes = [3000 /* bg */, 1000 /* title */, 1000 /* desc */, 1000 /* thumbs */]; /* Real values */
//var arrAnimTimes = [300 /* bg */, 100 /* title */, 100 /* desc */, 100 /* thumbs */]; /* Fast values for testing */

var imageData = [];
var cachedImageData = {};
var enable_clicking = true;

function idFromImage(imageName)
{ // e.g "web/a.png"
	return imageName.substring(0,imageName.length-4).replace('/','_');
}

function imageFromId(id)
{ // e.g "web_a"
	return id.replace('_','/') + ".png";
}

function catFromImg(img)
{
	return img.substring(0, img.indexOf('/'));
}

function isCSSEnabled()
{
	return ($('#lightbox').css('position') === "absolute");
}

function showImage(imgIndex)
{
	// Cycle images
	if(imgIndex == cachedImageData.numImages) imgIndex = 0;
	if(imgIndex == -1) imgIndex = cachedImageData.numImages-1;
	
	if(imgIndex >= 0 && imgIndex < cachedImageData.numImages)
	{
		var imgData = imageData[imgIndex];
		// $('#img_counter').html((imgIndex + 1) + ' / ' + cachedImageData.numImages);
		
		updateImageCounter(imgIndex, imgData);

		$('#lightbox_img').html('<img src="images/'+imgData.img+'">');
		$('#img_name').html(imgData.name);
		$('#img_desc').html(imgData.description);
		$('#adobe_icons').html('');
		if(imgData.tools && imgData.tools.length > 0)
		{
			var arrTools = imgData.tools.split(',');
			for(var i=0; i < arrTools.length;i++)
			{
				$('#adobe_icons').append('<div title="'+arrTools[i]+'" id="adobe_'+arrTools[i].toLowerCase()+'"></div>');
			}
		}
		
		if(!$('#lightbox').is(':visible') || !isCSSEnabled())
		{
			$(document).scrollTop(0);
		}
		$("#lightbox").show('slow');
		$("#black_bg").show();
	}
}

function updateImageCounter(imgIndex, imgData)
{	
	if(imgIndex >= 18 && $("#lightbox_thumbs").css('marginLeft') !== "-312px")
	{
		// Scroll to the left set of images if we aren't already there.
		$("#lightbox_thumbs").animate({ marginLeft: '-312px'}, 1000, "easeOutQuad", function() {
		});
	}
	else if(imgIndex <= 8 && $("#lightbox_thumbs").css('marginLeft') !== "0px")
	{
		$("#lightbox_thumbs").animate({ marginLeft: '0px'}, 1000, "easeOutQuad", function() {
		});
	}

	// Remove old counter
	var oldCounter = $('#thumb_counter');
	$(oldCounter.prev().children()[0]).removeClass("selectedThumb");
	oldCounter.remove();
	
	// Append counter to the right spot
	var smallThumImg = $('#T'+idFromImage(imgData.img));
	var parentDiv = smallThumImg.parent();
	$('<div id="thumb_counter" class="' + catFromImg(imgData.img) + '">'+catFromImg(imgData.img)+' <span>'+(imgIndex + 1) + '/' + cachedImageData.numImages+'</span></div>').insertAfter(parentDiv);
	smallThumImg.toggleClass("selectedThumb");
	window.location.hash = (imgIndex+1);
}

function getCurrentImageIndex()
{
	var imgChildren = $('#lightbox_img').children();
	if(imgChildren && imgChildren.length >= 1)
	{
		var imgTag = imgChildren[0];
		if(imgTag && imgTag.src && imgTag.src.length > 2)
		{
			var nlsi = imgTag.src.lastIndexOf('images/');
			if(nlsi > 0)
			{
				var imgId = imgTag.src.substring(nlsi+7);
				if(imgId && imgId.length > 0)
				{
					var imgIndex = cachedImageData.imgReverseMap[imgId];
					if(imgIndex || imgIndex === 0)
						return imgIndex;
				}
			}
		}	
	}
	return -1;
}

// Take the thumbail images in the DOM, and replace the images with the thumnail overlay
function makeThumbnails()
{
	$('.thumbimg').unwrap(); // Remove the "a" href.
	if(isCSSEnabled())  {
		$('.thumbimg').removeAttr('title'); // Remove the title
		$('.thumbimg').attr('src', "images/thumbnails-overlay.png"); // Change the image
	}
}

function makeSmallThumbnails()
{
	var thumbWidth = -39;
	for(var i = 0; i < cachedImageData.numImages; i++)
	{
		$('#lightbox_thumbs').append('<div style="background-position:'+(i*thumbWidth)+'px 0px" class="thumb_small" title="'+(imageData[i].name)+'"><img id="T'+idFromImage(imageData[i].img)+'" alt="'+(imageData[i].name)+'" class="thumbimg" src="images/thumb_small-overlay.png" width="38" height="38"/></div>');
	}
}

function prepImageData()
{
	var images = $('.thumbimg');
	imageData = [];
	for(var i=0; i < images.length; i++)
	{
		var n = $(images[i]);
		imageData.push({
			"img": n.parent().attr("href").substring(7),
			"name": n.attr('alt'),
			"description": n.parent().parent().children()[1].innerHTML,
			"tools": $(n.parent().parent().children()[2]).text()});
	}
	
	// Make a reverse map.
	cachedImageData.numImages = imageData.length;
	cachedImageData.imgReverseMap = {};
	for(var i=0; i < cachedImageData.numImages; i++)
	{
		cachedImageData.imgReverseMap[imageData[i].img] = i;
	}
}

function funcCloseLightbox()
{
	 $("#lightbox").hide();
	 $("#black_bg").hide();
	 window.location.hash = '';
}

function funcImageClick(eventObj)
{
	var imgId = eventObj.target.id;
	if(imgId.charAt(0) == 'T') imgId = imgId.substring(1);
	var imgIndex = cachedImageData.imgReverseMap[imageFromId(imgId)];
	if(imgIndex || imgIndex === 0) showImage(imgIndex);
}

function funcPreviousImage()
{
	if(enable_clicking) {
		var imgIndex = getCurrentImageIndex();
		if(imgIndex != -1) showImage(imgIndex-1);
	}
}

function funcNextImage()
{
	if(enable_clicking) {
		var imgIndex = getCurrentImageIndex();
		if(imgIndex != -1) showImage(imgIndex+1);
	}
}

$(document).ready(function()
{
	prepImageData();
	makeThumbnails();

	var imageNumToShow = 0;
	var strImgIndex = window.location.hash;
	if(strImgIndex && strImgIndex.length >= 2)
	{
		var imgIndex = parseInt(strImgIndex.substring(1));
		if(imgIndex > 0 && imgIndex <= cachedImageData.numImages)
		{
			imageNumToShow = imgIndex;
		}
	}

	if(isCSSEnabled())
	{
		makeSmallThumbnails();	
		if(imageNumToShow === 0)
		{
			$('#sitebg img').css({'opacity':'0', '-ms-filter': '"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"', 'filter': 'alpha(opacity=0)'});
			$('#title').css({'margin-left':'-284px'});
			$('#description').css({'margin-left':'0px', 'opacity':'0', '-ms-filter': '"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"', 'filter': 'alpha(opacity=0)', 'display' : 'block'});
			$('#webarea').css({'margin-left':'0px', 'opacity':'0', '-ms-filter': '"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"', 'filter': 'alpha(opacity=0)'});
			$('#printarea').css({'margin-left':'0px', 'opacity':'0', '-ms-filter': '"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"', 'filter': 'alpha(opacity=0)'});
			$('#miscarea').css({'margin-left':'0px', 'opacity':'0', '-ms-filter': '"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"', 'filter': 'alpha(opacity=0)'});
			
			$('#subtitle').css({'margin-left':'-300px'});

			$('<img />').attr('src', 'images/rafting_img2.jpg').load(
				function(){
					$('#sitebg img').animate({ opacity: 1}, arrAnimTimes[0],
						function() {
							$('#title').animate({ marginLeft: gLeftMargin}, arrAnimTimes[1],
								function() {
									$('#description').animate({ marginLeft: gLeftMargin, opacity: 1}, arrAnimTimes[2],
										function() {
											$('#webarea').animate({ marginLeft: gLeftMargin, opacity: 1}, arrAnimTimes[3], "easeOutBounce");
											$('#printarea').animate({ marginLeft: gMarginInBetween, opacity: 1}, arrAnimTimes[3], "easeOutBounce");
											$('#miscarea').animate({ marginLeft: gMarginInBetween, opacity: 1}, arrAnimTimes[3], "easeOutBounce");
										}
									);
								}
							);
							$('#subtitle').animate({ marginLeft: gLeftMargin}, arrAnimTimes[1]);
						}
					);
				});
			

		}
	}	
	$('.thumbimg').click(funcImageClick);
	$('.box_close').click(funcCloseLightbox);
	$('#black_bg').click(funcCloseLightbox);
	$('#lightbox_prev').click(funcPreviousImage);
	$('#lightbox_next').click(funcNextImage);
	$('#lightbox_bottom').click(funcNextImage);
	
	$(document).keyup(function(eventObj) {
		if(eventObj.which == 27) // Escape
		{
			funcCloseLightbox();
		}
		else if(eventObj.which == 39) // Right arrow
		{
			funcNextImage();
		}
		else if(eventObj.which == 37) // Left arrow
		{
			funcPreviousImage();
		}
	});
	
	if(imageNumToShow !== 0)
	{
		showImage(imageNumToShow-1);
	}
});
