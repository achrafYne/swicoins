// Filename: utils.js
define([
	'jquery',
	'serialize',
	'underscore',
	'backbone',
	'view/header',
	'view/navigation',
], function($, Serialize, _, Backbone, Header, Navigation) {

	Utils = {

		/*-------------------- Navigation --------------------*/

		navigation:{
			activate:function(){ Navigation.activate.apply(Navigation,arguments); },
			hide:function(){ Navigation.hide.apply(Navigation,arguments); },
			setBadge:function(){ Navigation.setBadge.apply(Navigation,arguments); }
		},

		/*-------------------- Header --------------------*/
		header:{
			setLeftButtonAndAddRetour:function(){ Header.setLeftButtonAndAddRetour.apply(Header,arguments); },
			setLeftButton:function(){ Header.setLeftButton.apply(Header,arguments); },
			setLeftButtonWithCheckNetwork:function(){ Header.setLeftButtonWithCheckNetwork.apply(Header,arguments); },
			setRightButton:function(){ Header.setRightButton.apply(Header,arguments); }
		},

		/*-------------------- Session --------connexion------------*/

		session:{
			
			check:function(params){
				var obj = params || {};
					
				obj.valid = obj.valid || function(){};
				obj.expired = obj.expired || function(){};

				if(null != Utils.storage.get('token',false)) obj.valid();
				else obj.expired();
			},
			save: function(login, mobile, pass){  

				$.cookie("email", login, { expires: 3650 }); //SETS IN DAYS (10 YEARS)
				$.cookie("password", pass, { expires: 3650 }); //SETS IN DAYS (10 YEARS)
				$.cookie("mobile", mobile, { expires: 3650 }); //SETS IN DAYS (10 YEARS)
			}

		},


		/*-------------------- Storage --------------------*/
		
		storage:{

			set:function(row,key,value,persistent){  

				var type = (persistent)? window.localStorage : window.sessionStorage,
					action = (persistent)? 'localStorage' : 'sessionStorage';
				if(type && type != undefined){
					/* get previously stored row */
					var data = Utils.storage.get(row,persistent) || {};
					/* Add key / value pair or update */
					data[key] = value;
					/* Update stored data */
					if(data) {
						type.setItem(row,JSON.stringify(data)); 
					}
					if(DEBUG) console.log(key+' value of '+row+' stored in '+action);
					return true;
				};
				return false;

			},

			get:function(row,persistent){  

				var type = (persistent)? window.localStorage : window.sessionStorage,
					action = (persistent)? 'localStorage' : 'sessionStorage';
				if(type){
					var data = type.getItem(row);
					if(DEBUG) console.log(row+' read from '+action);
					return (data) ? JSON.parse(data) : null;
				};
				return false;

			},

			destroy:function(row,persistent){
				
				var type = (persistent)? window.localStorage : window.sessionStorage,
					action = (persistent)? 'localStorage' : 'sessionStorage',
					rows = ('string' == typeof row)? [row] : row;
				if(type){
					for(var i=0; i<rows.length; i++){
						type.removeItem(rows[i]);
						if(DEBUG) console.log(rows[i]+' removed from '+action);
					};
				};

			},

			clear:function(persistent){
				
				var type = (persistent)? window.localStorage : window.sessionStorage,
					action = (persistent)? 'localStorage' : 'sessionStorage';
				if(type){
					type.clear();
					if(DEBUG) console.log(action+' cleared');
				};
			},
		},

		/*-------------------- Service Call --------------------*/

		service:{
			call:function(params){
				if(!Utils.isConnectedNetwork()){
					return false;
				}

				if (DEBUG) console.log("CallService");
				if (DEBUG) console.log(Utils.storage.get('token'));
				if (DEBUG) console.log("params.data > ",params);

				var os = "";
				if( Utils.isMobile.iOS() ) os = "ios";
				if( Utils.isMobile.Android() ) os = "android";
				if( Utils.isMobile.Win7() ) os = "wince";
				if( Utils.isMobile.Win8() ) os = "win32nt"; 

				var parser = new UAParser(),
					userA = parser.getDevice().vendor + ' ' + parser.getDevice().model + ' ' + parser.getOS().name + ' ' + parser.getOS().version;

				var params = params || {},
					isDir = ('/' == params.name.charAt(params.name.length-1)),
					ext = (ISLOCAL && !isDir)? '.json' : '';
					Utils.service.finish();// remove class loading
					$(".content").append('<div class="load"><img src="'+SITEURL+'/css/loading.gif" /></div>');
					$(".inner").addClass('loading');  
				$.ajax({
					/*headers: {                   
		                "Os": os,
		                "Build": Utils.storage.get('build',true).build,
		                "Device": userA
		  			},*/
				    url: USEPROXY
                        ? (( PROXYURL || SITEURL  ) + 'proxy.php?url='+ encodeURIComponent(CMSURL+params.name+ext) +'&mode=native&full_headers=0&full_status=0')
                        : ( CMSURL+params.name+ext )
                        ,
					cache:false,
					dataType:'json',
					type:'POST',
					data:JSON.stringify(params.data) || {},
					success: function(response){
						// check if there is error on errorKey exist
						if(response.errorKey){
							Errors.trigger({errorKey: response.errorKey} , false);
							//return;
						}
						params.success(response) || function(){}
					},
					error:function(response){ 
						// error status 404
						/*if(response.status !=404){
							var err = {};
							
							try{
								var err = eval('(' + response.responseText + ')');
								err.crached = false;
							}catch(e){
								// error status 500
								if(response.status == 500){
									Errors.trigger({errorKey: 'server.error'} , false);
								}else{
									// check token	
									if(jQuery.isEmptyObject(Utils.storage.get('token'))){
										Errors.validateToken();
										return;
									} 
									// check format of response (html or json)
									if( response.getResponseHeader("content-type").indexOf("json") == -1 || ( response.readyState == 0 && response.status == 0 ) ){ 
										Errors.trigger({errorKey: 'server.jsonbadformat' , type : e.message} , false); 
										Utils.service.finish();// remove class loading 
									} 
									
								}
								err.crached =  true;
							}
						
							if(!err.crached) { Errors.generateErrorsWS(err); }
								
							}else{
								Utils.popin.unable();
							}*/

						if( params.error ) { params.error(response) || function(){} }
						Utils.service.finish();// remove class loading
					}
				});

			},
			finish: function(page){
				if(!page){
					$(".loading").removeClass('loading');
				}else{	
					var currentPage = Utils.getCurrentPage();
					if(currentPage == page){
						$(".loading").removeClass('loading');
					}
				}
				$(".load").remove();
			},
			refresh: function(){
				// delete all local storage
				//localStorage.clear();
				var arr = ['email', 'mobile', 'type'];
				Object.keys(localStorage).forEach(function(key){  
		            if ( jQuery.inArray(key,arr) == -1 ) {
		                localStorage.removeItem(key); 
		            } 
		        }); 

				location.reload(true);
				if( location.hash != "#home" ){
					Utils.service.redirectHome();
				}
			},
			redirectHome:function(){
				Utils.router.navigate('#home',{ trigger:true }); 
			}
		},
			
		getCurrentPage:function(){

			var location = top.location.href;
			var page = location.replace(SITEURL + "#" ,"");
			return page;
		},
			
		/*-------------------- SendInvitation --------------------*/
		
		sendInvitations:function(recipientLogins){
			var tabRecipientLogins = recipientLogins;
			
			try{
				var data2 = { token:Utils.storage.get('token',false), "parameter" : { "@class" : "message", "message" : "Invitation sur Kwixo !" } };
				jQuery.each( tabRecipientLogins, function() {
					var login = this.replace(/^\s+/g,'').replace(/\s+$/g,'');//RegEx de Trim()
					login = login.replace(/ /g,"");
					Utils.service.call({
						name : 'makeInvitation/'+login,
						data : data2,
						success : function(response){
							Utils.service.finish();// remove class loading									
						}
					});
				});
			}catch(ex){
			}
		},
		
		
		/*-------------------- Form validation --------------------*/

		form:{

			modelMemorize:function(field){
				var root = field.getAttribute('data-root') || field.form.getAttribute('data-root') || false,
					key = field.name,
					value = ('checkbox' == field.type)? field.checked : $(field).val(),
					obj = {};
					
					if ( field.id == "prefixregister" ) { return; }
					if ( field.id == "birthDate" ) {
						var dt = $(field).val().split('/');
						value = dt[2]+'-'+dt[1]+'-'+dt[0];
					}

				/* If is sub object */
				if(root){
					/* Build obj */
					obj[root] = {};
					obj[root][key] = value;
				} else {
					obj[key] = value;
				};
				/* Udpate model */ 
				this.set(obj);
			},

			validate:function(e,callback){
		
				var form = e.target,
					$fields = $('input,select,textarea',form).not('input[type="submit"]'),
					row = form.name,
					data = $(form).serializeObject(),
					errors = [],
					lastField = null;

				/* Per field check */
				$fields.each(function(){
					
					/* Memorize value */
					// Utils.form.memorize(this);

					/* Check */
					switch(this.type){
						case 'radio':
							var val = $('input[name="'+this.name+'"]').val(),
								req = ('required' == this.getAttribute('required'));
							if(undefined == val && req) errors.push(this);
							break;
						case 'checkbox':
							var req = ('required' == this.getAttribute('required')),
								checked = this.checked;
							if(req && !checked) errors.push(this);
							break;
						default:
							
							var val = this.value,
								pat = this.getAttribute('pattern') || false,
								reg = (pat)? new RegExp(pat,'ig') : false,
								req = ('required' == this.getAttribute('required'));
							
							/* Check */
							if((req || '' != val) && (pat && !reg.test(val))){
								errors.push(this);
							};
							
							/* Confirmations fields */
							if(lastField && lastField.name+'Clone' == this.name){
								if(lastField.value != this.value){
									errors.push(this);
								};
							};

							break;
					};
					lastField = this;
				});

				/* Callback on success */
				if(0 == errors.length || !VALIDATE){
					callback(data);
				/* Or display errors */
				} else {
					
					/* Message */
					Utils.popin.open({ content:'form-error', data:{} });

					for(var i=0; i<errors.length; i++){
						var field = errors[i];
						// $(field).bind('focus click',Utils.form.clear).parents('.field,.sub').addClass('error');
					};
				};

				e.preventDefault();
				return false;

			},
			validatorForm: function(form){ 
			
			
				// form validate / step1 / step2 / step 3
				 var validator = $('form[data-root= '+form+']').validate({
					rules: {
						firstName: { 
							maxlength: 20,
							lettersonly: true
						},
						lastName: { 
							maxlength: 40,
							lettersonly: true
						},
						address: { 
							maxlength: 32
						},
						zipCode: { 
							number: true,
							minlength: 4,
							maxlength: 5
						},
						password: {
							required: true,
							minlength: 5,
							maxlength: 25,
							passwordValide: true
						},
					    passwordClone: {
					    	required: true,
					      	equalTo: "#password",
							passwordValide: true
					    },
						passwordOld: {
							required: true,
							minlength: 5,
							maxlength: 25,
							passwordValide: true
						},
						email: {
							required: true,
							maxlength: 70
						},
					    emailClone: {
					    	required: true,
					     	equalTo: "#email"
					    },
					    birthDate: {
					    	DateValide: true
					    },
					    professionnalCategory:{
					    	required: true
					    },
					    mobile: {
					    	number: true
					    },
					    secretQuestionAnswer:{
					    	maxlength: 30
					    },
					    cardCode:{
					    	required: true,
					    	number: true
					    },
					    crypto:{
					    	required: true,
					    	number: true
					    },
						code:{
							required: true,
					    	number: true,
							minlength: 4,
							maxlength: 4
						}
					},
					messages: {
						firstName: "",
						lastName: "",
						zipCode: "",
						password: "",
						birthDate: "",
						professionnalCategory: "",
						mobile: "",
						secretQuestionAnswer: "",
						cardCode: ""
					},
					focusInvalid: false,

					errorPlacement: function(error, element) {

					},

					highlight: function(element, errorClass, validClass) {
						var $item = $(element);
					    $item.parents('.field').addClass('error'); 
					},

					unhighlight: function(element, errorClass, validClass) {
					    $(element).parents('.field').removeClass('error');
					},
					invalidHandler: function(f, v) {
						Errors.loadErrorTextById( v.errorList );  
					}
				});

				/* 
				* Trigger Error on Blur on each input text
				*/
				$('form[data-root= '+form+']').find('input').blur(function(){
					$(this).valid();
				});

			},
			checkStrength: function(password){
			    
				//initial strength
			    var strength = 0;
				
			    //if the password length is less than 5, return message.
			    if (password.length < 5) { 

					$('#result').removeClass();
					$('#result').addClass('short');
					return 'Trés faible';

				}
			    
			    //length is ok, lets continue.
				
				//if length is 6 characters or more, increase strength value
				if (password.length > 5) strength += 1;
				
				//if password contains both lower and uppercase characters, increase strength value
				if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  strength += 1;
				
				//if it has numbers and characters, increase strength value
				if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))  strength += 1;
				
				//if it has one special character, increase strength value
			    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~,",',(,-,è,ç,à,),=,+,°])/))  strength += 1;
				
				//if it has two special characters, increase strength value
			    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
				
				//now we have calculated strength value, we can return messages
				
				//if value is less than 2
				if (strength < 2 ) {

					$('#result').removeClass();
					$('#result').addClass('weak');
					return 'Faible';

				} else if (strength == 2 ) {

					$('#result').removeClass();
					$('#result').addClass('good');
					return 'Moyen';

				} else {

					$('#result').removeClass();
					$('#result').addClass('strong');
					return 'Fort';

				}

			},
			validatorFormInfo: function(form){

				$('form.'+form).validate({
					rules:{
						zipCode: { 
							number: true,
							minlength: 4,
							maxlength: 5
						},
						email1: { 
							lettersonlyemail: true
						},
						email2: { 
							lettersonlyemail: true
						},
						email3: { 
							lettersonlyemail: true
						},
						email4: { 
							lettersonlyemail: true
						}
					},
					errorPlacement: function(error, element) {},

					highlight: function(element, errorClass, validClass) {
						var $item = $(element);
					    $item.parents('.field').addClass('error'); 
					},

					unhighlight: function(element, errorClass, validClass) {

					    $(element).parents('.field').removeClass('error');

					},
					invalidHandler: function(f, v) { 
							//Errors.loadErrorTextById( v.errorList ); 
					}
				});
			},

			validatorFormAskSend: function(form){

				$('form[name='+form+']').validate({
					rules:{
						amount:{
							amountValid: true,
							maxlength: 13
						},
						email:{
							lettersonlyemail: true
						}
					},
					errorPlacement: function(error, element) {},

					highlight: function(element, errorClass, validClass) {
						var $item = $(element);
					    $item.parents('.field').addClass('error'); 
					},
					focusInvalid: false,

					unhighlight: function(element, errorClass, validClass) {

					    $(element).parents('.field').removeClass('error');

					},
					invalidHandler: function(f, v) { 
						Errors.loadErrorTextById( v.errorList ); 
					}
				});
			},

			clear:function(){
				$(this).unbind('focus click',Utils.form.clear).parents('.field,.sub').removeClass('error');
			},
			clearPassword:function(){
				$("#passwordMobile").val("");
			}

		},
		
		/*-------------------- Call Back Card --------------------*/
		fakeCardCallback: function(from)
		{
			Utils.cardCallback({"version":"mock v 1.0","test":"O","codereponse":"00000","typecarte":"","finvalidite":"1401","pan_6":"439638","pan_2":"56","empreinte_carte":"4396384693274856","id_carte":"5600000439638","handle":"MOCKHandle","CVX2":"123"},from);
		},
		
		cardCallback: function(reponse,from){
			if(DEBUG) console.log("from : " + from);
			if(DEBUG) console.log(reponse);
			
			
			if (reponse.codereponse=='01010')
			{	Utils.popin.open({ data:{ title:'Erreur', content: 'Date de fin de validité incorrecte !' } });	}
			else
			{
				if (reponse.codereponse=='01011')
				{	Utils.popin.open({ data:{ title:'Erreur', content: 'Numéro de carte incorrect !' } });	}
				else
				{
					if (reponse.codereponse!='00000')
					{	Utils.popin.open({ data:{ title:'Erreur', content: 'Votre carte n\'a pas été acceptée par le système !' } });	}
					else
					{
						/* Confirm Inscription */
						if(from == 'join'){
							
							this.storage.set('reponseJoinCard','reponseJoinCard',reponse,false);
							Utils.router.navigate('join/final',{trigger:true,replace:false });
							
							
						/* Add Card */	
						}else if(from == 'send' || from == 'ask' || from == 'profil'){

							var data = {
								token:Utils.storage.get('token',false),
								parameter:{ "@class":"addMeanOfPayment",
											"bankData":{
															"typecarte" : reponse.typecarte,
															"finvalidite" : reponse.finvalidite,
															"pan_6" : reponse.pan_6,
															"pan_2" : reponse.pan_2,
															"empreinte_carte" : reponse.empreinte_carte,
															"id_carte" : reponse.id_carte,
															"handle" : reponse.handle,
															"CVX2" : reponse.CVX2,
															"codereponse" : reponse.codereponse,
															"nom_carte" : "Carte_New_1"
														}
											}
							};				

							Utils.service.call({
													name:'addMeanOfPayment',
													data:data,
													success:function(response){ 
																		if(DEBUG) console.log(response);
																		
																		if (response.error)
																		{
																			Utils.popin.open({ data:{ title:'Erreur technique', content: response.error.errorMessage } });	
																		}
																		else
																		{
																			if(from == 'send'){
																				Utils.router.navigate('user/send/form',{trigger:true,replace:false });
																			}else if (from == 'ask') {
																				Utils.router.navigate('user/ask/form',{trigger:true,replace:false });
																			}else{
																				Utils.router.navigate('user/others/profile/bank',{trigger:true,replace:false });
																			}
																		}
																		Utils.service.finish();// remove class loading
													}
							});
						
						}
					}
				}
			
			}
		},
		isConnectedNetwork : function(){
			var isConnected = false;
			if(PHONEGAP){
				try{
					var networkState = navigator.connection.type;
					if(networkState != "none"){
						isConnected = true;
					}
				}catch(ex){
					
				}
				if(!isConnected){
					Utils.popin.open({ data:{ title:'Problème de connexion Internet', content: "L’application nécessite une connexion Internet." } });
				}
			}else{
				isConnected = true;
			}
			
			return isConnected;
		},
		
		/*-------------------- File --------------------*/
		file:{
			check:function(){
				
			},
			load:function(){

			}
		},
		isEmailValid:function(email)
		{
			
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},
		isNumberValid:function(number)
		{
			var numberTrim = number.replace(/\s/g, '');
			var reg = /([0-9]|\+33\s?)(\s?\d{2})/ ;
			return reg.test(numberTrim);
		},

		/* Validate recipientLogins */
		validateRecipientLogins:function(recipientLogins){
			var recipientValid = true;
			var recipientLoginsTab = ( recipientLogins.indexOf(',')>-1 ) ? recipientLogins.split(',') : recipientLogins.split(" ");
			jQuery.each(recipientLoginsTab, function(indx, val) {
				var isEmailValid = Utils.isEmailValid(val);
				var isNumberValid = Utils.isNumberValid(val);
				if(!isEmailValid && !isNumberValid){
					recipientValid = false;
				}
			});
			return recipientValid;
		},

		/*-------------------- Formatage Data --------------------*/
		formatAmountForWS:function(amount){
			var amountStr = new String(amount);
			amountStr = amountStr.replace(',','.');
			var amountFormated = parseFloat(amountStr);
			amountFormated = amountFormated.toFixed(2);
			return amountFormated;	
		},
		formatDateFrToEn:function(dateFr){
			
			var dateTab = dateFr.split('/');
			dateEn= [dateTab[2],dateTab[1],dateTab[0]].join("-");
			return dateEn
		},
		/*-------------------- Popin --------------------*/
		popin:{
			opened:null,
			open:function(data){				

				require(['view/popin'],function(Popin){
					Popin.load(data);
				});

			},
			offline:function(){
				Utils.router.navigate('popin/content/connexion-error',{ trigger:true });
			},
			unable:function(){
				Utils.popin.open({ data:{ title:'Erreur', content:'Impossible de charger cette ressource.' } });
			},
			close: function(){
				$('.popin').remove();
			}
		},
		params:{
			// Params global ( prefixs / page inscripion + confirmation ( ask + send ) ) 
			prefixs: [
						{"diallingCode":"+33","countryName":"(+33) France métropolitaine"},
						{"diallingCode":"+590","countryName":"(+590) Guadeloupe"},
						{"diallingCode":"+594","countryName":"(+594) Guyane"},
						{"diallingCode":"+262","countryName":"(+262) La Réunion"},
						{"diallingCode":"+352","countryName":"(+352) Luxembourg"},
						{"diallingCode":"+596","countryName":"(+596) Martinique"}
					],
			countries: [
						{ countryCode :"FR", countryName:"France" },
						{ countryCode :"GP", countryName:"Guadeloupe" },
						{ countryCode :"GF", countryName:"Guyane" },
						{ countryCode :"RE", countryName:"La Réunion" },
						{ countryCode :"MQ", countryName:"Martinique" },
						{ countryCode :"LU", countryName:"Luxembourg" }
					],
			professionnalcategories: [
				"Agriculteur exploitant",
				"Artisan, commerçant et chef d'entreprise",
				"Cadre du secteur privé et profession indépendante",
				"Profession intermédiaire",
				"Employé",
				"Ouvrier",
				"Retraité",
				"Autre, sans activité professionnelle"
			],		
			contentnotfound : "Cette page est en cours de maintenance. Veuillez nous excuser pour la gêne occasionnée.",
			monthNamesShort: ['janv.','févr.','mars','avril','mai','juin','juil.','août','sept.','oct.','nov.','déc.']
			},
			content: {
				notfound:function(){
					Utils.popin.open({
						data:{
							content:Utils.params.contentnotfound,
							nobuttons:false,
							closeWithAction:true,
							valid:function(){ 
								Utils.popin.close(); 
							}
						}
					});
				}
			},
			isMobile: { 
			    Android: function() {
			        return navigator.userAgent.match(/Android/i);
			    },
			    iOS: function() {
			        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			    },
			    iOS7: function() {
			        return navigator.userAgent.match(/OS 7|OS 6/i);
			    },
			    Windows: function() {
			        return navigator.userAgent.match(/IEMobile/i);
			    },
			    Win7: function() {
			        return navigator.userAgent.match(/Windows Phone 7/i);
			    },
			    Win8: function() {
			        return navigator.userAgent.match(/Windows Phone 8/i);
			    },
			    LG610: function() {
			        return navigator.userAgent.match(/LG-E610/i);
			    },
			    mobile: function() {
			        return (Utils.isMobile.Android() || Utils.isMobile.iOS() || Utils.isMobile.Windows());
			    }
			},
			Functions: {
				init:function(){     
					Utils.Functions.hideKeyboardOnEnter();// disactivate enter keyboard
					Utils.Functions.hideKeyboardOnResize(); // hide nav on display keyboard  
					Utils.Functions.RefreshPage(); // check connection on navigate in the page   
				},     

				hideKeyboardOnEnter: function() {
				    $(document).on('keypress','input,select,textarea', function(ev){
				    	var e = ev || window.event,
				    	 	charCode = (typeof e.which == "number") ? e.which : e.keyCode;
					    if( charCode == 13 ){
						    document.activeElement.blur();
						    $("input").blur();
						    return false;
					    }
				    });
				}, 
				// fix bug redirect
				hideKeyboardOnResize: function () {
						$(window).resize(function(){ 
							//Utils.Functions.resizePopin();

							var ios7 = (Utils.isMobile.iOS()  && device.platform == 'iOS' && parseInt(device.version) >= 7);

							if ( !$(".auth").length && !$(".joinForm").length && !$(".money").length && !$(".forgetpass").length ){
								var height = $(window).height();
								if (height < 350){ // adjust this height value conforms to your layout
									$('nav').hide();
									$('.content section').css("bottom","0");
								}
								else {
									$('nav').show();
									$('.content section').css("bottom","50px");
								}
							}
						});
						
				},

				RefreshPage: function(){
					$(document).on("click", ".refresh", function(){
						if(!Utils.isConnectedNetwork()){
							return false;
						}
					});
				} 
			}

	};	

	/*-------------------- Deffered router - Circular dependencie --------------------*/

	require(['router'],function(Router){
		
		Utils.router = {
			navigate:function(){ Router.navigate.apply(Router,arguments); },
			refresh:function(){alert("refresh");Backbone.history.stop(); Backbone.history.start();}
		}

	});

	return Utils;

});
