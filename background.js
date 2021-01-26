"use strict";

chrome.action.onClicked.addListener( function( tab ) {
	chrome.tabs.query( { title: 'KuroTwi' }, function( tabs ) {
		var multi = false;
		
		for ( var i = 0 ; i < tabs.length ; i++ )
		{
			if ( tabs[i].url.match( /^(chrome|moz)-extension:\/\// ) )
			{
				multi = true;
				chrome.windows.update( tabs[i].windowId, { focused: true } );
				chrome.tabs.update( tabs[i].id, { active: true } );
				break;
			}
		}

		if ( multi == false )
		{
			chrome.tabs.create( { url: chrome.runtime.getURL( 'index.html' ) } );
		}
	} );
} );

