"use strict";

// 共通データ
var g_cmn = {};

// データ読み込み完了フラグ
var g_loaded = false;

// 終了時データ保存
var g_saveend = true;

// 開発者モード
var g_devmode = false;

// ユーザーストリーム使用フラグ
var g_usestream = false // UserStream廃止

// NGチェック用フィルタ
var g_ngregexp = {
	word: null,
	user: null,
	client: null
};

// 名前表示形式
var g_namedisp = 0;

// 時間表示形式
var g_timedisp = 0;

var manifest;

// 短縮URL展開
var shorturls;

// アップロードアイコンファイルオブジェクト
var uploadIconFile = null;

var consumerKey = 'luFRvnO5KsUow9ZinOet7Q';
var consumerSecret = 'V7Jx1kC6vsidqjloC2iRfkXqp6V6kQzLqTAbKXcPTs';

////////////////////////////////////////////////////////////////////////////////
// 開始
////////////////////////////////////////////////////////////////////////////////
$( document ).ready( function() {
	g_cmn = {
		cmn_param:	{											// 共通パラメータ
			font_family:		'',								// - フォント名
			font_size:			12,								// - フォントサイズ
			snap:				0,								// - パネルのスナップ
			stream:				0,								// - ユーザーストリームを使う	// UserStream廃止
			autoreadmore:		0,								// - もっと読むを自動実行
			scroll_vertical:	1,								// - ページ全体のスクロールバー(縦)
			scroll_horizontal:	1,								// - ページ全体のスクロールバー(横)

			notify_time:		10,								// - 通知の表示時間
			notify_sound_volume:1.0,							// - 音量
			notify_new:			1,								// - 新着あり通知
			notify_dmrecv:		1,								// - DM受信通知
			notify_favorite:	1,								// - お気に入り通知
			notify_follow:		1,								// - フォロー通知
			notify_mention:		1,								// - Mention通知
			notify_reponly:		0,								// - リプライのみ
			notify_retweet:		1,								// - リツイート通知
			notify_incoming:	1,								// - フォローリクエスト通知
			notify_quoted_tweet:1,								// - 引用リツイート通知
			notify_alltweets:	0,								// - すべてのツイートを通知
			notify_list_add:	1,								// - リストに追加

			top_period:			0,								// - 複数リプライ時にピリオドをつける
			tweetkey:			0,								// - ツイートショートカットキー

			reload_time:		600,							// - 新着読み込み
			get_count:			20,								// - 一度に取得するツイート数
			max_count:			100,							// - タイムラインに表示する最大ツイート数
			thumbnail:			1,								// - サムネイル
			urlexpand:			1,								// - URL展開
			search_lang:		0,								// - 検索対象言語
			newscroll:			1,								// - 新着ツイートにスクロール
			auto_thumb:			1,								// - サムネイルの自動表示
			follow_mark:		1,								// - 相互フォロー表示
			iconsize:			32,								// - アイコンサイズ
			onlyone_rt:			0,								// - リツイートを重複表示しない
			confirm_rt:			1,								// - リツイートを確認する
			ngwords:			null,							// - NG設定
			timedisp:			0,								// - ツイート時間の表示形式
			rt_accsel:			1,								// - リツイートするアカウントを選択する
			exclude_retweets:	0,								// - 検索結果からリツイートを除外する

			namedisp:			0,								// - 名前の表示形式

			nowbrowsing_text:	'Now Browsing: ',				// - Now Browsingテキスト
			consumerKey:		'',								// - Consumer Key
			consumerSecret:		'',								// - Consumer Secret

			color: {											// - 色の設定
				panel: {
					background: $( ':root' ).css( '--default-panel-background' ),
					text: $( ':root' ).css( '--default-panel-text' ),
				},
				tweet: {
					background: $( ':root' ).css( '--default-tweet-background' ),
					text: $( ':root' ).css( '--default-tweet-text' ),
					link: $( ':root' ).css( '--default-tweet-link' ),
				},
				titlebar: {
					background: $( ':root' ).css( '--default-titlebar-background' ),
					text: $( ':root' ).css( '--default-titlebar-text' ),
					fixed: $( ':root' ).css( '--default-titlebar-fixed-background' ),
				},
				button: {
					background: $( ':root' ).css( '--default-button-background' ),
					text: $( ':root' ).css( '--default-button-text' ),
				},
				scrollbar: {
					background: $( ':root' ).css( '--default-scrollbar-background' ),
					thumb: $( ':root' ).css( '--default-scrollbar-thumb' ),
				},
			},
		},
		panel:			null,			// パネル
		account:		null,			// アカウント
		hashtag:		null,			// ハッシュタグ
		draft:			null,			// 下書き
		mute:			null,			// 非表示ユーザ
		toolbar_user:	null,			// ツールバーに登録しているユーザ
		rss_panel:		null,			// RSSパネル
		group_panel:	null,			// グループパネル
		user_iconsize:	null,			// ユーザーごとのアイコンサイズ
		twconfig:		{				// Twitterの設定値
			short_url_length:				20,	// 2012/10/15現在の値
			characters_reserved_per_media:	21,
		},

		account_order:	null,			// アカウントの並び順
		panellist_width: '200px',		// パネルリストの幅
		current_version: '',			// 現在のバージョン
	};

	Init();
} );

