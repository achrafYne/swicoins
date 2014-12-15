/*
*  Error Systeme Manager
* 
***/
define(['jquery' ,'underscore','backbone','view/popin'] , function($,_,Backbone , Popin){

	var Erros = {
		/*
		* Extract the Error From key code
		**/

		error : function(err){
		
		if (DEBUG) console.log("ERREUR > ",err);
			err = err.errorKey;
			var arr = err.split('.') || [],
				obj = {};
				obj.technical = ( err === "technical" ) ? true :false;
			if( (arr.length > 1)  && ! obj.technical){
				obj = { space : arr[0] , name :arr[1]};
			}else if(!obj.technical){
				obj.unknown = true;
			}
		
			return obj;
		},

		/*
		*  Error 404 // on load ressoures
		*/
		unable : function(){
			
			//console.log('error is triggerr------------->');
			Popin.load({ data:{ title:'Erreur', content:'Impossible de charger cette ressource.' } });
		},

		/*
		* Return the file path by keycode 
		*/
		
		path : function(obj){
				//return obj.space+'/'+obj.name;
				return obj.space;
		},

		/*
		* Load Error from Local
		*/
		getLocal : function(er){
			var obj = this.error(er);
			if(obj.technical){
				this.trigger(er,true);
			}else if(obj.space && obj.name){
				this.localLoad({content : er.errorKey , type : er.type || null, errorMessage : er.errorMessage});
			}
		},

		/*
		* generate error key
		*/
		validateToken : function(){ 
			this.tokenExpiredOrBad();
		},
		tokenExpiredOrBad:function(){
			Utils.popin.open({
				data:{
					content:'Votre session a expiré, veuillez vous reconnecter',
					nobuttons:false,
					closeWithAction:true,
					valid:function(){
						Utils.popin.close();
						Utils.service.redirectHome();
						Utils.service.refresh();
					}
				}
			}); 
		},
		/*
		* generate error key
		*/
		generateErrorsWS : function(err){
				var key = err.error.errorKey,
					messageError = err.error.errorMessage,
					that = this;

				// bad session
				if( key.indexOf("authentication.badtokenkey") != -1 || key.indexOf("authentication.expiredtoken") != -1 ){
					this.tokenExpiredOrBad();
				}
				
				if( !err.errorKey || err.error ){ that.trigger(err.error , true); }

				if(key.indexOf("authentication.") != -1 ){
					Utils.popin.open({
						data:{
							content:messageError,
							nobuttons:false,
							closeWithAction:true,
							valid:function(){
								if(Utils.storage.get('token',false)){ history.back();
								}else{ Utils.router.navigate('#home',{ trigger:true }); }
								
								Utils.popin.close();
								Utils.service.redirectHome();
								Utils.service.refresh();
							}
						}
					});
				
				}

				// register via email
				if(key.errorKey  == "register.par.email"){
										
					var registerParEmailcountAttemptObj = Utils.storage.get('registerParEmailcountAttempt',false);
					
					if(Utils.storage.get('registerParEmailcountAttempt',false) == null || registerParEmailcountAttemptObj.registerParEmailcountAttempt == -1){
					
						Utils.popin.open({
							content:'email-already-use',
							data:{
								nobuttons:true,
								valid:function(){
									Utils.storage.set('IsRegisterParEmail','IsRegisterParEmail',true,false);
									Utils.router.navigate('join/step3',{ trigger:true });
									Utils.popin.close();
								}
							}
						});
						
						Utils.storage.set('registerParEmailcountAttempt','registerParEmailcountAttempt',1, false);
					}else{
						var countAttempt = registerParEmailcountAttemptObj.registerParEmailcountAttempt;
						if(countAttempt >= 3){
							Utils.storage.set('registerParEmailcountAttempt','registerParEmailcountAttempt',-1, false);
							
							Utils.popin.open({
								content:'register-par-email-cancel',
								data:{
									nobuttons:true,
									valid:function(){
										Utils.popin.close();
										Utils.service.redirectHome();
										Utils.service.refresh();
									}
								}
							}); 
							
						}else if(countAttempt > 0){
							require(['text!templates/popin/register-par-email-error.html'],function(tpl){

								var remainingAttempt = 3 - countAttempt;
								var textCount = '';
								if(remainingAttempt == 1){
									textCount = '1 essai';
								}else{ textCount = remainingAttempt + ' essais'; }
								
								var text = tpl.replace('_TEXTCOUNT_',textCount);
								Utils.popin.open({ data:{ title:'', content:text } });
								
								countAttempt++;
								Utils.storage.set('registerParEmailcountAttempt','registerParEmailcountAttempt',countAttempt, false);
							}); 
							Utils.router.navigate('join/step3',{ trigger:true });
						}
						
					}
					
				}
				 if(key  == "register.par.cb") Utils.router.navigate('join/step3registerParCB',{ trigger:true });
					
				if(key == "authentication.accountDisabled") 
					Utils.router.navigate('user/others/reactivateAccount',{ trigger:true }); 

				//that.trigger(err.error , false); 
		},
		trigger : function(err , status){
			if(err != null && err.errorKey != ""){
				

				var tt = err.errorKey ? err.errorKey : 'Error',
					params = {
						forcemessage : (err.errorKey == 'technical') ? true :false,
						content : err.errorMessage || '',
						title : '' /*( err.errorKey == "technical" ) ? '' : tt*/,
					};
				if(status){

					if(DEBUG){console.log("erreur trigger -> affichage POPIN");}
					//Popin.close();
					Popin.create({data :params});
				}else{
					this.getLocal(err);
				}
			}else{
				this.unable();
			}
		},
		/*
		*  Load the Error Message on errors.html by keyCode
		*/
		localLoad : function(params){
				var that = this;
			require(['text!templates/popin/errors-ws/errors.html'],function(tpl){
				
				
				/* Store content data */
				var errorText =	$(tpl).find('*[data-error-class="'+ params.content +'"]').length ?
										$(tpl).find('*[data-error-class="'+ params.content +'"]').html() : params.errorMessage;
				// check if there is type error from catch 
				/*if(params.type){
					errorText = errorText.replace('_TYPE_' , params.type);
				}*/
				if(DEBUG){console.log("erreur localLoad -> affichage POPIN");}
				
				Popin.create({data : {content : errorText}});


			},that.unable); 
		},

		loadErrorTextById : function(items){
			var that = this;
			require(['text!templates/popin/errors-forms.html'],function(tpl){
				var finalMsg = '';
					/*$.each(items,function(i, item){
						
						var el = item.element.name,
							val = item.element.value,
						    ttpl = $(tpl).find('.'+ el),
							$class = ttpl.find(val.length == 0 ? '.empty' : '.error'),
							errorText = $(tpl).find('.'+ el).length ? $class.html() : $(tpl).find('.notfouned').html();
							errorText = errorText.replace('__Type__' , el);
							finalMsg += errorText + "<br>";
					});*/
					
				if(DEBUG){console.log("erreur loadErrorTextById -> affichage POPIN");}
				finalMsg='<p>Merci de vérifier le(s) champ(s) saisi(s)</p>';
				Popin.create({data : {content : finalMsg}});

			},that.unable); 
		}
	};


	return Erros;
});