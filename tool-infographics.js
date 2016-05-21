function PAT_Infographics()
{
	// settings
	var $currentContainer = null;
	this.$tool = $("form#postadviestool");
	this.$wrapper = $("#infoGraphics");
	this.slideSpeed = 600;
	this.imageDir = '/images/layout/infographics';

	
	// reference to self
	var oGr = this;

	/**
	 * Initialize
	 */
	this.Init = function()
	{
		// build html
		oGr.BuildInfoGraphics();
		
		// set first item as current
		oGr.SetCurrentContainer(oGr.$wrapper.find(".infoGraphicContainer:first"));
		
		// set events
		oGr.SetEvents();
		
		// update all infographic states
		oGr.$tool.find("fieldset").each(function(){
			oGr.UpdateInfoGraphic($(this));
		});
	}
	
	this.SetEvents = function(){
		// input onchange
		oGr.$tool.find("input").change(function(){
			oGr.UpdateInfoGraphic($(this).closest("fieldset"));
		});
	}

	/**
	 * Checks which kind of fieldset it is and calls the correct update function
	 */
	this.UpdateInfoGraphic = function($fieldset)
	{
		if($fieldset.hasClass('type-sliders')) {
			return oGr.UpdateInfographic_Slider($fieldset);
		} else if($fieldset.hasClass('type-checkboxes')) {
			return oGr.UpdateInfographic_Checkbox($fieldset);
		} else if($fieldset.hasClass('type-radios')) {
			return oGr.UpdateInfographic_Radio($fieldset);
		} else if($fieldset.hasClass('type-buses')) {
			return oGr.UpdateInfographic_Bus($fieldset);
		}
	}

	/**
	 * Update slider infographic
	 */
	this.UpdateInfographic_Radio = function($fieldset)
	{
		// init
		var $container = $fieldset.getInfoGraphic();
		var checkedAmount = 0;
		// loop inputs
		$fieldset.find("input").each(function(){
			var infoGraphicSelector = '#' + $fieldset.attr("id") + '_' + $(this).attr("id");
			
			// checked or unchecked?
			if($(this).is(":checked")) {
				// fade in
				$(infoGraphicSelector).fadeIn();
				
				// fade out the rest
				$(infoGraphicSelector).siblings().fadeOut();
				
				// update checked amount
				checkedAmount = checkedAmount + 1;
			}
		});
		
		// none selected? show "none"
		if(checkedAmount == 0) {
			// hide all
			$fieldset.getInfoGraphic().find('.infoGraphic').hide();
			
			// show "none"
			var noneSelector = '#' + $fieldset.attr("id") + "_none";
			$(noneSelector).show();
		}
	}


	/**
	 * Update slider infographic
	 */
	this.UpdateInfographic_Slider = function($fieldset)
	{
		// init
		var value = parseInt($fieldset.find("input").val(), 10);
		var $container = $fieldset.getInfoGraphic();
		var highestValue = 0;
		var $infoGraphic = null;
		
		//loop all infographics and check for the highest value below or equal to the slider's value
		$container.find('.infoGraphic').each(function(){
			var infoGraphicValue = parseInt($(this).attr("id").replace($container.data('idPrefix'), ''), 10);
			if(infoGraphicValue <= value && infoGraphicValue >= highestValue) {
				$infoGraphic = $(this);
				highestValue = infoGraphicValue;
			}
		});
		
		if($infoGraphic !== null) {
			// hide all others
			$infoGraphic.siblings().hide();
			
			// show infographic
			$infoGraphic.show();
		}
	}
	
	/**
	 * Update checkbox infographic
	 */
	this.UpdateInfographic_Checkbox = function($fieldset)
	{
	
		// init
		var $container = $fieldset.getInfoGraphic();
		var $showNow = null;
		var $hideNow = null;
		
		// loop inputs
		$fieldset.find("input").each(function(){
			var idPrefix = '#' + $container.data('idPrefix') + $(this).attr("id") + '_';
			
			// checked or unchecked?
			if($(this).is(":checked")) {
				$showNow = $(idPrefix + 'checked');
				$hideNow = $(idPrefix + 'unchecked');
			} else {
				$showNow = $(idPrefix + 'unchecked');
				$hideNow = $(idPrefix + 'checked');
			}
			
			// don't animate
			if(typeof dontAnimate != 'undefined') {
				$showNow.show();
				$hideNow.hide();
			} 
			// animate
			else {
				$showNow.fadeIn("fast");
				$hideNow.fadeOut("fast");
			}
		});
	}

	/**
	 * Update checkbox infographic
	 */
	this.UpdateInfographic_Bus = function($fieldset)
	{
		// init
		var $container = $fieldset.getInfoGraphic();
		
		// loop inputs
		$fieldset.find("input").each(function(){
			// get bus
			var busSelector = '#bus_' + $(this).attr("id");
			var $bus = $(busSelector);
			
			// checked
			if($(this).is(':checked')) {
				if(!$bus.hasClass("parked")) {
					$bus.show().animate({
						left: 0
					}, 600, 'easeOutCirc', function(){
						$(this).addClass("parked");
					});
				}
			}
			// unchecked
			else {
				if($bus.hasClass("parked")) {
					$bus.animate({
						left: -725
					}, 1000, 'easeInBounce', function(){
						// hide buses that are not in sight
						$(this).hide();
						$(this).removeClass("parked");
						$(this).css('left', 725);
					});
				} else {
					// hide buses that are not in sight
					$bus.hide();
				}
			}
		});
	}


	
	/**
	 * Build all infographics for the form
	 */
	this.BuildInfoGraphics = function()
	{
		oGr.$tool.find('fieldset').each(function(){
			// buses
			if($(this).hasClass('type-buses')) {
				$("#infoGraphics").append(oGr.BuildInfographic_Buses($(this)));
			} 
			// nothing
			else if ($(this).hasClass('type-nothing')) {
				$("#infoGraphics").append(oGr.BuildInfographic_Nothing($(this)));
			} 
			// sliders
			else if ($(this).hasClass('type-sliders')) {
				$("#infoGraphics").append(oGr.BuildInfographic_Sliders($(this)));
			} 
			// radios
			else if ($(this).hasClass('type-radios')) {
				$("#infoGraphics").append(oGr.BuildInfographic_Radios($(this)));
			} 
			// checkboxes
			else if ($(this).hasClass('type-checkboxes')) {
				$("#infoGraphics").append(oGr.BuildInfographic_Checkboxes($(this)));
			}
		});
		
		$("#infoGraphics").append('<div class="infoGraphicContainer end" />');
	}
		
	/**
	 * Build infographics for a buses card
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 */
	this.BuildInfographic_Buses = function($card)
	{
		// get container
		var $container = oGr.BuildInfoGraphicContainer($card, 'buses');
		
		// loop checkboxes and create buses
		var i = 1;
		$card.find("input").each(function(){
			// create infographic for bus
			var $infoGraphic = oGr.BuildInfoGraphicState($card, 'buses', i, 'bus_' + $(this).attr("id"));
			// get z-index class
			var aClasses = $(this).attr("class").split(/\s+/);
			var zIndex = '';
			for(var i = 0; i < aClasses.length; i++){
				if(aClasses[i].substr(0, 1) == 'z' && aClasses[i].length < 4) {
					zIndex = aClasses[i];
				}
			}
			$infoGraphic.addClass(zIndex);
			// add infographic to container
			$container.append($infoGraphic);
			// update loop number
			i++;
		});

		// return
		return $container;
	}
	
	/**
	 * Build infographics for a nothing card
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 */
	this.BuildInfographic_Nothing = function($card)
	{
		// get container
		var $container = oGr.BuildInfoGraphicContainer($card, 'nothing');
		
		// this type just needs a single span
		var $infoGraphic = oGr.BuildInfoGraphicState($card, 'nothing', 1, $card.attr("id") + '_slideState_1');

		// compile and return
		$container.append($infoGraphic);
		return $container;
	}

	
	/**
	 * Build infographics for a sliders card
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 */
	this.BuildInfographic_Sliders = function($card)
	{
		// get container
		var $container = oGr.BuildInfoGraphicContainer($card, 'sliders');
		
		// loop checkboxes and create buses
		var i = 1;
		var aCriteria = null;
		
		
		// step 1
		if($card.attr("id") == 'postadviestool_stepOneSection') {
			aCriteria = new Array('0', '1', '100', '200', '500', '1000', '1500', '2000', '3000', '4000');
		}
		// step 10
		else if($card.attr("id") == 'postadviestool_stepTenSection') {
			aCriteria = new Array('0', '1', '10', '20', '40', '60', '70', '80', '90', '100');
		} 
		// step 7
		else if($card.attr("id") == 'postadviestool_stepSevenSection') {
			aCriteria = new Array('0', '1', '50', '200', '400', '600', '800');
		}
		// step 7a
		else if($card.attr("id") == 'postadviestool_stepSevenaSection') {
			aCriteria = new Array('0', '1', '10', '20', '40', '60', '80', '90', '100');
		}
		
		var idPrefix = $card.attr("id") + '_slideState_';
		$container.data('idPrefix', idPrefix);
		for(i = 0; i < aCriteria.length; i++) {
			var index = i + 1;
			// create infographic for bus
			var $infoGraphic = oGr.BuildInfoGraphicState($card, 'sliders', index, idPrefix + aCriteria[i]);
			// add infographic to container
			$container.append($infoGraphic);
		}

		// return
		return $container;
	}
	
	/**
	 * Build infographics for a radios card
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 */
	this.BuildInfographic_Radios = function($card)
	{
		// get container
		var $container = oGr.BuildInfoGraphicContainer($card, 'radios');
				
		// loop checkboxes and create buses
		var i = 1;
		$card.find("input").each(function(){
			// create infographic for bus
			var $infoGraphic = oGr.BuildInfoGraphicState($card, 'radios', i, $card.attr("id") + '_' + $(this).attr("id"));
			// add infographic to container
			$container.append($infoGraphic);
			// update loop number
			i++;
		});

		// also add option for nothing selected
		var $infoGraphic = oGr.BuildInfoGraphicState($card, 'radios', i, $card.attr("id") + '_none');
		$container.append($infoGraphic);
		

		// return
		return $container;
	}
	
	/**
	 * Build infographics for a checkboxes card
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 */
	this.BuildInfographic_Checkboxes = function($card)
	{
		// get container
		var $container = oGr.BuildInfoGraphicContainer($card, 'checkboxes');
				
		// loop checkboxes and create spans
		var i = 1;
		var idPrefix = $card.attr("id") + '_';
		$container.data('idPrefix', idPrefix);
		$card.find("input").each(function(){
			// create infographic for checkbox checked
			var $infoGraphicChecked = oGr.BuildInfoGraphicState($card, 'checkboxes', i, idPrefix + $(this).attr("id") + '_checked');
			// add infographic to container
			$container.append($infoGraphicChecked);
			// update loop number
			i++
			
			// create infographic for checkbox unchecked
			var $infoGraphicUnchecked = oGr.BuildInfoGraphicState($card, 'checkboxes', i, idPrefix + $(this).attr("id") + '_unchecked');
			// add infographic to container
			$container.append($infoGraphicUnchecked);
			// update loop number
			i++;
				
			// get z-index class
			var aClasses = $(this).attr("class").split(/\s+/);
			var zIndex = '';
			for(var i = 0; i < aClasses.length; i++){
				if(aClasses[i].substr(0, 1) == 'z' && aClasses[i].length < 4) {
					zIndex = aClasses[i];
				}
			}
			$infoGraphicChecked.addClass(zIndex);
			$infoGraphicUnchecked.addClass(zIndex);
		});

		// return
		return $container;
	}
	
	/**
	 * Build a container for one or more infographic states
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 * @param type	The type of card (buses, nothing, sliders, radio or checkboxes)
	 */
	this.BuildInfoGraphicContainer = function($card, type)
	{
		var $container = $('<div class="infoGraphicContainer infoGraphicContainer_' + type + '" id="infoGraphicContainer_' + $card.attr("id") + '" />');
		$("body").append($container);
		return $container;
	}
	
	/**
	 * Build an infographic state
	 * @param $card jQuery object: the fieldset to which the infographic relates
	 * @param type	The type of card (buses, nothing, sliders, radio or checkboxes)
	 * @param index The index of the infographic in its container
	 * @param extraclass Every extra class you'd like to give the infographic
	 */
	this.BuildInfoGraphicState = function($card, type, index, id) 
	{
		var $infoGraphic = $('<span />');
		
		if(!$("body").hasClass("tml_mobile-simple")) {
			// get image url 
			var filename = id.replace($card.attr('id') + '_', '').replace('postadviestool_', '') + '.png';
			var imgSrc = oGr.imageDir + '/'+ $card.attr('id') + '/' + filename;
			
			// build image tag
			$infoGraphic = $('<img class="infoGraphic ' + type + ' index_' + index + '" id="' + id +'" src="' + imgSrc + '"/>');
			$("body").append($infoGraphic);
		} 
		
		// return
		return $infoGraphic;
	}
	
	/**
	 * Go to the next container
	 */
	this.Prev = function(fnCallback)
	{
		// find prev
		var $prev = oGr.$currentContainer.prevAll('.infoGraphicContainer:visible').first();
		if($prev.length > 0) {
			oGr.GoToSelector($prev, fnCallback);
		} 
		// no prev found
		else {
			return false;
		}
	}
	
	/**
	 * Go to the previous container
	 */
	this.Next = function(fnCallback)
	{
		// find next
		var $next = oGr.$currentContainer.nextAll('.infoGraphicContainer:visible').first();
		if($next.length > 0) {
			oGr.GoToSelector($next, fnCallback);
		} 
		// no next found
		else {
			return false;
		}
	}
	
	/**
	 * Set current fieldset
	 */
	this.SetCurrentContainer = function(selector)
	{
		// set class
		$(".currentContainer").removeClass("currentContainer");
		$(selector).addClass("currentContainer");
		
		// set internal pointer
		oGr.$currentContainer = $(selector);
	}
	
	/**
	 * Go to a selector
	 */
	this.GoToSelector = function(selector, fnCallback)
	{
		var $new = $(selector);
		
		// initialize
		oGr.BeginGoTo();
		
		// calculate offset
		var containerWidth = oGr.$wrapper.find(".infoGraphicContainer:first").outerWidth(true);
		var endOffset = 0 - ($new.prevAll(".infoGraphicContainer:visible").length * containerWidth);

		// animate to next card
		oGr.$wrapper.animate({
			left: endOffset
		}, oGr.slideSpeed, 'easeInOutCirc', function(){
			// finish off
			oGr.EndGoTo($new, fnCallback);
		});
	}

	/**
	 * Call a callback function
	 */
	this.Callback = function(fnCallback)
	{
		if(typeof fnCallback == 'function') {
			fnCallback();
		} 
	}
	
	/**
	 * Initialize a Go To action
	 */
	this.BeginGoTo = function()
	{
		
	}

	/**
	 * Finish off a Go To action
	 */
	this.EndGoTo = function(selector, fnCallback)
	{
		// set current
		oGr.SetCurrentContainer(selector);

		// callback
		oGr.Callback(fnCallback);
	}
	
	this.Init();
}

/**
 * jQuery function to get a fieldset's infographic
 */
(function ($) {
$.fn.getInfoGraphic = function () {
	var selector = '#infoGraphicContainer_' + $(this).attr("id");
	return $(selector);
};
})(jQuery);
