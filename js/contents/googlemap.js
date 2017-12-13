"use strict";

////////////////////////////////////////////////////////////////////////////////
// GoogleMap
////////////////////////////////////////////////////////////////////////////////
Contents.googlemap = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );

	cp.SetIcon( null );

	////////////////////////////////////////////////////////////
	// 開始処理
	////////////////////////////////////////////////////////////
	this.start = function() {
		cont.addClass( 'googlemap' )
			.html( OutputTPL( 'googlemap', {} ) );

		// googleのAPIがロードされていない
		if ( typeof( google ) == 'undefined' )
		{
			cp.SetTitle( 'Google Map - ' );
			return;
		}

		var latlng = new google.maps.LatLng( cp.param['lat'], cp.param['lng'] );

		var map = new google.maps.Map( document.getElementById( 'googlemapview' ),
			{
				zoom: cp.param['zoom'],
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scaleControl: true,
			}
		);

		google.maps.event.addListener( map, 'center_changed', function() {
			var latlng = map.getCenter();
			cp.SetTitle( 'Google Map - ' + Math.round( latlng.lat() * 10000 ) / 10000 + ',' +
										   Math.round( latlng.lng() * 10000 ) / 10000, null );

			cp.param['lat'] = latlng.lat();
			cp.param['lng'] = latlng.lng();
		} );

		google.maps.event.addListener( map, 'zoom_changed', function() {
			cp.param['zoom'] = map.getZoom();
		} );


		map.setCenter( latlng );

		// マーカー
		var marker = new google.maps.Marker( {
			position: latlng,
			map: map,
		} );

		p.draggable( 'option', 'cancel', 'div.contents' );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
