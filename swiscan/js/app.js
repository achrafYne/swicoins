// Filename: app.js
define([
	'jquery',
	'underscore',
	'backbone',
	'router',
	'utils',
], function($, _, Backbone, Router, Utils){

	/* Backbone overrides */
	var OriginalModel = Backbone.Model;
	Backbone.Model = Backbone.Model.extend({
		set:function(attributes, options){

			/* Check each values */
			if('object' == typeof attributes && !$.isArray(attributes)){
				for(var i in attributes){
					
					/* If passed value is an object, then try to extend existing object */
					if('object' == typeof attributes[i] && !$.isArray(attributes[i])){
						/* Merge */
						var obj = this.get(i);
						attributes[i] = $.extend(true,obj,attributes[i]);
					};

				};
			};

			return OriginalModel.prototype.set.call(this, attributes, options);
		}
	}); 

	Utils.Functions.init();  // call all functions js  
	//Utils.storage.set('build','build',BUILD, true);
	
	/* Initialiazed the History record */
	Backbone.history.start();
	
});