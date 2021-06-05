"use strict";

////////////////////////////////////////////////////////////////////////////////
// トレンド
////////////////////////////////////////////////////////////////////////////////
Contents.trends = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var scrollPos = null;
	var tm = null;

	cp.SetIcon( 'icon-search' );

	////////////////////////////////////////////////////////////
	// 特定サイト由来のトレンドに警告表示＆表示順を下げる
	// 現在の対象:
	//  shindanmaker.com
	//  4ndan.com
	//  kuizy.net
	////////////////////////////////////////////////////////////
	const useless_flags = {}

	const uselessTrend = ( res ) => {
		const icon_html = '<span class="useless_trends">❌</span>'
		const target_url_re = /(shindanmaker\.com|4ndan\.com|kuizy\.net)/

		const api_version = '1.1'	// API(v1.1/v2)の切り替え

		if ( g_devmode ) {
			console.time( 'TM' )
		}

		// 検索用に対象のトレンドを10件ずつに分ける
		const query_strings = []
		let query = []

		$.each( res.json[0].trends, function( i, val ) {
			if ( useless_flags[val.query] === undefined ) {
				useless_flags[val.query] = false

				if ( query.length == 10 ) {
					query_strings.push( query )
					query = []
				}

				query.push( val.query.replace( /^%22|%22$/g, "" ) )
			} else {
				if ( useless_flags[val.query] === true ) {
					cont.find( '.trends_list' ).find( `span[query="${val.query}"]` ).prepend( icon_html ).closest( '.item' ).appendTo( '.trends_list' )
				}
			}
		} );

		if ( query.length > 0 ) {
			query_strings.push( query )
		}

		let current_index = 0

		const checkSearchResult = () => {
			let q = `"${query_strings[current_index][0]}"`

			for ( let i = 1 ; i < query_strings[current_index].length ; i++ ) {
				q += ` OR "${query_strings[current_index][i]}"`
			}

			if ( g_devmode ) {
				if ( api_version == '1.1' ) {
					console.log( `(${decodeURIComponent( q )})  exclude:retweets` )
				} else {
					console.log( `(${decodeURIComponent( q )}) -is:retweet` )
				}
			}

			let request_url, request_data

			if ( api_version == '1.1' ) {
				request_url = ApiUrl( '1.1' ) + 'search/tweets.json'
				request_data = {
					count: 100,
					q: `(${decodeURIComponent( q )})  exclude:retweets`,
					include_entities: true,
					include_rts: false,
				}
			} else {
				request_url = ApiUrl( '2' ) + 'tweets/search/recent'
				request_data = {
					max_results: 100,
					query: `(${decodeURIComponent( q )}) -is:retweet`,
					'tweet.fields': 'entities'
				}
			}

			SendRequest(
				{
					action: 'oauth_send',
					acsToken: g_cmn.account[cp.param['account_id']]['accessToken'],
					acsSecret: g_cmn.account[cp.param['account_id']]['accessSecret'],
					param: {
						type: 'GET',
						url: request_url,
						data: request_data
					},
					id: cp.param['account_id']
				},
				function( res )
				{
					if ( g_devmode ) {
						console.log( res )
					}

					let response_data

					if ( api_version == '1.1' ) {
						response_data = res.json.statuses
					} else {
						response_data = res.json.data
					}

					if ( res.status == 200 && response_data !== undefined )
					{
						const checkUselessUrl = ( urls ) => {
							if ( urls === undefined ) {
								return false
							}

							for ( let i = 0 ; i < urls.length ; i++ ) {
								if ( urls[i].expanded_url.match( target_url_re ) ) {
									return true
								}
							}

							return false
						}

						// トレンドの単語を含む検索結果のうち、3件以上もしくは40%以上に対象のURLが含まれているかで判別
						for ( let i = 0 ; i < query_strings[current_index].length ; i++ ) {
							let safe_count = 0, out_count = 0
							const q = query_strings[current_index][i]

							for ( let j = 0 ; j < response_data.length ; j++ ) {
								if ( response_data[j].text.indexOf( decodeURIComponent( q ) ) == -1 ) {
									continue
								}

								if ( response_data[j].entities !== undefined ) {
									if ( checkUselessUrl( response_data[j].entities.urls ) ) {
										out_count++

										if ( out_count >= 3 ) {
											break
										}
									} else {
										safe_count++
									}
								} else {
									safe_count++
								}
							}

							if ( g_devmode ) {
								console.log( `${decodeURIComponent( q )} ${out_count}/${(safe_count+out_count)}`)
							}

							if ( out_count >= 3 || out_count / ( safe_count + out_count ) > 0.4 ) {
								useless_flags[q] = true
								cont.find( '.trends_list' ).find( `span[query="${q}"]` ).prepend( icon_html ).closest( '.item' ).appendTo( '.trends_list' )
							}
						}
					}

					if ( current_index < query_strings.length - 1 ) {
						current_index++
						checkSearchResult()
					} else {
						if ( g_devmode ) {
							console.timeEnd( 'TM' )
						}
					}
				}
			)
		}

		if ( query_strings.length > 0 ) {
			checkSearchResult()
		} else {
			if ( g_devmode ) {
				console.timeEnd( 'TM' )
			}
		}
	}

	////////////////////////////////////////////////////////////
	// リスト部作成
	////////////////////////////////////////////////////////////
	var ListMake = function() {
		var param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'trends/place.json',
			data: {
				id: cp.param['woeid'],
			},
		};

		cont.activity( { color: '#ffffff' } );

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[cp.param['account_id']]['accessToken'],
				acsSecret: g_cmn.account[cp.param['account_id']]['accessSecret'],
				param: param,
				id: cp.param['account_id']
			},
			function( res )
			{
				if ( res.status == 200 )
				{
					cont.find( '.trends_list' ).html( OutputTPL( 'trends_list', { items: res.json[0].trends } ) )
						.trigger( 'contents_resize' );

					$.each( res.json[0].trends, function( i, val ) {
						var chk = true;
						var txt;

						if ( !val.name.match( /^#/ ) )
						{
							return true;
						}
						else
						{
							txt = RegExp.rightContext;
						}

						for ( var j = 0, _len = g_cmn.notsave.tl_hashtag.length ; j < _len ; j++ )
						{
							if ( g_cmn.notsave.tl_hashtag[j].hashtag == txt )
							{
								chk = false;
								break;
							}
						}

						if ( chk )
						{
							g_cmn.notsave.tl_hashtag.push( { hashtag: txt } );
						}
					} );

					// ハッシュタグプルダウンを更新
					$( 'div.contents' ).trigger( 'hashtag_pulldown_update' );

					////////////////////////////////////////
					// クリック時処理
					////////////////////////////////////////
					cont.find( '.trends_list' ).find( '.item .title > span' ).click( function( e ) {

						OpenSearchResult( decodeURIComponent( $( this ).attr( 'query' ) ), cp.param['account_id'] );

						e.stopPropagation();
					} );

					if ( g_cmn.cmn_param.experiments.useless_trend == 1 ) {
						uselessTrend( res )
					}
				}
				else
				{
					ApiError( i18nGetMessage( 'i18n_0096' ), res );
				}

				cont.activity( false );

				$( 'panel' ).find( 'div.contents' ).trigger( 'api_remaining_update', [cp.param['account_id']] );
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
					scrollPos = cont.find( '.trends_list' ).scrollTop();
				}
			}
			// 復元
			else
			{
				if ( scrollPos != null )
				{
					cont.find( '.trends_list' ).scrollTop( scrollPos );
					scrollPos = null;
				}
			}
		} );

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			cont.find( '.trends_list' ).height( cont.height() - cont.find( '.panel_btns' ).height() - 1 );
		} );

		////////////////////////////////////////
		// このパネルを開いたアカウントが
		// 削除された場合
		////////////////////////////////////////
		var AccountAliveCheck = function() {
			if ( g_cmn.account[cp.param['account_id']] == undefined )
			{
				// パネルを閉じる
				p.find( '.close' ).trigger( 'click', [false] );
				return false;
			}

			return true;
		};

		////////////////////////////////////////
		// アカウント変更
		////////////////////////////////////////
		cont.on( 'account_change', function( e, account_id ) {
			if ( cp.param['account_id'] == account_id )
			{
			}
			else
			{
				p.find( 'div.titlebar' ).find( '.titlename' ).text( g_cmn.account[account_id].screen_name );
				cp.param['account_id'] = account_id;

				cp.title = cp.title.replace( /(<span class=\"titlename\">).*(<\/span>)/,
					'$1' + g_cmn.account[account_id].screen_name + '$2' );

				// パネルリストの更新"
				$( document ).trigger( 'panellist_changed' );
			}
		} );

		////////////////////////////////////////
		// アカウント情報更新
		////////////////////////////////////////
		cont.on( 'account_update', function() {
			AccountAliveCheck();

			// アカウント選択リスト更新
			var s = '';
			var id;

			for ( var i = 0, _len = g_cmn.account_order.length ; i < _len ; i++ )
			{
				id = g_cmn.account_order[i];
				s += '<span account_id="' + id + '">' + g_cmn.account[id].screen_name + '</span>';
			}

			p.find( 'div.titlebar' ).find( '.titlename_list' ).html( s )
				.find( 'span' ).click( function( e ) {
					p.find( 'div.contents' ).trigger( 'account_change', [$( this ).attr( 'account_id' )] );
					$( this ).parent().hide();
				} );
		} );

		if ( !AccountAliveCheck() )
		{
			return;
		}

		// 全体を作成
		cont.addClass( 'trends' )
			.html( OutputTPL( 'trends', {} ) );

		cp.SetTitle( i18nGetMessage( 'i18n_0095' ) + ' (<span class="titlename">' + g_cmn.account[cp.param.account_id].screen_name + '</span>)', false );
		
		if ( cp.param['woeid'] == undefined )
		{
			// 都市の初期設定は日本
			cp.param['woeid'] = '23424856';
		}

		////////////////////////////////////////
		// 新着読み込みタイマー開始
		////////////////////////////////////////
		cont.on( 'reload_timer', function() {
			// タイマーを止める
			if ( tm != null )
			{
				clearInterval( tm );
				tm = null;
			}

			// タイマー起動
			tm = setInterval( function() {
				ListMake();
			}, 3 * 60 * 1000 );
		} );

		////////////////////////////////////////
		// 更新ボタンクリック
		////////////////////////////////////////
		cont.find( '.panel_btns' ).find( '.trends_reload' ).click( function( e ) {
			cont.trigger( 'reload_timer' );
			ListMake();
		} );

		////////////////////////////////////////////////////////////
		// 都市リストを取得する
		////////////////////////////////////////////////////////////
		
		var param = {
			type: 'GET',
			url: ApiUrl( '1.1' ) + 'trends/available.json',
			data: {
			},
		};

		cont.find( '.woeids' ).find( '.selectitems' ).hide();

		SendRequest(
			{
				action: 'oauth_send',
				acsToken: g_cmn.account[cp.param['account_id']]['accessToken'],
				acsSecret: g_cmn.account[cp.param['account_id']]['accessSecret'],
				param: param,
				id: cp.param['account_id']
			},
			function( res )
			{
				var woeids = new Array();

				if ( res.status == 200 )
				{
					woeids = res.json;
				}
				else
				{
					ApiError( i18nGetMessage( 'i18n_0283' ), res );

					// 取得失敗したときは日本のみ
					woeids.push( {
						parentid: 1,
						name: i18nGetMessage( 'i18n_0261' ),
						woeid: '23424856',
					} );
				}

				woeids.sort( function( a, b ) {
					return ( a['name'] > b['name'] ) ? 1: -1;
				} );

				// 都市選択メニュー作成
				var s = '';

				for ( var i = 0, _len = woeids.length ; i < _len ; i++ )
				{
					s += OutputTPL( 'trends_woeid', {
							woeid: woeids[i].woeid,
							selected: ( cp.param['woeid'] == woeids[i].woeid ) ? 'selected' : '',
							bold: ( woeids[i].parentid == 1 || woeids[i].woeid == 1 ) ? 'bold' : '',
							name: woeids[i].name,
						} );

					if ( cp.param['woeid'] == woeids[i].woeid )
					{
						cont.find( '.woeids' ).find( '.selitem' ).html( escapeHTML( woeids[i].name ) );
					}
				}

				// メニュー開閉
				cont.find( '.woeids' ).click( function() {
					var len = cont.find( '.woeids' ).find( '.selectitems > .selectitem' ).length;

					// 開くときに都市一覧を描く
					if ( len == 0 )
					{
						cont.find( '.woeids' ).find( '.selectitems' ).html( s ).css( {
							top: cont.find( '.woeids' ).position().top + cont.find( '.woeids' ).height(),
						} );

						cont.find( '.woeids' ).find( '.selectitem.selected' ).removeClass( 'selected' );
						cont.find( '.woeids' ).find( '.selectitem[value=' + cp.param['woeid'] + ']' ).addClass( 'selected' );
					}

					$( this ).find( '.selectitems' ).slideToggle( 200, function() {
						$( this ).scrollTop( $( this ).find( '.selectitem.selected' ).prop( 'offsetTop' ) );

						// 閉じるときに消す
						if ( len != 0 )
						{
							cont.find( '.woeids' ).find( '.selectitems' ).html( '' );
						}
					} );
				} );

				// 選択変更
				cont.find( '.woeids' ).find( '.selectitems' ).click( function( e ) {
					var item = $( e.target );

					if ( item.hasClass( 'selectitem' ) )
					{
						var new_woeid = item.attr( 'value' );

						cont.find( '.woeids' ).trigger( 'click' );

						// 変更があったらトレンド更新
						if ( cp.param['woeid'] != new_woeid )
						{
							$( this ).find( '.selectitem' ).removeClass( 'selected' );
							item.addClass( 'selected' );

							cp.param['woeid'] = new_woeid;

							cont.find( '.woeids' ).find( '.selitem' ).html( escapeHTML( item.html() ) );

							setTimeout( function() {
								ListMake();
							}, 1 );

							cont.trigger( 'reload_timer' );
						}
					}

					e.stopPropagation();
				} );

				setTimeout( function() {
					ListMake();
				}, 1 );

				$( 'panel' ).find( 'div.contents' ).trigger( 'api_remaining_update', [cp.param['account_id']] );

				cont.trigger( 'reload_timer' );
			}
		);
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
		if ( tm != null )
		{
			clearTimeout( tm );
			tm = null;
		}
	};
}