////////////////////////////////////////////////////////////////////////////////
// 初期化処理
////////////////////////////////////////////////////////////////////////////////
function Init()
{
	$( '#tooltip' ).hide();
	$( '#blackout' ).hide();
	$( '#messagebox' ).hide();
	$( '#imageviewer').hide();

	g_cmn.panel = new Array();
	g_cmn.account = {};
	g_cmn.hashtag = new Array();
	g_cmn.draft = new Array();
	g_cmn.mute = new Array();
	g_cmn.toolbar_user = new Array();
	g_cmn.notsave = {};
	g_cmn.notsave.notify_history = new Array();
	g_cmn.notsave.retweets = {};
	g_cmn.notsave.tl_hashtag = new Array();
	g_cmn.rss_panel = {};
	g_cmn.group_panel = {};
	g_cmn.user_iconsize = {};
	g_cmn.cmn_param.ngwords = new Array();
	g_cmn.account_order = new Array();

	$( document ).on( 'drop dragover', function( e ) {
		if ( e.target.tagName.match( /textarea/i ) || ( e.target.tagName.match( /input/i ) && e.target.type.match( /text/i ) ) )
		{
			if ( e.type == 'drop' && e.originalEvent.dataTransfer.files.length )
			{
				e.preventDefault();
				e.stopPropagation();
			}

			return true;
		}

		e.preventDefault();
		e.stopPropagation();
	} );

	// ツールバー
	$( '#head' ).html( OutputTPL( 'header', {} ) );
	$( '#head' ).find( '.header_sub' ).hide();

	// パネルリスト
	$( '#panellist' ).resizable( {
		handles: 'e',
		minWidth: '16',
//		grid: [4,4],
		stop: function() {
			g_cmn.panellist_width = $( '#panellist' ).css( 'width' );

			// パネルリストを被せない対応
			$( '#main' ).css( { position: 'absolute', left: g_cmn.panellist_width } );
		},
	} );

	$.ajax( {
		type: 'GET',
		url: 'manifest.json',
		data: {},
		dataType: 'json',
		success: function( data, status ) {
			manifest = data;

			$( '#main' ).append( '<div id="version"><a class="anchor version" href="https://oken1.github.io/kurotwi/" rel="nofollow noopener noreferrer" target="_blank">' +
				manifest.name + ' version ' + manifest.version + '</a></div>' );
		},
		async: false,
	} );

	// Activity Indicator dummy
	$.fn.activity = function( opts ) {
		if ( opts == false )
		{
			$( '#loading' ).hide();
		}
		else
		{
			$( '#loading' ).show();
		}
	};

	////////////////////////////////////////////////////////////
	// 保存データを読み込み、アカウント、パネルを復元する
	////////////////////////////////////////////////////////////
	var LoadData = function() {
		userstream = {};
		shorturls = new Array();

		// localStorageからデータ読み込み
		var text = getUserInfo( 'g_cmn_V1' );

		if ( text != '' )
		{
			text = decodeURIComponent( text );
			var _g_cmn = JSON.parse( text );

			// 共通パラメータの復元
			for ( var p in _g_cmn.cmn_param )
			{
				// 削除されたパラメータは無視
				if ( g_cmn.cmn_param[p] == undefined )
				{
					continue;
				}

				switch ( p )
				{
					// 色の設定
					case 'color':
						for ( var q in g_cmn.cmn_param[p] )
						{
							for ( var r in g_cmn.cmn_param[p][q] )
							{
								if ( _g_cmn.cmn_param[p][q] != undefined )
								{
									g_cmn.cmn_param[p][q][r] = _g_cmn.cmn_param[p][q][r];
								}
								else
								{
								console.log(q + ' undefined ' );
								}
							}
						}
						break;

					default:
						g_cmn.cmn_param[p] = _g_cmn.cmn_param[p];
						break;
				}
			}

			// フォントサイズ
			SetFont();

			// ページ全体のスクロールバー
			$( 'body' ).css( { 'overflow-y': ( g_cmn.cmn_param['scroll_vertical'] == 1 ) ? 'auto' : 'hidden' } );
			$( 'body' ).css( { 'overflow-x': ( g_cmn.cmn_param['scroll_horizontal'] == 1 ) ? 'auto' : 'hidden' } );

			MakeNGRegExp();

			// ユーザーストリームを使う？
			g_cmn.cmn_param['stream'] = 0 // UserStream廃止
			g_usestream = ( g_cmn.cmn_param['stream'] == 1 ) ? true : false;

			// 名前の表示形式
			g_namedisp = g_cmn.cmn_param['namedisp'];

			// 時間の表示形式
			g_timedisp = g_cmn.cmn_param['timedisp'];

			////////////////////////////////////////
			// 後続処理
			// （アカウントの復元後に実行する）
			////////////////////////////////////////
			var Subsequent = function() {
				// ハッシュタグの復元
				if ( _g_cmn.hashtag != undefined )
				{
					g_cmn.hashtag = _g_cmn.hashtag;
				}

				// 下書きの復元
				if ( _g_cmn.draft != undefined )
				{
					g_cmn.draft = _g_cmn.draft;
				}

				// 非表示ユーザの復元
				if ( _g_cmn.mute != undefined )
				{
					g_cmn.mute = _g_cmn.mute;
				}

				// 非表示ユーザーをNGに統合
				for ( var i = 0, _len = g_cmn.mute.length ; i < _len ; i++ )
				{
					g_cmn.cmn_param['ngwords'].push( {
						enabled: 'true',
						type: 'user',
						word: g_cmn.mute[i].screen_name
					} );
				}

				g_cmn.mute = [];

				// ツールバーユーザの復元
				if ( _g_cmn.toolbar_user != undefined )
				{
					g_cmn.toolbar_user = _g_cmn.toolbar_user;
				}

				UpdateToolbarUser();

				// RSSパネルの復元
				if ( _g_cmn.rss_panel != undefined )
				{
					g_cmn.rss_panel = _g_cmn.rss_panel;
				}

				// グループパネルの復元
				if ( _g_cmn.group_panel != undefined )
				{
					g_cmn.group_panel = _g_cmn.group_panel;
				}

				// ユーザーごとのアイコンサイズの復元
				if ( _g_cmn.user_iconsize != undefined )
				{
					g_cmn.user_iconsize = _g_cmn.user_iconsize;
				}

				// アカウントの並び順
				if ( _g_cmn.account_order != undefined )
				{
					g_cmn.account_order = _g_cmn.account_order;

					// 削除されているアカウントを取り除く
					for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
					{
						if ( g_cmn.account[g_cmn.account_order[i]] == undefined )
						{
							g_cmn.account_order.splice( i, 1 );
							i--;
						}
					}
				}
				else
				{
					for ( var id in g_cmn.account )
					{
						g_cmn.account_order.push( id.toString() );
					}
				}

				// パネルリストの幅
				if ( _g_cmn.panellist_width != undefined )
				{
					 g_cmn.panellist_width = _g_cmn.panellist_width;
				}

				// 現在のバージョン
				if ( _g_cmn.current_version != undefined )
				{
					 g_cmn.current_version = _g_cmn.current_version;
				}

				if ( g_cmn.current_version != '' )
				{
					if ( g_cmn.current_version != manifest.version )
					{
						MessageBox( i18nGetMessage( 'i18n_0345', [g_cmn.current_version, manifest.version] ) +
							'<br><br>' +
							'<a class="anchor version" href="https://oken1.github.io/kurotwi/#update" rel="nofollow noopener noreferrer" target="_blank">https://oken1.github.io/kurotwi/#update</a>',
							5 * 1000 );
					}
				}

				g_cmn.current_version = manifest.version;

				// アカウントの並び順にユーザーストリーム接続要求
				for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
				{
					g_cmn.account[g_cmn.account_order[i]].notsave.stream = 0;

					if ( g_usestream )
					{
						SendRequest(
							{
								action: 'stream_start',
								acsToken: g_cmn.account[g_cmn.account_order[i]]['accessToken'],
								acsSecret: g_cmn.account[g_cmn.account_order[i]]['accessSecret'],
								id: g_cmn.account_order[i],
							},
							function( res )
							{
							}
						);
					}
				}

				// パネルの復元
				var cp;

				for ( var i = 0, _len = _g_cmn.panel.length ; i < _len ; i++ )
				{
					cp = new CPanel( _g_cmn.panel[i].x, _g_cmn.panel[i].y,
									 _g_cmn.panel[i].w, _g_cmn.panel[i].h,
									 _g_cmn.panel[i].id.replace( /^panel_/, '' ),
									 _g_cmn.panel[i].minimum,
									 _g_cmn.panel[i].zindex,
									 _g_cmn.panel[i].status,
									 true );

					if ( _g_cmn.panel[i].type == null )
					{
						continue;
					}

					cp.SetType( _g_cmn.panel[i].type );
					cp.SetParam( _g_cmn.panel[i].param );
					cp.Start();
				}

				// フォローリクエストの表示(仮)
				for ( var id in g_cmn.account )
				{
					if ( g_cmn.account[id].notsave.protected && g_cmn.account[id].notsave.incoming.length > 0 )
					{
						setTimeout( function( _id ) {
							OpenNotification( 'incoming', {
								user: g_cmn.account[_id].screen_name,
								img: g_cmn.account[_id].icon,
								count: g_cmn.account[_id].notsave.incoming.length,
							} )
						}, 1000, id );
					}
				}

				// 色の設定
				SetColorSettings();

				g_loaded = true;
			};

			// アカウントの復元
			var _cnt = 0;
			var _comp = 0;

			for ( var id in _g_cmn.account )
			{
				_cnt++;
			}

			////////////////////////////////////////
			// すべてのアカウント情報が
			// 更新し終わってから後続処理を実行
			////////////////////////////////////////
			var CompCheck = function() {
				if ( _comp >= _cnt )
				{
					// 処理実行状況の表示が消えるのを待つ
					var _next = function() {
						if ( $( '#blackout' ).find( 'div.info' ).length == 0 )
						{
							GetConfiguration( function() {
								Blackout( false );
								$( '#blackout' ).activity( false );
								Subsequent();
								$( '#head' ).trigger( 'account_update' );
							} );
						}
						else
						{
							setTimeout( function() { _next(); }, 100 );
						}
					};

					_next();
				}
			};

			// アカウント情報なし
			if ( _cnt == 0 )
			{
				// 後続処理を実行
				Blackout( false );
				$( '#blackout' ).activity( false );
				GetConfiguration( function() { Subsequent(); } );
			}
			// アカウント情報あり
			else
			{
				for ( var id in _g_cmn.account )
				{
					// アカウント情報初期設定値
					g_cmn.account[id] = {
						accessToken: '',
						accessSecret: '',
						user_id: '',
						screen_name: '',
						name: '',
						icon: '',
						notsave: {},
					};

					for ( var p in _g_cmn.account[id] )
					{
						// 削除されたパラメータは無視
						if ( g_cmn.account[id][p] == undefined )
						{
							continue;
						}

						g_cmn.account[id][p] = _g_cmn.account[id][p];

						// 開発者モード
						if ( p == 'screen_name' )
						{
							if ( g_cmn.account[id][p] == 'kurotwi_support' )
							{
								g_devmode = true;
								$( '#version a' ).append( '(Developer Mode)' );
							}
						}
					}

					// アカウント情報を更新
					var param = {
						type: 'GET',
						url: ApiUrl( '1.1' ) + 'users/show.json',
						data: {
							user_id: g_cmn.account[id]['user_id'],
						},
					};

					Blackout( true );

					$( '#blackout' ).activity( { color: '#808080', width: 8, length: 14 } );

					$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
						id: 'info0_' + id,
						msg: i18nGetMessage( 'i18n_0046' ) + '(' + g_cmn.account[id]['screen_name'] + ')' } ) );

					SendRequest(
						{
							action: 'oauth_send',
							acsToken: g_cmn.account[id]['accessToken'],
							acsSecret: g_cmn.account[id]['accessSecret'],
							param: param,
							id: id,
						},
						function( res )
						{
							if ( res.status == 200 )
							{
								// 最新の情報に更新
								g_cmn.account[res.id]['screen_name'] = res.json.screen_name;
								g_cmn.account[res.id]['name'] = res.json.name;
								g_cmn.account[res.id]['icon'] = res.json.profile_image_url_https;
								g_cmn.account[res.id]['follow'] = res.json.friends_count;
								g_cmn.account[res.id]['follower'] = res.json.followers_count;
								g_cmn.account[res.id]['statuses_count'] = res.json.statuses_count;
								g_cmn.account[res.id].notsave['protected'] = res.json.protected;

								$( '#info0_' + res.id ).append( ' ... completed' ).fadeOut( 'slow', function() { $( this ).remove() } );

								GetAccountInfo( res.id, function() { _comp++; CompCheck(); } );
							}
							else
							{
								// 情報が取得出来なかったアカウントは削除(2013/06/30廃止)
								//if ( res.status == 404 )
								if ( 0 )
								{
									MessageBox( i18nGetMessage( 'i18n_0117', [g_cmn.account[res.id]['screen_name']] ) );

									SendRequest(
										{
											action: 'stream_stop',
											id: res.id,
										},
										function()
										{
										}
									);

									delete g_cmn.account[res.id];
								}
								else
								{
									ApiError( i18nGetMessage( 'i18n_0099', [g_cmn.account[res.id]['screen_name']] ), res );
								}

								$( '#info0_' + res.id ).append( ' ... completed' ).fadeOut( 'slow', function() { $( this ).remove() } );

								_comp++;
								CompCheck();
							}
						}
					);
				}
			}
		}
		else
		{
			g_loaded = true;
			// 初回起動

			// フォントサイズ
			SetFont();

			// アカウント画面を開く
			Blackout( false );
			$( '#blackout' ).activity( false );
			$( '#head_account' ).trigger( 'click' );
		}

		// 相対時間書き換え
		var RelTime = function() {
			for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
			{
				if ( g_cmn.panel[i].type == 'timeline' )
				{
					var p = $( '#' + g_cmn.panel[i].id );

					var items = p.find( 'div.item' );

					items.each( function() {
						var item = $( this );
						var date = item.find( '.tweet' ).find( '.headcontainer' ).find( '.namedate' ).find( '.date' );

						//panel.param.timeline_type dmrecv,dmsent
						if ( g_cmn.panel[i].param.timeline_type == 'dmrecv' ||
							 g_cmn.panel[i].param.timeline_type == 'dmsent' )
						{
							date.text( DateConv( date.attr( 'absdate' ) , 1 ) );
						}
						else
						{
							date.find( 'a' ).text( DateConv( date.attr( 'absdate' ) , 1 ) );
						}
					} );
				}
			}
			setTimeout( RelTime, 5 * 1000 );
		}

		if ( g_cmn.cmn_param['timedisp'] == 1 )
		{
			RelTime();
		}

		// 設定/状態保存の定期実行
		var AutoSave = function() {
			SaveData();

			setTimeout( AutoSave, 30 * 1000 );
		};

		setTimeout( AutoSave, 30 * 1000 );
	};

	////////////////////////////////////////////////////////////
	// ツールボタンのクリック処理
	////////////////////////////////////////////////////////////
	$( '#head_tool' ).on( 'click', function( e ) {
		// disabledなら処理しない
		if ( $( this ).hasClass( 'disabled' ) )
		{
			return;
		}

		$( '#head_tool_sub' ).toggle()
			.css( { left: 0, top: $( this ).outerHeight() } );
	} );

	////////////////////////////////////////////////////////////
	// ツールメニューのクリック処理
	////////////////////////////////////////////////////////////
	$( '#head_tool_sub' ).on( 'click', function( e ) {
		switch ( $( e.target ).index() )
		{
			// RSSパネル一覧
			case 0:
				var pid = IsUnique( 'rsslist' );

				if ( pid == null )
				{
					var _cp = new CPanel( null, null, 320, 360 );
					_cp.SetType( 'rsslist' );
					_cp.SetParam( {} );
					_cp.Start();
				}
				else
				{
					SetFront( $( '#' + pid ) );

					// 最小化している場合は元に戻す
					if ( GetPanel( pid ).minimum.minimum == true )
					{
						$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
					}
				}

				break;
			// デスクトップ通知履歴
			case 1:
				var pid = IsUnique( 'notify_history' );

				if ( pid == null )
				{
					var _cp = new CPanel( null, null, 320, 300 );
					_cp.SetType( 'notify_history' );
					_cp.SetParam( {} );
					_cp.Start();
				}
				else
				{
					SetFront( $( '#' + pid ) );

					// 最小化している場合は元に戻す
					if ( GetPanel( pid ).minimum.minimum == true )
					{
						$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
					}
				}

				break;
			// トレンド
			case 2:
				var _cp = new CPanel( null, null, 240, 360 );
				_cp.SetType( 'trends' );
				_cp.SetParam( { account_id: g_cmn.account_order[0] } );
				_cp.Start();

				break;
			// Now Browsing
			case 3:
				var pid = IsUnique( 'nowbrowsing' );

				if ( pid == null )
				{
					var _cp = new CPanel( null, null, 360, 240 );
					_cp.SetType( 'nowbrowsing' );
					_cp.SetParam( {} );
					_cp.Start();
				}
				else
				{
					SetFront( $( '#' + pid ) );

					// 最小化している場合は元に戻す
					if ( GetPanel( pid ).minimum.minimum == true )
					{
						$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
					}
				}

				break;
			// グループストリーム一覧
			case 4:
				var pid = IsUnique( 'grouplist' );

				if ( pid == null )
				{
					var _cp = new CPanel( null, null, 320, 360 );
					_cp.SetType( 'grouplist' );
					_cp.SetParam( {} );
					_cp.Start();
				}
				else
				{
					SetFront( $( '#' + pid ) );

					// 最小化している場合は元に戻す
					if ( GetPanel( pid ).minimum.minimum == true )
					{
						$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
					}
				}

				break;

			// インポート/エクスポート
			case 5:
				var pid = IsUnique( 'impexp' );

				if ( pid == null )
				{
					var _cp = new CPanel( null, null, 360, 240 );
					_cp.SetType( 'impexp' );
					_cp.SetParam( {} );
					_cp.Start();
				}
				else
				{
					SetFront( $( '#' + pid ) );

					// 最小化している場合は元に戻す
					if ( GetPanel( pid ).minimum.minimum == true )
					{
						$( '#' + pid ).find( 'titlebar' ).find( '.minimum' ).trigger( 'click' );
					}
				}

				break;

		}

		$( this ).toggle();
	} );

	////////////////////////////////////////////////////////////
	// 検索ボタンのクリック処理
	////////////////////////////////////////////////////////////
	$( '#head_search' ).on( 'click', function( e ) {
		// disabledなら処理しない
		if ( $( this ).hasClass( 'disabled' ) )
		{
			return;
		}

		var pid = IsUnique( 'searchbox' );

		if ( pid == null )
		{
			var _cp = new CPanel( null, null, 320, 140 );
			_cp.SetType( 'searchbox' );
			_cp.SetParam( { account_id: '', } );
			_cp.Start();
		}
		else
		{
			SetFront( $( '#' + pid ) );

			// 最小化している場合は元に戻す
			if ( GetPanel( pid ).minimum.minimum == true )
			{
				$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
			}

			$( '#searchbox_text' ).focus();
		}
	});

	////////////////////////////////////////////////////////////
	// ツイートボタンのクリック処理
	////////////////////////////////////////////////////////////
	$( '#head_tweet' ).on( 'click', function( e ) {
		// disabledなら処理しない
		if ( $( this ).hasClass( 'disabled' ) )
		{
			return;
		}

		var pid = IsUnique( 'tweetbox' );
		var left = null;
		var top = null;
		var width = 324;

		if ( pid != null )
		{
			SetFront( $( '#' + pid ) );

			// 最小化している場合は元に戻す
			if ( GetPanel( pid ).minimum.minimum == true )
			{
				$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
			}

			$( '#tweetbox_text' ).focus();
		}

		if ( pid == null )
		{
			var _cp = new CPanel( left, top, width, 240 );
			_cp.SetType( 'tweetbox' );
			_cp.SetParam( { account_id: '', rep_user: null, hashtag: null } );
			_cp.Start();
		}
	});

	////////////////////////////////////////////////////////////
	// アカウントボタンのクリック処理
	////////////////////////////////////////////////////////////
	$( '#head_account' ).on( 'click', function( e ) {
		var pid = IsUnique( 'account' );

		if ( pid == null )
		{
			var _cp = new CPanel( null, null, 360, 240 );
			_cp.SetType( 'account' );
			_cp.SetParam( {} );
			_cp.Start();
		}
		else
		{
			SetFront( $( '#' + pid ) );

			// 最小化している場合は元に戻す
			if ( GetPanel( pid ).minimum.minimum == true )
			{
				$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
			}
		}
	});

	////////////////////////////////////////////////////////////
	// 設定ボタンのクリック処理
	////////////////////////////////////////////////////////////
	$( '#head_setting' ).on( 'click', function( e ) {
		var pid = IsUnique( 'cmnsetting' );

		if ( pid == null )
		{
			var _cp = new CPanel( null, null, 360, 360 );
			_cp.SetType( 'cmnsetting' );
			_cp.SetParam( {} );
			_cp.Start();
		}
		else
		{
			SetFront( $( '#' + pid ) );

			// 最小化している場合は元に戻す
			if ( GetPanel( pid ).minimum.minimum == true )
			{
				$( '#' + pid ).find( 'div.titlebar' ).find( '.minimum' ).trigger( 'click' );
			}
		}
	});

	////////////////////////////////////////////////////////////
	// アカウント数変更時の処理
	////////////////////////////////////////////////////////////
	$( '#head' ).on( 'account_update', function()
		{
			// ツイート、検索ボタンの有効/無効
			if ( AccountCount() > 0 )
			{
				$( '#head_search' ).removeClass( 'disabled' );
				$( '#head_tweet' ).removeClass( 'disabled' );
			}
			else
			{
				$( '#head_search' ).addClass( 'disabled' );
				$( '#head_tweet' ).addClass( 'disabled' );
			}

			// 各パネルの処理を呼ぶ
			$( 'panel' ).find( 'div.contents' ).trigger( 'account_update' );
		}
	);

	////////////////////////////////////////////////////////////////////////////////
	// パネルリスト表示
	////////////////////////////////////////////////////////////////////////////////
	$( '#head_panellist' ).on( 'click', function() {
		if ( $( '#panellist' ).css( 'display' ) == 'none' )
		{
			// パネルリストを被せない対応
			$( '#main' ).css( { position: 'absolute' } ).animate( { left: g_cmn.panellist_width }, 200 );

			$( '#panellist' ).css( { display: 'block', top: $( '#head' ).outerHeight() } ).animate( { width: g_cmn.panellist_width }, 200 );
		}
		else
		{
			// パネルリストを被せない対応
			$( '#main' ).animate( { left: 0 }, 400 ).css( { position: 'relative' } );

			$( '#panellist' ).animate( { width: 0 }, 200, function() { $( '#panellist' ).css( { display: 'none' } ) } );
		}
	} );

	////////////////////////////////////////////////////////////
	// キーボードショートカット
	////////////////////////////////////////////////////////////
	$( window ).keydown( function( e ) {
		// altを押していない場合は無視
		if ( e.altKey != true )
		{
			return;
		}

		// ブラックアウト中は無効
		if ( $( '#blackout' ).css( 'display' ) != 'none' )
		{
			return;
		}

		var INITIAL_ELEMENT_ID = ''
		var element_id = INITIAL_ELEMENT_ID
		switch ( e.keyCode )
		{
			// alt+'w'でツイートパネル
			case 87:
				element_id = '#head_tweet'
				break;
			// alt+'s'で検索パネル
			case 83:
				element_id = '#head_search'
				break;
			// alt+'a'でアカウントパネル
			case 65:
			  element_id = '#head_account'
				break;
			// alt+'p'でパネルリスト
			case 80:
			  element_id = '#head_panellist'
				break;
			default:
			  return;
		}

		if ( element_id == INITIAL_ELEMENT_ID )
		{
			return;
		}

		// Macでalt+<character>は別の文字列になり、フォーカスが移った後にその文字が入力さ
		// れてしまうのでデフォルト動作を無効化
		// e.g. alt+'w' = ∑
		e.preventDefault();
		$( element_id ).trigger( 'click' );
	} );

	LoadData();
}

