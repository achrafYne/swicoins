// Filename model/join.js
define([
	'backbone',
	'underscore',
	'utils'
], function(Backbone, _, Utils){

	/*-------------------- CONFIG --------------------*/

	var Model = Backbone.Model.extend({
			defaults:{
				
				/* Overall */
				completed:0,
				prefixs: Utils.params.prefixs,
				countries: Utils.params.countries,
				
				/* Personal Data */
				personalData:{

					firstName:'',
					lastName:'',
					Email:'',
					Pass:''

				},
				
				/* Carte Data */
				securityData:{ 
					typecarte:'',    
					number_carte:'',
					monthYear:'',
					security_code:'',

				},

				/* my Adresses */
				myAdresses:{

					firstAdresse:'',
					secondAdresse:'',
					state:'',
					city:'',
					zip:'',
					country:'',
					handle:'',
					phone:''

				}

			},

			/*-------------------- Methods --------------------*/
			init:function(){
				var model = this;
				model.set({ registerFinish:0 }); 
			},	
			getSecretQuestions:function(){
				
				var model = this;

				/* Call for secret questions list */
				Utils.service.call({
					name:'anon/getSecretQuestions/',
					success:function(response){
						model.set({ questions:response.secretQuestions }); 
						$(".loading").removeClass('loading');
						Utils.service.finish();// remove class loading
					}
				});
			},

			getInternationalDiallingCodes:function(){
				
				var model = this;

				/* Call for secret questions list */
				Utils.service.call({
					name:'anon/getInternationalDiallingCodes/',
					success:function(response){
						if( response.phoneCountryCodes )  model.set({ prefixs:response.phoneCountryCodes }); 
						$(".loading").removeClass('loading');
						Utils.service.finish();// remove class loading
					}
				});
			},
			getRegisterNewUserIframeUrl:function(){
				
				var model = this,
	                securityData = model.get('securityData'),
	                data = {
                                "parameter":
                                {
                                    "@class":"urlReturn",
                                    "data":URL_PAYBOX_RETURN
                                }
                            };    

                Utils.service.call({
                    name:'anon/getRegisterNewUserIframeUrl/'+securityData.email,
                    data:data,
                    success:function(response){ 

                        if( response.url ){
                            model.set({registerNewUserIframeUrl:response.url + escape("?from=join")})
                        }; 
                        $(".loading").removeClass('loading');
                        Utils.service.finish();// remove class loading
                    }
                });
				
			},
			registerUserParEmail:function(){
				var model = this;
				if(DEBUG) console.log("register per email !");
				if(Utils.storage.get('reponseJoinCard',false)){
					if(DEBUG) console.log("register per email");
					JoinModel.registerUser(Utils.storage.get('reponseJoinCard',false));
				}
			},
			registerUser:function(reponseBankData){
				if(DEBUG) console.log("registerUser");
				var model = this;
				var reponse = Utils.storage.get('reponseJoinCard',false);
				

				
				model.get('bankData').empreinte_carte = reponseBankData.reponseJoinCard.empreinte_carte;
				model.get('bankData').typecarte = reponseBankData.reponseJoinCard.typecarte; 
				model.get('bankData').typecarte = reponseBankData.reponseJoinCard.typecarte; 
				model.get('bankData').finvalidite = reponseBankData.reponseJoinCard.finvalidite;
				model.get('bankData').pan_6 = reponseBankData.reponseJoinCard.pan_6;
				model.get('bankData').pan_2 = reponseBankData.reponseJoinCard.pan_2;
				model.get('bankData').id_carte = reponseBankData.reponseJoinCard.id_carte;
				model.get('bankData').handle = reponseBankData.reponseJoinCard.handle;
				model.get('bankData').CVX2 = reponseBankData.reponseJoinCard.CVX2;
				model.get('bankData').codereponse = reponseBankData.reponseJoinCard.codereponse;
				model.get('bankData').nom_carte = '';	
				
				
				var data = {
						    "parameter": {
						        "@class": "registerUser",
						        "personalData": model.get('personalData'),
						        "securityData": model.get('securityData'),
						        "bankData": model.get('bankData')
						    }
						};

				if(DEBUG) console.log(data);
				if(2 == model.get('completed')){
					Utils.service.call({
							name:'anon/registerUser',
							data:data,
							success:function(response){
								//alert("finish");
								
								if(Utils.storage.get('isReceivedMoney',false)){
									
									var fullNameReceivedMoney = Utils.storage.get('fullNameReceivedMoney',false).fullNameReceivedMoney,
										amountReceivedMoney = Utils.storage.get('amountReceivedMoney',false).amountReceivedMoney;
									model.set({ isReceivedMoney:1, fullNameReceivedMoney:fullNameReceivedMoney, amountReceivedMoney : amountReceivedMoney });
								}
								
								model.set({ registerFinish:1 });
								if(DEBUG) console.log(response);
								if(DEBUG) console.log(model);
								$(".loading").removeClass('loading');
								Utils.service.finish();// remove class loading

							}
					});
				}

				
			},
			
			
			
			reset:function(){
				this.set(this.defaults);
				
			}
		}),
		Instance = new Model();

	// Return the model for the module
	return Instance;

});