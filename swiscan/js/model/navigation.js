// Filename model/navigation.js
define([
	'backbone',
	'underscore',
	'utils'
], function(Backbone, _, Utils){

	/*-------------------- CONFIG --------------------*/

	var Model = Backbone.Model.extend({
			defaults:{
				active:0,
				buttons:[
					{
						id:'send',
						label:'Envoyer',
						route:'#user/send/form',
						badge:0
					},
					{
						id:'ask',
						label:'Demander',
						route:'#user/ask/form',
						badge:0
					},
					{
						id:'actions',
						label:'Actions',
						route:'#user/actions/home',
						badge:0
					},
					{
						id:'others',
						label:'Autres',
						route:'#user/others/home',
						badge:0
					}
				]
			},
			reset:function(){
				this.set(this.defaults);
			}
		}),
		Instance = new Model();

	// Return the model for the module
	return Instance;

});