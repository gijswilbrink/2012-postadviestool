function PAT_Navigation()
{
	
	// settings
	this.$current = null;
	this.$tool = $("form#postadviestool");
	this.cardSpeed = 600;
	
	// reference to self
	var oNav = this;
	
	/**
	 * Initialize
	 */
	this.Init = function()
	{
		oNav.CreateProgressBar();
		
		// set first item as current
		oNav.SetCurrent(oNav.$tool.find("fieldset:first"));
		
		// set all events
		oNav.SetEvents();
		
		// check if something was invalid
		if($(".ofb_invalid").length > 0 && !$("body").hasClass("tml_mobile-simple")) {
			oNav.CheckRelevancies();
			oNav.GoToSelector($(".ofb_invalid").first().closest("fieldset"));
		}
		
		if(oNav.$tool.length > 0) {
			oNav.DoOmniture(1);
		}
	}

	/**
	 * Create the progress bar
	 */
	this.CreateProgressBar = function()
	{
		var i = 1;
		oNav.$tool.find("fieldset").each(function(){
			var $newStep = $('<span class="step" id="progress_step' + i + '" />');
			$("#progress").append($newStep);
			i++;
		});
	}

	/**
	 * Set all events for the tool
	 */
	this.SetEvents = function()
	{
		// on submit on main form
		oNav.$tool.submit(function(){
			// end of form?
			if(oNav.$current.attr("id") == 'postadviestool_stepFourteenSection') {
				/*if($("#postadviestool_email").val() == '') {
					alert("Vul uw e-mailadres in om uw persoonlijke rapport te ontvangen");
					return false;
				}*/
			
				return true;
			}
			return false;
		});
		
		// prev event
		$("#prev").click(function(){
			oNav.CheckRelevancies();
			oNav.Prev();
			PAT_Globals.oGr.Prev();
			return false;
		});
		
		// next event
		$("#next").click(function(){
			oNav.CheckRelevancies();
			oNav.Next();
			PAT_Globals.oGr.Next();
			return false;
		});
		
		// Swipe function for touch devices with hammer.js author: Gijs Wilbrink
		// swipe left = next
		/*$("#postadviestool fieldset").hammer().bind("swipe", function(e){
			
			oNav.CheckRelevancies();

			// next
			if(e.gesture.direction == 2) { // swipe left = direction 2
				oNav.Next();
				PAT_Globals.oGr.Next();
			}
			// prev
			else if(e.gesture.direction == 4) { // swipe right = direction 4
				oNav.Prev();
				PAT_Globals.oGr.Prev();
			}
			return false;
		}); */

		// onchange on all form fields: check relevancy of fieldset
		$("input, select, textarea").change(function(){
			oNav.CheckRelevancies();
		});
	}
	
	/**
	 * Set current fieldset
	 */
	this.SetCurrent = function(selector)
	{
		// set class
		$(".current").removeClass("current");
		$(selector).addClass("current");
		
		// set internal pointer
		oNav.$current = $(selector);
		
		// hide prev arrow on first step
		var $prev = oNav.$current.prevAll('fieldset:visible');
		if($prev.length == 0) {
			$("#prev").fadeOut();
		} else if (!$("#prev").is(":visible")) {
			$("#prev").fadeIn();
		}
	}
	
	/**
	 * Go to the next question
	 */
	this.Prev = function(fnCallback)
	{
		// find prev
		var $prev = oNav.$current.prevAll('fieldset:visible').first();
		if($prev.length > 0) {
			oNav.GoToSelector($prev, fnCallback);
		} 
		// no prev found
		else {
			return false;
		}
	}
	
	/**
	 * Go to the previous question
	 */
	this.Next = function(fnCallback)
	{
		// validate
		
		// find next
		var $next = oNav.$current.nextAll('fieldset:visible').first();
		if($next.length > 0) {
			// google analytics tracking
			if(CookiePermission(9)) {
				_gaq.push(['_trackPageview', '/stap-' + $next.attr("id") + '/']);
			}
			
			oNav.GoToSelector($next, fnCallback);
		} 
		// no next found
		else {
			return false;
		}
	}
	
	/**
	 * Go to a selector
	 */
	this.GoToSelector = function(selector, fnCallback)
	{
		var $new = $(selector);
		
		// initialize
		oNav.BeginGoTo();
		
		// calculate offset
		var cardWidth = oNav.$tool.find("fieldset:first").outerWidth();
		var endOffset = 0 - ($new.prevAll("fieldset:visible").length * cardWidth);
		// end card is wider: correction
		if($new.attr("id") == 'postadviestool_stepFourteenSection') {
			$("#next").hide();
			var difference = ($new.outerWidth() - cardWidth) / 2;
			endOffset = endOffset - difference;			
		} else {
			$("#next").show();
		}
		
		oNav.DoOmniture($new.prevAll("fieldset").length + 1);
		
		
		// animate to next card
		oNav.$tool.animate({
			left: endOffset
		}, oNav.cardSpeed, 'easeInOutCirc', function(){
			// finish off
			oNav.EndGoTo($new, fnCallback);
		});
		
		// fade card contents
		$new.find('h2, .ofb_container').fadeIn(oNav.cardSpeed);
		oNav.$current.find('h2, .ofb_container').fadeOut(oNav.cardSpeed);
	}
	
	this.DoOmniture = function(step)
	{
		if(typeof Info != 'undefined') {
		Info.page.type = 'formStep';
		Info.form.name = 'Postadviestool';
		Info.form.step = step;
		$("body").trigger("step");
//		console.log('Info.form.step geset op ' + step);
		}
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
		oNav.SetCurrent(selector);
		
		// update progress indicator
		var stepsCompleted = $(selector).prevAll("fieldset").length;
		$('#progress .step').removeClass("complete");
		$('#progress .step:lt(' + stepsCompleted + ')').addClass("complete");
		
		// update stepscompleted input
		$("#postadviestool_stepsCompleted").val(stepsCompleted);
		
		// update tips and advises
		oNav.UpdateTipsAndAdvices();
		
		// callback
		oNav.Callback(fnCallback);
	}
	
	/**
	 * Updates the numbers of tips and advices
	 */
	this.UpdateTipsAndAdvices = function()
	{
		var data = oNav.$tool.serialize().replace('&action=', '&formAction=');
		
		// get advices
		$.post('./?action=Site_Postadviestool_GetResultAmounts', data, function(oAmounts){
			$("#efficiencyNo").text(oAmounts.advices);
			$("#tipNo").text(oAmounts.tips);
			
			if (oAmounts.advices > 0) {
				$("ul#envelopes li").removeClass("active");
				$("ul#envelopes li.advices" + oAmounts.advices).addClass("active");	
			} else {
				$("ul#envelopes li").removeClass("active");
			}
		}, 'json');
		
	}
	
	/**
	 * Check if a card should be shown or not
	 */
	this.IsCardRelevant = function(selector)
	{
		var id = $(selector).attr("id");
		
		// loop all fieldsets that depend on something. return false if dependency fails
		switch(id) {
			case 'postadviestool_stepTwoSection' :
				// als nooit honderd stuks of meer				
				if($("#postadviestool_aantalPoststukkenPerMaand").val() == '0' ) {
					return false;
				}
			break;
			// 250 stuks of meer
			// case 'postadviestool_stepFourbSection' :
			// inhoud partijen
			case 'postadviestool_stepFiveSection' :
			// hoe gefrankeerd
			case 'postadviestool_stepSixSection' :
			
				// als nooit honderd stuks of meer				
				if($("input[name=tweehonderdvijftigStuksOfMeer]:checked").val() == 'nooit') {
					return false;
				}
			break;	
				// brievenbuspakjes
			case 'postadviestool_stepSevenaSection' :
				// als minder dan 1 pakket	
				if($("#postadviestool_aantalPakkettenPerMaand").val() == '0' ) {
					return false;
				}
			break;		
				// welke pakketvervoerder
			case 'postadviestool_stepEightSection' :
				return false;
				// als minder dan 1 pakket	
				if($("#postadviestool_aantalPakkettenPerMaand").val() == '0' ) {
					return false;
				}
			break;
			// hoe gefrankeerd
			case 'postadviestool_stepNineSection' :
				// als pakketvervoerder niet postnl is
				if($("#postadviestool_vervoerderPostNL:checked").length == 0) {
					return false;
				}

			break;
			// waar koopt u post en pakketzegels
			case 'postadviestool_stepElevenSection' :
				// als nergens postzegels en pakketzegels geselecteerd
				if($("#postadviestool_frPostStukPostzegel:checked").length + $("#postadviestool_frPartijenPostzegel:checked").length + $("#postadviestool_frPakkettenPakketzegel:checked").length == 0) {
					return false;
				}
			break;
			
			// post nietmeegenomen door postnl
			case 'postadviestool_stepThirteenSection' :
				if($("#postadviestool_servHaalservice:checked").length > 0) {
					return false;
				}
			break;
		}
		
		// return true in all other cases
		return true;
	}
	
	/**
	 * Loop all fieldsets and check if they are still relevant
	 */
	this.CheckRelevancies = function()
	{
		// loop
		oNav.$tool.find("fieldset").each(function(){
			// relevant
			if(oNav.IsCardRelevant(this)) {
			    $(this).show().removeClass("irrelevant");
			    $(this).getInfoGraphic().show().removeClass("irrelevant");
			} 
			// irrelevant
			else {
			    $(this).hide().addClass("irrelevant");
			    $(this).getInfoGraphic().hide().addClass("irrelevant");
			}
		});
	}
	
	this.Init();
}

