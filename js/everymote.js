"use strict";

angular.module('everymote.service',['partymote.services'])
	.factory('thingBuilder', function(playlistServices){
		var build = function (spThing){

	        spThing.settings = { 
	                    "name":"Spotify " +localStorage.getItem("name"),
	                    "id":"28",
	                    "actionControles":[
	                                    {"type":"spotify-search", "name":"search", "id":"1"}
	                                    ,{"type":"list", "name":"list", "id":"2", "curentState":""}]
	                    ,"iconType": "spotifyL",
	                    "info":playlistServices.getCurrentTrackInfo()
	            };

	              
	        spThing.updateTrack = function(){
	            if(spThing.socket){
	           		spThing.socket.emit('updateInfo', playlistServices.getCurrentTrackInfo());
	         	}
	        };
	        playlistServices.addPlayerEventListener(spThing.updateTrack);


	        spThing.updatePlayStatus = function(){
	            if(spThing.socket){
	               updateEverymoteWithPlayStatus(spThing);
	            }
	        };
	        
	        spThing.handleAction = function(action){
	            if(action.id === "1"){
	                console.log(action);
	                playlistServices.addTrack(action.value);
	                
	            }
	        };
	       	return spThing;
	    };

    	return build;
	})
    .factory('Socket', function(thingBuilder){
    	var server = 'thing.everymote.com',
        port = '80';

    	var connectThing = function(thing){
        console.log(thing);
        var socket = io.connect('http://' + server + ':' + port + '/thing',
                {"force new connection":false 
                        ,'reconnect': true
                        ,'reconnection delay': 500
                        ,'max reconnection attempts': 10});
        
       
        socket.on('connect', function () {
                console.log('connected');
                socket.emit('setup', thing.settings);
                thing.socket = socket;
                thing.updateTrack();
                //updateEverymoteWithTrackDetails(spThing);

               // getPlayList(function(tracks){console.log("first GetPlayLis"); console.dir(tracks);spThing.socket.emit('updateActionControlerState', {"id":"2", "curentState":tracks});});

              //updateEverymoteWithPlayList(spThing);
        }).on('doAction', function (action) {
                console.log(action.id);
                thing.handleAction(action);
        }).on('connect_failed', function () {
                console.log('error:' + socket );
        }).on('disconnect', function () {
                console.log('disconnected');
        }).on('reconnect', function () {
               console.log('reconnect');
             
        });
    };
    var thing = thingBuilder({});
    connectThing(thing);
}).run(function(Socket){}); 