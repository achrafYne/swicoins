// Filename: passwordRecovery.js
define([
	'jquery',
	'jqueryvalidator',
	'underscore',
	'backbone',
	'utils',
	'model/passwordRecovery',
	'text!templates/passwordRecovery.html'
], function($, jqueryvalidator, _, Backbone, Utils, PasswordModel, PasswordTpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({
		
		/*-------------------- INIT --------------------*/
		initialize:function(params){
		
			/* View / Model association */
			var that = this;

			if(params && params.params.crypt && params.params.key){
				PasswordModel.reset();
				var data = {
					"@class":"findUserSecretQuestion",
					"encodeValue": params.params.crypt,
					"key":params.params.key
				};
					
				Utils.service.call({
					name:'anon/findUserSecretQuestion/',
					data:data,
					success:function(response){
						PasswordModel.set({
							step:3,
							id:response.findUserSecretQuestion.id,
							question:response.findUserSecretQuestion.secretQuestionDTO.label
						});
						Utils.service.finish();// remove class loading
					}
				});
				
			}
				
				
			/* Bind model changes that need the view to refresh */
			PasswordModel.bind('change:step',function(){ that.render(); });
			
		},
		/* Unlink model to prevent multiple binding and save resources */
		unlink:function(){
			PasswordModel.off();
		},
		/*-------------------- EVENTS --------------------*/
		events:{
		
			//'submit .emailForm':'gotoSecretQuestion',
			'submit .emailForm':'sendPassword',
			'submit .answerForm':'createNewPassword',
			'change input:not([type="submit"],[type="checkbox"])':'memorize'
		},
		/*-------------------- HANDLERS --------------------*/
		memorize:function(e){
			Utils.form.modelMemorize.call(PasswordModel,e.target);
		},
		sendPassword:function(e){
			
			var view = this;

			/* Validation */
			Utils.form.validate(e,function(data){
				
				/* Call service */
				Utils.service.call({
					name:'anon/emailUpdatePasswordLink/'+PasswordModel.get('email'),
					success:function(response){
						PasswordModel.set({
							step:2
						});
						Utils.service.finish();// remove class loading
					}
				});

			});
			e.preventDefault();
			return false;
		},
		createNewPassword:function(e){
				

				/* Validation */
				Utils.form.validate(e,function(serialized){
					var answer = serialized.secretQuestionAnswer,
						password = serialized.password,
						data = {
							"@class":"setModifyExternalPassword",
							"id":PasswordModel.get('id'),
							"questionAnswer":answer,
							"newPassword":password,
							"scorePassword":10
						};

					/* Call service */
					Utils.service.call({
						name:'anon/changePasswordNotConnected/',
						data:data,
						success:function(response){
							Utils.popin.open({
								content:'confirmation-changePasswordNotConnected',
								data:{
									nobuttons:true,
									token:Utils.storage.get('token',false),
									valid:function(){
										top.location = SITEURL+'#home';
									}
								}
							});
							Utils.service.finish();// remove class loading
						}
					});
				});
			e.preventDefault();
			return false;
		
		},

		/*-------------------- RENDER --------------------*/

		render:function(isGlobal){


			/* Is rendering operation called from Router */
			// validate form
			if(isGlobal){
				
			}
			
			/* Vars */
			var	compiledTemplate = _.template(PasswordTpl, { model:PasswordModel });
			
			/* Append */
			this.$el.html(compiledTemplate);

			// disbaled copy / paste of inputs : email & password
			$('#password,#passwordClone,#secretQuestionAnswer').bind('copy paste', function (e) {
			   e.preventDefault();
			});
						
			/* Update header */
			Utils.header.setLeftButton('Retour','back','javascript:history.back();');
			Utils.header.setRightButton('Aide','help','#popin/id/mtra_popup-besoin-aide');

			
			Utils.form.validatorForm('answerForm');

		}

	});

	/*-------------------- MODULE --------------------*/

	return {
		id:'passwordRecovery',
		level:1,
		view:View
	};

});



