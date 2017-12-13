"use strict";

////////////////////////////////////////////////////////////////////////////////
// 位置情報設定
////////////////////////////////////////////////////////////////////////////////
Contents.geosetting = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );

	cp.SetIcon( 'icon-earth' );

	////////////////////////////////////////////////////////////
	// 開始処理
	////////////////////////////////////////////////////////////
	this.start = function() {
		cont.addClass( 'geosetting' )
			.html( OutputTPL( 'geosetting', {} ) );

		cp.SetTitle( i18nGetMessage( 'i18n_0190' ), false );
			
		// googleのAPIがロードされていない
		if ( typeof( google ) == 'undefined' )
		{
			$( '#geoapply' ).addClass( 'disabled' );
			$( '#curgeo' ).addClass( 'disabled' );
			return;
		}

		var latlng = new google.maps.LatLng( cp.param['lat'], cp.param['lng'] );

		var map = new google.maps.Map( document.getElementById( 'geosetmap' ),
			{
				zoom: cp.param['zoom'],
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scaleControl: true,
			}
		);

		var currentMarker = null;

		var SetMarker = function( latlng ) {
			if ( currentMarker != null )
			{
				currentMarker.setMap( null );
			}

			var marker = new google.maps.Marker( {
				position: latlng,
				map: map,
			} );

			currentMarker = marker;

			cp.param['lat'] = latlng.lat();
			cp.param['lng'] = latlng.lng();
		};

		// クリックした位置にマーカーを置く
		google.maps.event.addListener( map, 'click', function( e ) {
			SetMarker( e.latLng );
		} );

		google.maps.event.addListener( map, 'zoom_changed', function() {
			cp.param['zoom'] = map.getZoom();
		} );

		map.setCenter( latlng );

		SetMarker( latlng );

		p.draggable( 'option', 'cancel', 'div.contents' );

		// 設定する
		$( '#geoapply' ).on( 'click', function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var pid = IsUnique( 'tweetbox' );

			if ( pid != null )
			{
				var item = {
					lat: cp.param['lat'],
					lng: cp.param['lng'],
					zoom: cp.param['zoom'],
				};

				$( '#' + pid ).find( 'div.contents' ).trigger( 'geoapply', [item] );
			}

			p.find( '.close' ).trigger( 'click', [false] );

			e.stopPropagation();
		} );

		// 現在地取得
		$( '#curgeo' ).on( 'click', function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			navigator.geolocation.getCurrentPosition( function( pos ) {
				var _latlng = new google.maps.LatLng( pos.coords.latitude, pos.coords.longitude );

				SetMarker( _latlng );

				map.setCenter( _latlng );
			} );

			e.stopPropagation();
		} );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
