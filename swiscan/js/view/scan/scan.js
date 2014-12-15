// Filename: view/scan/scan.js
define([
	'jquery',
	'jqueryvalidator',
	'underscore',
	'backbone',
	'utils',
	'text!templates/scan/scan.html'
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
		id:'Scan',
		level:4,
		view:View
	};

});