////////////////////////////////////////////////////////////////////////////////
// 終了処理
////////////////////////////////////////////////////////////////////////////////
window.onunload = window.onbeforeunload = function( e ) {
	// 全コンテンツの終了処理を実行
	for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
	{
		if ( g_cmn.panel[i].type != null )
		{
			g_cmn.panel[i].contents.stop();
		}
	}

	// ストリームを止める
	for ( var id in userstream )
	{
		StopUserStream( id );
	}

	userstream = {};

	if ( !g_saveend )
	{
		return;
	}

	// データ読み込みが完了していない場合
	if ( g_loaded == false )
	{
		// データの上書きをしない
		return;
	}

	SaveData();

	g_saveend = false;
};

////////////////////////////////////////////////////////////////////////////////
// ツールチップ表示
////////////////////////////////////////////////////////////////////////////////
$( document ).on( 'mouseenter mouseleave', '.tooltip', function( e ) {
	if ( e.type == 'mouseenter' )
	{
		var tip = $( this ).attr( 'tooltip' );

		if ( tip == undefined )
		{
			return;
		}

		$( '#tooltip' ).css( { left: 0, top: 0, width: 'auto' } ).text( tip );

		var l, t, w;
		l = $( this ).offset().left + $( this ).outerWidth();
		t = $( this ).offset().top + 2;
		w = $( '#tooltip' ).outerWidth( true );

		// 画面外にでないように調整
		if ( l + $( '#tooltip' ).outerWidth( true ) + 8 > $( window ).width() + $( document ).scrollLeft() )
		{
			l = $( window ).width() - $( '#tooltip' ).outerWidth( true ) - 8 + $( document ).scrollLeft();
			t = $( this ).offset().top + $( this ).outerHeight() + 2;
		}

		$( '#tooltip' ).css( { top: t, left: l, width: w } ).show();
	}
	else
	{
		$( '#tooltip' ).hide();
	}
});

////////////////////////////////////////////////////////////////////////////////
// ブラックアウト
////////////////////////////////////////////////////////////////////////////////
function Blackout( flg, special )
{
	if ( special == false )
	{
		return;
	}

	if ( flg )
	{
		$( '#blackout' ).show();
	}
	else
	{
		$( '#blackout' ).hide();
	}
}

////////////////////////////////////////////////////////////////////////////////
// ユニークコンテンツチェック
// ret)
//  null     ... 開かれていない
//  パネルID ... 開かれている
////////////////////////////////////////////////////////////////////////////////
function IsUnique( type )
{
	for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
	{
		if ( g_cmn.panel[i].type == type )
		{
			return g_cmn.panel[i].id;
		}
	}

	return null;
}

////////////////////////////////////////////////////////////////////////////////
// 指定したパネルIDのパネルオブジェクトを返す
////////////////////////////////////////////////////////////////////////////////
function GetPanel( panelid )
{
	for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
	{
		if ( g_cmn.panel[i].id == panelid )
		{
			return g_cmn.panel[i];
		}
	}

	return null;
}

////////////////////////////////////////////////////////////////////////////////
// データを保存する
////////////////////////////////////////////////////////////////////////////////
function SaveData()
{
	if ( g_loaded )
	{
		setUserInfo( 'g_cmn_V1', SaveDataText() );
	}
}

////////////////////////////////////////////////////////////////////////////////
// テンプレート出力
////////////////////////////////////////////////////////////////////////////////
var tpl_c = {};

function OutputTPL( name, assign )
{
	if ( tpl_c[name] == null || tpl_c[name] == undefined )
	{
		$.ajax( {
			type: 'GET',
			url: 'template/' + name + '.tpl',
			data: {},
			dataType: 'text',
			success: function( data, status ) {
				// 国際化対応
				data = data.replace( /\t/g, '' );

				var i18ns = data.match( /\(i18n_.+?\)/g );

				if ( i18ns )
				{
					for ( var i = 0, _len = i18ns.length ; i < _len ; i++ )
					{
						data = data.replace( i18ns[i], i18nGetMessage( i18ns[i].replace( /\W/g, "" ) ) );
					}
				}

				tpl_c[name] = new jSmart( data );
			},
			async: false,
		} );
	}
	return tpl_c[name].fetch( assign );
}

////////////////////////////////////////////////////////////////////////////////
// アカウント数取得
////////////////////////////////////////////////////////////////////////////////
function AccountCount()
{
	return g_cmn.account_order.length;
}

