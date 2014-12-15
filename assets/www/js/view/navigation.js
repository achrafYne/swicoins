// Filename: navigation.js
define([
	'jquery',
	'underscore',
	'backbone',
	'model/navigation',
	'text!templates/navigation.html'
], function($, _, Backbone, NavigationModel, navigationTpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({

		el:$('nav'),
		
		/*-------------------- INIT / DEFERED INIT --------------------*/

		initialize:function(){

			/* View / Model association */
			var that = this;
			/* Bind collection changes that need the view to refresh */
			NavigationModel.bind('change',function(){ that.render(); });

		},
		/* Unlink model to prevent multiple binding and save resources */
		unlink:function(){
			NavigationModel.off();
		},
		/*-------------------- RENDER --------------------*/

		render:function(){
			
			// Vars
			var	compiledTemplate = _.template(navigationTpl, { model:NavigationModel });
			
			// Append
			this.$el.html(compiledTemplate);

		},

		/*-------------------- METHODS --------------------*/

		activate:function(index){

			/* Call action list for badge count */
			require(['model/user/actions/list']);

			this.$el.removeClass('empty');
			NavigationModel.set({ active:index });
		},

		hide:function(){
			this.$el.addClass('empty');
		},

		setBadge:function(index,count){
			var buttons = NavigationModel.get('buttons'),
				r = Math.round(Math.random()*10000);
			buttons[index].badge = count;
			NavigationModel.set({ buttons:buttons });
			NavigationModel.set({ nocache:r });
		}


	});
	
	/*-------------------- INIT --------------------*/

	if(DEBUG) console.log('Navigation initialized');

	/* Instanciate the view */
	var Navigation = new View();
	Navigation.render();


	return Navigation;

});
