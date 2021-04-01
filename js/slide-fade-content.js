// Ajax Slide & Fade Content with jQuery v2.0 @ http://perishablepress.com/slide-fade-content/
// DEMO @ http://perishablepress.com/wp/wp-content/demos/slide-fade-content/
// DEMO @ http://perishablepress.com/demos/slide-fade-content/
// slide & fade content
jQuery(document).ready(function($) {
	$('.more').on('click', function() {
		var href = $(this).attr('href');
		if ($('#ajax-content').is(':visible')) {
			$('#ajax-content').css({ display:'block' }).animate({ height:'0' }).empty();
			$('.close-content').css({ display:'none' });
		}
		$("html,body").animate({scrollTop:$("#ajax-content").offset().top},500);
		$('#ajax-content').css({ display:'block' }).animate({ height:'auto' },function() {
			$('#ajax-content').html('<img id="loader" src="images/loader.gif">');
			$('#loader').css({ border:'none', position:'relative', top:'24px', left:'48px', boxShadow:'none' }); // http://loadinfo.net/
			$('#ajax-content').load('extra-content.html ' + href, function() {
				$('#ajax-content').hide().fadeIn('slow');
			});			
			$('.close-content').css({ display:'block' });
		});
	});
	
	$('.close-content').click(function() {
		$('#ajax-content').css({ display:'block' }).animate({ height:'0' }).empty();
		$('.close-content').css({ display:'none' });
	});	



	$('.blog-more').on('click', function() {
		var href = $(this).attr('href');
		if ($('#blog-ajax-content').is(':visible')) {
			$('#blog-ajax-content').css({ display:'block' }).animate({ height:'0' }).empty();
			$('.blog-close-content').css({ display:'none' });
		}
		$("html,body").animate({scrollTop:$("#blog-ajax-content").offset().top},500);
		$('#blog-ajax-content').css({ display:'block' }).animate({ height:'auto' },function() {
			$('#blog-ajax-content').html('<img id="loader" src="images/loader.gif">');
			$('#blog-loader').css({ border:'none', position:'relative', top:'24px', left:'48px', boxShadow:'none' }); // http://loadinfo.net/
			$('#blog-ajax-content').load('blog-extra-content.html ' + href, function() {
				$('#blog-ajax-content').hide().fadeIn('slow');
			});			
			$('.blog-close-content').css({ display:'block' });
		});
	});
	
	$('.blog-close-content').click(function() {
		$('#blog-ajax-content').css({ display:'block' }).animate({ height:'0' }).empty();
		$('.blog-close-content').css({ display:'none' });
	});


});