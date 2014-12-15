// Filename: header.js
define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {

    /*-------------------- CONFIG --------------------*/

    var HeaderView = Backbone.View.extend({
        el: $('header'),

        initialize:function(options){
            options || (options={});
        },

        events:{
          //  'click h1':'goHome',
        },

        goHome:function(){
            require(['utils'], function(Utils){
                Utils.router.navigate('home',{ trigger:true });                
            });
            // Utils.router.navigate('home',{ trigger:true });
        },

        setLeftButtonAndAddRetour: function(text, css, href) {
            this.$el.find('.leftButton').remove();
            this.$el.find('.leftButton2').remove();
            this.$el.find('.leftButtonsContainer').remove();
            if (text && css && href) {
                var t = '<div class="leftButtonsContainer">';
                t += '<a href="#home" class="leftButton2 back">Retour</a>';
                t += '<a href="' + href + '" class="leftButton ' + css + '">' + text + '</a>';
                t += '</div>';
                this.$el.append(t);
            }
        },

        setLeftButton: function(text, css, href) {
            // Remove previous buttons
            this.$el.find('.leftButton').remove();
            this.$el.find('.leftButton2').remove();
            this.$el.find('.leftButtonsContainer').remove();
            // Append new button if has
            if (text && css && href) {
                var t = '<div class="leftButtonsContainer">';
                t += '<a href="' + href + '" class="leftButton ' + css + '">' + text + '</a>';
                t += '</div>';
                this.$el.append(t);
            }
        },
		
		setLeftButtonWithCheckNetwork : function(text, css, href, xiti) {

			// Remove previous buttons
            this.$el.find('.leftButton').remove();
            this.$el.find('.leftButton2').remove();
            this.$el.find('.leftButtonsContainer').remove();
            // Append new button if has
			
            if (text && css && href) {
			     
                var onlick = '';
                if( !$(".auth").length ){
				    onlick = 'if(Utils.isConnectedNetwork()){ return true; } else {return false;}';
                } 

                var t = '<div class="leftButtonsContainer">';
                    t += '<a href="' + href + '" class="leftButton ' + css + '" onclick="'+onlick+'" data-xiti="'+xiti+'">' + text + '</a>';
                    t += '</div>';
                this.$el.append(t);
            }
        },

        setRightButton: function(text, css, href, xiti) {
            // Remove previous buttons
            this.$el.find('.rightButton').remove();
            // Append new button if has
            if (text && css && href) this.$el.append('<a href="' + href + '" class="rightButton ' + css + '" data-xiti="'+ xiti +'">' + text + '</a>');
            // if(text && css && href)	this.$el.append('<a href="'+href+'" class="rightButton '+css+'">'+text+'</a>').find('.rightButton');
        }


    });

    /*-------------------- INIT --------------------*/

    if (DEBUG) console.log('Header initialized');

    /* Instanciate the view */
    var Header = new HeaderView();

    return Header;

});
