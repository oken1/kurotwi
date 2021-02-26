"use strict";

////////////////////////////////////////////////////////////////////////////////
// 設定
////////////////////////////////////////////////////////////////////////////////
Contents.cmnsetting = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var scrollPos = null;

	cp.SetIcon( 'icon-cog' );

	////////////////////////////////////////////////////////////
	// ハッシュタグプルダウンメニューを作成
	////////////////////////////////////////////////////////////
	function MakeHashtagPullDown()
	{
		var s = '';

		for ( var i = 0, _len = g_cmn.notsave.tl_hashtag.length ; i < _len ; i++ )
		{
			s += '<div class="item tlhash" text="' + escapeHTML( g_cmn.notsave.tl_hashtag[i].hashtag ) + '">' + escapeHTML( g_cmn.notsave.tl_hashtag[i].hashtag ) + '</div>';
		}

		var pulldown = cont.find( '#hashtag_pulldown' );

		pulldown.html( s );

		if ( s == '' )
		{
			pulldown.hide();
		}
	}

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
					scrollPos = $( '#cmnsetting_items' ).scrollTop();
				}
			}
			// 復元
			else
			{
				if ( scrollPos != null )
				{
					$( '#cmnsetting_items' ).scrollTop( scrollPos );
				}
			}
		} );

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			$( '#cmnsetting_items' ).height( cont.height() - cont.find( '.panel_btns' ).height() - 1 );
		} );

		////////////////////////////////////////
		// プルダウン更新
		////////////////////////////////////////
		cont.on( 'hashtag_pulldown_update', function( e ) {
			MakeHashtagPullDown();
		} );

		// 全体を作成
		cont.addClass( 'cmnsetting' )
			.html( OutputTPL( 'cmnsetting', {
				param: g_cmn.cmn_param,
			} ) );

		cp.SetTitle( i18nGetMessage( 'i18n_0242' ), false );
			
		////////////////////////////////////////
		// スクロール処理
		////////////////////////////////////////
		$( '#cmnsetting_items' ).scroll( function( e ) {
			var pulldown = $( '#hashtag_pulldown' );

			if ( pulldown.css( 'display' ) != 'none' )
			{
				var _text = $( '#csethash_list' ).find( '.hashitem:eq(' + pulldown.attr( 'index' ) + ')' ).find( 'input[type=text]' );
				pulldown.css( { top: Math.floor( _text.position().top ) + _text.outerHeight() } );
			}
		} );

		$( '#cmnsetting_apply' ).addClass( 'disabled' );

		// 現行値設定(スライダー)
		$( '#cset_font_size' ).slider( {
			min: 10,
			max: 24,
			value: g_cmn.cmn_param['font_size'],
			animate: 'fast',
			slide: function( e, ui ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				$( '#cset_font_size_disp' ).html( ui.value + 'px' );
			},
		} );

		$( '#cset_reload_time' ).slider( {
			min: 60,
			max: 600,
			step: 30,
			value: g_cmn.cmn_param['reload_time'],
			animate: 'fast',
			slide: function( e, ui ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				$( '#cset_reload_time_disp' ).html( ui.value + i18nGetMessage( 'i18n_0270' ) );
			},
		} );

		$( '#cset_get_count' ).slider( {
			min: 20,
			max: 200,
			step: 10,
			value: g_cmn.cmn_param['get_count'],
			animate: 'fast',
			slide: function( e, ui ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				$( '#cset_get_count_disp' ).html( ui.value + i18nGetMessage( 'i18n_0204' ) );

				if ( $( '#cset_max_count' ).slider( 'value' ) < ui.value )
				{
					$( '#cset_max_count' ).slider( 'value', ui.value );
				}

				$( '#cset_max_count' ).slider( 'option', {
					min: ui.value,
				} );

				$( '#cset_max_count_disp' ).html( $( '#cset_max_count' ).slider( 'value' ) + i18nGetMessage( 'i18n_0204' ) );
			},
		} );

		$( '#cset_max_count' ).slider( {
			min: g_cmn.cmn_param['get_count'],
			max: 1000,
			step: 10,
			value: g_cmn.cmn_param['max_count'],
			animate: 'fast',
			slide: function( e, ui ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				$( '#cset_max_count_disp' ).html( ui.value + i18nGetMessage( 'i18n_0204' ) );
			},
		} );

		$( '#cset_notify_sound_volume' ).slider( {
			min: 0.0,
			max: 1.0,
			step: 0.1,
			value: g_cmn.cmn_param['notify_sound_volume'],
			animate: 'fast',
			slide: function( e, ui ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				$( '#cset_notify_sound_volume_disp' ).html( ui.value );
			},
		} );

		////////////////////////////////////////
		// 色入力変更処理
		////////////////////////////////////////
		cont.find( '.colorcontainer' ).find( 'input[type="text"]' ).on( 'change', function() {
			var col = $( this ).val();

			$( this ).closest( '.colorcontainer' ).find( 'input[type="color"]' ).val( col );
		} );

		////////////////////////////////////////
		// 色選択変更処理
		////////////////////////////////////////
		cont.find( '.colorcontainer' ).find( 'input[type="color"]' ).on( 'change', function() {
			var col = $( this ).val();

			$( this ).closest( '.colorcontainer' ).find( 'input[type="text"]' ).val( col );
		} );

		////////////////////////////////////////
		// 色の設定をリセット
		////////////////////////////////////////
		$( '#cset_reset_color' ).on( 'click', function( e ) {
			var colors = new Array(
				$( ':root' ).css( '--default-panel-background' ),
				$( ':root' ).css( '--default-panel-text' ),
				$( ':root' ).css( '--default-tweet-background' ),
				$( ':root' ).css( '--default-tweet-text' ),
				$( ':root' ).css( '--default-tweet-link' ),
				$( ':root' ).css( '--default-titlebar-background' ),
				$( ':root' ).css( '--default-titlebar-text' ),
				$( ':root' ).css( '--default-titlebar-fixed-background' ),
				$( ':root' ).css( '--default-button-background' ),
				$( ':root' ).css( '--default-button-text' ),
				$( ':root' ).css( '--default-scrollbar-background' ),
				$( ':root' ).css( '--default-scrollbar-thumb' )
			);

			cont.find( '.colorcontainer' ).find( 'input[type="text"]' ).each( function( index ) {
				$( this ).val( colors[index] ).trigger( 'change' );
			} );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 色の設定をツイート
		////////////////////////////////////////
		$( '#cset_tweet_color' ).on( 'click', function( e ) {
			var text = '[KuroTwi_color_v1.1]';

			text += $( '#cset_color_panel_background' ).val() + ',' +
					$( '#cset_color_panel_text' ).val() + ',' +
					$( '#cset_color_tweet_background' ).val() + ',' +
					$( '#cset_color_tweet_text' ).val() + ',' +
					$( '#cset_color_tweet_link' ).val() + ',' +
					$( '#cset_color_titlebar_background' ).val() + ',' +
					$( '#cset_color_titlebar_text' ).val() + ',' +
					$( '#cset_color_titlebar_fixed' ).val() + ',' +
					$( '#cset_color_button_background' ).val() + ',' +
					$( '#cset_color_button_text' ).val() + ',' +
					$( '#cset_color_scrollbar_background' ).val() + ',' +
					$( '#cset_color_scrollbar_thumb' ).val();

			text = text.replace( /#/g, '' );

			var pid = IsUnique( 'tweetbox' );
			var left = null;
			var top = null;
			var width = 324;

			var SetText = function() {
				var areatext = $( '#tweetbox_text' ).val();
				var pos = $( '#tweetbox_text' ).get( 0 ).selectionStart;
				var bef = areatext.substr( 0, pos );
				var aft = areatext.substr( pos, areatext.length );

				$( '#tweetbox_text' ).val( bef + text + aft )
					.focus()
					.trigger( 'keyup' );
			};

			// ツイートパネルが開いていない場合は開く
			if ( pid == null )
			{
				var _cp = new CPanel( left, top, width, 240 );
				_cp.SetType( 'tweetbox' );
				_cp.SetParam( { account_id: '', rep_user: null, hashtag: null } );
				_cp.Start( function() {
					SetText();
					$( '#tweetbox_text' ).SetPos( 'start' );
				} );
			}
			else
			{
				SetText();
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 試聴ボタンクリック処理
		////////////////////////////////////////
		$( '#cset_audition' ).on( 'click', function( e ) {
			$( '#notify_sound' ).get( 0 ).volume = $( '#cset_notify_sound_volume' ).slider( 'value' );
			$( '#notify_sound' ).get( 0 ).play();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// NG設定復元
		////////////////////////////////////////
		for ( var i = 0, _len = g_cmn.cmn_param.ngwords.length ; i < _len ; i++ )
		{
			AppendNGItem( g_cmn.cmn_param.ngwords[i].enabled,
						  g_cmn.cmn_param.ngwords[i].type,
						  g_cmn.cmn_param.ngwords[i].word );
		}

		for ( var i = 0, _len = g_cmn.hashtag.length ; i < _len ; i++ )
		{
			AppendHashItem( g_cmn.hashtag[i].hashtag );
		}

		////////////////////////////////////////
		// NG設定追加ボタンクリック処理
		////////////////////////////////////////
		$( '#cset_ngappend' ).on( 'click', function( e ) {
//			if ( $( '#csetng_list' ).find( '.ngitem' ).length >= 100 )
//			{
//				MessageBox( i18nGetMessage( 'i18n_0069' ) );
//			}
//			else
			{
				AppendNGItem();

				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ハッシュタグ設定追加ボタンクリック処理
		////////////////////////////////////////
		$( '#cset_hashappend' ).on( 'click', function( e ) {
			AppendHashItem();

			$( '#cmnsettihash_apply' ).removeClass( 'disabled' );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ハッシュタグプルダウン選択
		////////////////////////////////////////
		$( '#hashtag_pulldown' ).on( 'click', '> div.item', function( e ) {
			$( '#csethash_list' ).find( '.hashitem:eq(' + $( this ).parent().attr( 'index' ) + ')' ).find( 'input[type=text]' ).val( $( this ).attr( 'text' ) );
			$( '#cmnsetting_apply' ).removeClass( 'disabled' );
			$( this ).parent().hide();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// NG設定追加処理
		////////////////////////////////////////
		function AppendNGItem( enabled, type, word )
		{
			$( '#csetng_list' ).append( OutputTPL( 'ng_list', {} ) );

			$( '#csetng_list' ).scrollTop( $( '#csetng_list' ).prop( 'scrollHeight' ) )

			var additem = $( '#csetng_list' ).find( '.ngitem' ).last();

			additem.find( 'input[type=text]' ).focus();

			additem.find( 'input' ).change( function( e ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
			} );

			// 初期値設定
			if ( enabled == undefined )
			{
				enabled = 'true';
			}

			if ( enabled == 'true' )
			{
				additem.find( '.ngenable' ).find( 'input[type=checkbox]' ).prop( 'checked', true )
					.attr( 'tooltip', i18nGetMessage( 'i18n_0282' ) );
			}
			else
			{
				additem.find( '.ngenable' ).find( 'input[type=checkbox]' ).prop( 'checked', false )
					.attr( 'tooltip', i18nGetMessage( 'i18n_0280' ) );
			}

			additem.attr( 'enabled', enabled );

			if ( type == undefined )
			{
				type = 'word';
			}

			if ( type == 'word' )
			{
				additem.find( '.ngtype' ).find( 'a' ).attr( 'tooltip', i18nGetMessage( 'i18n_0181' ) ).removeClass( 'icon-user icon-twitter' ).addClass( 'icon-A' );
			}
			else if ( type == 'user' )
			{
				additem.find( '.ngtype' ).find( 'a' ).attr( 'tooltip', i18nGetMessage( 'i18n_0181' ) ).removeClass( 'icon-A icon-twitter' ).addClass( 'icon-user' );
			}
			else
			{
				additem.find( '.ngtype' ).find( 'a' ).attr( 'tooltip', i18nGetMessage( 'i18n_0181' ) ).removeClass( 'icon-user icon-A' ).addClass( 'icon-twitter' );
			}

			additem.attr( 'type', type );

			if ( word == undefined )
			{
				word = '';
			}

			additem.find( '.ngword' ).find( 'input[type=text]' ).val( word );
			additem.attr( 'word', word );

			additem.find( '.ngword' ).find( 'input[type=text]' ).keyup( function() {
				if ( $( this ).val() != additem.attr( 'word' ) )
				{
					$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				}
			} );

			// NG設定有効/無効切り替え処理
			additem.find( '.ngenable' ).find( 'input[type=checkbox]' ).change( function( e ) {
				if ( $( this ).prop( 'checked' ) )
				{
					$( this ).parent().parent().attr( 'enabled', true );
					$( this ).attr( 'tooltip', i18nGetMessage( 'i18n_0282' ) );
				}
				else
				{
					$( this ).parent().parent().attr( 'enabled', false );
					$( this ).attr( 'tooltip', i18nGetMessage( 'i18n_0280' ) );
				}

				$( this ).trigger( 'mouseenter' );

				e.stopPropagation();
			} );

			// NG設定タイプボタンクリック処理
			additem.find( '.ngtype' ).find( 'a' ).on( 'click', function( e ) {
				var item = $( this ).parent().parent();
				var curtype = item.attr( 'type' );

				if ( curtype == 'word' )
				{
					item.attr( 'type', 'user' );
					$( this ).attr( 'tooltip', i18nGetMessage( 'i18n_0161' ) );
					$( this ).removeClass( 'icon-A' ).addClass( 'icon-user' );
				}
				else if ( curtype == 'user' )
				{
					item.attr( 'type', 'client' );
					$( this ).attr( 'tooltip', i18nGetMessage( 'i18n_0059' ) );
					$( this ).removeClass( 'icon-user' ).addClass( 'icon-twitter' );
				}
				else
				{
					item.attr( 'type', 'word' );
					$( this ).attr( 'tooltip', i18nGetMessage( 'i18n_0181' ) );
					$( this ).removeClass( 'icon-twitter' ).addClass( 'icon-A' );
				}

				$( this ).trigger( 'mouseenter' );

				$( '#cmnsetting_apply' ).removeClass( 'disabled' );

				e.stopPropagation();
			} );

			// NG設定×ボタンクリック処理
			additem.find( '.ngdel' ).find( 'span' ).on( 'click', function( e ) {
				$( this ).parent().parent().remove();

				$( '#cmnsetting_apply' ).removeClass( 'disabled' );

				$( '#tooltip' ).hide();

				e.stopPropagation();
			} );
		}

		////////////////////////////////////////
		// ハッシュタグ設定追加処理
		////////////////////////////////////////
		function AppendHashItem( word )
		{
			$( '#csethash_list' ).append( OutputTPL( 'hash_list', {} ) );

			$( '#csethash_list' ).scrollTop( $( '#csethash_list' ).prop( 'scrollHeight' ) )

			var additem = $( '#csethash_list' ).find( '.hashitem' ).last();

			additem.find( 'input[type=text]' ).focus();

			additem.find( 'input' ).change( function( e ) {
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
			} );

			// 初期値設定
			if ( word == undefined )
			{
				word = '';
			}

			additem.find( '.hashword' ).find( 'input[type=text]' ).val( word );
			additem.attr( 'word', word );

			additem.find( '.hashword' ).find( 'input[type=text]' ).keyup( function() {
				if ( $( this ).val() != additem.attr( 'word' ) )
				{
					$( '#cmnsetting_apply' ).removeClass( 'disabled' );
				}
			} );

			additem.find( '.hashword' ).find( 'input[type=text]' ).on( 'click', function( e ) {
				var pulldown = $( '#hashtag_pulldown' );
				var index = $( this ).parent().parent().index();

				if ( pulldown.css( 'display' ) == 'none' )
				{
					$( 'div.contents' ).trigger( 'hashtag_pulldown_update' );

					if ( pulldown.find( '.item' ).length )
					{
						pulldown.css( {
							width: $( this ).outerWidth(),
							left: Math.floor( $( this ).position().left ),
							top: Math.floor( $( this ).position().top ) + $( this ).outerHeight()
						} )
						.attr( 'index', index )
						.show();
					}
				}
				else
				{
					if ( Math.floor( pulldown.position().top ) != Math.floor( $( this ).position().top ) + $( this ).outerHeight() )
					{
						pulldown.css( {
							width: $( this ).outerWidth(),
							top: Math.floor( $( this ).position().top ) + $( this ).outerHeight()
						} )
						.attr( 'index', index )
						.show();
					}
					else
					{
						pulldown.hide();
					}
				}

				e.stopPropagation();
			} );

			// ハッシュタグ設定×ボタンクリック処理
			additem.find( '.hashdel' ).find( 'span' ).on( 'click', function( e ) {
				$( this ).parent().parent().remove();

				$( '#cmnsetting_apply' ).removeClass( 'disabled' );

				$( '#tooltip' ).hide();
				$( '#hashtag_pulldown' ).hide();

				e.stopPropagation();
			} );
		}

		////////////////////////////////////////
		// 設定変更時処理
		////////////////////////////////////////
		cont.find( 'input' ).change( function( e ) {
			$( '#cmnsetting_apply' ).removeClass( 'disabled' );
		} );

		$( '#cset_font_family' ).keyup( function() {
			if ( $( this ).val() != g_cmn.cmn_param['font_family'] )
			{
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
			}
		} );

		$( '#cset_nowbrowsing_text' ).keyup( function() {
			if ( $( this ).val() != g_cmn.cmn_param['nowbrowsing_text'] )
			{
				$( '#cmnsetting_apply' ).removeClass( 'disabled' );
			}
		} );

		////////////////////////////////////////
		// 適用ボタンクリック処理
		////////////////////////////////////////
		$( '#cmnsetting_apply' ).on( 'click', function( e ) {
			// disabedなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			// 入力値チェック
			var chk = true;

			$( '#csethash_list' ).find( '.hashitem' ).each( function() {
				var word = $( this ).find( '.hashword' ).find( 'input[type=text]' ).val();

				if ( word != '' && !word.match( /^[^\s「」。、!"#\$%&'\(\)=\-~\^\\@`\[\{;\+\*:\]\}<,>\.\?\/]+$/ ) )
				{
					// "
					MessageBox( i18nGetMessage( 'i18n_0109' ) );
					$( this ).find( '.hashword' ).find( 'input[type=text]' ).focus();
					e.stopPropagation();
					chk = false;
				}
			} );

			if ( chk == false )
			{
				return;
			}

			// フォントサイズ
			g_cmn.cmn_param['font_size'] = $( '#cset_font_size' ).slider( 'value' );

			// フォント名
			if ( $( '#cset_font_family' ).val().length <= 64 )
			{
				g_cmn.cmn_param['font_family'] = escapeHTML( $( '#cset_font_family' ).val() );
			}

			SetFont();

			// パネルのスナップ
			g_cmn.cmn_param['snap'] = ( $( '#cset_snap' ).prop( 'checked' ) ) ? 1 : 0;
			$( 'panel' ).draggable( 'option', 'snap', ( g_cmn.cmn_param['snap'] ) ? 'panel,#head,#panellist' : false );
			$( 'panel' ).draggable( 'option', 'snapMode', ( g_cmn.cmn_param['snap'] ) ? 'outer' : '' );

			// ページ全体のスクロールバー
			var old_v = g_cmn.cmn_param['scroll_vertical'];
			var old_h = g_cmn.cmn_param['scroll_horizontal'];

			g_cmn.cmn_param['scroll_vertical'] = ( $( '#cset_scroll_vertical' ).prop( 'checked' ) ) ? 1 : 0;
			g_cmn.cmn_param['scroll_horizontal'] = ( $( '#cset_scroll_horizontal' ).prop( 'checked' ) ) ? 1 : 0;

			$( 'body' ).css( {
				'overflow-y': ( g_cmn.cmn_param['scroll_vertical'] == 1 ) ? 'auto' : 'hidden',
				'overflow-x': ( g_cmn.cmn_param['scroll_horizontal'] == 1 ) ? 'auto' : 'hidden'
			} );

			// スクロールバーが消えない問題対策(変更があったときのみ)
			if ( ( old_v != g_cmn.cmn_param['scroll_vertical'] || old_h != g_cmn.cmn_param['scroll_horizontal'] ) &&
				 ( g_cmn.cmn_param['scroll_vertical'] == 0 || g_cmn.cmn_param['scroll_horizontal'] == 0 ) )
			{
				setTimeout( function() { $( 'body' ).hide(); setTimeout( function() { $( 'body' ).show(); }, 0 ) }, 0 );
			}

			// 音量
			g_cmn.cmn_param['notify_sound_volume'] = $( '#cset_notify_sound_volume' ).slider( 'value' );

			// 新着あり通知
			g_cmn.cmn_param['notify_new'] = ( $( '#cset_notify_new' ).prop( 'checked' ) ) ? 1 : 0;

			// フォローリクエスト通知
			g_cmn.cmn_param['notify_incoming'] = ( $( '#cset_notify_incoming' ).prop( 'checked' ) ) ? 1 : 0;

			// 新着読み込み
			g_cmn.cmn_param['reload_time'] = $( '#cset_reload_time' ).slider( 'value' );

			// 一度に取得するツイート数
			g_cmn.cmn_param['get_count'] = $( '#cset_get_count' ).slider( 'value' );

			// タイムラインに表示する最大ツイート数
			g_cmn.cmn_param['max_count'] = $( '#cset_max_count' ).slider( 'value' );

			// サムネイル
			g_cmn.cmn_param['thumbnail'] = ( $( '#cset_thumbnail' ).prop( 'checked' ) ) ? 1 : 0;

			// URL展開
			g_cmn.cmn_param['urlexpand'] = ( $( '#cset_urlexpand' ).prop( 'checked' ) ) ? 1 : 0;

			// 検索対象言語
			g_cmn.cmn_param['search_lang'] = $( 'input[name=cset_search_lang]:checked' ).val();
/*
			// もっと読むを自動実行
			g_cmn.cmn_param['autoreadmore'] = ( $( '#cset_autoreadmore' ).prop( 'checked' ) ) ? 1 : 0;
*/
			// 新着ツイートにスクロール
			g_cmn.cmn_param['newscroll'] = ( $( '#cset_newscroll' ).prop( 'checked' ) ) ? 1 : 0;

			// サムネイルの自動表示
			g_cmn.cmn_param['auto_thumb'] = ( $( '#cset_auto_thumb' ).prop( 'checked' ) ) ? 1 : 0;

			// 相互フォロー表示
			g_cmn.cmn_param['follow_mark'] = ( $( '#cset_follow_mark' ).prop( 'checked' ) ) ? 1: 0;

			// リツイートを重複表示しない
			g_cmn.cmn_param['onlyone_rt'] = ( $( '#cset_onlyone_rt' ).prop( 'checked' ) ) ? 1: 0;

			// リツイートを確認する
			g_cmn.cmn_param['confirm_rt'] = ( $( '#cset_confirm_rt' ).prop( 'checked' ) ) ? 1: 0;

			// ツイートショートカットキー
			g_cmn.cmn_param['tweetkey'] = $( 'input[name=cset_tweetkey]:checked' ).val();

			// ツイート時間の表示形式
			g_cmn.cmn_param['timedisp'] = $( 'input[name=cset_timedisp]:checked' ).val();

			// 名前の表示形式
			g_cmn.cmn_param['namedisp'] = $( 'input[name=cset_namedisp]:checked' ).val();

			// リツイートするアカウントを選択する
			g_cmn.cmn_param['rt_accsel'] = ( $( '#cset_rt_accsel' ).prop( 'checked' ) ) ? 1: 0;

			// 検索結果からリツイートを除外する
			g_cmn.cmn_param['exclude_retweets'] = ( $( '#cset_exclude_retweets' ).prop( 'checked' ) ) ? 1: 0;

			// Now Browsingテキスト
			if ( $( '#cset_nowbrowsing_text' ).val().length <= 140 )
			{
				g_cmn.cmn_param['nowbrowsing_text'] = escapeHTML( $( '#cset_nowbrowsing_text' ).val() );
			}

			// ハッシュタグ設定
			var hashwords = new Array();

			$( '#csethash_list' ).find( '.hashitem' ).each( function() {
				var word = $( this ).find( '.hashword' ).find( 'input[type=text]' ).val();

				if ( word != '' )
				{
					// "
					var checked = undefined;

					for ( var i = 0, _len = g_cmn.hashtag.length ; i < _len ; i++ )
					{
						if ( g_cmn.hashtag[i].hashtag == word )
						{
							checked = g_cmn.hashtag[i].checked;
							break;
						}
					}

					hashwords.push( { hashtag: word, checked: checked } );
				}
			} );

			g_cmn.hashtag = hashwords;
			$( '#hashtag_pulldown' ).hide();

			// NG設定
			var ngwords = new Array();

			$( '#csetng_list' ).find( '.ngitem' ).each( function() {
				var word = $( this ).find( '.ngword' ).find( 'input[type=text]' ).val();

				if ( word != '' )
				{
					ngwords.push( {
						enabled: $( this ).attr( 'enabled' ),
						type: $( this ).attr( 'type' ),
						word: word,
					} );
				}
			} );

			g_cmn.cmn_param['ngwords'] = ngwords;

			$( 'panel' ).trigger( 'resize' );

			$( '#cmnsetting_apply' ).addClass( 'disabled' );

			$( '#tweetbox_text' ).trigger( 'keyup' );
			$( '#dmbox_text' ).trigger( 'keyup' );

			MakeNGRegExp();

			// 色の設定
			g_cmn.cmn_param.color = {
				panel: {
					background: $( '#cset_color_panel_background' ).val(),
					text: $( '#cset_color_panel_text' ).val(),
				},
				tweet: {
					background: $( '#cset_color_tweet_background' ).val(),
					text: $( '#cset_color_tweet_text' ).val(),
					link: $( '#cset_color_tweet_link' ).val(),
				},
				titlebar: {
					background: $( '#cset_color_titlebar_background' ).val(),
					text: $( '#cset_color_titlebar_text' ).val(),
					fixed: $( '#cset_color_titlebar_fixed' ).val(),
				},
				button: {
					background: $( '#cset_color_button_background' ).val(),
					text: $( '#cset_color_button_text' ).val(),
				},
				scrollbar: {
					background: $( '#cset_color_scrollbar_background' ).val(),
					thumb: $( '#cset_color_scrollbar_thumb' ).val(),
				},
			};

			SetColorSettings();

			SaveData();

			// ツイートボタンのツールチップを設定に合わせる
			var _tips = new Array( 'Ctrl+Enter', 'Shift+Enter', 'Enter' );
			$( '#tweet' ).attr( 'tooltip', i18nGetMessage( 'i18n_0083' ) + '(' + _tips[g_cmn.cmn_param.tweetkey] + ')' );
			$( '#dmsend' ).attr( 'tooltip', i18nGetMessage( 'i18n_0250' ) + '(' + _tips[g_cmn.cmn_param.tweetkey] + ')' );

			// ハッシュタグプルダウンを更新
			$( 'div.contents' ).trigger( 'hashtag_pulldown_update' );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 分類部クリック処理
		////////////////////////////////////////
		cont.find( '.kind' ).on( 'click', function( e ) {
			var img_off = 'icon-play';
			var img_on = 'icon-arrow_down';

			if ( $( this ).find( '> span' ).hasClass( img_on ) )
			{
				$( this ).find( '> span' ).removeClass( img_on ).addClass( img_off )
					.end()
					.next().slideUp( 0 );
			}
			else
			{
				$( this ).find( '> span' ).removeClass( img_off ).addClass( img_on )
					.end()
					.next().slideDown( 200 );
			}

			e.stopPropagation();
		} );

		cont.find( '.kind' ).trigger( 'click' );

		cont.trigger( 'contents_resize' );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
