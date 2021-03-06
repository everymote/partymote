"use strict";

angular.module('everymote.service',['partymote.services','settingsService'])
	.factory('thingBuilder', function(playlistServices, settings){
		var build = function (spThing){

	        spThing.settings = { 
	                    "name":"Partymote @ " + settings.name.get(),
	                    "id":"28",
	                    "actionControles":[
	                                    {"type":"spotify-search", "name":"search", "id":"search"}
	                                    ,{"type":"spotify-list", "name":"spotify-list", "id":"2", "curentState":{}}]
	                    ,"iconType": "spotifyL",
	                     //"position":{"lat":55.61245,"lon":12.99139},
	                    "info":playlistServices.getCurrentTrackInfo()
	            };

	        var mapTrack = function(track){
				return {name:track.name,
						artists:track.artists,
						image:track.image}
	        };
	        spThing.updatePlaylist = function(){
	            if(spThing.socket){
	            	var tracks =  playlistServices.getPlaylist().tracks.map(mapTrack);
	           		spThing.socket.emit('updateActionControlerState',{"id":"2", "curentState":tracks});
	         	}
	        };
	        playlistServices.addPlaylistEventListener(spThing.updatePlaylist); 

	        spThing.updateTrack = function(){
	            if(spThing.socket){
	            	var currentTrack = playlistServices.getCurrentTrackInfo();
	           		spThing.socket.emit('updateInfo', currentTrack);
	           		spThing.settings.info = currentTrack
	         	}
	        };
	        playlistServices.addPlayerEventListener(spThing.updateTrack);

	        spThing.handleAction = function(action){
	            if(action.id === "search"){
	                console.log(action);
	                playlistServices.addUserTrackFromURI(action.value.href, action.value.userId);
	                
	            }
	        };
	       	return spThing;
	    };

    	return build;
	})
    .factory('everymoteClient', function(thingBuilder, settings){
    	var server = 'thing.everymote.com',
        port ='80';

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
	                thing.updatePlaylist();
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


    	var updateName = function(newName){
    		thing.settings.name="Partymote @ " + newName;
    		thing.socket.emit('setup', thing.settings);
    		thing.updatePlaylist();
    	};

    	settings.addNameChangeEventListener(updateName);

    	var updateAsseccMode = function(mode){
    		thing.settings.name="Spotify " + newName;
    		thing.socket.emit('setup', thing.settings);
    	};
}).run(function(everymoteClient){}); 