// Filename: view/login.js
define([
	'jquery',
	'underscore',
	'backbone',
	'utils'
], function($, _, Backbone, Utils){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({
		
		initialize:function(params){
			/* Store token in non persistent storage */
			Utils.storage.set('token','key',params.token,false);
			Utils.router.navigate('user/send/form',{ trigger:true, replace:true });

		}

	});

	/*-------------------- MODULE --------------------*/

	return View;

});
