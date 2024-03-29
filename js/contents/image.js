"use strict";

////////////////////////////////////////////////////////////////////////////////
// イメージ表示
////////////////////////////////////////////////////////////////////////////////
Contents.image = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var scaleX = 1, scaleY = 1, rotate = 0;
	var fit = true;

	cp.SetIcon( 'icon-image' );

	////////////////////////////////////////////////////////////
	// タイトル設定
	////////////////////////////////////////////////////////////
	const setTitle = ( append ) => {
		let title_url = ( cp.param['video'] && Array.isArray( cp.param['url'] ) ) ? cp.param['url'][0] : cp.param['url']
		title_url = title_url.replace( /api_key=\w+\&/, '' )

		if ( title_url.match( /^data:image\// ) )
		{
			title_url = i18nGetMessage( 'i18n_0256' )
		}

		cp.SetTitle( i18nGetMessage( 'i18n_0199' ) + ' - ' + title_url + append, false )
	}

	////////////////////////////////////////////////////////////
	// 開始処理
	////////////////////////////////////////////////////////////
	this.start = function() {
		setTitle()
		setTimeout( function() { cont.activity( { color: '#ffffff' } ); }, 0 );

		if ( cp.param['video'] )
		{
			let items = []

			if ( Array.isArray( cp.param['url'] ) ) {
				for ( let i = 0 ; i < cp.param['url'].length ; i++ ) {
					items.push( {
						url: cp.param['url'][i],
						contenttype: cp.param['contenttype'][i]
					} )
				}
			} else {
				items.push( {
					url: cp.param['url'],
					contenttype: cp.param['contenttype']
				} )
			}

			cont.addClass( 'image' )
				.html( OutputTPL( 'image', { items: items, video: true, poster: cp.param['poster'] } ) );
		}
		else
		{
			cont.addClass( 'image' )
				.html( OutputTPL( 'image', { url: cp.param['url'] } ) );
		}

		cont.find( '.resizebtn' ).hide();

		////////////////////////////////////////
		// 画像のサイズをパネルに合わせる
		////////////////////////////////////////
		var FitPanelSize = function() {
			var pw = cont.outerWidth();
			var ph = cont.outerHeight() - p.find( 'div.titlebar' ).outerHeight()+5;

			var nw, nh;

			if ( cp.param['video'] )
			{
				if ( cont.find( 'video' ).length ) {
					nw = cont.find( 'video' ).get( 0 ).videoWidth;
					nh = cont.find( 'video' ).get( 0 ).videoHeight;
				}
			}
			else
			{
				nw = cont.find( 'img.image' ).get( 0 ).naturalWidth;
				nh = cont.find( 'img.image' ).get( 0 ).naturalHeight;
			}

			var pnw = pw;
			var pnh = pw / nw * nh;

			if ( pnh > ph )
			{
				pnh = ph;
				pnw = ph / nh * nw;
			}

			cont.find( 'img.image, video' ).css( {
				width: pnw,
				height: pnh,
			} );
		};

		////////////////////////////////////////
		// 画像のサイズを実サイズにする
		////////////////////////////////////////
		var RealSize = function() {
			if ( cp.param['video'] )
			{
				var img = cont.find( 'video' );

				img.width( img.get( 0 ).videoWidth )
					.height( img.get( 0 ).videoHeight );
			}
			else
			{
				var img = cont.find( 'img.image' );

				img.width( img.get( 0 ).naturalWidth )
					.height( img.get( 0 ).naturalHeight );
			}
		};

		////////////////////////////////////////
		// ロード完了
		////////////////////////////////////////
		var LoadedEvent = function() {
			// 実サイズ
			var nw, nh;

			if ( cp.param['video'] )
			{
				nw = $( this ).get( 0 ).videoWidth;
				nh = $( this ).get( 0 ).videoHeight;
				setTitle( ' (' + nw + '×' + nh + ')')
			}
			else
			{
				nw = $( this ).get( 0 ).naturalWidth;
				nh = $( this ).get( 0 ).naturalHeight;
				setTitle( ' (' + nw + '×' + nh + ')' )
			}

			setTimeout( function() {cont.activity( false ); }, 0 );

			// 巨大画像の表示抑止
			var mainw = $( window ).width() * 0.95;
			var mainh = ( $( window ).height() ) * 0.85;

			if ( nw > mainw )
			{
				nh = mainw * nh / nw;
				nw = mainw;
			}

			if ( nh > mainh )
			{
				nw = mainh * nw / nh;
				nh = mainh;
			}

			// タイトルバーのボタン表示分の幅を確保
			var barsize = p.find( 'div.titlebar' ).find( '.close' ).outerWidth() * 3 + 48;

			nw = ( nw < barsize ) ? barsize : nw;

			if ( nh < 200 )
			{
				nh = 200;
			}

			nh = nh + p.find( 'div.titlebar' ).outerHeight() + 24;

			p.css( { width: nw, height: nh, left: ( $( 'body' ).outerWidth() - nw ) / 2 + $( document ).scrollLeft() } )
				.trigger( 'resize' );

			// 画像ダブルクリックで閉じる
			cont.find( 'img.image,video' ).on( 'dblclick', function( e ) {
				p.find( '.close' ).trigger( 'click', [false] );
			} );

			////////////////////////////////////////
			// パネルサイズに合わせる
			////////////////////////////////////////
			cont.find( '.img_panelsize' ).click( function( e ) {
				fit = true;

				FitPanelSize();

				p.trigger( 'resize' );
				e.stopPropagation();
			} );

			////////////////////////////////////////
			// 実サイズで表示
			////////////////////////////////////////
			cont.find( '.img_fullsize' ).click( function( e ) {
				fit = false;

				RealSize();

				p.trigger( 'resize' );
				e.stopPropagation();
			} );

			////////////////////////////////////////
			// 上下反転
			////////////////////////////////////////
			cont.find( '.img_udreverse' ).click( function( e ) {
				scaleY = ( scaleY == 1 ) ? -1 : 1;

				cont.find( 'img.image, video' ).css( { '-webkit-transform': 'scale(' + scaleX + ',' + scaleY + ') rotate(' + rotate + 'deg)' } );
				e.stopPropagation();
			} );

			////////////////////////////////////////
			// 左右反転
			////////////////////////////////////////
			cont.find( '.img_lrreverse' ).click( function( e ) {
				scaleX = ( scaleX == 1 ) ? -1 : 1;

				cont.find( 'img.image, video' ).css( { '-webkit-transform': 'scale(' + scaleX + ',' + scaleY + ') rotate(' + rotate + 'deg)' } );
				e.stopPropagation();
			} );

			////////////////////////////////////////
			// 回転
			////////////////////////////////////////
			cont.find( '.img_rotate' ).click( function( e ) {
				rotate = ( rotate == 270 ) ? 0 : rotate + 90;

				cont.find( 'img.image, video' ).css( { '-webkit-transform': 'scale(' + scaleX + ',' + scaleY + ') rotate(' + rotate + 'deg)' } );
				e.stopPropagation();
			} );

			////////////////////////////////////////
			// リサイズボタン群表示
			////////////////////////////////////////
			if ( !cp.param['video'] )
			{
				cont.mouseenter( function( e ) {
					cont.find( '.resizebtn' ).show();
				} );
			}

			////////////////////////////////////////
			// リサイズボタン群非表示
			////////////////////////////////////////
			cont.mouseleave( function( e ) {
				cont.find( '.resizebtn' ).hide();
			} );

			////////////////////////////////////////
			// 音量
			////////////////////////////////////////
			if ( cp.param['video'] ) {
				cont.find( 'video' )
					.prop( 'volume', g_cmn.video_volume )
					.on( 'volumechange', function() {
						g_cmn.video_volume = this.volume
					} )
			}

			// 初期表示
			cont.find( '.img_panelsize' ).trigger( 'click' );
		};

		cont.find( 'img.image' ).on( 'load', LoadedEvent );
		cont.find( 'video' ).on( 'loadedmetadata', LoadedEvent );

		if ( g_devmode ) {
			console.log( '--event-----------' )
			cont.find( 'video' ).on( 'loadstart', () => { console.log('loadstart') } )
			cont.find( 'video' ).on( 'suspend', () => { console.log('suspend') } )
			cont.find( 'video' ).on( 'abort', () => { console.log('abort') } )
			cont.find( 'video' ).on( 'error', () => { console.log('error') } )
			cont.find( 'video' ).on( 'emptied', () => { console.log('emptied') } )
			cont.find( 'video' ).on( 'stalled', () => { console.log('stalled') } )
			cont.find( 'video' ).on( 'loadedmetadata', () => { console.log('loadedmetadata') } )
			cont.find( 'video' ).on( 'canplay', () => { console.log('canplay') } )
			cont.find( 'video' ).on( 'playing', () => { console.log('playing') } )
		}

		////////////////////////////////////////
		// 読み込み失敗
		////////////////////////////////////////
		var ErrorEvent = function( e ) {
			if ( g_devmode ) {
				console.log( '読み込み失敗' )
				console.log( cont.find( 'video' ).get(0).error )
			}

			setTitle( ' (' + i18nGetMessage( 'i18n_0258' ) + ')' )
			setTimeout( function() { cont.activity( false ); }, 0 );

			cont.find( 'video' ).addClass( 'error' )
			//cont.find( 'video' ).remove()
		};

		cont.find( 'img.image,video' ).on( 'error', ErrorEvent );

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			if ( fit )
			{
				FitPanelSize();
			}
		} );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
