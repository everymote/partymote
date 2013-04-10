'use strict';

/* Controllers */


function MainCtrl($scope, location, playlistServices) {
	location.start(function(position){
					console.log(position);
				});

	$scope.playlist = playlistServices.getPlaylist();
};


function SettingsCtrl($scope, localStorage) {
	$scope.name = localStorage.getItem('partymote.name') || "";
	$scope.accessmode = localStorage.getItem('partymote.accessmode') || "wifi";

	$scope.updateAccessmode = function(){
		localStorage.setItem('partymote.accessmode',$scope.accessmode);
	};
	$scope.updateName = function(){
		localStorage.setItem('partymote.name',$scope.name);
	};
};
