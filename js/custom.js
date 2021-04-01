jQuery( document ).ready(function($) {
	"use strict";
	/*------------------------------ Tooltips ----------------------*/
	$('.tooltips').tooltip();

	/*------------------------------ Masonry Blog -----------------*/

	var $container = $('#blogs');
	// initialize
	$container.masonry({
	  itemSelector: '.blog-item'
	});
	// initialize Masonry after all images have loaded
	$container.imagesLoaded( function() {
	  $container.masonry();
	});

	/*------------------------------ OWL Carousel -----------------*/

	$("#owl-man-family").owlCarousel({
		items : 2,
		lazyLoad : true
	});

	$("#owl-woman-family").owlCarousel({
		items : 2,
		lazyLoad : true
	});

	$("#owl-moments").owlCarousel({
		items : 4,
		pagination : false,
		autoPlay : true,
		lazyLoad : true
	});

	$("#owl-common").owlCarousel({
		items : 3,
		lazyLoad : true
	});

	/*------------------------------ Sticky Navigation -----------------*/

	$(".topbar-nav").sticky({topSpacing:0});

	/*------------------------------ Magnific POP -----------------*/

	$('.popup-vimeo').magnificPopup({
		disableOn: 700,
        type: 'iframe',
        removalDelay: 160,
        preloader: false,

        fixedContentPos: false
	});
	$('.popup-image').magnificPopup({
	  type: 'image',
	  removalDelay: 500, //delay removal by X to allow out-animation
	  callbacks: {
		beforeOpen: function() {
		  // just a hack that adds mfp-anim class to markup
		   this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
		   this.st.mainClass = this.st.el.attr('data-effect');
		}
	  },
	  closeOnContentClick: true,
	  midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
	});

	/*------------------------------ Parallax Effect -----------------*/
	$('.parallax-section').each(function(){
		$(this).parallax("50%", 0.5);
	});
});

jQuery(document).ready(function($) {
	"use strict";
	/*------------------------------ Tooltips ----------------------*/
	$.widget.bridge('uitooltip', $.ui.tooltip); // Resolve name collision between jQuery UI and Bootstrap

});

jQuery(document).ready(function($) {
    "use strict";
    $(window).scroll(function(){
        if($(window).scrollTop() > 200){
            $("#back-to-top").fadeIn(200);
        } else{
            $("#back-to-top").fadeOut(200);
        }
    });

    $('#back-to-top, .back-to-top').click(function() {
        $('html, body').animate({ scrollTop:0 }, '800');
        return false;
    });
});

jQuery(document).ready(function($) {
    "use strict";
    $(".blog-post-audio p iframe").css({"width":"100%","height":"100"});
    $(".blog-post-video").fitVids();
    $(".portfolio-post-audio p iframe").css({"width":"100%","height":"100"});
    $(".portfolio-post-video").fitVids();
	wresize();
});

function wresize() {
    var body_ht = jQuery( window ).height();
    var body_wd = jQuery( window ).width();
    jQuery('#owl-demo .item img').width(body_wd);
}
jQuery( window ).resize(function() {
   wresize()
});

jQuery(document).ready(function($) {
	"use strict";
	$('#respond').addClass('row');
});

jQuery(document).ready(function($) {
	var time = PlutonTime.slidetime; // time in seconds
	var $progressBar,$bar,$elem,isPause,tick,percentTime;
	var animation = PlutonAnimation.animation;

	//Init the carousel
	$("#owl-demo").owlCarousel({
		slideSpeed : 500,
		pagination : false,
		singleItem : true,
		afterInit : progressBar,
		afterMove : moved,
		startDragging : pauseOnDragging,
		transitionStyle : animation
	});

	//Init progressBar where elem is $("#owl-demo")
	function progressBar(elem){
	$elem = elem;
	//build progress bar elements
	buildProgressBar();
	//start counting
	start();
	}
	 
	//create div#progressBar and div#bar then prepend to $("#owl-demo")
	function buildProgressBar(){
	$progressBar = $("<div>",{
	id:"progressBar"
	});
	$bar = $("<div>",{
	id:"bar"
	});
	$progressBar.append($bar).prependTo($elem);
	}
	 
	function start() {
	//reset timer
	percentTime = 0;
	isPause = false;
	//run interval every 0.01 second
	tick = setInterval(interval, 10);
	};
	 
	function interval() {
	if(isPause === false){
	percentTime += 1 / time;
	$bar.css({
	width: percentTime+"%"
	});
	//if percentTime is equal or greater than 100
	if(percentTime >= 100){
	//slide to next item
	$elem.trigger('owl.next')
	}
	}
	}
	 
	//pause while dragging
	function pauseOnDragging(){
	isPause = true;
	}
	 
	//moved callback
	function moved(){
	//clear interval
	clearTimeout(tick);
	//start again
	start();
	}
});