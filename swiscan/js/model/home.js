// Filename model/home.js
define([
	'backbone',
	'underscore',
	'utils'
], function(Backbone, _, Utils){

	/*-------------------- CONFIG --------------------*/

	var Model = Backbone.Model.extend({
			defaults:{
				type:'mobile',
				prefix:'',
				prefixs: Utils.params.prefixs,
				mobile:'',
				email:'',
				store:false,
				password:''
			},
			reset:function(){
				this.set(this.defaults);
			},

			getInternationalDiallingCodes:function(){
				return false;
				var model = this;

				/* Call for secret questions list */
				Utils.service.call({
					name:'anon/getInternationalDiallingCodes/',
					success:function(response){
						if( response.phoneCountryCodes )  model.set({ prefixs:response.phoneCountryCodes }); 
						Utils.service.finish();// remove class loading
					}
				});
			}
		}),
		Instance = new Model();

	// Return the model for the module
	return Instance;

});