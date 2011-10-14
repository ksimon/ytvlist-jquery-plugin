/**************************************************************************
 * Name:    Youtube Video List jQuery plugin
 * Author:  ksimon
 * Website: http://ksimon.github.com/ytvlist-jquery-plugin/
 **************************************************************************
 Description:
  Youtube Video List jQuery plugin can show youtube videos by author, keyword or category.
 TODO:
  - handling more than 50 videos result (paging)
  - to beautify / jqueryfy
  - documentation
 FIX:
 - solve 'Unexpected value align parsing preserveAspectRatio attribute.' error after insert iframe
*/

(function( $ ){
	
	$.fn.ytvlist = function( options ) {  
	
		var settings = {
			'msgLoading' : 'Loading...',
			'msgNovideo' : 'No video',
			'msgInvalidOrderby' : 'Invalid orderby parameter',
			'msgBack': 'Back',
			'showTitleList' : true,
			'showTitleEmbed': true
		};
		
		return this.each(function() {
			if ( options ) { 
				$.extend( settings, options );
			}
			
			var containerDiv = $(this);
			var listDiv = null;
			var embedDiv = null;
			
			if(settings.orderby == null || settings.orderby == 'relevance' || settings.orderby == 'published' || settings.orderby == 'viewCount' || settings.orderby == 'rating') {
				getYoutubeVideos();
			} else {
				var errorP = $("<p/>")
					.addClass("error-text")
					.text(settings.msgInvalidOrderby + ": " + settings.orderby);
				containerDiv.append(errorP);
				
			}
			
			function getYoutubeVideos() {
				var loadingP = $("<p/>")
					.addClass("loading-text")
					.text(settings.msgLoading);
				containerDiv.append(loadingP);
				url = "http://gdata.youtube.com/feeds/api/videos?alt=json&v=2.1";
				if(settings.author) {
					url += "&author=" + settings.author;
				}
				if(settings.keyword) {
					url += "&q=" + settings.keyword;
				}
				if(settings.orderby) {
					url += "&orderby=" + settings.orderby;
				}
				if(settings.category) {
					url += "&category=" + settings.category;
				}

				$.getJSON(url, renderVideos);
			}			
			function renderVideos(data) {
				containerDiv.empty();
				if(data.feed.entry) {
					
					listDiv = $('<div/>')
						.addClass('video-list')
						.css({
							position: 'relative',
							overflow: 'hidden'
						})
						.append();
					
					var videos = data.feed.entry;
					
					for (var i = 0; i < videos.length; i++){
						appendVideo(videos[i], i);
					}
					
					containerDiv.append(listDiv);
				} else {
					var errorP = $("<p/>")
						.addClass("error-text")
						.text(settings.msgNovideo);
					containerDiv.append(errorP);
				}
			};
			function appendVideo(video, index) {
				thumbnails = video.media$group.media$thumbnail;
				for(j = 0; j < thumbnails.length; j++) {
					if(thumbnails[j].yt$name == "default") {
						img = $("<img/>")
							.addClass('video-thumbnail')
							.prop("id", "img" + index)
							.prop("src", thumbnails[j].url)
							.data("video", video)
							.hover(
								function () { $(this).css("cursor","pointer")},
								function () { $(this).css("cursor","default")}
							)
							.append();
						
						img.click(imgOnClick);
						
						imgDiv = $('<div/>')
							.addClass('video')
							.css({
								width: "160px",
								float: "left",
								marginRight: '10px',
								marginBottom: '10px'
							})
							.append(img);
						
						if(settings.showTitleList) {
							p = $("<p/>").text(video.title.$t);
							imgDiv.append(p);
						}
						
						listDiv.append(imgDiv);
					}
				}
				
			};
			function imgOnClick(e) {
				listDiv.hide();
				video = $("#" + e.target.id).data("video");
				
				videoId = video.id.$t.substring(video.id.$t.indexOf("video:") + "video:".length);
				
				if(embedDiv) {
					embedDiv.empty();
				} else {
					embedDiv = $('<div/>')
						.addClass('video-embed')
						.prop("id", "video-embed")
						.css("width", "100%")
						.css("text-align", "center")
						.append();
					containerDiv.append(embedDiv);
				}
				
				if(settings.showTitleEmbed) {
					p = $("<p/>").text(video.title.$t);
					embedDiv.append(p);
				}
				
				iframe = $("<iframe/>")
					.prop("id", "embed")
					.prop("width", "560")
					.prop("height", "315")
					.prop("src", "http://www.youtube.com/embed/" + videoId)
					.prop("frameborder", "0")
					.append();
				
				embedDiv.show();
				embedDiv.append(iframe);
				
				backP = $("<a/>")
				.click(backOnClick)
				.hover(
					function () { $(this).css("cursor","pointer")},
					function () { $(this).css("cursor","default")}
				)
				.append($("<p/>")
					.text(settings.msgBack))
				embedDiv.append(backP);
				
			};
			function backOnClick(e) {
				embedDiv.hide();
				listDiv.show();
			};
		});
	};
})( jQuery );
