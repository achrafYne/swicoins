// Filename: router.js
define([
	'jquery',
	'underscore',
	'backbone',
	'utils'
], function($, _, Backbone, Utils) {

	/*-------------------- CONFIG --------------------*/

	/* Define routes */
	var AppRouter = Backbone.Router.extend({
			routes: {
				'login/:token':'login',
				'popin/:type/:name':'openPopin',
				'user/:section/contact/:id':'loadContactView',	/* All pages in this folder need session to be active */
				'user/actions/:type':'loadListView',			/* All pages in this folder need session to be active */
				'user/actions/:type/:index':'loadDetailView',	/* All pages in this folder need session to be active */
				'user/others/profile/history':'loadHistoryView',	
				

				'user/others/profile/finishedDemand/:index':'loadFinishedDemandDetailView',	
				'user/others/profile/finishedDonation/:index':'loadFinishedDonationetailView',
				'user/others/profile/waitingDemand/:index':'loadWaitingDemandDetailView',	
				'user/others/profile/waitingDonation/:index':'loadWaitingDonationetailView',	
				

				'user/*path':'loadUserView',					/* All pages in this folder need session to be active */

				'success':'loadSuccess',
				'settings':'loadSettings',
				'paiement':'loadiIframePaiement',
				'carte':'loadiAddCarte',
				'carte/:from':'loadiAddCarte',
				'scan':'loadiScan',
				'passwordRecovery/:crypt/:key':'loadPasswordRecovery',
				'':'redirectToHome',
				'*path':'loadView'
			},
			refresh:function(){
				Backbone.history.fragment = null;
				Backbone.history.navigate(document.location.hash, { trigger:true, replace:true });
			}
		});

	/*-------------------- INIT --------------------*/
	
	if(DEBUG) console.log('Router initialized');

	/* Clear localStorage */
	Utils.storage.clear(false);

	/* Instanciate the router */
	var Router = new AppRouter(),
		currentLevel = null,
		currentView = null,
		currentContent = null,
		progress = false,
		refresh = false,
		renderAndDisplay = function(Screen, params){
		
			/* If non visible view - Background task */
			if(-1 == Screen.level){
				var task = new Screen.view();
				task.render(true);

				/* No need to refresh */
				refresh = false;

				return
			
			/* Else if same level view, simple replace */
			} else if(currentLevel == Screen.level){
				/* Add ID il Screen object and store CurrentID to prevent same view replacment */
				if(Screen.id == currentContent) return;

				/* Append new container without 'prev' or 'next' */
				currentView.$el.after('<section class="same"></section>');
				
				/* store old reference for destruction purpose */
				var oldView = currentView,
					View = Screen.view.extend({
						el:$('.same')
					});

				currentContent = Screen.id;
				currentView = new View();
				currentView.render(true);
				currentView.$el.removeClass('same');

				/* Destuction of old view */
				if(oldView.unlink) oldView.unlink();
				oldView.unbind();
				oldView.remove();

				/* No need to refresh */
				refresh = false;

			/* Else if transition in progress, history back to prevent multiple transition */
			} else if(progress){

				refresh = true;
				return;

			/* Else manage transition */
			} else {
				
				progress = true;

				/* DETERMINE IF FORWARD OR BACKWARD */
				var first = (null == currentLevel),
					way = (Screen.level > currentLevel)? 'forward' : 'backward',
					from = 'current',
					to = '',
					oldView = currentView;

				/* If previous screen loaded */
				if(!first){
					from = ('forward' == way)? 'next' : 'prev';
					to = ('forward' == way)? 'prev' : 'next';

					/* Hide */
					oldView.$el.addClass(to);
				};

				
				/* Set view root, instanciate and render */
				var View = Screen.view.extend({
						el:$('.'+from)
					});
					
				
				
				
				
				currentContent = Screen.id;
				if(params){
					currentView = new View({params:params});
				}else{
					currentView = new View();
				}
				
				currentView.render(true);
				currentView.$el.removeClass(from);

				/* Store current screen level */
				currentLevel = Screen.level;

				/* Reset base DOM structure after transition */
				setTimeout(function(){

					progress = false;

					/* Remove oldview */
					if(oldView){
						if(oldView.unlink) oldView.unlink();
						oldView.unbind();
						oldView.remove();
					};

					/* Reset DOM base structure */
					currentView.$el.prevAll('section').remove();
					currentView.$el.nextAll('section').remove();
					currentView.$el.before('<section class="prev"></section>').after('<section class="next"></section>');
					
					/* Check if refresh is needed */
					if(refresh){
						/* Need redirection */
						Router.refresh();
						/* Reset previously store redirection */
						refresh = false;
					};

				},500);

			};

		},
		backupToHome = function(err){
			/* Allow multiple require on a file (ensure network problem won't bloc user) */
			if(err) require.undef(err.requireModules[0]);
			/* Redirect to home - Maybe we must condition this action */
			Router.navigate('home',{ trigger: true, replace: true });
		};

	/*-------------------- ACTIONS --------------------*/

	/* If call on root */
	Router.on('route:redirectToHome',backupToHome);

	/* Standard pages */
	Router.on('route:loadView', function (path) {
		 
		/* Require view */
		require(['view/'+path],renderAndDisplay,backupToHome); 
		if(DEBUG) console.log(path+' Route');

	});

	/* Temp: VOID */
	Router.on('route:loadSuccess',function(type,index){ 
		require(['view/user/ask/success'],renderAndDisplay,backupToHome);  
	});		

	Router.on('route:loadSettings',function(type,index){ 
		require(['view/user/others/settings'],renderAndDisplay,backupToHome);  
	});

	Router.on('route:loadiIframePaiement',function(type,index){ 
		require(['view/iframePaiement'],renderAndDisplay,backupToHome);  
	});

	Router.on('route:loadiAddCarte',function(type,index){ 
		require(['view/carte'],renderAndDisplay,backupToHome);  
	});

	Router.on('route:loadiScan',function(){ 
		require(['view/scan/scan'],renderAndDisplay,backupToHome);  
	});

	Router.on('route:loadPasswordRecovery',function(crypt,key){ 

		var params = new Object();
		params.crypt = crypt;
		params.key = key;
		require(['view/passwordRecovery'],function(view){
			renderAndDisplay(view,params)
		},backupToHome);		
		
	});

	/* Pages that need a valid session */
	var loadUserView = function(path){
		
		/* Check if session still valid */
		Utils.session.check({
			// expired:backupToHome,
			expired:function(){
		
				/* Require view */
				require(['view/user/'+path],renderAndDisplay,backupToHome);
				if(DEBUG) console.log('User : '+path+' Route');

			},
			valid:function(){
		
				/* Require view */
				require(['view/user/'+path],renderAndDisplay,backupToHome);
				if(DEBUG) console.log('User : '+path+' Route');

			}
		});

	};
	Router.on('route:loadUserView',loadUserView);
	Router.on('route:loadListView',function(type){ 

		/* Home specific */
		if('home' == type){
			loadUserView('actions/home');
			return;
		};

		/* Require actions model to set context */
		require(['model/user/actions/list'],function(ListModel){
			ListModel.set({ state:{ cat:type } , silent:true });
		});
		var path = 'actions/list';
		loadUserView(path);

	});

	Router.on('route:loadDetailView',function(type,index){
		/* Require actions model to set context */
		require(['model/user/actions/list'],function(ListModel){
			ListModel.set({ state:{ index:index } , silent:true });
		});
		var path = 'actions/detail';
		loadUserView(path);

	});

	Router.on('route:loadHistoryView',function(type,index){
		/* Home specific */
		if('home' == type){
			loadUserView('others/profile/home');
			return;
		};

		/* Require actions model to set context */
		require(['model/user/others/profile/history'],function(ListModel){
			ListModel.set({ state:{ cat:type } , silent:true });
		});

		var path = 'others/profile/history';
		loadUserView(path);
	});	

	Router.on('route:loadFinishedDemandDetailView',function(index){ 
		var type ='finishedDemand';
		if(DEBUG) console.log("Type : " + type ," Index : "+ index);
		/* Require actions model to set context */
		require(['model/user/others/profile/history'],function(ListModel){
			ListModel.set({ state:{ index:index , type : type } , silent:true });
		});
		var path = 'others/profile/details';
		loadUserView(path);
	});

	Router.on('route:loadFinishedDonationetailView',function(index){ 
		var type ='finishedDonation';
		if(DEBUG) console.log("Type : " + type ," Index : "+ index);
		/* Require actions model to set context */
		require(['model/user/others/profile/history'],function(ListModel){
			ListModel.set({ state:{ index:index , type : type } , silent:true });
		});
		var path = 'others/profile/details';
		loadUserView(path);
	});

	Router.on('route:loadWaitingDemandDetailView',function(index){ 
		var type ='waitingDemand';
		if(DEBUG) console.log("Type : " + type ," Index : "+ index);
		/* Require actions model to set context */
		require(['model/user/others/profile/history'],function(ListModel){
			ListModel.set({ state:{ index:index , type : type } , silent:true });
		});
		var path = 'others/profile/details';
		loadUserView(path);
	});

	Router.on('route:loadWaitingDonationetailView',function(index){ 
		var type ='waitingDonation';
		if(DEBUG) console.log("Type : " + type ," Index : "+ index);
		/* Require actions model to set context */
		require(['model/user/others/profile/history'],function(ListModel){
			ListModel.set({ state:{ index:index , type : type } , silent:true });
		});
		var path = 'others/profile/details';
		loadUserView(path);
	});

	Router.on('route:loadContactView',function(section,id){
		
		/* Require actions model to set context */
		require(['collection/contacts'],function(ContactsCollection){
			ContactsCollection.active = ContactsCollection.where({ id:id+'' })[0];
			var path = section+'/contact';
			loadUserView(path);
		});

	});

	/* Popin */
	Router.on('route:openPopin', function(type,name) {

		history.back();
		
		/* Build params obj */
		var contentid = ('id' == type)? name : undefined,
			content = ('id' != type)? name : 'connexion-error',
			params = {
				contentid:contentid,
				content:content,
				data:{  }
			};

		Utils.popin.open(params);

	});

	/* Popin */
	Router.on('route:login', function(token) {
		require(['view/login'],function(loginView){
			var login = new loginView({ token:token });
		});		
	});

	return Router;

});
