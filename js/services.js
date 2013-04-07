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

angular.module('partymote.services',[])
    .service('playlistServices',function($rootScope){
    	var playlist = {};
    	var loadedPlaylist;
        var _Track, _Player;
        var index = 0;
        var playerEventListeners = [];

        var addPlayerEventListener = function(callback){
            playerEventListeners.push(callback);
        };

        var trackChanged = function(){
            playerEventListeners.forEach(function(callback){callback();});
        };

        var getCurrentTrackInfo = function(){
            if(_Player && _Player.track){
                return _Player.track.name;
            }
            return "Nothing playing!"
        };

        var updatePlaylistView = function(){
            index = _Player.index;
            loadedPlaylist.tracks.snapshot(index, index + 50).done(function(snapshot) {
                         playlist.tracks = snapshot.toArray();
                         $rootScope.$apply();
                    });

        };

        var addTrack = function(trackURI){
            _Track
                .fromURI(trackURI)
                .load('name','uri','image')
                .done(function(loadedTrack){
                    loadedPlaylist.tracks.add(loadedTrack);
                    updatePlaylistView();
                    
                    if(!_Player.playing){
                        
                        _Player.playContext(loadedPlaylist);
                    }
                });
            };

    	require(['$api/models#Playlist', '$api/models#Track', '$api/models#player'], function(Playlist, Track, Player) {
            _Track = Track;
            _Player = Player;

            _Player.addEventListener('change:index', updatePlaylistView);
            _Player.addEventListener('change:track', trackChanged);

    		Playlist.
    			createTemporary("partymote").
    			done(function(p){
    								p.load('tracks').
    									done(function(playlistPromise){
    										loadedPlaylist = playlistPromise;
    										loadedPlaylist.tracks.snapshot(0, 50).done(function(snapshot) {playlist.tracks = snapshot.toArray();});
                                            addTrack('spotify:track:7BkQiT7LfhOCEuyWD9FF35');
                                            addTrack('spotify:track:6yuswSxDJzx0Tulvy6ZBXg');
                                            addTrack('spotify:track:10bcDungKvOzo2W3LsSdp9');
                                            
    								});
    							});
    	});

	var getPlaylist = function() {
		return playlist;
	};
	return {getPlaylist:getPlaylist,
            addTrack:addTrack,
            getCurrentTrackInfo: getCurrentTrackInfo,
            addPlayerEventListener:addPlayerEventListener};
});
