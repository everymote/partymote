'use strict';

/* Controllers */


function MainCtrl($scope, location, playlistServices) {
	location.start(function(position){
					console.log(position);
				});

	$scope.playlist = playlistServices.getPlaylist();
};


function SettingsCtrl($scope, settings) {
	$scope.name = settings.name.get();
	$scope.accessmode = settings.accessMode.get();

	$scope.updateAccessmode = function(){
		settings.accessMode.set($scope.accessmode);
	};
	$scope.updateName = function(){
		settings.name.set($scope.name);
	};
};
