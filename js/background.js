"use strict";

console.log( 'KuroTwi background loaded.' );

var currentTab = undefined;

chrome.browserAction.onClicked.addListener( function( tab ) {
	if ( currentTab == undefined ) {
		chrome.tabs.create( { url: chrome.extension.getURL( 'index.html' ) }, function( tab ) {
			currentTab = tab;

			chrome.tabs.onRemoved.addListener( function( tabId, removeInfo ) {
				if ( tabId == currentTab.id && removeInfo.windowId == currentTab.windowId ) {
					currentTab = undefined;
				}
			} )
		} )
	}
	else {
		chrome.windows.update( currentTab.windowId, { focused: true } );
		chrome.tabs.update( currentTab.id, { active: true } );
	}
} );


