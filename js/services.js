'use strict';

angular.module('localStorageService',[]).value('localStorage', window.localStorage);

angular.module('settingsService',['localStorageService'])
    .factory('settings',function(localStorage){
        var settings = {},
            nameChangeEventListeners = [];

        settings.name = {};
        settings.name.get = function(){return localStorage.getItem('partymote.name') || ""};
        settings.name.set = function(name){
            localStorage.setItem('partymote.name', name);
            nameChangeEventListeners.forEach(function(callback){callback(name);});
        };

        settings.accessMode = {};
        settings.accessMode.get = function(){return localStorage.getItem('partymote.accessmode') || "wifi"};
        settings.accessMode.set = function(accessmode){localStorage.setItem('partymote.accessmode', accessmode);};

        settings.addNameChangeEventListener = function(listener){
            nameChangeEventListeners.push(listener);
        };


        return settings;
});

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
        var playlistEventListeners = [];

        var addPlayerEventListener = function(callback){
            playerEventListeners.push(callback);
        };

        var addPlaylistEventListener = function(callback){
            playlistEventListeners.push(callback);
        };

        var trackChanged = function(){
            playerEventListeners.forEach(function(callback){callback();});
        };

        var playlistChanged = function(){
            playlistEventListeners.forEach(function(callback){callback();});
        };

        var getCurrentTrackInfo = function(){
            if(_Player && _Player.track){
                return _Player.track.name;
            }
            return "Nothing playing!"
        };

        var startPlay = function(){
            if(!_Player.context || _Player.context.uri !=  loadedPlaylist.uri){
                _Player.playContext(loadedPlaylist);
            }else{
                index = _Player.index;
            }
        };

        var setIndex = function(e){
            console.log(e);
        }

        var updatePlaylistView = function(){
            index = _Player.index;
            loadedPlaylist.tracks.snapshot(index).done(function(snapshot) {
                         playlist.tracks = snapshot.toArray();
                         console.log("time for update");
                         console.log(playlist.tracks);
                         $rootScope.$apply();
                         playlistChanged(playlist);
                         startPlay();
                    });

        };

        var addTrackFromURI = function(trackURI){
            _Track
                .fromURI(trackURI)
                .load('name','uri','image')
                .done(function(loadedTrack){
                    loadedTrack.test = 4;
                    loadedPlaylist.tracks.add(loadedTrack);
                });
            };

        var addHandler = {};
        addHandler.Track = function(track){
            track
                    .load('name','uri','image')
                    .done(function(loadedTrack){
                             loadedPlaylist.tracks.add(loadedTrack);
                         });
        };
        addHandler.Playlist = function(playlist){
            playlist.
                load('tracks').
                done(function(dragedPlaylist){

                   dragedPlaylist.tracks.snapshot().done(function(snap){
                        
                        snap.loadAll('name','uri','image').done(function(loadedTracks) {
                          loadedPlaylist.tracks.add(loadedTracks);
                            });
                    });
                   
                });
        };
        addHandler.Album = addHandler.Playlist;


        var addDroped = function(droped){
            if(!droped){return;}

            var func = addHandler[droped.constructor.name];
            if(func){
                func(droped);
            }else{
                console.log(droped);
            }

        };
//http://open.spotify.com/track/1g2qPLmj7zk831LAI0ryKY"
        var addDropedUrl = function(url){
            if(!url){return;}
            /*url.
            var func = addHandler[droped.constructor.name];

            if(func){
                func(addDropedUrls);
            }else{
                console.log(droped);
            }*/

        };

    	require(['$api/models#Playlist', '$api/models#Track', '$api/models#player'], function(Playlist, Track, Player) {
            _Track = Track;
            _Player = Player;

            _Player.addEventListener('change:index', updatePlaylistView);
            _Player.addEventListener('change:index', setIndex);
            _Player.addEventListener('change:track', trackChanged);

    		Playlist.
    			createTemporary("partymote").
    			done(function(p){
    					   p.load('tracks').
    					   	done(function(playlistPromise){
    					   		loadedPlaylist = playlistPromise;
                                loadedPlaylist.addEventListener('insert', updatePlaylistView);
                                updatePlaylistView();
    					   });
    					});
    	});

    	var getPlaylist = function() {
    		return playlist;
    	};
    	return {getPlaylist:getPlaylist,
                addTrackFromURI:addTrackFromURI,
                addDroped:addDroped,
                addDropedUrl:addDropedUrl,
                getCurrentTrackInfo: getCurrentTrackInfo,
                addPlayerEventListener:addPlayerEventListener,
                addPlaylistEventListener:addPlaylistEventListener};

    }).service('dropHandler',function(playlistServices){
        require(['$api/models'], function(models){
            var handleDrop = function(){
                models.application.dropped.forEach(playlistServices.addDroped);
            };
            models.application.addEventListener('dropped', handleDrop);
        });

        var handleDropedUrls = function(urls){
            urls.forEach(playlistServices.addDropedUrls);
        };

        return {handleDropedUrls:handleDropedUrls};

    }).run(function(dropHandler){}); 
