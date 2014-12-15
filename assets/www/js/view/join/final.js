// Filename: view/join/final.js
define([
	'jquery',
	'underscore',
	'backbone',
	'utils',
	'model/join',
	'text!templates/join/final.html'
], function($, _, Backbone, Utils, JoinModel, Tpl){

	/*-------------------- CONFIG --------------------*/

	var View = Backbone.View.extend({

	
		initialize:function(){
	
			this.once('renderEvent', function () {
				/* Clear session storage */
				var isFinish = (1 == JoinModel.get('registerFinish'));
				if(isFinish){
					if(DEBUG) console.log("RESET MODEL");
					JoinModel.reset();
				}
			});
			
			
			if(Utils.storage.get('reponseJoinCard',false)){
				JoinModel.registerUser(Utils.storage.get('reponseJoinCard',false));
			}
			
			
			
			/* View / Model association */
			var that = this;
			
			JoinModel.bind('change:registerFinish', function(){ if(DEBUG) console.log('Step 4 event'); that.render(); });
		},
	
		/*-------------------- EVENTS --------------------*/
	
		events:{},

		/*-------------------- HANDLERS --------------------*/

		/*-------------------- RENDER --------------------*/

		render:function(isGlobal){
			

				
			//	alert("complete : " + JoinModel.get('completed'));
				/* Prevent direct access */
				var auth = (2 == JoinModel.get('completed'));
				
				if(!auth) Utils.router.navigate('join/step1',{ trigger:true, replace:true });

				/* Vars */
				var	compiledTemplate = _.template(Tpl, { model:JoinModel } );
				
				/* Append */
				this.$el.html(compiledTemplate);

				/* Update header */
				Utils.header.setLeftButton();
				Utils.header.setRightButton('Aide','help  xitiClick','#popin/id/mtra_popup-besoin-aide',"s2=6&p=Inscription_recapitulatif::aide");
				
				if(DEBUG) console.log("FIRST LOAD : " + isGlobal);
				
				if(!isGlobal){
					this.trigger('renderEvent');
				}
		}
		

	});

	/*-------------------- MODULE --------------------*/

	return {
		id:'joinFinal',
		level:6,
		view:View
	};

});
