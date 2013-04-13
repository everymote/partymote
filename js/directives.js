'use strict';

/* Directives */


angular.module('partymote.directives', ['partymote.services']).
  directive('dropArea', function(dropHandler) {
    return function(scope, elm, attrs) {
    		
   		var dropBox = elm[0];
   		dropBox.addEventListener('dragstart', function(e){
   		    e.dataTransfer.setData('text/html', this.innerHTML);
   		    e.dataTransfer.effectAllowed = 'copy';
   		}, false);

   		dropBox.addEventListener('dragenter', function(e){
   		    if (e.preventDefault) e.preventDefault();
   		    e.dataTransfer.dropEffect = 'copy';
   		    this.classList.add('over');
   		}, false);

   		dropBox.addEventListener('dragover', function(e){
   		    if (e.preventDefault) e.preventDefault();
   		    e.dataTransfer.dropEffect = 'copy';
   		    return false;
   		}, false);

   		dropBox.addEventListener('drop', function(e){
   		    if (e.preventDefault) e.preventDefault();
   		    var droped = e.dataTransfer.getData('text').split(' ');
   		    console.log(droped);
   		    dropHandler.handleDropedUrls(droped);
   		   /* this.classList.remove('over');
   		    var success_message = document.createElement('p');
   		    success_message.innerHTML = 'Playlist successfully dropped: ' + drop.uri;
   		    this.appendChild(success_message);*/
   		}, false);

    };
  });
