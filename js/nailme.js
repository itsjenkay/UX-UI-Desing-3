$(document).ready(function(){
		// alert($(window).width())
	$('#menu_icon').on('click', function(){
		$('.nav').slideToggle('slow','linear');
	});

	//controling header scroll
	var lastScrollTop = 0;
	 $(window).on('scroll', function() {
	 	if ($(window).width()>=800) {
	        st = $(this).scrollTop();
	        if(st < lastScrollTop) {
	            $(".Hhome").css("position","fixed");
	        }
	        else {
				if(st < 180){
					$(".Hhome").css("position","fixed");
				}else{
					$(".Hhome").css("position","relative");
				}
			};
		     lastScrollTop = st;
		     zIndex = 999999
	 	}
    });

	//fixed footer for home-classic page
	$('.foot').scrollToFixed({
		bottom:0,
	});
	$('.fix').scrollToFixed();

	// $('.foot').hover(function(){
	// 	$('.hide').slideToggle('fast', 'linear');
	// });
	$('.foot').hover(function(){//alert('dff')
		$('.hide').slideDown();
	});
	$(document).mousemove(function(e) {
		if ((e.pageY<=330)&&($('.hide').css('display')=="block")) {
			$('.hide').hide();
		}
	})
	//slideToggle for sub-menu-nav
	$('.myMenu ul li').hover(function() {
		if ($(window).width()>=800) {
			$(this).children('.sub_menu').stop(true, false, true).slideToggle('fast', 'linear');
		}
	});

   //flexslider for Demo-Home-classic page
   $('#flexslider-captions').flexslider({
   		animation: 'fade',
   		slideshow: true,
   		slideshowSpeed: '10000',
   		animationSpeed: '600',
   		smoothHeight : false,
   		controlNav: false,
   		directionNav: true,
   		animationLoop: true,

   		before: function(){
   			$('.extendBgSlider h1,.extendBgSlider p').animate({opaicty: 0, marginTop: '-25px'}, 100);
   		},
   		after: function(){
   			$('.extendBgSlider h1').animate({opacity:1, marginTop: '0'}, 100);
   			$('.extendBgSlider p').delay(100).animate({opacity: 1, marginTop: '0'},100);
   		}
   }); 

   $('slider-prev').on('click', function(){
   		$( '.flex-direction-nav a.flex-prev' ).trigger( 'click' );
   });  
   $('slider-next').on('click', function(){
   		$( '.flex-direction-nav a.flex-next' ).trigger( 'click' );
   });

   $('#full-bg-slider-container').cherryfullBgSlider({
   		duration: '1200',
		autoSwitcherDelay: '10000',
		parallaxEffect: false,
		animateLayout: 'zoom-fade-eff',
		prevButton: $( '.slider-prev' ),
		nextButton: $( '.slider-next' ),
		paginationList: $('.flex-control-paging')
	});
	
});



var map;
var mapContainer = document.getElementById('map');
function initMap(){
	var mapOptions = {
		zoom: 8,
		center: {lat:6.4298642, lng:7.49411406},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	map = new google.maps.Map(mapContainer, mapOptions);
	var marker = new google.maps.Marker({
		position: {lat:6.4298642, lng:7.49411406},
		map: map
	})
		
}
initMap();
