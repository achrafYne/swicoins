// Filename: view/join/step1.js
define([
	'jquery',
	'jqueryvalidator',
	'underscore',
	'backbone',
	'utils',
	'text!templates/join/step1.html'
], function($, jqueryvalidator, _, Backbone, Utils, Tpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({
		initialize : function() {
			this.render(); 
	    },
		/*-------------------- EVENTS --------------------*/

		events:{ }, 

		/*-------------------- RENDER --------------------*/

		render:function(){ 
			var	compiledTemplate = _.template(Tpl);
			this.$el.html(compiledTemplate); 
		}

	});

	/*-------------------- MODULE --------------------*/

	return {
		id:'joinStep1',
		level:1,
		view:View
	};

});
