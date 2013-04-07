'use strict';

/* Filters */

angular.module('partymote.filters', []).
  filter('zero', function() {
  	return function(index){
  		var s = "0" + index;
    	return s.substr(s.length-2); 
	};
  });
