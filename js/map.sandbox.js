"use strict";

( function() {
	var lat, lng, zoom, cpid;
	var map;
	var currentMarker = null;

	function SendMsg( msg )
	{
		parent.postMessage( 'cpid=' + cpid + ',' + msg, '*' );
	}

	function SetMarker( latlng )
	{
		if ( currentMarker != null )
		{
			currentMarker.setMap( null );
		}

		var marker = new google.maps.Marker( {
			position: latlng,
			map: map
		} );

		currentMarker = marker;
	}

	if ( typeof ( google ) == 'undefined' )
	{
		SendMsg( 'status=error' );
		return;
	}

	google.maps.event.addDomListener( window, 'load', function() {
		var param = location.search.replace( /^\?/, '' );
		var keyvals = param.split( '&' );
		var keys = {};

		for ( var i = 0, _len = keyvals.length ; i < _len ; i++ )
		{
			var keyval = keyvals[i].split( '=' );
			keys[keyval[0]] = decodeURIComponent( keyval[1] );
		}

		lat = keys['lat'];
		lng = keys['lng'];
		zoom = parseInt( keys['zoom'] );
		cpid = keys['cpid'];

		var latlng = new google.maps.LatLng( lat, lng );

		map = new google.maps.Map( document.querySelector('.mapdiv'),
			{
				zoom: zoom,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scaleControl: true,
			}
		);

		if ( keys['mode'] == 'setting' )
		{
			google.maps.event.addListener( map, 'click', function( e ) {
				SetMarker( e.latLng );
			} );
		}

		google.maps.event.addListener( map, 'center_changed', function() {
			var latlng = map.getCenter();
			SendMsg( 'status=latlng,lat=' + latlng.lat() + ',lng=' + latlng.lng() );
		} );

		google.maps.event.addListener( map, 'zoom_changed', function() {
			SendMsg( 'status=zoom,zoom=' + map.getZoom() );
		} );

		map.setCenter( latlng );
		SetMarker( latlng );
	} );
} )();
