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
          var getLocation = function(location){
            var loc = location.Location.query();
            loc.load(['latitude', 'longitude']).done(postPosition).fail(onError);
          };


         	return {
                 	start : function(callback){
                         	callbackfunc = callback;
                          require(['$api/location'], getLocation);
                      }
         	};
	}());
	return geo;
});

angular.module('partymote.services',[])
    .service('playlistServices',function($rootScope, $http){
    	var playlist = {tracks:[]};
        var _loadedPlaylist;
    	  var loadedPlayer;
        var _Track, _models, _lastSnapshot;
        var index = 0;
        var playerEventListeners = [];
        var playlistEventListeners = [];
        var addHandler = {};
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


        var getTracksFromEchonest = function(song){
          return song.tracks[0].foreign_id.replace('-WW', '');
        };

        var getSimilarSongs = function(songs){

          var params = {api_key:'OF9T6VDU7WNAERECF',
                        song_id:songs,
                        bucket:['id:spotify-WW', 'tracks'],
                        limit:'true',
                        results:5,
                        type:'song-radio',
                        variety:0.5,
                        distribution:'wandering',
                        limited_interactivity: true

                      };
          var options = {params:params,
                        cache:false};

          
          $http.get('http://developer.echonest.com/api/v4/playlist/static', options).
                success(function(data, status) {
                  
                 var spotifyURIs = data.response.songs.map(getTracksFromEchonest);
                 
                 var tracks = _Track.fromURIs(spotifyURIs);
                 //console.log(tracks);
                 tracks.forEach(function(track){
                                            track.userName = "radio";
                                            addHandler.Track(track);
                                          });
                 
                //callback(data);
                }).
                error(function(data, status) {
                  console.log(data);
                });
        };

        var addMoreSongs = function(){
            var total = _lastSnapshot.length;
            var lastFive = total - 5;
            _loadedPlaylist.tracks.snapshot(lastFive, total).done(function(snapshot) {
              console.log(snapshot);
              var songs = snapshot.toURIs().map(function(songUri){return songUri.replace('spotify','spotify-WW')});
              console.log(songs);
              getSimilarSongs(songs);
            });

        };
       
      
        var updatePlaylistView = function(){
            setTimeout(startPlay, 500);
            //var t = _loadedPlaylist.tracks.sort('name:d');
            //console.log(t);
            console.log(_loadedPlaylist);
            console.log(loadedPlayer);

            index = loadedPlayer.index;
            _loadedPlaylist.tracks.snapshot(index, 50 + index).done(function(snapshot) {
                         _lastSnapshot = snapshot;
                         playlist.tracks = snapshot.toArray();
                         console.log("time for update");
                         $rootScope.$apply();
                         playlistChanged(playlist);
                         
                         if(index > 0 && playlist.tracks.length == 1){
                            addMoreSongs();
                         };

                    });

        };

        var getUserAdded = function(snapshot, userId){
          
          if(snapshot){
            var userAdded = {};
            userAdded[userId] = 1;

            var tracks = snapshot.toArray();
            for(var i = 0; i < tracks.length; i++){
              var addedByUser = tracks[i].userId;
              if(i === 0 && !addedByUser && tracks.length > 1 && tracks[1].userId){
                i = 1;
                addedByUser = tracks[i].userId;
              }
              if(addedByUser){
                if(userAdded[addedByUser]){
                  userAdded[addedByUser] = userAdded[addedByUser] + 1;
                }else{
                  userAdded[addedByUser] = 1;
                }

                var usersCurent = userAdded[userId] ? userAdded[userId] : 1;
                if(userAdded[addedByUser] > (usersCurent)){
                  return _lastSnapshot.ref(i + index);
                }

              }else{
                if(i === 0 ){
                  return _lastSnapshot.ref(i + index + 1);
                }else{
                  return _lastSnapshot.ref(i + index);
                }
              }
            }
          }
        };

        var addUserTrack = function(loadedTrack, userId){
          if(_lastSnapshot){
            if(_lastSnapshot.find(loadedTrack)){return};
            
            var ref = getUserAdded(_lastSnapshot, userId);
            if(!ref){
                _loadedPlaylist.tracks.add(loadedTrack);
                return;
              }
              _loadedPlaylist.tracks.insert(ref, loadedTrack);
            
          }else{
            _loadedPlaylist.tracks.add(loadedTrack);
          }

        };

        var users = {nr:0};
        var getUserName = function(userId){
            if(users[userId]){
              return users[userId].name;
            }else{
              users.nr = users.nr + 1;
              users[userId] = { name:"User " + users.nr};
              return users[userId].name;  
            }
        };

        var addUserTrackFromURI = function(trackURI, userId){
            _Track
                .fromURI(trackURI)
                .load('name','uri','image')
                .done(function(loadedTrack){
                  loadedTrack.userId = userId;
                  loadedTrack.userName = getUserName(userId);
                  addUserTrack(loadedTrack, userId);
                });
            };

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
        var addDropedUrl = function(url){
            if(!url){return;}

            console.log(url);
            require(['$api/models#Playlist'], function(Playlist){
               var dragdPlaylist = Playlist.fromURI(url);
               addHandler.Playlist(dragdPlaylist);
            });

        };

        var loadPlaylist = function(playlist){
            playlist.load('tracks').
                            done(function(playlistPromise){
                               _loadedPlaylist = playlistPromise;
                           });
        };

      var country = "WW";
      var setCountry = function(models){
        models.session.load('country').done(function(session){
          console.log(session);
          country = session.country;
        });
      };
      
      var test = function(a){
        console.log(a);
      };

    	require(['$api/models','$api/audio'], function(models) {
            setCountry(models);
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
    			createTemporary("partymote:"+timeStamp).
    			done(function(p){
                              p.addEventListener('insert', updatePlaylistView);
                              loadPlaylist(p);
    					});
    	});

    	var getPlaylist = function() {
    		return playlist;
    	};
    	return {getPlaylist:getPlaylist,
                addUserTrackFromURI:addUserTrackFromURI,
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
