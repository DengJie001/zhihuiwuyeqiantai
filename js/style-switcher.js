jQuery(document).ready(function($) {
  $('#default').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/default.css" type="text/css" />');
    return false;
  });

  $('#blue').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/blue.css" type="text/css" />');
    return false;
  });

  $('#asparagus').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/asparagus.css" type="text/css" />');
    return false;
  });

  $('#green').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/green.css" type="text/css" />');
    return false;
  });

  $('#orange').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/orange.css" type="text/css" />');
    return false;
  });

  $('#purple').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/purple.css" type="text/css" />');
    return false;
  });

  $('#yellow').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/yellow.css" type="text/css" />');
    return false;
  });

  $('#tomato').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/tomato.css" type="text/css" />');
    return false;
  });

  $('#teal').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/teal.css" type="text/css" />');
    return false;
  });

  $('#pink').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/pink.css" type="text/css" />');
    return false;
  });

  $('#lima').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/lima.css" type="text/css" />');
    return false;
  });

  $('#turquoise').click(function(){
    var linkcss = PlutonLinkTheme.link;
    $('link[rel*=jquery]').remove();
    $('head').append('<link rel="stylesheet jquery" href="'+linkcss+'css/themes/turquoise.css" type="text/css" />');
    return false;
  });

});


jQuery(document).ready(function($) {
	$(".switcher .fa-cog").click(function(e) { 
	e.preventDefault();
	$(".switcher").toggleClass("active");
	});
});