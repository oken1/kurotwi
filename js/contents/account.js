"use strict";

////////////////////////////////////////////////////////////////////////////////
// アカウント
////////////////////////////////////////////////////////////////////////////////
Contents.account = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var scrollPos = null;
	let reqToken = ''
	let reqSecret = ''

	cp.SetIcon( 'icon-users' );

	////////////////////////////////////////////////////////////
	// リスト部作成
	////////////////////////////////////////////////////////////
	var ListMake = function() {
		var items = new Array();
		var cnt = 0;
		var dt, reset_time;

		for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
		{
			var id = g_cmn.account_order[i];

			dt = new Date();
			dt.setTime( g_cmn.account[id]['reset'] * 1000 );
			reset_time = ( '00' + dt.getHours() ).slice( -2 ) + ':' +
						 ( '00' + dt.getMinutes() ).slice( -2 ) + ':' +
						 ( '00' + dt.getSeconds() ).slice( -2 );

			items.push( {
				name: g_cmn.account[id]['screen_name'],
				icon: g_cmn.account[id]['icon'],
				follow: g_cmn.account[id]['follow'],
				follower: g_cmn.account[id]['follower'],
				statuses_count: NumFormat( g_cmn.account[id]['statuses_count'] ),
				id: id,
			} );

			cnt++;
		}

		var assign = {
			items: items,
		};

		$( '#account_list' ).html( OutputTPL( 'account_list', assign ) );

		cont.trigger( 'contents_resize' );

		// 選択の保持
		if ( $( '#account_del' ).attr( 'delid' ) != undefined )
		{
			if ( g_cmn.account[$( '#account_del' ).attr( 'delid' )] != undefined )
			{
				$( '#account_list' ).find( 'div.item[account_id=' + $( '#account_del' ).attr( 'delid' ) + ']' ).addClass( 'select' );
				$( '#account_del' ).removeClass( 'disabled' );
				$( '#account_setting' ).removeClass( 'disabled' );
				$( '#account_posup' ).removeClass( 'disabled' );
				$( '#account_posdown' ).removeClass( 'disabled' );
			}
		}

		////////////////////////////////////////
		// クリック時処理
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).click( function( e ) {
			$( '#account_list' ).find( 'div.item' ).removeClass( 'select' );
			$( this ).addClass( 'select' );
			$( '#account_del' )
				.attr( 'delid', $( this ).attr( 'account_id' ) )
				.removeClass( 'disabled' );
			$( '#account_setting' )
				.removeClass( 'disabled' );
			$( '#account_posup' )
				.removeClass( 'disabled' );
			$( '#account_posdown' )
				.removeClass( 'disabled' );

			SetFront( p );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// アイコンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.icon' ).find( 'img' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			OpenUserShow( g_cmn.account[account_id].screen_name,
				g_cmn.account[account_id].user_id,
				account_id );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 名前クリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.name' ).find( 'div:first-child' ).find( 'span:first-child' ).click( function( e ) {
			var account_id = $( this ).parent().parent().parent().attr( 'account_id' );

			OpenUserTimeline( g_cmn.account[account_id].screen_name, account_id );
			e.stopPropagation();
		} );

		////////////////////////////////////////
		// APIクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.apilimit' ).click( function( e ) {
			var account_id = $( this ).parent().parent().parent().attr( 'account_id' );

			var _cp = new CPanel( null, null, 360, 400 );
			_cp.SetType( 'api_remaining' );
			_cp.SetParam( {
				account_id: account_id,
			} );
			_cp.Start();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ホームボタンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.buttons' ).find( '.home' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
			_cp.SetType( 'timeline' );
			_cp.SetParam( {
				account_id: account_id,
				timeline_type: 'home',
				reload_time: g_cmn.cmn_param['reload_time'],
			} );
			_cp.Start();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// Mentionボタンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.buttons' ).find( '.mention' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
			_cp.SetType( 'timeline' );
			_cp.SetParam( {
				account_id: account_id,
				timeline_type: 'mention',
				reload_time: g_cmn.cmn_param['reload_time'],
			} );
			_cp.Start();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// リストボタンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.buttons' ).find( '.lists' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			var _cp = new CPanel( null, null, 400, 300 );
			_cp.SetType( 'lists' );
			_cp.SetParam( {
				account_id: account_id,
			} );
			_cp.Start();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// DMボタンクリック
		////////////////////////////////////////
		$( '#account_list' ).find( 'div.item' ).find( '.buttons' ).find( '.dm' ).click( function( e ) {
			var account_id = $( this ).parent().parent().attr( 'account_id' );

			var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
			_cp.SetType( 'timeline' );
			_cp.SetParam( {
				account_id: account_id,
				timeline_type: 'dmrecv',
				reload_time: g_cmn.cmn_param['reload_time'],
			} );
			_cp.Start();

			e.stopPropagation();
		} );
	};

	////////////////////////////////////////////////////////////
	// アクセストークンを取得してアカウント追加
	////////////////////////////////////////////////////////////
	var GetAccessToken = function( pin )
	{
		Blackout( true );

		// アクセストークン取得
		SendRequest(
			{
				action: 'access_token',
				reqToken: reqToken,
				reqSecret: reqSecret,
				pin: pin,
			},
			function( res )
			{
				var acsToken = '';
				var acsSecret = '';
				var user_id = '';
				var screen_name = '';

				if ( typeof res != 'string' ) {
					MessageBox( i18nGetMessage( 'i18n_0049' ) );
					Blackout( false );
					return;
				}

				if ( res.search( /oauth_token=([\w\-]+)\&/ ) != -1 )
				{
					acsToken = RegExp.$1;
				}
				if ( res.search( /oauth_token_secret=([\w\-]+)\&/ ) != -1 )
				{
					acsSecret = RegExp.$1;
				}
				if ( res.search( /user_id=([\w\-]+)\&/ ) != -1 )
				{
					user_id = RegExp.$1;
				}
				if ( res.search( /screen_name=([\w\-]+)/ ) != -1 )
				{
					screen_name = RegExp.$1;
				}

				if ( acsToken == '' || acsSecret == '' || user_id == '' || screen_name == '' )
				{
					MessageBox( i18nGetMessage( 'i18n_0049' ) );
					Blackout( false );
					return;
				}

				// アイコンを取得
				var param = {
					type: 'GET',
					url: ApiUrl( '1.1' ) + 'users/show.json',
					data: {
						user_id: user_id,
					},
				};

				$( '#account_list' ).activity( { color: '#ffffff' } );

				SendRequest(
					{
						action: 'oauth_send',
						acsToken: acsToken,
						acsSecret: acsSecret,
						param: param,
					},
					function( res )
					{
						if ( res.status == 200 )
						{
							if ( res.json.profile_image_url_https )
							{
								var account_id = GetUniqueID();

								// アカウント追加
								g_cmn.account[account_id] = {
									accessToken: acsToken,
									accessSecret: acsSecret,
									user_id: user_id,
									screen_name: screen_name,
									name: res.json.name,
									icon: res.json.profile_image_url_https,
									follow: res.json.friends_count,
									follower: res.json.followers_count,
									statuses_count: res.json.statuses_count,
									notsave: {
										protected: res.json.protected,
									},
								};

								g_cmn.account_order.push( account_id.toString() );

								// アカウントパネル更新
								$( '#account_list' ).activity( false );

								$( '#head' ).trigger( 'account_update' );

								UpdateToolbarUser();

								GetAccountInfo( account_id, function() {
									Blackout( false );

									// フォローリクエストの表示(仮)
									if ( g_cmn.account[account_id].notsave.protected && g_cmn.account[account_id].notsave.incoming.length > 0 )
									{
										setTimeout( function( _id ) {
											OpenNotification( 'incoming', {
												user: g_cmn.account[_id].screen_name,
												img: g_cmn.account[_id].icon,
												count: g_cmn.account[_id].notsave.incoming.length,
											} )
										}, 1000, account_id );
									}
								} );
							}
						}
						else
						{
							ApiError( i18nGetMessage( 'i18n_0045' ), res );
							$( '#account_list' ).activity( false );
							Blackout( false );
						}
					}
				);
			}
		);
	};

	////////////////////////////////////////////////////////////
	// 開始処理
	////////////////////////////////////////////////////////////
	this.start = function() {
		////////////////////////////////////////
		// 最小化/設定切替時のスクロール位置
		// 保存/復元
		////////////////////////////////////////
		cont.on( 'contents_scrollsave', function( e, type ) {
			// 保存
			if ( type == 0 )
			{
				if ( scrollPos == null )
				{
					scrollPos = $( '#account_list' ).scrollTop();
				}
			}
			// 復元
			else
			{
				if ( scrollPos != null )
				{
					$( '#account_list' ).scrollTop( scrollPos );
					scrollPos = null;
				}
			}
		} );

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			$( '#account_list' ).height( cont.height() - cont.find( '.panel_btns' ).height() - 1 );
		} );

		////////////////////////////////////////
		// アカウント情報更新
		////////////////////////////////////////
		cont.on( 'account_update', function() {
			// 削除ボタン
			$( '#account_del' ).addClass( 'disabled' );

			// 設定ボタン
			$( '#account_setting' ).addClass( 'disabled' );

			// ▲▼ボタン
			$( '#account_posup' ).addClass( 'disabled' );
			$( '#account_posdown' ).addClass( 'disabled' );

			ListMake();

			// 全削除ボタン有効/無効
			if ( AccountCount() > 0 )
			{
				$( '#account_alldel' ).removeClass( 'disabled' );
			}
			else
			{
				$( '#account_alldel' ).addClass( 'disabled' );
			}
		} );

		// 全体を作成
		cont.addClass( 'account' )
			.html( OutputTPL( 'account', {} ) );

		cp.SetTitle( i18nGetMessage( 'i18n_0044' ), false );
			
		////////////////////////////////////////
		// 追加ボタンクリック処理
		////////////////////////////////////////
		$( '#account_add' ).click( function( e ) {
			// リクエストトークン取得
			SendRequest(
				{
					action: 'request_token',
				},
				function( res )
				{
					if ( res.search( /oauth_token=([\w\-]+)\&/ ) != -1 )
					{
						reqToken = RegExp.$1;
					}
					if ( res.search( /oauth_token_secret=([\w\-]+)\&/ ) != -1 )
					{
						reqSecret = RegExp.$1;
					}

					if ( reqToken == '' || reqSecret == '' )
					{
						MessageBox( i18nGetMessage( 'i18n_0166' ) );
						return;
					}

					// 認証ウィンドウを開く
					SendRequest(
						{
							action: 'oauth_window',
							reqToken: reqToken,
							reqSecret: reqSecret,
						},
						function( res )
						{
							chrome.tabs.create( { url: res }, function () {
								// PIN入力の表示
								$( '#pin_input' ).show()
								$( '#pin_input_text' ).val( '' )
								$( '#pin_input_ok' ).addClass( 'disabled' )
							} )
						}
					);
				}
			);
		} );

		////////////////////////////////////////
		// 入力文字数によるボタン制御(コード)
		////////////////////////////////////////
		$( '#pin_input_text' ).on( 'keyup change', function() {
			if ( $( '#pin_input_text' ).val().match( /^\d+$/ ) )
			{
				$( '#pin_input_ok' ).removeClass( 'disabled' );
			}
			else
			{
				$( '#pin_input_ok' ).addClass( 'disabled' );
			}
		} )

		////////////////////////////////////////
		// OKボタンクリック処理
		////////////////////////////////////////
		$( '#pin_input_ok' ).on( 'click', function() {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			GetAccessToken( $( '#pin_input_text' ).val() )

			$( '#pin_input' ).hide();
			$( '#pin_input_text' ).val( '' );
			$( '#pin_input_ok' ).addClass( 'disabled' );
		} )

		////////////////////////////////////////
		// Cancelボタンクリック処理
		////////////////////////////////////////
		$( '#pin_input_cancel' ).on( 'click', function() {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			$( '#pin_input' ).hide();
			$( '#pin_input_text' ).val( '' );
			$( '#pin_input_ok' ).addClass( 'disabled' );
		} );
	
		////////////////////////////////////////
		// 削除ボタンクリック処理
		////////////////////////////////////////
		$( '#account_del' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			if ( confirm( i18nGetMessage( 'i18n_0185', [g_cmn.account[$( this ).attr( 'delid' )].screen_name] ) ) )
			{
				delete g_cmn.account[$( this ).attr( 'delid' )];

				for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
				{
					if ( g_cmn.account_order[i] == $( this ).attr( 'delid' ) )
					{
						g_cmn.account_order.splice( i, 1 );
						break;
					}
				}

				$( '#account_list' ).find( 'div.item' ).each( function() {
					if ( $( this ).hasClass( 'select' ) )
					{
						$( this ).fadeOut( 'fast', function() { $( '#head' ).trigger( 'account_update' ); } );
					}
				} );

				UpdateToolbarUser();
			}
		} );

		////////////////////////////////////////
		// 全削除ボタンクリック処理
		////////////////////////////////////////
		$( '#account_alldel' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			if ( confirm( i18nGetMessage( 'i18n_0073' ) ) )
			{
				g_cmn.account = {};
				g_cmn.account_order = [];

				$( '#account_list' ).find( 'div.item' ).fadeOut( 'fast', function() { $( '#head' ).trigger( 'account_update' ); } );

				UpdateToolbarUser();
			}
		} );

		////////////////////////////////////////
		// アカウント設定ボタンクリック処理
		////////////////////////////////////////
		$( '#account_setting' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var pid = IsUnique( 'accountset' );

			if ( pid == null )
			{
				var _cp = new CPanel( null, null, 360, 420 );
				_cp.SetType( 'accountset' );
				_cp.SetParam( {
					account_id: $( '#account_del' ).attr( 'delid' ),
				} );
				_cp.Start();
			}
			else
			{
				var _cp = GetPanel( pid );
				_cp.SetType( 'accountset' );
				_cp.SetParam( {
					account_id: $( '#account_del' ).attr( 'delid' ),
				} );
				$( '#' + pid ).find( 'div.contents' ).trigger( 'account_change' );
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ▲ボタンクリック処理
		////////////////////////////////////////
		$( '#account_posup' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var selid = $( '#account_del' ).attr( 'delid' );

			for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
			{
				if ( g_cmn.account_order[i] == selid )
				{
					if ( i > 0 )
					{
						var tmp = g_cmn.account_order[i - 1];
						g_cmn.account_order[i - 1] = g_cmn.account_order[i];
						g_cmn.account_order[i] = tmp;
						$( '#head' ).trigger( 'account_update' );
					}

					break;
				}
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ▼ボタンクリック処理
		////////////////////////////////////////
		$( '#account_posdown' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var selid = $( '#account_del' ).attr( 'delid' );

			for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
			{
				if ( g_cmn.account_order[i] == selid )
				{
					if ( i < g_cmn.account_order.length - 1 )
					{
						var tmp = g_cmn.account_order[i + 1];
						g_cmn.account_order[i + 1] = g_cmn.account_order[i];
						g_cmn.account_order[i] = tmp;
						$( '#head' ).trigger( 'account_update' );
					}

					break;
				}
			}

			e.stopPropagation();
		} );

		$( '#pin_input' ).hide()

		// リスト部作成処理
		cont.trigger( 'account_update' );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
