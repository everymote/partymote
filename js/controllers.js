'use strict';

/* Controllers */


function MainCtrl($scope, location, playlistServices) {
	location.start(function(position){
					console.log(position);
				});

	$scope.playlist = playlistServices.getPlaylist();
}
//MainCtrl.$inject = [];


function SettingsCtrl() {
}
SettingsCtrl.$inject = [];
