// Filename: view/home.js
define([
    'jquery',
    'jqueryvalidator',
    'underscore',
    'backbone',
    'utils',
    'model/home',
    'text!templates/home.html',
], function($, jqueryvalidator, _, Backbone, Utils, HomeModel, Tpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({
		
		/*-------------------- INIT --------------------*/

		initialize:function(){  
		}, 

		/*-------------------- EVENTS --------------------*/

		events:{ 
			'submit .logForm':'callAuth',  
			'click .scan':'scanCode'
		},
		scanCode:function(){
			/*var scanner = cordova.require("cordova/plugin/BarcodeScanner");

	        scanner.scan( function (result) { 

	            alert("We got a barcode\n" + 
	            "Result: " + result.text + "\n" + 
	            "Format: " + result.format + "\n" + 
	            "Cancelled: " + result.cancelled);  

	           console.log("Scanner result: \n" +
	                "text: " + result.text + "\n" +
	                "format: " + result.format + "\n" +
	                "cancelled: " + result.cancelled + "\n");
	            document.getElementById("info").innerHTML = result.text; 

	        }, function (error) { 
	            console.log("Scanning failed: ", error); 
	        });*/
		},

		/*-------------------- HANDLERS --------------------*/    
		callAuth:function(e){ 
			Utils.router.navigate('join/step1',{ trigger:true });  
			e.preventDefault();
			//e.preventDefault();

			//alert("Submit form login");
			/*if(!Utils.isConnectedNetwork()){
				return false;
			}
			if(DEBUG){ console.log("call Auth"); }
			Utils.form.validate(e,function(serialized){

				//Utils.form.clearPassword();
				
				var login = serialized.email || serialized.prefix + serialized.mobile || '',
					data = {
						password:serialized.passwordWithoutRestriction
					};  
				
			
				Utils.service.call({
					name:'signin/'+login,
					data:data,
					success:function(response){

						if(DEBUG) console.log("success response");
						 
						if(response.token){
							top.location = SITEURL+'#login/'+response.token.key;
							//
						} else {
									alert('failed');
									Utils.popin.open({ data:{ title:'Erreur', content: response.errorMessage } }); 
						};
						Utils.service.finish();// remove class loading
					},
					error:function(response){
						Utils.service.finish();// remove class loading
					}
				});

			});*/

		},
		
		
		
		/*-------------------- RENDER --------------------*/
		render:function(isGlobal){

			/* Vars */
			var	compiledTemplate = _.template(Tpl, { model:HomeModel });
			/* Append */
			this.$el.html(compiledTemplate);

			/* Update header */
			Utils.header.setLeftButtonWithCheckNetwork('Infos','infos refresh','#infos/home', '');
			Utils.header.setRightButton('Démo','demo','#demo');
			
			/* Hide Navigation */
			Utils.navigation.hide();
			
			var element = document.getElementById('deviceProperties');
        	element.innerHTML = 'Device Name: '     + device.name     + '<br />' +
                            'Device Model: '    + device.model    + '<br />' +
                            'Device Cordova: '  + device.cordova  + '<br />' +
                            'Device Platform: ' + device.platform + '<br />' +
                            'Device UUID: '     + device.uuid     + '<br />' +
                            'Device Version: '  + device.version  + '<br />'; 

			//Utils.form.validatorForm('logForm');  
			
			
		}

	});

	/*-------------------- MODULE --------------------*/

	return {
		id:'home',
		level:0,
		view:View
	};

});