////////////////////////////////////////////////////////////////////////////////
// KuroTwiに登録しているアカウントかチェック
////////////////////////////////////////////////////////////////////////////////
function IsMyAccount( user_id )
{
	for ( var id in g_cmn.account )
	{
		if ( g_cmn.account[id].user_id == user_id )
		{
			return id;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// 指定したパネルにアカウント選択ボックスを作成
////////////////////////////////////////////////////////////////////////////////
function AccountSelectMake( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );

	// アカウント未選択/指定されたアカウントが存在しない場合
	if ( cp.param.account_id == '' || g_cmn.account[cp.param['account_id']] == undefined )
	{
		// 先頭のアカウントを自動選択
		if ( g_cmn.account_order.length > 0 )
		{
			cp.param['account_id'] = g_cmn.account_order[0];
		}
	}

	// 選択したアカウント部
	var item = {
		id: cp.param['account_id'],
		icon: g_cmn.account[cp.param['account_id']].icon,
		name: g_cmn.account[cp.param['account_id']].screen_name,
	};

	var account_select = cont.find( '.account_select' );

	account_select.html( OutputTPL( 'account_select', { item: item } ) );

	account_select.find( '.selectitem' ).on( 'click',
		function()
		{
			account_select.find( '.selectlist' ).slideToggle( 200, function() {
				account_select.find( '.selectlist' ).scrollTop( account_select.find( '.selectlist' ).find( '.item.select' ).position().top );
			} );
		}
	);

	// アカウント一覧部
	var selectlist = account_select.find( '.selectlist' );

	var items = new Array();
	var id;

	for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
	{
		id = g_cmn.account_order[i];

		items.push( {
			name: g_cmn.account[id]['screen_name'],
			icon: g_cmn.account[id]['icon'],
			id: id,
		} );
	}

	var assign = {
		items: items,
	};

	selectlist.html( OutputTPL( 'account_select_list', assign ) );

	selectlist.find( '.item' ).each( function() {
		if ( $( this ).attr( 'account_id' ) == cp.param['account_id'] )
		{
			$( this ).addClass( 'select' );
			return false;
		}
	} );

	////////////////////////////////////////////////////////////
	// クリック時処理
	////////////////////////////////////////////////////////////
	selectlist.find( '.item' ).on( 'click', function( e ) {
		cp.param['account_id'] = $( this ).attr( 'account_id' );

		selectlist.slideToggle( 100, function() {
			AccountSelectMake( cp );
			cont.trigger( 'account_changed' );
		} );

		e.stopPropagation();
	} );

	selectlist.hide();
}

////////////////////////////////////////////////////////////////////////////////
// フォント設定
////////////////////////////////////////////////////////////////////////////////
function SetFont( formflg )
{
	if ( !formflg )
	{
		var font_family = ( g_cmn.cmn_param.font_family ) ? g_cmn.cmn_param.font_family : $( ':root' ).css( '--default-font-family' );

		$( 'html,body' ).css( { fontSize: g_cmn.cmn_param.font_size + 'px', fontFamily: font_family } );
	}

	$( 'input[type=text]' ).css( { fontSize: g_cmn.cmn_param.font_size + 'px' } );
	$( 'input[type=file]' ).css( { fontSize: g_cmn.cmn_param.font_size + 'px' } );
	$( 'textarea' ).css( { fontSize: g_cmn.cmn_param.font_size + 'px' } );
	$( 'select' ).css( { fontSize: g_cmn.cmn_param.font_size + 'px' } );
}

////////////////////////////////////////////////////////////////////////////////
// 指定したパネルを一番上に持ってくる
////////////////////////////////////////////////////////////////////////////////
function SetFront( p )
{
	var pzindex = p[0].style.zIndex;

	$( 'panel' ).each( function() {
		var zindex = $( this )[0].style.zIndex;

		if ( zindex > pzindex )
		{
			$( this ).css( 'zIndex', zindex - 1 );
		}
	} );

	p.css( 'zIndex', 100 + g_cmn.panel.length - 1 );
}

////////////////////////////////////////////////////////////////////////////////
// デスクトップ通知を表示
////////////////////////////////////////////////////////////////////////////////
function OpenNotification( type, data )
{
	var s = '';

	if ( type != 'new' && g_cmn.cmn_param['notify_' + type] == 0 )
	{
		return;
	}

	var options = {
		iconUrl: 'images/icon128.png',
	};

	if ( data.simg )
	{
		options.iconUrl = data.simg;
	}
	else if ( data.img )
	{
		if ( data.img.match( /^http.*/ ) )
		{
			options.iconUrl = data.img;
		}
	}

	switch ( type ) {
		case 'retweet':
			options.title = i18nGetMessage( 'i18n_0332', [data.src] );

			options.message = data.msg + '\n' + data.date;
			break;
		case 'favorite':
			options.title = i18nGetMessage( 'i18n_0330', [data.src] );
			options.message = data.msg + '\n' + data.date;
			break;
		case 'follow':
			options.title = i18nGetMessage( 'i18n_0329', [data.src, data.target] );
			options.message = '';
			options.buttons = [
				{ title: data.src, iconUrl: data.simg },
				{ title: data.target, iconUrl: data.timg }
			];
			break;
		case 'dmrecv':
			options.title = i18nGetMessage( 'i18n_0331', [data.src, data.target] );
			options.message = '';
			options.buttons = [
				{ title: data.src, iconUrl: data.simg },
				{ title: data.target, iconUrl: data.timg }
			];
			break;
		case 'mention':
			options.title = i18nGetMessage( 'i18n_0337', [data.src] );
			options.message = data.msg + '\n' + data.date;
			break;
		case 'incoming':
			options.title = i18nGetMessage( 'i18n_0333', [data.user, data.count] );
			options.message = '';
			break;
		case 'list_add':
			options.title = i18nGetMessage( 'i18n_0336', [data.src, data.target] );
			options.message = data.list_fullname;
			options.buttons = [
				{ title: data.src, iconUrl: data.simg },
				{ title: data.target, iconUrl: data.timg }
			];
			break;
		case 'new':
			options.title = i18nGetMessage( 'i18n_0237' );
			options.message = data.user + ' ' + data.count + i18nGetMessage( 'i18n_0204' );
			break;
		case 'alltweets':
		case 'quoted_tweet':
			options.title = data.src;

			if ( data.rtsrc )
			{
				if ( data.rtcnt > 0 )
				{
					options.message = i18nGetMessage( 'i18n_0335', [data.rtsrc, data.rtcnt] ) + '\n';
				}
				else
				{
					options.message = i18nGetMessage( 'i18n_0334', [data.rtsrc] ) + '\n';
				}
			}
			else
			{
				options.message = '';
			}

			options.message += data.msg + '\n' + data.date;
			break;
	}

	var pp = new Notification( options.title, {
		body: options.message,
		icon: options.iconUrl
	} );

	// 設定時間後に消去
	pp.onshow = function() {
		setTimeout( function() { pp.close() }, g_cmn.cmn_param['notify_time'] * 1000 );
	};

	// 音を鳴らす
	$( '#notify_sound' ).get( 0 ).volume = g_cmn.cmn_param['notify_sound_volume'];
	$( '#notify_sound' ).get( 0 ).play();

	// 履歴に追加
	g_cmn.notsave.notify_history.push( { type: type, data: data } );

	var pid = IsUnique( 'notify_history' );

	// 通知履歴パネルを開いている場合のみ
	if ( pid != null )
	{
		$( '#notify_history_reload' ).trigger( 'click' );
	}
}

////////////////////////////////////////////////////////////////////////////////
// APIのURLを返す
////////////////////////////////////////////////////////////////////////////////
function ApiUrl( ver, type )
{
	if ( ver == undefined )
	{
		// 1.0
		return 'https://api.twitter.com/1/';
	}
	else
	{
		if ( type == 'upload' )
		{
			return 'https://upload.twitter.com/' + ver + '/';
		}

		return 'https://api.twitter.com/' + ver + '/';
	}
}

////////////////////////////////////////////////////////////////////////////////
// タイムライン作成
////////////////////////////////////////////////////////////////////////////////
function MakeTimeline( json, account_id )
{
	var my_screen_name = g_cmn.account[account_id].screen_name;

	// 公式RT？
	var rt_flg = ( json.retweeted_status );
	var rt_icon = '';
	var rt_screen_name = '';
	var rt_name = '';
	var rt_user_id = '';
	var rt_created_at = '';
	var rt_id = '';
	var id = json.id_str;

	if ( g_devmode )
	{
		console.log( json );
	}

	if ( rt_flg )
	{
		rt_icon = json.user.profile_image_url_https;
		rt_screen_name = json.user.screen_name;
		rt_name = json.user.name;
		rt_user_id = json.user.id_str;
		rt_created_at = json.created_at;
		id = json.id_str;
		json = json.retweeted_status;
		rt_id = json.id_str;

		g_cmn.notsave.retweets[rt_id] = true;
	}

	// 複数画像対応
	if ( json.extended_entities )
	{
		if ( json.extended_entities.media )
		{
			json.entities.media = json.extended_entities.media;
		}
	}

	// リンク設定
	var text = Txt2Link( json.text, json.entities );

	// ハッシュタグを保存
	$.each( json.entities.hashtags, function( i, val ) {
		var chk = true;
		for ( var j = 0, _len = g_cmn.notsave.tl_hashtag.length ; j < _len ; j++ )
		{
			if ( g_cmn.notsave.tl_hashtag[j].hashtag == val.text )
			{
				chk = false;
				break;
			}
		}

		if ( chk )
		{
			g_cmn.notsave.tl_hashtag.push( { hashtag: val.text } );
		}
	} );

	json.source = json.source.replace( /rel=\"nofollow\"/, 'rel="nofollow noopener noreferrer" class="anchor" target="_blank"' );

	// "</a>がついていないことがある不具合対策
	if ( json.source.match( /^<a/ ) )
	{
		if ( !json.source.match( /<\/a>$/ ) )
		{
			json.source += '</a>';
		}
	}

	// 公式
	if ( json.source.match( /^web$/ ) )
	{
		json.source = '<a href="https://twitter.com/" class="anchor" rel="nofollow noopener noreferrer" target="_blank">web</a>';
	}

	// "改行
	text = text.replace( /\n/g, '<br>' );

	// 相互、一方フォローマーク
	var isfriend = IsFriend( account_id, json.user.id_str );
	var isfollower = IsFollower( account_id, json.user.id_str );

	if ( rt_user_id != '' && json.favorited )
	{
		if ( ( rt_user_id != g_cmn.account[account_id].user_id ) )
		{
			json.favorited = false;
		}
	}

	// 絵文字表示
	{
		text = twemoji.parse( text );
	}

	var assign = {
		status_id: id,
		icon: json.user.profile_image_url_https,
		screen_name: json.user.screen_name,
		user_id: json.user.id_str,
		name: twemoji.parse( json.user.name ),
		protected: json.user.protected,
		verified: json.user.verified,
		favorited: json.favorited,
		text: text,
		date: DateConv( json.created_at, 0 ),
		absdate: json.created_at,
		source: json.source,
		geo: json.geo,
		in_reply_to_status_id: json.in_reply_to_status_id_str,
		mytweet: ( rt_flg ) ? ( rt_screen_name == my_screen_name )
							: ( json.user.screen_name == my_screen_name ),
		rt_flg: rt_flg,
		rt_icon: rt_icon,
		rt_screen_name: rt_screen_name,
		rt_name: twemoji.parse( rt_name ),
		rt_user_id: rt_user_id,
		friends: NumFormat( json.user.friends_count ),
		followers: NumFormat( json.user.followers_count ),
		statuses_count: NumFormat( json.user.statuses_count ),
		rtcnt: json.retweet_count - 1,
		created_at: ( rt_flg ) ? rt_created_at : json.created_at,
		rt_id: rt_id,
		ismutual: g_cmn.cmn_param['follow_mark'] & isfriend & isfollower,
		isfriend: g_cmn.cmn_param['follow_mark'] & isfriend & !isfollower,
		isfollower: g_cmn.cmn_param['follow_mark'] & !isfriend & isfollower,
		namedisp: g_namedisp,
		dispdate: DateConv( json.created_at, ( g_timedisp == 1 ) ? 1 : 3 ),
		favcnt: json.favorite_count,
	};

	return OutputTPL( 'timeline_tweet', assign );
}

////////////////////////////////////////////////////////////////////////////////
// DM表示作成
////////////////////////////////////////////////////////////////////////////////
function MakeTimeline_DM( json, type, account_id )
{
	var my_screen_name = g_cmn.account[account_id].screen_name;

	var id = json.id_str;

	if ( g_devmode )
	{
		console.log( json );
	}

	// 複数画像対応
	if ( json.extended_entities )
	{
		if ( json.extended_entities.media )
		{
			json.entities.media = json.extended_entities.media;
		}
	}

	// リンク設定
	var text = Txt2Link( json.text, json.entities );

	// 改行
	text = text.replace( /\n/g, '<br>' );

	var sendrec = ( type == 'dmrecv' ) ? json.sender : json.recipient;
	var user_id = ( type == 'dmrecv' ) ? json.sender_id : json.recipient_id;

	// 相互、一方フォローマーク
	var isfriend = IsFriend( account_id, user_id ) ;
	var isfollower = IsFollower( account_id, user_id );

	// 絵文字表示
	{
		text = twemoji.parse( text );
	}

	var assign = {
		icon: sendrec.profile_image_url_https,
		screen_name: sendrec.screen_name,
		user_id: user_id,
		name: twemoji.parse( sendrec.name ),
		text: text,
		date: DateConv( json.created_at, 0 ),
		absdate: json.created_at,
		status_id: json.id_str,
		type: type,
		created_at: json.created_at,
		ismutual: g_cmn.cmn_param['follow_mark'] & isfriend & isfollower,
		isfriend: g_cmn.cmn_param['follow_mark'] & isfriend & !isfollower,
		isfollower: g_cmn.cmn_param['follow_mark'] & !isfriend & isfollower,
		namedisp: g_namedisp,
		dispdate: DateConv( json.created_at, ( g_timedisp == 1 ) ? 1 : 3 ),
	};

	return OutputTPL( 'timeline_dm', assign );
}

////////////////////////////////////////////////////////////////////////////////
// ストリームデータ解析
////////////////////////////////////////////////////////////////////////////////
function StreamDataAnalyze( data )
{
	var account_id = data.account_id;
	var json = data.json;

	////////////////////////////////////////////////////////////
	// アカウントIDの一致するタイムラインパネルにデータを送信
	////////////////////////////////////////////////////////////
	var PutTimeline = function( panel_type, timeline_type ) {
		for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
		{
			if ( g_cmn.panel[i].type == panel_type )
			{
				if ( g_cmn.panel[i].param['timeline_type'].match( timeline_type ) &&
					 g_cmn.panel[i].param['account_id'] == account_id )
				{
					$( '#' + g_cmn.panel[i].id ).find( 'div.contents' ).trigger( 'getstream', [json] );
				}
			}
		}
	};

	// 接続成功/エラー/切断
	if ( json.error_id != undefined )
	{
		var current_stream = g_cmn.account[account_id].notsave.stream;

		switch ( json.error_id )
		{
			// ユーザーストリーム接続エラー
			case -1:
				g_cmn.account[account_id].notsave.stream = 0;

				if ( json.status )
				{
					MessageBox( g_cmn.account[account_id].screen_name + i18nGetMessage( 'i18n_0102' ) + '(' + json.status + ')' );
				}

				DisconnectUserStream( account_id );
				break;
			// ユーザーストリーム接続成功
			case 2:
				g_cmn.account[account_id].notsave.stream = 2;
				break;
			// ユーザーストリーム接続試行中
			case 1:
				g_cmn.account[account_id].notsave.stream = 1;
				break;
			// ユーザーストリーム切断
			case 0:
				if ( g_cmn.account[account_id] != undefined )
				{
					g_cmn.account[account_id].notsave.stream = 0;
				}
				// アカウントが削除されている場合
				else
				{
					return;
				}

				DisconnectUserStream( account_id );
				break;
		}

		// Streamのステータスに変更があった場合のみ
		if ( current_stream != g_cmn.account[account_id].notsave.stream )
		{
			var pid = IsUnique( 'account' );

			if ( pid != null )
			{
				$( '#' + pid ).find( 'div.contents' ).trigger( 'account_update' );
			}

			// ツールバーユーザーの更新
			UpdateToolbarUser();

			if ( g_cmn.account[account_id].notsave.stream == 0 ||
				 g_cmn.account[account_id].notsave.stream == 2 )
			{
				for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
				{
					if ( g_cmn.panel[i].type == 'timeline' )
					{
						if ( g_cmn.panel[i].param['account_id'] == account_id )
						{
							$( '#' + g_cmn.panel[i].id ).find( 'div.contents' ).find( '.timeline_list' ).trigger( 'reload_timer' );
						}
					}
				}
			}
		}

		return;
	}

	if ( json.friends || json.friends_str )
	{
	}
	else if ( json.retweeted_status )
	{
		// RT非表示
		if ( IsNoRetweetUser( account_id, json.user.id_str ) )
		{
			return;
		}

		// ミュートユーザーチェック
		if ( json.retweeted_status.user )
		{
			if ( IsMuteUser( account_id, json.retweeted_status.user.id_str ) )
			{
				return;
			}
		}

		// ブロックユーザーチェック
		if ( json.retweeted_status.user )
		{
			if ( IsBlockUser( account_id, json.retweeted_status.user.id_str ) )
			{
				return;
			}
		}

		json = ConvertExtendedTweet( json, 'userstream' );

		json = AppendQuotedStatusURL( json )

		// NGチェック
		if ( IsNGTweet( json, 'normal' ) )
		{
			return;
		}

		// 重複表示なし
		if ( g_cmn.cmn_param['onlyone_rt'] == 1 )
		{
			// すでに表示済み？
			if ( g_cmn.notsave.retweets[json.retweeted_status.id_str] )
			{
				return;
			}
		}

		g_cmn.notsave.retweets[json.retweeted_status.id_str] = true;

		var notified = false;

		// 自分のアカウントのツイートがRTされたら通知
		if ( IsMyAccount( json.retweeted_status.user.id_str ) )
		{
			// 自分の別アカウントでRTした分は通知しない
			if ( !IsMyAccount( json.user.id_str ) || g_devmode )
			{
				OpenNotification( 'retweet', {
					src: json.user.screen_name,
					simg: json.user.profile_image_url_https,
					target: json.retweeted_status.user.screen_name,
					msg: json.retweeted_status.text,
					date: DateConv( json.retweeted_status.created_at, 0 ),
					account_id: account_id,
				} );

				notified = true;
			}
		}

		// 全てのツイート通知
		if ( !notified )
		{
			OpenNotification( 'alltweets', {
							src: json.retweeted_status.user.screen_name,
							simg: json.retweeted_status.user.profile_image_url_https,
							msg: json.retweeted_status.text,
							date: DateConv( json.retweeted_status.created_at, 0 ),
							rtsrc: json.user.screen_name,
							rtsimg: json.user.profile_image_url_https,
							rtcnt: json.retweet_count - 1,
							account_id: account_id,
						} );
		}

		PutTimeline( 'timeline', 'home|group' );
	}
	else if ( json.event )
	{
		switch ( json.event )
		{
			case 'favorite':
				// 自分が追加したもの以外をデスクトップ通知
				if ( !IsMyAccount( json.source.id_str ) || g_devmode )
				{
					OpenNotification( 'favorite', {
						src: json.source.screen_name,
						simg: json.source.profile_image_url_https,
						target: json.target.screen_name,
						msg: json.target_object.text,
						date: DateConv( json.target_object.created_at, 0 ),
						account_id: account_id,
					} );
				}

				break;
			case 'follow':
				// 自分がフォローしたもの以外をデスクトップ通知
				if ( !IsMyAccount( json.source.id_str ) || g_devmode )
				{
					OpenNotification( 'follow', {
						simg: json.source.profile_image_url_https,
						src: json.source.screen_name,
						timg: json.target.profile_image_url_https,
						target: json.target.screen_name,
						account_id: account_id,
						num: json.target.followers_count + 1,
					} );
				}

				break;
			case 'list_member_added':
				if ( !IsMyAccount( json.source.id_str ) || g_devmode )
				{
					OpenNotification( 'list_add', {
						simg: json.source.profile_image_url_https,
						src: json.source.screen_name,
						timg: json.target.profile_image_url_https,
						target: json.target.screen_name,
						account_id: account_id,
						num: json.target.followers_count + 1,
						list_fullname: json.target_object.full_name,
						list_id: json.target_object.id_str,
						list_screen_name: json.target_object.user.screen_name,
						list_slug: json.target_object.slug,
					} );
				}

				break;
			case 'quoted_tweet':
				if ( !IsMyAccount( json.source.id_str ) || g_devmode )
				{
					OpenNotification( 'quoted_tweet', {
									src: json.target_object.user.screen_name,
									simg: json.target_object.user.profile_image_url_https,
									msg: json.target_object.text,
									date: DateConv( json.target_object.created_at, 0 ),
									account_id: account_id,
								} );
				}

				break;
			default:
				break;
		}
	}
	else if ( json.direct_message )
	{
		json = json.direct_message;

		if ( g_cmn.account[account_id].screen_name == json.recipient_screen_name )
		{
			// NGチェック
			if ( IsNGTweet( json, 'dmrecv' ) )
			{
				return;
			}

			// デスクトップ通知
			OpenNotification( 'dmrecv', {
				simg: json.sender.profile_image_url_https,
				src: json.sender.screen_name,
				timg: json.recipient.profile_image_url_https,
				target: json.recipient.screen_name,
				account_id: account_id,
			} );

			PutTimeline( 'timeline', 'dmrecv' );
		}

		if ( g_cmn.account[account_id].screen_name == json.sender_screen_name )
		{
			PutTimeline( 'timeline', 'dmsent' );
		}
	}
	else if ( json.delete )
	{
		$( '.contents.timeline' ).find( '.timeline_list' ).find( '.item[status_id="' + json.delete.status.id_str + '"]' ).addClass( 'deleted' )
	}
	else
	{
		if ( json.entities == undefined )
		{
			return;
		}

		// ミュートユーザーチェック
		if ( IsMuteUser( account_id, json.user.id_str ) )
		{
			return;
		}

		// ブロックユーザーチェック
		if ( IsBlockUser( account_id, json.user.id_str ) )
		{
			return;
		}

		json = ConvertExtendedTweet( json, 'userstream' );

		json = AppendQuotedStatusURL( json )

		// NGチェック
		if ( IsNGTweet( json, 'normal' ) )
		{
			return;
		}

		// entitiesのmentionに自分のアカウントが含まれている場合
 		for ( var i = 0, _len = json.entities.user_mentions.length ; i < _len ; i++ )
		{
			if ( json.entities.user_mentions[i].screen_name == g_cmn.account[account_id].screen_name )
			{
				// リプライのみ通知の場合、in_reply_to_screen_nameが自分のアカウントのときだけ通知
				if ( g_cmn.cmn_param['notify_reponly'] == 0 ||
					 ( g_cmn.cmn_param['notify_reponly'] == 1 && json.in_reply_to_screen_name == g_cmn.account[account_id].screen_name ) )
				{
					OpenNotification( 'mention', {
						src: json.user.screen_name,
						simg: json.user.profile_image_url_https,
						msg: json.text,
						date: DateConv( json.created_at, 0 ),
						account_id: account_id,
					} );
				}

				PutTimeline( 'timeline', 'mention' );
				break;
			}
		}

		// 全てのツイート通知
		OpenNotification( 'alltweets', {
						src: json.user.screen_name,
						simg: json.user.profile_image_url_https,
						msg: json.text,
						date: DateConv( json.created_at, 0 ),
						account_id: account_id,
					} );

		PutTimeline( 'timeline', 'home|group' );
	}
}

////////////////////////////////////////////////////////////////////////////////
// アイコンをドラッグできるようにする
////////////////////////////////////////////////////////////////////////////////
function SetDraggable( selector, p, cp )
{
	selector.draggable( {
		containment: 'document',
		opacity: 0.8,
		start: function() {
			$( '#main' ).addClass( 'dragon' );
			$( '#head' ).addClass( 'dragon' );

			var item = $( this ).parent().parent();

			if ( cp != null )
			{
				SetFront( p );
				$( this ).addClass( 'fromtl' );
			}

			$( this ).addClass( 'dropitem user' )
				.attr( {
					account_id: ( cp != null ) ? cp.param['account_id'] : null,
					user_id: item.attr( 'user_id' ),
					screen_name: item.attr( 'screen_name' ),
					icon: $( this ).attr( 'src' ),
					created_at: item.attr( 'created_at' ),
					type: ( item.attr( 'type' ) ) ? item.attr( 'type' ) : 'user',
				} );

			if ( item.attr( 'type' ) == 'list' )
			{
				$( this ).attr( {
					list_id: item.attr( 'list_id' ),
					owner_screen_name: item.attr( 'owner_screen_name' ),
					slug: item.attr( 'slug' ),
					name: item.attr( 'name' ),
				} );
			}

			if ( !item.attr( 'drag_id' ) )
			{
				item.attr( 'drag_id', GetUniqueID() );
			}

			$( '#head_users' ).attr( 'currentdrag', item.attr( 'drag_id' ) );

			$( 'body' ).css( { pointerEvents: 'none' } );
		},
		stop: function( e, ui ) {
			$( '#main' ).removeClass( 'dragon' );
			$( '#head' ).removeClass( 'dragon' );

			$( this ).removeClass( 'dropitem user' );

			$( 'body' ).css( { pointerEvents: 'auto' } );

			var dropuser;
			var dropuseridx = 0;

			// ツールバーから
			if ( !$( this ).hasClass( 'fromtl' ) )
			{
				var idx = $( '#head_users' ).find( '>div[drag_id="' + $( '#head_users' ).attr( 'currentdrag' ) + '"]' ).index();

				dropuser = g_cmn.toolbar_user[idx];
				g_cmn.toolbar_user.splice( idx, 1 );
				dropuseridx = idx;
			}
			// TLから
			else
			{
				if ( IsToolbarUser( $( this ).attr( 'user_id' ) ) == -1 )
				{
					dropuser = {
						user_id: $( this ).attr( 'user_id' ),
						screen_name: $( this ).attr( 'screen_name' ),
						icon: $( this ).attr( 'icon' ),
						account_id: $( this ).attr( 'account_id' ),
						created_at: $( this ).attr( 'created_at' ),
						type: $( this ).attr( 'type' ),
					};
				}
				else
				{
					$( '#head_users' ).removeAttr( 'currentdrag' );
					$( '#head_users div' ).removeClass( 'iconover' );
					return;
				}
			}

			// 情報を挿入する
			var insflg = false;

			$( '#head_users > div' ).each( function() {
				if ( $( this ).hasClass( 'iconover' ) )
				{
					// 右端
					if ( $( this ).hasClass( 'dmy' ) )
					{
						g_cmn.toolbar_user.push( dropuser );
						insflg = true;
					}
					else
					{
						for ( var i = 0, _len = g_cmn.toolbar_user.length ; i < _len ; i++ )
						{
							if ( ( g_cmn.toolbar_user[i].type == 'user' && g_cmn.toolbar_user[i].user_id == $( this ).attr( 'user_id' ) ) ||
								 ( g_cmn.toolbar_user[i].type == 'list' && g_cmn.toolbar_user[i].list_id == $( this ).attr( 'list_id' ) ) )
							{
								g_cmn.toolbar_user.splice( i, 0, dropuser );
								insflg = true;
								break;
							}
						}
					}

					return false;
				}
			} );

			if ( !insflg )
			{
				// TLから
				if ( $( this ).hasClass( 'fromtl' ) )
				{
					var l = ui.offset.left - $( document ).scrollLeft() ;
					var t = ui.offset.top - $( document ).scrollTop();
					var head = $( '#head' );
					var hl = head.position().left;
					var ht = head.position().top;
					var hw = head.outerWidth();
					var hh = head.outerHeight();

					if ( l >= hl && l <= hl + hw && t >= ht && t <= ht + hh )
					{
						g_cmn.toolbar_user.push( dropuser );
					}
				}
				// ツールバーから
				else
				{
					g_cmn.toolbar_user.splice( dropuseridx, 0, dropuser );
				}
			}

			$( '#head_users' ).removeAttr( 'currentdrag' );
			UpdateToolbarUser();

			$( '#head_users div' ).removeClass( 'iconover' );
		},
		drag: function( e, ui ) {
			var l = ui.offset.left - $( document ).scrollLeft();
			var t = ui.offset.top - $( document ).scrollTop();
			var head = $( '#head' );
			var hl = head.position().left;
			var ht = head.position().top;
			var hw = head.outerWidth();
			var hh = head.outerHeight();

			if ( l >= hl && l <= hl + hw && t >= ht && t <= ht + hh )
			{
				$( '#head_users > div' )
					.removeClass( 'iconover' )
					.each( function() {
						var dl = $( this ).position().left;
						var dt = $( this ).position().top;
						var dw = $( this ).outerWidth();
						var dh = $( this ).outerHeight();
						var id = $( this ).attr( 'drag_id' );

						if ( l >= dl - dw / 2 && l < dl + dw - dw / 2 && t >= dt && t <= dt + dh && $( '#head_users' ).attr( 'currentdrag' ) != id )
						{
							$( this ).addClass( 'iconover' );
							return false;
						}
					} );
			}
		},

		appendTo: 'body',
		zIndex: 2000,
		helper: 'clone',
	} );
}

////////////////////////////////////////////////////////////////////////////////
// ユーザ情報を開く"
////////////////////////////////////////////////////////////////////////////////
function OpenUserShow( screen_name, user_id, account_id )
{
	var _cp = new CPanel( null, null, 400, 360 );
	_cp.SetType( 'show' );
	_cp.SetParam( {
		account_id: account_id,
		screen_name: screen_name,
		user_id: user_id,
	} );
	_cp.Start();
};

////////////////////////////////////////////////////////////////////////////////
// ユーザタイムラインを開く
////////////////////////////////////////////////////////////////////////////////
function OpenUserTimeline( screen_name, account_id )
{
	var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
	_cp.SetType( 'timeline' );
	_cp.SetParam( {
		account_id: account_id,
		timeline_type: 'user',
		screen_name: screen_name,
		reload_time: g_cmn.cmn_param['reload_time'],
	} );
	_cp.Start();
};

////////////////////////////////////////////////////////////////////////////////
// 検索結果を開く
////////////////////////////////////////////////////////////////////////////////
function OpenSearchResult( q, account_id )
{
	var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
	_cp.SetType( 'timeline' );
	_cp.SetParam( {
		account_id: account_id,
		timeline_type: 'search',
		q: q,
		reload_time: g_cmn.cmn_param['reload_time'],
	} );
	_cp.Start();
};

////////////////////////////////////////////////////////////////////////////////
// テキストエリアのカーソル位置設定
////////////////////////////////////////////////////////////////////////////////
$.fn.extend( {
	SetPos: function( pos ) {
		var elem = this.get( 0 );

		if ( pos == 'start' )
		{
			pos = 0;
		}
		else if ( pos == 'end' )
		{
			pos = elem.value.length;
		}

		if ( elem != undefined )
		{
			elem.focus();

			if ( elem.createTextRange )
			{
				var range = elem.createTextRange();
				range.move( 'character', pos );
				range.select();
			}
			else if ( elem.setSelectionRange )
			{
				elem.setSelectionRange( pos, pos );
			}
		}
	}
} );

////////////////////////////////////////////////////////////////////////////////
// ミュートユーザかチェック
////////////////////////////////////////////////////////////////////////////////
function IsMuteUser( account_id, user_id )
{
	var account = g_cmn.account[account_id];

	if ( account.notsave.muteusers == undefined )
	{
		return false;
	}

	for ( var i = 0, _len = account.notsave.muteusers.length ; i < _len ; i++ )
	{
		if ( user_id == account.notsave.muteusers[i] )
		{
			return true;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// ブロックユーザかチェック
////////////////////////////////////////////////////////////////////////////////
function IsBlockUser( account_id, user_id )
{
	var account = g_cmn.account[account_id];

	if ( account.notsave.blockusers == undefined )
	{
		return false;
	}

	for ( var i = 0, _len = account.notsave.blockusers.length ; i < _len ; i++ )
	{
		if ( user_id == account.notsave.blockusers[i] )
		{
			return true;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// フレンドかチェック
////////////////////////////////////////////////////////////////////////////////
function IsFriend( account_id, user_id )
{
	var account = g_cmn.account[account_id];

	if ( account.notsave.friends == undefined )
	{
		return false;
	}

	for ( var i = 0, _len = account.notsave.friends.length ; i < _len ; i++ )
	{
		if ( user_id == account.notsave.friends[i] )
		{
			return true;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// フォロワーかチェック
////////////////////////////////////////////////////////////////////////////////
function IsFollower( account_id, user_id )
{
	var account = g_cmn.account[account_id];

	if ( account.notsave.followers == undefined )
	{
		return false;
	}

	for ( var i = 0, _len = account.notsave.followers.length ; i < _len ; i++ )
	{
		if ( user_id == account.notsave.followers[i] )
		{
			return true;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// RT非表示ユーザかチェック
////////////////////////////////////////////////////////////////////////////////
function IsNoRetweetUser( account_id, user_id )
{
	var account = g_cmn.account[account_id];

	if ( account.notsave.noretweet == undefined )
	{
		return false;
	}

	for ( var i = 0, _len = account.notsave.noretweet.length ; i < _len ; i++ )
	{
		if ( user_id == account.notsave.noretweet[i] )
		{
			return true;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// API呼び出しエラー
////////////////////////////////////////////////////////////////////////////////
function ApiError( msg, res )
{
	var str = msg + '(' + res.status + ')\n' + '[' + res.message + ']';

	MessageBox( str );
}

////////////////////////////////////////////////////////////////////////////////
// ツイート数表示の更新
////////////////////////////////////////////////////////////////////////////////
function StatusesCountUpdate( account_id, num )
{
	g_cmn.account[account_id]['statuses_count'] += num;

	var pid = IsUnique( 'account' );

	// アカウントパネルを開いている場合のみ
	if ( pid != null )
	{
		$( '#' + pid ).find( 'div.contents' ).trigger( 'account_update' );
	}
}

////////////////////////////////////////////////////////////////////////////////
// メッセージ出力
////////////////////////////////////////////////////////////////////////////////
var messages = new Array();

function MessageBox( msg, time )
{
	var MessageUpdate = function() {
		for ( var i = 0, s = '', _len = messages.length ; i < _len ; i++ )
		{
			s += messages[i].msg;
		}

		if ( s == '' )
		{
			$( '#messagebox' ).css( 'visibility', 'hidden' );
		}
		else
		{
			$( '#messagebox_body' ).html( s );
		}
	};

	msg = '<div><div class="msg">' + msg.replace( /\n/g, '<br>' ) + '</div></div>';

	messages.push( {
		msg: msg,
		tm: setTimeout( function() {
			messages.splice( 0, 1 );
			MessageUpdate();
		}, ( time ) ? time : 20 * 1000 ),
	} );

	// 初回表示
	if ( $( '#messagebox' ).css( 'display' ) == 'none' )
	{
		$( '#messagebox' ).show()
			.draggable( {
				cursor: 'move',
			} )
			.html( OutputTPL( 'messagebox', {} ) );

		var w = $( '#messagebox' ).outerWidth();
		var h = $( '#messagebox' ).outerHeight();

		$( '#messagebox' ).css( {
			left: ( $( '#main' ).width() - w ) / 2,
			top: ( $( '#main' ).height() - h ) / 2 - $( '#head' ).height(),
		} );

		$( '#messagebox_foot' ).find( '.btn' ).on( 'click', function( e ) {
			$( '#messagebox' ).css( 'visibility', 'hidden' );

			// メッセージをクリア
			for ( var i = 0, _len = messages.length ; i < _len ; i++ )
			{
				clearTimeout( messages[i].tm );
			}

			messages = [];

			MessageUpdate();

			e.stopPropagation();
		} );
	}
	// 2回目以降表示
	{
		$( '#messagebox' ).css( 'visibility', 'visible' );
	}

	MessageUpdate();
}

////////////////////////////////////////////////////////////////////////////////
// ツールバーユーザ？
////////////////////////////////////////////////////////////////////////////////
function IsToolbarUser( user_id )
{
	var len = g_cmn.toolbar_user.length;

	for ( var i = 0 ; i < len ; i++ )
	{
		if ( g_cmn.toolbar_user[i].user_id == user_id && ( !g_cmn.toolbar_user[i].type || g_cmn.toolbar_user[i].type == 'user' ) )
		{
			return i;
		}
	}

	return -1;
}

////////////////////////////////////////////////////////////////////////////////
// ツールバーリスト？
////////////////////////////////////////////////////////////////////////////////
function IsToolbarList( list_id )
{
	var len = g_cmn.toolbar_user.length;

	for ( var i = 0 ; i < len ; i++ )
	{
		if ( g_cmn.toolbar_user[i].type == 'list' )
		{
			if ( g_cmn.toolbar_user[i].list_id == list_id )
			{
				return i;
			}
		}
	}

	return -1;
}

////////////////////////////////////////////////////////////////////////////////
// ツールバーユーザの表示を更新
////////////////////////////////////////////////////////////////////////////////
function UpdateToolbarUser()
{
	var s = '';
	var len = g_cmn.toolbar_user.length;
	var myacc;
	var assign;

	for ( var i = 0 ; i < len ; i++ )
	{
		myacc = IsMyAccount( g_cmn.toolbar_user[i].user_id );

		if ( !g_cmn.toolbar_user[i].type )
		{
			g_cmn.toolbar_user[i].type = 'user';
		}

		assign = {
			icon: g_cmn.toolbar_user[i].icon,
			user_id: g_cmn.toolbar_user[i].user_id,
			screen_name: g_cmn.toolbar_user[i].screen_name,
			account_id: g_cmn.toolbar_user[i].account_id,
			created_at: g_cmn.toolbar_user[i].created_at,
			type: g_cmn.toolbar_user[i].type,
			drag_id: GetUniqueID(),
		};

		if ( g_cmn.toolbar_user[i].type == 'user' )
		{
			assign.myaccount = ( myacc != false ) ? true : false;
			assign.stream = ( myacc != false ) ? g_cmn.account[myacc].notsave.stream : 0;
		}

		if ( g_cmn.toolbar_user[i].type == 'list' )
		{
			assign.list_id = g_cmn.toolbar_user[i].list_id;
			assign.slug = g_cmn.toolbar_user[i].slug;
			assign.name = g_cmn.toolbar_user[i].name;
			assign.owner_screen_name = g_cmn.toolbar_user[i].owner_screen_name;
		}

		s += OutputTPL( 'header_user', assign );
	}

	s += "<div class='dmy'></div>";

	$( '#head_users' ).html( s ).find( '> div' ).each( function() {
		if ( $( this ).hasClass( 'dmy' ) )
		{
			return true;
		}

		var screen_name = $( this ).attr( 'screen_name' );
		var account_id = $( this ).attr( 'account_id' );
		var user_id = $( this ).attr( 'user_id' );
		var type = $( this ).attr( 'type' );

		var list_id, slug, name;

		if ( type == 'list' )
		{
			screen_name = $( this ).attr( 'owner_screen_name' );
			list_id = $( this ).attr( 'list_id' );
			slug = $( this ).attr( 'slug' );
			name = $( this ).attr( 'name' );
		}

		////////////////////////////////////////////////////////////
		// アイコンクリック時処理
		////////////////////////////////////////////////////////////
		$( this ).find( 'img' ).on( 'click', function( e ) {
			switch ( type )
			{
				case 'user':
					OpenUserTimeline( screen_name, account_id );
					break;
				case 'list':
					var _cp = new CPanel( null, null, 360, $( window ).height() * 0.75 );
					_cp.SetType( 'timeline' );
					_cp.SetParam( {
						account_id: account_id,
						timeline_type: 'list',
						screen_name: screen_name,
						slug: slug,
						name: name,
						reload_time: g_cmn.cmn_param['reload_time'],
					} );
					_cp.Start();
					break;
			}

			e.stopPropagation();
		} )
		////////////////////////////////////////////////////////////
		// 削除処理
		////////////////////////////////////////////////////////////
		.on( 'contextmenu', function( e ) {
			var len = g_cmn.toolbar_user.length;

			for ( var i = 0 ; i < len ; i++ )
			{
				if ( ( type == 'list' && g_cmn.toolbar_user[i].type == 'list' && list_id == g_cmn.toolbar_user[i].list_id ) ||
					 ( type == 'user' && g_cmn.toolbar_user[i].type == 'user' && user_id == g_cmn.toolbar_user[i].user_id ) )
				{
					g_cmn.toolbar_user.splice( i, 1 );
					UpdateToolbarUser();
					$( '#tooltip' ).hide();
					break;
				}
			}

			if ( type == 'list' )
			{
				for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
				{
					if ( g_cmn.panel[i].type == 'lists' )
					{
						$( '#' + g_cmn.panel[i].id ).find( 'div.contents' )
							.find( '.item[list_id=' + list_id + ']' ).find( '.toolbarlist' )
							.text( i18nGetMessage( 'i18n_0092' ) );
					}
				}
			}

			return false;
		} )
		.on( 'mouseenter mouseleave', function( e ) {
			if ( e.type == 'mouseenter' )
			{
				SetDraggable( $( this ), null, null );
			}
			else
			{
				$( '#tooltip' ).hide();
			}
		} );

		////////////////////////////////////////////////////////////
		// ユーザーストリーム接続状態クリック処理
		////////////////////////////////////////////////////////////
		$( this ).find( 'div.streamsts' ).find( 'div' ).on( 'click', function( e ) {
			return false // UserStream廃止

			var _account_id = IsMyAccount( user_id );

			// 接続しているときは切断
			if ( $( this ).hasClass( 'on' ) || $( this ).hasClass( 'try' ) )
			{
				SendRequest(
					{
						action: 'stream_stop',
						id: _account_id,
					},
					function( res )
					{
					}
				);
			}
			// 切断しているときは接続
			else if ( $( this ).hasClass( 'off' ) )
			{
				SendRequest(
					{
						action: 'stream_start',
						acsToken: g_cmn.account[_account_id]['accessToken'],
						acsSecret: g_cmn.account[_account_id]['accessSecret'],
						id: _account_id,
					},
					function( res )
					{
					}
				);
			}

			e.stopPropagation();
		} );
	} );
}

////////////////////////////////////////////////////////////
// ツイートから画像のURLを抽出してサムネイル表示を呼び出す
////////////////////////////////////////////////////////////
function OpenThumbnail( item, stream )
{
	item.find( '.tweet_text' ).find( 'a' ).each( function() {
		// 画像URLなら
		if ( isImageURL( $( this ).attr( 'href' ) ) )
		{
			$( this ).trigger( 'mouseover', [ true, stream ] );
		}
	} );
}

////////////////////////////////////////////////////////////////////////////////
// NGチェック用フィルタ作成
////////////////////////////////////////////////////////////////////////////////
function MakeNGRegExp()
{
	var ptn = {
		word: '',
		user: '',
		client: ''
	};

	for ( var i = 0, _len = g_cmn.cmn_param['ngwords'].length ; i < _len ; i++ )
	{
		if ( g_cmn.cmn_param['ngwords'][i].enabled == 'false' )
		{
			continue;
		}

		try {
			const _chk = new RegExp( g_cmn.cmn_param['ngwords'][i].word );
		} catch( e ) {
			g_cmn.cmn_param['ngwords'][i].enabled = false;
			continue;
		}

		ptn[g_cmn.cmn_param['ngwords'][i].type] += ( ptn[g_cmn.cmn_param['ngwords'][i].type] != '' ) ? '|' +
			g_cmn.cmn_param['ngwords'][i].word : g_cmn.cmn_param['ngwords'][i].word;
	}

	for ( var p in ptn )
	{
		if ( ptn[p] != '' )
		{
			try {
				g_ngregexp[p] = new RegExp( ptn[p] );
			} catch( e ) {
				g_ngregexp[p] = null;
			}
		}
		else
		{
			g_ngregexp[p] = null;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// NGチェック
////////////////////////////////////////////////////////////////////////////////
function IsNGTweet( json, tltype )
{
	var word = '';
	var user = '';
	var client = '';
	var rt_user = '';

	switch ( tltype )
	{
		case 'normal':
		case 'search':
			if ( json.retweeted_status )
			{
				if ( !json.retweeted_status.user )
				{
					console.log( 'INVALID DATA - retweeted_status.user is not found.' );
					console.log( json );
					return true;
				}

				rt_user = json.user.screen_name;
				json = json.retweeted_status;
			}

			word = json.text;

			user = json.user.screen_name;
			client = json.source.replace( /<.*?>/g, '' );

			break;
		case 'dmrecv':
			word = json.text;
			user = json.sender.screen_name;
			break;
		case 'dmsent':
			word = json.text;
			user = json.recipient.screen_name;
			break;
	}

	// 短縮URLを展開する
	if ( json.entities )
	{
		var map = {};

		$.each( json.entities.urls, function( i, val ) {
			map[val.indices[0]] = {
				end: val.indices[1],
				func: function() {
					var url = ( val.expanded_url == null ) ? val.url : val.expanded_url;
					var durl;

					try {
						durl = escapeHTML( decodeURI( url ) );
					}
					catch ( e )
					{
						console.log( 'decode error [' + url + ']' );
						durl = url;
					}

					return durl;
				}
			};
		} );

		var _word = '';
		var last = 0;

		for ( var i = 0, _len = word.length ; i < _len ; ++i )
		{
			if ( map[i] )
			{
				if ( i > last )
				{
					_word += uc_substring( word, last, i );
				}

				_word += map[i].func();
				last = map[i].end;
				i = map[i].end - 1;
			}
		}

		if ( i > last )
		{
			_word += uc_substring( word, last, i );
		}

		word = _word;
	}

	if ( g_ngregexp.word != null )
	{
		if ( g_ngregexp.word.test( word ) )
		{
			return true;
		}
	}

	if ( g_ngregexp.user != null )
	{
		if ( g_ngregexp.user.test( user ) )
		{
			return true;
		}

		// RTの場合は、RTしたユーザーも対象
		if ( rt_user != '' )
		{
			if ( g_ngregexp.user.test( rt_user ) )
			{
				return true;
			}
		}
	}

	if ( g_ngregexp.client != null )
	{
		if ( g_ngregexp.client.test( client ) )
		{
			return true;
		}
	}

	return false;
}

////////////////////////////////////////////////////////////////////////////////
// 指定したアカウントの付加情報を取得する
////////////////////////////////////////////////////////////////////////////////
function GetAccountInfo( account_id, callback )
{
	var param;

	// 検索メモ取得
	var GetSearchMemo = function( retry ) {
		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'saved_searches/list.json',
			data: {
			},
		};

		if ( retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info1_' + account_id,
				msg: i18nGetMessage( 'i18n_0212' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				g_cmn.account[account_id].notsave.saved_search = new Array();

				if ( res.status == 200 )
				{
					for ( var i = 0, _len = res.json.length ; i < _len ; i++ )
					{
						g_cmn.account[account_id].notsave.saved_search.push( res.json[i].query );
					}

					$( '#info1_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info1_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetSearchMemo( retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0209' ), res );
					$( '#info1_' + account_id ).append( ' ... not completed' );
				}

				$( '#info1_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );
				GetBlock( 0 );
			}
		);
	};

	// ブロックユーザID取得(完了待ちする)
	var GetBlock = function( retry ) {
		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'blocks/ids.json',
			data: {
			},
		};

		if ( retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info2_' + account_id,
				msg: i18nGetMessage( 'i18n_0143' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				g_cmn.account[account_id].notsave.blockusers = new Array();

				if ( res.status == 200 )
				{
					g_cmn.account[account_id].notsave.blockusers = res.json.ids;

					$( '#info2_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info2_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetBlock( retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0142' ), res );
					$( '#info2_' + account_id ).append( ' ... not completed' );
				}

				$( '#info2_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );
				GetMute( '-1', 0 );
			}
		);
	};

	// ミュートユーザID取得(完了待ちする)
	var GetMute = function( retry ) {
		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'mutes/users/ids.json',
			data: {
			},
		};

		if ( retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info2_' + account_id,
				msg: i18nGetMessage( 'i18n_0363' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				g_cmn.account[account_id].notsave.muteusers = new Array();

				if ( res.status == 200 )
				{
					g_cmn.account[account_id].notsave.muteusers = res.json.ids;

					$( '#info2_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info2_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetMute( retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0362' ), res );
					$( '#info2_' + account_id ).append( ' ... not completed' );
				}

				$( '#info2_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );
				GetFriends( '-1', 0 );
			}
		);
	};

	// フレンドID取得(完了待ちする)
	var GetFriends = function( cursor, retry ) {
		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'friends/ids.json',
			data: {
				user_id: g_cmn.account[account_id]['user_id'],
				cursor: cursor
			},
		};

		if ( cursor == '-1' && retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info3_' + account_id,
				msg: i18nGetMessage( 'i18n_0137' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				if ( param.data.cursor == '-1' )
				{
					g_cmn.account[account_id].notsave.friends = new Array();
				}

				if ( res.status == 200 )
				{
					g_cmn.account[account_id].notsave.friends = g_cmn.account[account_id].notsave.friends.concat( res.json.ids );

					if ( res.json.next_cursor_str != '0' )
					{
						GetFriends( res.json.next_cursor_str, 0 );
						return true;
					}

					$( '#info3_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info3_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetFriends( cursor, retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0138' ), res );
					$( '#info3_' + account_id ).append( ' ... not completed' );
				}

				$( '#info3_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );
				GetFollowers( '-1', 0 );
			}
		);
	};

	// フォロワーID取得(完了待ちする)
	var GetFollowers = function( cursor, retry ) {
		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'followers/ids.json',
			data: {
				user_id: g_cmn.account[account_id]['user_id'],
				cursor: cursor
			},
		};

		if ( cursor == '-1' && retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info4_' + account_id,
				msg: i18nGetMessage( 'i18n_0123' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				if ( param.data.cursor == '-1' )
				{
					g_cmn.account[account_id].notsave.followers = new Array();
				}

				if ( res.status == 200 )
				{
					g_cmn.account[account_id].notsave.followers = g_cmn.account[account_id].notsave.followers.concat( res.json.ids );

					if ( res.json.next_cursor_str != '0' )
					{
						GetFollowers( res.json.next_cursor_str, 0 );

						return true;
					}

					$( '#info4_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info4_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetFollowers( cursor, retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0124' ), res );
					$( '#info4_' + account_id ).append( ' ... not completed' );
				}

				$( '#info4_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );
				GetIncoming( '-1', 0 );
			}
		);
	};

	// フォローリクエスト取得(完了待ちする)
	var GetIncoming = function( cursor, retry ) {
		// 鍵付きアカのみ
		if ( !g_cmn.account[account_id].notsave.protected )
		{
			g_cmn.account[account_id].notsave.incoming = new Array();
			GetNoRetweet( 0 );
			return;
		}

		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'friendships/incoming.json',
			data: {
				cursor: cursor
			},
		};

		if ( cursor == '-1' && retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info5_' + account_id,
				msg: i18nGetMessage( 'i18n_0132' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				if ( param.data.cursor == '-1' )
				{
					g_cmn.account[account_id].notsave.incoming = new Array();
				}

				if ( res.status == 200 )
				{
					g_cmn.account[account_id].notsave.incoming = g_cmn.account[account_id].notsave.incoming.concat( res.json.ids );

					if ( res.json.next_cursor_str != '0' )
					{
						GetIncoming( res.json.next_cursor_str, 0 );

						return true;
					}

					$( '#info5_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info5_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetIncoming( cursor, retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0131' ), res );
					$( '#info5_' + account_id ).append( ' ... not completed' );
				}

				$( '#info5_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );
				GetNoRetweet( 0 );
			}
		);
	};

	// RT非表示ユーザー取得(完了待ちする)
	var GetNoRetweet = function( retry ) {
		param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'friendships/no_retweets/ids.json',
			data: {
			},
		};

		if ( retry == 0 )
		{
			$( '#blackout' ).append( OutputTPL( 'blackoutinfo', {
				id: 'info6_' + account_id,
				msg: i18nGetMessage( 'i18n_0324' ) + '(' + g_cmn.account[account_id].screen_name + ')' } ) );
		}

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[account_id]['accessToken'],
				acsSecret: g_cmn.account[account_id]['accessSecret'],
				param: param,
				id: account_id,
			},
			function( res )
			{
				g_cmn.account[account_id].notsave.noretweet = new Array();

				if ( res.status == 200 )
				{
					g_cmn.account[account_id].notsave.noretweet = res.json;
					$( '#info6_' + account_id ).append( ' ... completed' );
				}
				else
				{
					// 3回までリトライ
					if ( retry < 2 )
					{
						retry++;
						$( '#info6_' + account_id ).append( ' ... retry:' + retry );
						setTimeout( function() { GetNoRetweet( retry ); }, 1000 );
						return;
					}

					ApiError( i18nGetMessage( 'i18n_0325' ), res );
					$( '#info6_' + account_id ).append( ' ... not completed' );
				}

				$( '#info6_' + account_id ).fadeOut( 'slow', function() { $( this ).remove() } );

				callback();
			}
		);
	};

	GetSearchMemo( 0 );
}

////////////////////////////////////////////////////////////////////////////////
// ユーザーごとのアイコンサイズを適用する
////////////////////////////////////////////////////////////////////////////////
function SetUserIconSize( items )
{
	for ( var user_id in g_cmn.user_iconsize )
	{
		items.filter( '[user_id=' + user_id + ']' ).find( '.icon' ).css( { width: g_cmn.user_iconsize[user_id] } )
				.find( '> img' ).css( { width: g_cmn.user_iconsize[user_id], height: g_cmn.user_iconsize[user_id] } )
				.end()
				.find( '.retweet img' ).css( { width: g_cmn.user_iconsize[user_id] * 0.7, height: g_cmn.user_iconsize[user_id] * 0.7 } );
	}
}

////////////////////////////////////////////////////////////////////////////////
// configurationを取得する
////////////////////////////////////////////////////////////////////////////////
function GetConfiguration( callback )
{
	var account_id = null;

	for ( var id in g_cmn.account )
	{
		account_id = id;
		break;
	}

	var LastConfig = function() {
		var text = getUserInfo( 'g_cmn_V1' );

		if ( text != '' )
		{
			text = decodeURIComponent( text );
			var _g_cmn = JSON.parse( text );

			if ( _g_cmn.twconfig != undefined && _g_cmn.twconfig != null )
			{
				g_cmn.twconfig = _g_cmn.twconfig;
			}
		}
	};

	if ( account_id == null )
	{
		LastConfig();
		callback();
		return;
	}

	var param = {
		type: 'GET',
		url: ApiUrl( '1.1' ) + 'help/configuration.json',
		data: {
		}
	};

	SendRequest(
		{
			action: 'oauth_send',
			acsToken: g_cmn.account[account_id]['accessToken'],
			acsSecret: g_cmn.account[account_id]['accessSecret'],
			param: param,
			id: account_id
		},
		function( res )
		{
			if ( res.status == 200 )
			{
				if ( g_devmode )
				{
					console.log( res.json );
				}

				g_cmn.twconfig = res.json;
			}
			else
			{
				LastConfig();
			}

			callback();
		}
	);
}

////////////////////////////////////////////////////////////////////////////////
// セーブデータをテキスト化する
////////////////////////////////////////////////////////////////////////////////
function SaveDataText()
{
	var _g_cmn = {};
	var pi;

	for ( var i in g_cmn )
	{
		if ( i == 'notsave' )
		{
			continue;
		}
		else if ( i == 'account' )
		{
			_g_cmn[i] = {};

			for ( var j in g_cmn[i] )
			{
				_g_cmn[i][j] = {};

				for ( var k in g_cmn[i][j] )
				{
					if ( k == 'notsave' )
					{
						continue;
					}
					else
					{
						_g_cmn[i][j][k] = g_cmn[i][j][k];
					}
				}
			}
		}
		else if ( i == 'hashtag' )
		{
			_g_cmn[i] = new Array();

			for ( var j = 0, _len = g_cmn[i].length ; j < _len ; j++ )
			{
				_g_cmn[i].push( {} );

				for ( var k in g_cmn[i][j] )
				{
					if ( k == 'checked' )
					{
						continue;
					}
					else
					{
						_g_cmn[i][j][k] = g_cmn[i][j][k];
					}
				}
			}
		}
		else if ( i == 'panel' )
		{
			_g_cmn[i] = new Array();

			for ( var j = 0, _len = g_cmn[i].length ; j < _len ; j++ )
			{
				_g_cmn[i].push( {} );

				for ( var k in g_cmn[i][j] )
				{
					if ( k != 'contents' && k != 'SetType' && k != 'SetTitle' && k != 'SetIcon' &&
						 k != 'SetParam' && k != 'SetContents' && k != 'title' )
					{
						_g_cmn[i][j][k] = g_cmn[i][j][k];
					}
				}

				pi = $( '#' + g_cmn[i][j].id );

				_g_cmn[i][j].x = pi.position().left;
				_g_cmn[i][j].y = pi.position().top;
				_g_cmn[i][j].w = pi.width();
				_g_cmn[i][j].h = pi.height();
				_g_cmn[i][j].zindex = pi[0].style.zIndex;
			}
		}
		else
		{
			_g_cmn[i] = g_cmn[i];
		}
	}

	// 共通データをJSON形式でlocalStorageに保存
	var text = JSON.stringify( _g_cmn );
	text = encodeURIComponent( text );

	return text;
}


////////////////////////////////////////////////////////////////////////////////
// 画面リサイズ
////////////////////////////////////////////////////////////////////////////////
$( window ).on( 'resize', function( e ) {
	$( '#head' ).css( { width: $( window ).width() } );
} );


////////////////////////////////////////////////////////////////////////////////
// パネルリストの更新
////////////////////////////////////////////////////////////////////////////////
$( document ).on( 'panellist_changed', function( e ) {
	var items = new Array();

	var _p, _class, icon, badge;

	for ( var i = 0, _len = g_cmn.panel.length ; i < _len ; i++ )
	{
		_p = $( '#' + g_cmn.panel[i].id );
		_class = _p.find( 'span.titleicon' ).attr( 'class' );
		icon = '';
		badge = '';

		// アイコンあり
		if ( _class.match( /(icon-\S*)/ ) )
		{
			var _icon = RegExp.$1;

			if ( _p.find( 'span.titleicon' ).css( 'display' ) != 'none' )
			{
				icon = _icon;
			}
		}

		// 未読あり
		var _b = _p.find( '> div.titlebar' ).find( 'span.badge' );
		if ( _b )
		{
			badge = _b.text();
		}

		items.push( {
			icon: icon,
			title: g_cmn.panel[i].title,
			panel_id: g_cmn.panel[i].id,
			badge: badge
		} );
	}

	$( '#panellist' ).find( '> div.lists' ).html( OutputTPL( 'panellist', { items: items } ) )
	.find( 'span.badge' ).each( function() {
		if ( $( this ).text() != '' )
		{
			$( this ).show();
		}
		else
		{
			$( this ).hide();
		}
	} )
	.end().find( '> div' ).on( 'click', function() {
		var panel_id = $( this ).attr( 'panel_id' );
		var _p = $( '#' + panel_id );
		SetFront( _p );

		$( 'html' ).animate( { scrollTop: _p.position().top - $( '#head' ).outerHeight(),  scrollLeft: _p.position().left }, 200 );
	} );
} );

////////////////////////////////////////////////////////////////////////////////
// ツイート拡張対応
////////////////////////////////////////////////////////////////////////////////
function ConvertExtendedTweet( json, type )
{
	var _json = json;

	// UserStream
	if ( type == 'userstream' )
	{
		if ( json.extended_tweet )
		{
			_json.text = json.extended_tweet.full_text;
			_json.entities = json.extended_tweet.entities;
		}

		if ( json.retweeted_status )
		{
			if ( json.retweeted_status.extended_tweet )
			{
				_json.retweeted_status.text = json.retweeted_status.extended_tweet.full_text;
				_json.retweeted_status.entities = json.retweeted_status.extended_tweet.entities;
			}
		}

		if ( json.quoted_status )
		{
			if ( json.quoted_status.extended_tweet )
			{
				_json.quoted_status.text = json.quoted_status.extended_tweet.full_text;
				_json.quoted_status.entities = json.quoted_status.extended_tweet.entities;
			}
		}
	}
	// other
	else
	{
		_json.text = json.full_text;

		if ( json.retweeted_status )
		{
			_json.retweeted_status.text = json.retweeted_status.full_text;
		}

		if ( json.quoted_status )
		{
			_json.quoted_status.text = json.quoted_status.full_text;
		}
	}

	return _json;
}

////////////////////////////////////////////////////////////////////////////////
// 引用RTのURLがツイートに含まれなくなった変更への対応
////////////////////////////////////////////////////////////////////////////////
function AppendQuotedStatusURL( json ) {
	var _json = json

	if ( json.quoted_status_permalink ) {
		if ( !json.text.match( json.quoted_status_permalink.url ) ) {
			_json.text = `${json.text} <a href="${json.quoted_status_permalink.expanded}" class="url anchor" rel="nofollow noopener noreferrer" target="_blank">${json.quoted_status_permalink.display}</a>`
		}
	}
	return _json
}

////////////////////////////////////////////////////////////////////////////////
// 色の設定をCSSに反映する
////////////////////////////////////////////////////////////////////////////////
function SetColorSettings()
{
	$( ':root' ).css( {
		'--panel-background': g_cmn.cmn_param.color.panel.background,
		'--panel-text': g_cmn.cmn_param.color.panel.text,

		'--tweet-background': g_cmn.cmn_param.color.tweet.background,
		'--tweet-res-background': HSLConvert( g_cmn.cmn_param.color.tweet.background, 0.85 ),
		'--tweet-text': g_cmn.cmn_param.color.tweet.text,
		'--tweet-link': g_cmn.cmn_param.color.tweet.link,

		'--titlebar-background': g_cmn.cmn_param.color.titlebar.background,
		'--titlebar-text': g_cmn.cmn_param.color.titlebar.text,
		'--titlebar-fixed-background': g_cmn.cmn_param.color.titlebar.fixed,

		'--button-background': g_cmn.cmn_param.color.button.background,
		'--button-text': g_cmn.cmn_param.color.button.text,

		'--scrollbar-background': g_cmn.cmn_param.color.scrollbar.background,
		'--scrollbar-thumb': g_cmn.cmn_param.color.scrollbar.thumb,
	} );
}

////////////////////////////////////////////////////////////////////////////////
// 外部通信
////////////////////////////////////////////////////////////////////////////////
function SendRequest( req, callback )
{
	switch( req.action )
	{
		// リクエストトークン取得
		case 'request_token':
			var accessor = {
				consumerSecret: consumerSecret,
				tokenSecret: ''
			};

			var message = {
				method: 'GET', 
				action: 'https://api.twitter.com/oauth/request_token',
				parameters: {
					oauth_signature_method: 'HMAC-SHA1',
					oauth_consumer_key: consumerKey,
					oauth_version: '1.0',
				}
			};

			OAuth.setTimestampAndNonce( message );
			OAuth.SignatureMethod.sign( message, accessor );
			var target = OAuth.addToURL( message.action, message.parameters );

			$.ajax( {
				url: target,
				dataType: 'text',
				type: 'GET',
			} ).done( function( data ) {
				callback( data );
			} ).fail( function( data ) {
				callback( data );
			} );

			break;
		// 認証ウィンドウURL作成
		// req : reqToken
		//       reqSecret
		case 'oauth_window':
			var accessor = {
				consumerSecret: consumerSecret,
				tokenSecret: req.reqSecret
			};

			var message = {
				method: 'GET', 
				action: 'https://api.twitter.com/oauth/authenticate',
				parameters: {
					oauth_signature_method: 'HMAC-SHA1',
					oauth_consumer_key: consumerKey,
					oauth_token: req.reqToken,
					oauth_version: '1.0',
				}
			};

			OAuth.setTimestampAndNonce( message );
			OAuth.SignatureMethod.sign( message, accessor );
			var target = OAuth.addToURL( message.action, message.parameters );
			callback( target );
			break;
		// アクセストークン取得
		// req : reqToken
		//       reqSecret
		//       pin
		case 'access_token':
			var accessor = {
				consumerSecret: consumerSecret,
				tokenSecret: req.reqSecret
			};

			var message = {
				method: 'POST', 
				action: 'https://api.twitter.com/oauth/access_token',
				parameters: {
					oauth_signature_method: 'HMAC-SHA1',
					oauth_consumer_key: consumerKey,
					oauth_token: req.reqToken,
					oauth_verifier: req.pin,
					oauth_version: '1.0',
				}
			};

			OAuth.setTimestampAndNonce( message );
			OAuth.SignatureMethod.sign( message, accessor );
			var target = OAuth.addToURL( message.action, message.parameters );

			$.ajax( {
				url: target,
				dataType: 'text',
				type: 'POST',
			} ).done( function( data ) {
				callback( data );
			} ).fail( function( data ) {
				callback( data );
			} );

			break;
		// OAuth認証付きAPI呼び出し
		// req : acsToken
		//       acsSecret
		//       param
		//       id
		case 'oauth_send':
			var accessor = {
				consumerSecret: consumerSecret,
				tokenSecret: req.acsSecret
			};

			if ( !req.param.url.match( /https:\/\/upload\.twitter\.com/ ) )
			{
				var message = {
					method: req.param.type,
					action: req.param.url,
					parameters: {
						oauth_signature_method: 'HMAC-SHA1',
						oauth_consumer_key: consumerKey,
						oauth_token: req.acsToken,
						oauth_version: '1.0',
					}
				};

				for ( var key in req.param.data )
				{
					message.parameters[key] = req.param.data[key];
				}

				OAuth.setTimestampAndNonce( message );
				OAuth.SignatureMethod.sign( message, accessor );
				var target = OAuth.addToURL( message.action, message.parameters );

				$.ajax( {
					url: target,
					dataType: 'json',
					type: req.param.type,
				} ).done( function( data ) {
					callback( {
						status: 200,
						json: data,
						id: req.id,
					} );
				} ).fail( function( data ) {
					console.log( data );

					var status = data.status;
					var message = 'API Error';

					if ( data.responseJSON != undefined )
					{
						if ( data.responseJSON.errors != undefined )
						{
							message = data.responseJSON.errors[0].message;
						}
						else if ( data.responseJSON.error != undefined )
						{
							message = data.responseJSON.error;
						}
					}

					// API1.1の429エラー
					if ( status == 429 )
					{
						var dt = new Date();
						dt.setTime( data.getResponseHeader( 'x-rate-limit-reset' ) * 1000 );
							var date = ( '00' + dt.getHours() ).slice( -2 ) + ':' +
										( '00' + dt.getMinutes() ).slice( -2 ) + ':' +
										( '00' + dt.getSeconds() ).slice( -2 );

						message = i18nGetMessage( 'i18n_0285', [ data.getResponseHeader( 'x-rate-limit-limit' ), date ] );
					}

					callback( {
						status: status,
						id: req.id,
						message: message,
					} );
				} );
			}
			else
			// 画像アップロード
			{
				var message = {
					method: 'POST',
					action: req.param.url,
					parameters: {
						oauth_signature_method: 'HMAC-SHA1',
						oauth_consumer_key: consumerKey,
						oauth_token: req.acsToken,
						oauth_version: '1.0',
					}
				};

				var media_data = req.param.data['media_data'];
				delete req.param.data['media_data'];

				var formdata = new FormData();
				formdata.append( 'media_data', media_data );

				for ( var key in req.param.data )
				{
					message.parameters[key] = req.param.data[key];
				}

				OAuth.setTimestampAndNonce( message );
				OAuth.SignatureMethod.sign( message, accessor );
				var target = OAuth.addToURL( message.action, message.parameters );

				var xhr = new XMLHttpRequest();

				xhr.open( 'POST', target, true );

				xhr.onreadystatechange = function() {
					if ( xhr.readyState != 4 )
					{
						return;
					}
					if ( xhr.status == 200 && xhr.responseText )
					{
						try
						{
							var data = JSON.parse( xhr.responseText );
							callback( {
								status: xhr.status,
								json: data,
								id: req.id,
							} );
						}
						catch ( err )
						{
							callback( {
								status: xhr.status,
							} );
						}
					}
					else
					{
						var message = '';

						if ( xhr.responseText != undefined )
						{
							try
							{
								var json = JSON.parse( xhr.responseText );

								if ( json.error != undefined )
								{
									message = json.error;
								}
							}
							catch ( err )
							{
								// htmlで返ってくる場合は無視
								if ( !xhr.responseText.match( /<html/m ) )
								{
									message = xhr.responseText;
								}
								else
								{
									xhr.status = 500;
									message = 'Internal Server Error';
								}
							}
						}

						// 空メッセージ防止
						if ( message == '' )
						{
							message = 'Twitter is over capacity.';
						}

						callback( {
							status: xhr.status,
							id: req.id,
							message: message,
						} );
					}
				};

				xhr.send( formdata );
			}

			break;
		// ストリーミング開始
		// req : acsToken
		//       acsSecret
		case 'stream_start':
			ConnectUserStream( req, StreamDataAnalyze );
			callback();
			break;
		// ストリーミング停止
		// req : acsToken
		//       acsSecret
		case 'stream_stop':
			StopUserStream( req.id );
			callback();
			break;

		// ニコニコ動画のサムネイルURL取得
		// req : id
		case 'nicovideo_url':
			$.ajax( {
				url: 'https://ext.nicovideo.jp/api/getthumbinfo/' + req.id,
				dataType: 'xml',
				type: 'GET',
				success: function ( data, status, xhr ) {
					if ( data.getElementsByTagName( 'thumbnail_url' )[0] != undefined ) {
						callback( { thumb: data.getElementsByTagName( 'thumbnail_url' )[0].firstChild.nodeValue, original: '' } );
					}
					else {
						callback( '' )
					}
				},
				error: function ( xhr, status, errorThrown ) {
					callback( '' );
				},
			} );

			break;

		// アイコンアップロード
		// req : acsToken
		//       acsSecret
		//       id
		case 'icon_upload':
			// アップロードファイルが設定されていない場合は処理しない
			if ( uploadIconFile == null )
			{
				callback( '' );
			}

			var accessor = {
				consumerSecret: consumerSecret,
				tokenSecret: req.acsSecret
			};

			var message = {
				method: 'POST',
				action: 'https://api.twitter.com/1.1/account/update_profile_image.json',
				parameters: {
					oauth_signature_method: 'HMAC-SHA1',
					oauth_consumer_key: consumerKey,
					oauth_token: req.acsToken,
					oauth_version: '1.0',
				}
			};

			OAuth.setTimestampAndNonce( message );
			OAuth.SignatureMethod.sign( message, accessor );
			var target = OAuth.addToURL( message.action, message.parameters );

			var xhr = new XMLHttpRequest();

			xhr.open( 'POST', target, true );

			var formdata = new FormData();

			formdata.append( 'image', uploadIconFile );
			uploadIconFile = null;

			xhr.onreadystatechange = function() {
				if ( xhr.readyState != 4 )
				{
					return;
				}
				if ( xhr.status == 200 && xhr.responseText )
				{
					try
					{
						var json = JSON.parse( xhr.responseText );

						if ( json.profile_image_url_https != undefined )
						{
							callback( json.profile_image_url_https );
						}
						else
						{
							callback( '' );
						}
					}
					catch ( err )
					{
						callback( '' );
					}
				}
				else
				{
					callback( '' );
				}
			};

			xhr.send( formdata );
			break;

		// 翻訳
		// req : src
		//       targ
		//       word
		case 'translate':
			$.ajax( {
				url: 'https://api.microsofttranslator.com/v2/Ajax.svc/Translate?appId=C9739C3837CBBD166870AF1C6EFFDEBE433DC2A8&from=' + req.src + '&to=' + req.targ + '&text=' + req.word,
				dataType: 'json',
				type: 'GET',
				success: function ( data, status, xhr ) {
					callback( data );
				},
				error: function ( xhr, status, errorThrown ) {
					callback( '' );
				},
			} );

			break;

		// RSS取得
		// req : url
		//       count
		//       index
		case 'feed':
			var res = {
				items: [],
				url: req.url,
				index: req.index,
			};

			res.items.push( { feedtitle: '', feedlink: '' } );

			$.ajax( {
				url: req.url,
				dataType: 'xml',
				type: 'GET',
				success: function ( data, status, xhr ) {
					res.items[0].feedtitle = $( 'channel', data ).find( '> title' ).text();
					res.items[0].feedlink = $( 'channel', data ).find( '> link' ).text();

					var item = $( 'item', data );

					for ( var i = 0, _len = req.count ; i < _len ; i++ )
					{
						if ( i < item.length )
						{
							res.items.push( {
								title: $( item[i] ).find ( '> title' ).text(),
								link: $( item[i] ).find ( '> link' ).text(),
								description: $( item[i] ).find( '> description' ).text().replace( /(<([^>]+)>)/ig, '' ),
							} );
						}
					}

					callback( res );
				},
				error: function ( xhr, status, errorThrown ) {
					callback( res );
				},
			} );

			break;
	}
}

////////////////////////////////////////////////////////////////////////////////
// i18n
////////////////////////////////////////////////////////////////////////////////
function i18nGetMessage( id, options )
{
	return chrome.i18n.getMessage( id, options );
}
