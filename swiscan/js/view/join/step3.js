// Filename: view/join/step3.js
define([
	'jquery',
	'jqueryvalidator',
	'underscore',
	'backbone',
	'utils',
	'model/join',
	'text!templates/join/step3.html'
], function($, jqueryvalidator, _, Backbone, Utils, JoinModel, Tpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({
		
		
		initialize:function(){ 
			  
		},
		
		/*-------------------- EVENTS --------------------*/

		events:{
			'change input:not([type="submit"],[type="checkbox"]),select':'memorize'
		},

		/*-------------------- HANDLERS --------------------*/

		memorize:function(e){

			Utils.form.modelMemorize.call(JoinModel,e.target);

		},
		

		/*-------------------- RENDER --------------------*/

		render:function(){

			/* Prevent direct access */
			/*var auth = (2 == JoinModel.get('completed'))
			if(!auth) { 
				Utils.router.navigate('join/step1',{ trigger:true, replace:true });
			}*/

			/* Vars */
			var	compiledTemplate = _.template(Tpl, { model:JoinModel } );

			/* Append */
			this.$el.html(compiledTemplate); 

		}

	});

	/*-------------------- MODULE --------------------*/

	return {
		id:'joinStep3',
		level:3,
		view:View
	};

});
