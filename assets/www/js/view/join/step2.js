// Filename: view/join/step2.js
define([
	'jquery',
	'jqueryvalidator',
	'underscore',
	'backbone',
	'utils',
	'model/join',
	'text!templates/join/step2.html'
], function($, jqueryvalidator,_, Backbone, Utils, JoinModel, Tpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({
		
		/*-------------------- INIT --------------------*/

		initialize:function(){

			/* Get secrect questions list */
			//JoinModel.getSecretQuestions();

			/* Get international dialling codes */
			//JoinModel.getInternationalDiallingCodes();

			/* View / Model association */
			var that = this;
			/* Bind model changes that need the view to refresh */
			//JoinModel.bind('change:questions', function(){ if(DEBUG) console.log('Step 2 event'); that.render(); });

		},
		/* Unlink model to prevent multiple binding and save resources */
		unlink:function(){
			//JoinModel.off();
		},

		/*-------------------- EVENTS --------------------*/

		events:{
			'submit .joinForm':'validateStep',
			'change input:not(".ignore"),select':'memorize'
		},

		/*-------------------- HANDLERS --------------------*/

		memorize:function(e){
			Utils.form.modelMemorize.call(JoinModel,e.target);

		},
		validateStep:function(e){
			Utils.router.navigate('join/step3',{ trigger:true });
			e.preventDefault();
			// check secretQuestions if it's not changed in first time. 

			/*JoinModel.get("securityData").mobileNumber = ($("#mobileNumber").val()) ? $("#prefixregister").val() + $("#mobileNumber").val() : "";  // set Prefix + mobileNumber

			Utils.form.validate(e,function(){
				JoinModel.set({ completed:2 }); 
				Utils.router.navigate('join/step3',{ trigger:true });
			});*/


		},

		/*-------------------- RENDER --------------------*/

		render:function(){
			
			
			//console.log('Render');
			/* Prevent direct access */
			/*var auth = (1 == JoinModel.get('completed'));
			if(!auth) Utils.router.navigate('join/step1',{ trigger:true, replace:true });*/

			/* Vars */
			var	compiledTemplate = _.template(Tpl, { model:JoinModel } );

			/* Append */
			this.$el.html(compiledTemplate);

			
			
			
			// validate form
			//Utils.form.validatorForm('securityData');

			// disbaled copy / paste of inputs : email & password
			/*$('#emailClone,#password,#passwordClone,#secretQuestionAnswer').bind('copy paste', function (e) {
		       e.preventDefault();
		    });*/

			/* Update header */
			//Utils.header.setLeftButton('Retour','back','#join/step1'); // call step1  //javascript:history.back();
			//Utils.header.setRightButton('Aide','help  xitiClick','#popin/id/mtra_popup-besoin-aide',"s2=4&p=Inscription2::aide");

			// onchange select indicatif
			//Utils.Functions.indicatifPrefix();

		}

	});

	/*-------------------- MODULE --------------------*/

	return {
		id:'joinStep2',
		level:2,
		view:View
	};

});
