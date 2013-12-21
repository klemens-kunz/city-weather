(function($){

	// Array of condition codes (from http://developer.yahoo.com/weather/#codes) adapted to the available set of icons
	var conditionCodes = new Array(
		"windy-rain", //tornado
		"windy-rain", //tropical-storm
		"windy-rain", //hurricane
		"thunderstorm", //severe-thunderstorms
		"thunderstorm", //thunderstorms
		"heavy-snow", //mixed-rain-and-snow
		"heavy-rain", //mixed-rain-and-sleet
		"heavy-snow", //mixed-snow-and-sleet
		"freezing-drizzle", //freezing-drizzle
		"chance-of-rain", //drizzle
		"hail", //freezing-rain
		"chance-of-rain", //showers
		"heavy-rain", //showers
		"chance-of-snow", //snow-flurries
		"chance-of-snow", //light-snow-showers
		"heavy-snow", //blowing-snow
		"heavy-snow", //snow
		"hail", //hail
		"chance-of-snow", //sleet
		"fog", //dust
		"fog", //foggy
		"fog", //haze
		"fog", //smoky
		"windy", //blustery
		"windy", //windy
		"cold", //cold
		"mostly-cloudy", //cloudy
		"mostly-cloudy", //mostly-cloudy-(night)
		"mostly-cloudy", //mostly-cloudy-(day)
		"partly-cloudy", //partly-cloudy-(night)
		"partly-cloudy", //partly-cloudy-(day)
		"sunny", //clear-(night)
		"sunny", //sunny
		"sunny", //fair-(night)
		"sunny", //fair-(day)
		"hail", //mixed-rain-and-hail
		"sunny", //hot
		"chance-of-storm", //isolated-thunderstorms
		"chance-of-storm", //scattered-thunderstorms
		"chance-of-storm", //scattered-thunderstorms
		"chance-of-rain", //scattered-showers
		"heavy-snow", //heavy-snow
		"chance-of-snow", //scattered-snow-showers
		"heavy-snow", //heavy-snow
		"partly-cloudy", //partly-cloudy
		"thunderstorm", //thundershowers
		"chance-of-snow", //snow-showers
		"chance-of-storm", //isolated-thundershowers
		"not-available" //not-available
	);

	// String of all available condition classes to swiftly remove any possible class from a forecast-icon element
	var conditionClasses = "sunny partly-cloudy chance-of-storm chance-of-rain heavy-rain windy windy-rain chance-of-snow heavy-snow hail mostly-cloudy thunderstorm fog cold not-available";

	//main function to get the weather data for a specific city
	function getWeather(cityZip){
		var ajaxURL = "http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location%3D%22" + cityZip + "%22&format=json"

		$.ajax({
			type: "GET",
			url: ajaxURL,
			cache: false,
			dataType: "json",
			success: function(data){
				setToday(data.query.results.channel.item.condition, data.query.results.channel.item.forecast[0]);
				setForecast(data.query.results.channel.item.forecast.slice(1));
			},
			complete: function(){
				//convert unit, if necessary (i.e. if celsius is active)
				var tempElem = $('.unit.active');
				var unit = tempElem.data('unit');
				if(unit == "celsius") convertTemperature(tempElem, unit);
			}
		});
	}

	// function displaying the values for today's weather
	function setToday(condition, forecast){
		var todayBox = $('.forecast-box.today');
		todayBox.find('.current-condition .text-bold').html(condition.text);

		todayBox.find('.conditions .temp-now span:first-child').text(condition.temp);
		todayBox.find('.conditions .temp-high span:first-child').text(forecast.high);
		todayBox.find('.conditions .temp-low span:first-child').text(forecast.low);

		setIcon(todayBox.find('.current-condition .forecast-icon'), condition.code);
		setIcon(todayBox.find('.conditions .forecast-icon'), forecast.code);
	}

	// function for all forecasts (i.e. the next four days)
	function setForecast(forecast){
		for(i = 0; i < forecast.length; i++){
			// Set the respective box for either tomorrow or the three days after tomorrow
			var box = i == 0 ? $('.forecast-box.tomorrow') : $('.forecast-boxes > div:nth-child(' + i + ')');

			box.find('.date').text(forecast[i].date);
			
			box.find('.conditions .condition').text(forecast[i].text);
			box.find('.conditions .temp-high span:first-child').text(forecast[i].high);
			box.find('.conditions .temp-low span:first-child').text(forecast[i].low);

			setIcon(box.find('.forecast-icon'), forecast[i].code);
		}
	}

	// Set the class of the icon element to display the respective weather condition icon
	function setIcon(element, condition){
		if(condition == 3200) condition = 48; //map the yahoo code for "not available" to the respective item in the array
		element.removeClass(conditionClasses);
		element.addClass(conditionCodes[condition]);
	}

	// function for temperature unit conversion
	function convertTemperature(elem, unit){
		if(unit == "fahrenheit"){
			$.each($('.temp-low, .temp-high, .temp-now'), function(){
				var tempSpan = $(this).find('span:first-child');
				var temp = tempSpan.text();
				// Fahrenheit = Celsius * 1.8 + 32
				var convertedTemp = Math.round(parseInt(temp, 10) * 1.8 + 32);
				tempSpan.text(convertedTemp);
				tempSpan.next('span').html("&deg;F");
			});
		}
		else if(unit == "celsius"){
			$.each($('.temp-low, .temp-high, .temp-now'), function(){
				var tempSpan = $(this).find('span:first-child');
				var temp = tempSpan.text();
				// Celsius = (Fahrenheit - 32) / 1.8
				var convertedTemp = Math.round((parseInt(temp, 10) - 32) / 1.8);
				tempSpan.text(convertedTemp);
				tempSpan.next('span').html("&deg;C");
			});
		}

		$('.unit').removeClass('active');
		elem.addClass('active');
	}

	// setting the bookmark URLs
	// 1. Setting the URL incl. URL parameter for a specific city
	// 2. Setting the URL as a general URL
	function setBookmarkURL(zipCode, cityName){
		if(zipCode != ""){
			$('.social .facebook').attr('href','https://www.facebook.com/sharer/sharer.php?u=' + window.location.href + '?zip=' + zipCode);
			$('.social .twitter').attr('href','https://twitter.com/intent/tweet?text=city-weather.com %7C ' + cityName + '&url=' + window.location.href + '?zip=' + zipCode);
			$('.social .google').attr('href','https://plus.google.com/share?url=' + window.location.href + '?zip=' + zipCode);
			$('.social .bookmark').attr('href',window.location.href + '?zip=' + zipCode);
		}
		else{
			$('.social .facebook').attr('href','https://www.facebook.com/sharer/sharer.php?u=' + window.location.href);
			$('.social .twitter').attr('href','https://twitter.com/intent/tweet?text=city-weather.com&url=' + window.location.href);
			$('.social .google').attr('href','https://plus.google.com/share?url=' + window.location.href);
			$('.social .bookmark').attr('href',window.location.href);
		}
	}

	$(document).ready(function(){
		// initially, get URL parameter for predefined zip code (if any) and display the weather for the respective city
		var url = window.location.href;
		if(url.indexOf('?') > -1){
			var paramsValid = true;
			var param = url.split('?')[1].split('=');

			if(param[0] != "zip"){
				paramsValid = false;
				alert("Unknown parameters. Loading default city.");
			}
			else{
				var cityZip = param[1];
			
				// get the allowed values from the list and compare them with the value from the URL param
				var predefValues = $("#sel-city > option").map(function() {
					return $(this).val();
				});
				var predefCities = $("#sel-city > option").map(function() {
					return $(this).text();
				});

				for(i = 0; i < predefValues.length; i++){
					if(cityZip == predefValues[i]){
						var cityName = predefCities[i];

						$('#city-name').text(cityName);
						$('#sel-city').val(cityZip);
						getWeather(cityZip);
						setBookmarkURL(cityZip, cityName);
						paramsValid = true;
						break;
					}
					else{
						paramsValid = false;
					}
				}
				if(!paramsValid) alert("Unknown parameters. Loading default city.");
			}
		}

		if(!paramsValid){
			// if URL parameter is invalid, get the weather for Boston (for simplicity's sake)			
			var city = $('#sel-city');
			var cityZip = city.val();
			var cityName = city.find('option[value="' + cityZip + '"]').text();

			$('#city-name').text(cityName);
			getWeather(cityZip);
			setBookmarkURL("", "");
		}

		// event handler for city select
		$('#sel-city').bind('change', function(){
			var city = $(this);
			var cityZip = city.val();
			var cityName = city.find('option[value="' + cityZip + '"]').text();

			$('#city-name').text(cityName);
			getWeather(cityZip);
			setBookmarkURL(cityZip, cityName);
		});

		//event handler for fahrenheit/celsius conversion
		$('.unit').bind('click',function(){
			var elem = $(this);
			var unit = elem.data('unit');
			if(!elem.hasClass('active')) convertTemperature(elem, unit);
		});

		//event handler for setting a browser bookmark link (JS bookmarking is not allowed in Chrome/Firefox)
		$('.social .bookmark').bind('click', function(event){
			if (navigator.userAgent.toLowerCase().indexOf('mozilla') > -1) { // Mozilla Firefox Bookmark
      			alert("Firefox does not allow bookmarking via JavaScript. Please use Chrome's bookmarking function.");
      		}
      		else if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){ //Browser is Google Chrome
      			alert("Chrome does not allow bookmarking via JavaScript. Please use Chrome's bookmarking function.");
      		}
      		else if(window.external) { // IE Favorite
        		window.external.AddFavorite(location.href,document.title); 
	        	event.preventDefault();
        	}
      		else if(window.opera && window.print) { // Opera Hotlist
        		this.title=document.title;
        		event.preventDefault();
        		return true;
        	}

		});

		//event handler for social bookmarks
		$('.social .facebook, .social .twitter, .social .google').bind('click', function(){
			alert("These links are for demonstration purposes only!");
		});
	});
})(jQuery);