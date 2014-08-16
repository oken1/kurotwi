"use strict";

( function() {
	var url, count, mode, uid, cpid;

	function SendMsg( msg )
	{
		parent.postMessage( 'cpid=' + cpid + ',uid=' + uid + ',' + msg, '*' );
	}

	if ( typeof( google ) == 'undefined' )
	{
		SendMsg( 'status=error' );
		return;
	}

	google.load( 'feeds', '1' );
	google.setOnLoadCallback( Init );

	function Init()
	{
		var param = location.search.replace( /^\?/, '' );
		var keyvals = param.split( '&' );
		var keys = {};
		var items = new Array();

		for ( var i = 0, _len = keyvals.length ; i < _len ; i++ )
		{
			var keyval = keyvals[i].split( '=' );
			keys[keyval[0]] = decodeURIComponent( keyval[1] );
		}

		url = keys['url'];
		count = keys['count'];
		mode = keys['mode'];
		uid = keys['uid'];
		cpid = keys['cpid'];

		var feed;

		if ( url.match( /\?.+/ ) )
		{
			feed = new google.feeds.Feed( url + '&' + GetUniqueID() );
		}
		else
		{
			feed = new google.feeds.Feed( url + '?' + GetUniqueID() );
		}

		feed.setNumEntries( count );

		feed.load( function( res ) {
			if ( !res.error )
			{
				items.push( {
					feedtitle: res.feed.title,
					feedlink: res.feed.link,
				} );

				for ( var i = 0, _len = res.feed.entries.length ; i < _len ; i++ )
				{
					var entry = res.feed.entries[i];

					items.push( {
						title: entry.title,
						link: entry.link,
						description: entry.contentSnippet
					} );
				}

				SendMsg( 'status=res.ok,mode=' + mode +
						 ',url=' + encodeURIComponent( url ) +
						 ',items=' + encodeURIComponent( JSON.stringify( items ) ) );
			}
			else
			{
				SendMsg( 'status=res.error,mode=' + mode );
			}
		} );
	}
} )();
