'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
//angular.module('partymote.services', []).
//  value('version', '0.1');


angular.module('locationService',[])
    .factory('location',function(){
	var geo = (function() {
		


         	var callbackfunc;
         	var postPosition = function (position) {
                 	callbackfunc(position);
         	};
         	var onError = function() {
                	 console.log("Error getting position");
         	};
         	return {
                 	start : function(callback){
                         	callbackfunc = callback;
                         	require(['$api/location#Location'], function(location){
									location.query().load(['latitude', 'longitude']).done(function(loc) {
									  callbackfunc(loc);
									});
                         	
                 			});
                         }
         	};
	}());
	return geo;
});
//loadedPlaylist.tracks.snapshot(0, 50).done(function(snapshot) {console.log(snapshot)})
/*
Track
		    									.fromURI('spotify:track:7BkQiT7LfhOCEuyWD9FF35')
		    									.load('name','uri')
		    									.done(function(loadedTrack){
										                    	loadedPlaylist.tracks.add(loadedTrack);
								                });
                                                
*/
angular.module('partymote.services',[])
    .service('playlistServices',function($rootScope){
    	var playlist = {};
    	var loadedPlaylist;
        var Track;

        var addTrack = function(trackURI){
            Track
                .fromURI(trackURI)
                .load('name','uri','image')
                .done(function(loadedTrack){
                    loadedPlaylist.tracks.add(loadedTrack);
                    loadedPlaylist.tracks.snapshot(0, 50).done(function(snapshot) {
                         playlist.tracks = snapshot.toArray();
                         $rootScope.$apply();
                    });
                });
            };

    	require(['$api/models#Playlist', '$api/models#Track'], function(Playlist, TrackModule) {
            Track = TrackModule;
    		Playlist.
    			createTemporary("partymote").
    			done(function(p){
    								p.load('tracks').
    									done(function(playlistPromise){
    										loadedPlaylist = playlistPromise;
    										loadedPlaylist.tracks.snapshot(0, 50).done(function(snapshot) {playlist.tracks = snapshot.toArray();});
                                            addTrack('spotify:track:7BkQiT7LfhOCEuyWD9FF35');
                                            addTrack('spotify:track:6yuswSxDJzx0Tulvy6ZBXg');
    								});
    							});
    	});

	var getPlaylist = function() {
		return playlist;
	};
	return {getPlaylist:getPlaylist,
            addTrack:addTrack};
});
