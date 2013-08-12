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
         	var onError = function(a,b) {
                	 console.log("Error getting position");
                     console.log(a); console.log(b);
         	};
         	return {
                 	start : function(callback){
                         	callbackfunc = callback;
                         	require(['$api/location'], function(location){
									var loc = location.Location.query();
                      loc.load(['latitude', 'longitude']).done(function(loc) {
									  callbackfunc(loc);
									}).fail(onError);;
                         	
                 			});
                         }
         	};
	}());
	return geo;
});

angular.module('partymote.services',[])
    .service('playlistServices',function($rootScope){
    	var playlist = {tracks:[]};
        var _loadedPlaylist;
    	  var loadedPlayer;
        var _Track, _models, _lastSnapshot;
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
            if(_models && loadedPlayer && loadedPlayer.track){
                return loadedPlayer.track.name;
            }
            return "Nothing playing!"
        };
         var setIndex = function(e){
            console.log("index");
            console.log(e);
        }

        var getPlaylistID = function(uri){
          if(!uri) return;

          var index = uri.lastIndexOf(":");
           return uri.substring(index);
        };
        var startPlay = function(){
            //if(_loadedPlaylist.tracks)

            if(!loadedPlayer.context || getPlaylistID(loadedPlayer.context.uri) !=  getPlaylistID(_loadedPlaylist.uri)){
                console.log("start play");
                
                loadedPlayer.playContext(_loadedPlaylist, 0).done(function(){});
                
            }else{
                index = loadedPlayer.index;
            }
        };

       
      
        var updatePlaylistView = function(){
            setTimeout(startPlay,500);
            //var t = _loadedPlaylist.tracks.sort('name:d');
            //console.log(t);
            console.log(_loadedPlaylist);
            console.log(loadedPlayer);

            index = loadedPlayer.index;
            _loadedPlaylist.tracks.snapshot(index, 50 + index).done(function(snapshot) {
                         _lastSnapshot = snapshot;
                         playlist.tracks = snapshot.toArray();
                         console.log("time for update");
                         //console.log(playlist.tracks);
                         $rootScope.$apply();
                         playlistChanged(playlist);
                         
                    });

        };

        var lastAddedIndex = 0;
        var addUserTrack = function(loadedTrack){
          if(_lastSnapshot){
            lastAddedIndex = lastAddedIndex > index ? lastAddedIndex : index;
            lastAddedIndex = lastAddedIndex + 1;
            var ref = _lastSnapshot.ref(lastAddedIndex);
            console.log(lastAddedIndex);
            console.log(ref);
            _loadedPlaylist.tracks.insert(ref, loadedTrack);
          }else{
            _loadedPlaylist.tracks.add(loadedTrack);
          }

        };

        var addTrackFromURI = function(trackURI){
            _Track
                .fromURI(trackURI)
                .load('name','uri','image')
                .done(function(loadedTrack){
                    loadedTrack.test = 4;
                    //_loadedPlaylist.tracks.add(loadedTrack);
                    addUserTrack(loadedTrack);
                });
            };

        

        var addHandler = {};
        addHandler.Track = function(track){
            track
                    .load('name','uri','image')
                    .done(function(loadedTrack){
                             _loadedPlaylist.tracks.add(loadedTrack);
                         });
        };
        addHandler.Playlist = function(playlist){
            playlist.
                load('tracks').
                done(function(dragedPlaylist){

                   dragedPlaylist.tracks.snapshot().done(function(snap){
                        
                        snap.loadAll('name','uri','image').done(function(loadedTracks) {
                          console.log(_loadedPlaylist);
                          _loadedPlaylist.tracks.add(loadedTracks);
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

            console.log(url);
            require(['$api/models#Playlist'], function(Playlist){
               var dragdPlaylist = Playlist.fromURI(url);
               addHandler.Playlist(dragdPlaylist);
            });
            /*url.
            var func = addHandler[droped.constructor.name];

            if(func){
                func(addDropedUrls);
            }else{
                console.log(droped);
            }*/

        };

        var loadPlaylist = function(playlist){
            playlist.load('tracks').
                            done(function(playlistPromise){
                               _loadedPlaylist = playlistPromise;
                              // _loadedPlaylist.tracks.clear().done();
                               // loadedPlayer.playContext(_loadedPlaylist, 0);
                               // var track = Track.fromURI("spotify:track:3fllpI9uZKkdy3NJS0J1oV");
                               // _loadedPlaylist.tracks.add(track);
                               // _loadedPlaylist.tracks.remove(track).done();
                           });
        };

      var test = function(models){
        models.session.load('country').done(function(blob){
          console.log(blob);
          
        });
      }
        
    	require(['$api/models'], function(models) {
            test(models);
            index = 0;
            _models = models;
            _Track = models.Track;
            models.player.load("index").done(function(player) {
                loadedPlayer = player;
                loadedPlayer.addEventListener('change:index', updatePlaylistView);
                loadedPlayer.addEventListener('change:track', trackChanged);
            });



            var timeStamp = new Date().getTime();
    		models.Playlist.
          //fromURI("spotify:user:macke8080:playlist:3I9xZFEm8CvBJcL55JfXeM").load('name').
    			createTemporary("partymote:"+timeStamp).
    			done(function(p){
                                p.addEventListener('insert', updatePlaylistView);
                                //loadedPlaylist = p.load('tracks');
                                 //models.Playlist.fromURI(p.uri).load('name').done(function(playlist){
                                    
                                    loadPlaylist(p);
                              //  });

    					  /* p.load('tracks').
    					   	done(function(playlistPromise){
    					   		_loadedPlaylist = playlistPromise;
                               // loadedPlayer.playContext(_loadedPlaylist, 0);
                               // var track = Track.fromURI("spotify:track:3fllpI9uZKkdy3NJS0J1oV");
                               // _loadedPlaylist.tracks.add(track);
                               // _loadedPlaylist.tracks.remove(track).done();
    					   });*/
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
            urls.forEach(playlistServices.addDropedUrl);
        };

        return {handleDropedUrls:handleDropedUrls};

    }).run(function(dropHandler){}); 

    //https://gist.github.com/plamere/5207460
    //http://developer.echonest.com/docs/v4/playlist.html#static
