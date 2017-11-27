"use strict";

var userstream;

////////////////////////////////////////////////////////////////////////////////
// UserStreamへ接続する
////////////////////////////////////////////////////////////////////////////////
function ConnectUserStream( req )
{
	if ( userstream[req.id] != undefined )
	{
		return false;
	}

	userstream[req.id] = {};

	// 接続試行中
	StreamDataAnalyze( { account_id: req.id, json: { error_id: 1 } } );

	// キューの送出処理
	userstream[req.id].tm = setInterval( function() {
		if ( userstream[req.id].queue_high == undefined )
		{
			return;
		}

		// ツイート、RT等
		if ( userstream[req.id].queue_high.length > 0 )
		{
			StreamDataAnalyze( { account_id: req.id, json: userstream[req.id].queue_high.shift() } );
		}

		// イベント系
		if ( userstream[req.id].queue_low.length > 0 )
		{
			StreamDataAnalyze( { account_id: req.id, json: userstream[req.id].queue_low.shift() } );
		}

		// 削除
		if ( userstream[req.id].queue_del.length > 0 )
		{
			StreamDataAnalyze( { account_id: req.id, json: userstream[req.id].queue_del.shift() } );
		}
	}, 500 );

	// URLの作成
	var message = {
		method: 'GET',
		action: 'https://userstream.twitter.com/1.1/user.json',
		parameters: {
			oauth_signature_method: 'HMAC-SHA1',
			oauth_consumer_key: consumerKey,
			oauth_token: req.acsToken,
			oauth_version: '1.0',
		}
	};

	OAuth.setTimestampAndNonce( message );
	OAuth.SignatureMethod.sign( message, { consumerSecret: consumerSecret, tokenSecret: req.acsSecret } );
	var target = OAuth.addToURL( message.action, message.parameters );

	// 接続
	fetch( target, {
		method: 'GET',
		mode: 'cors',
		headers: { 'X-User-Agent': manifest.name + ' ' + manifest.version },
	} ).then( function( res ) {
		userstream[req.id].reader = res.body.getReader();
		var decoder = new TextDecoder();
		var txt = '';
		var json = {};

		userstream[req.id].reader.read().then( function processResult( result ) {
			// 接続終了
			if ( result.done )
			{
				if ( res.status != 200 )
				{
					StreamDataAnalyze( { account_id: req.id, json: { error_id: -1, status: res.status } } );
				}
				else
				{
					StreamDataAnalyze( { account_id: req.id, json: { error_id: 0 } } );
				}
				
				return;
			}

			// 接続中
			StreamDataAnalyze( { account_id: req.id, json: { error_id: 2 } } );

			txt += decoder.decode( result.value || new Uint8Array, { stream: true } );
			var data = txt.split( /\n/ );
			txt = '';

			for ( var i = 0 ; i < data.length ; i++ )
			{
				try {
					Object.assign( json, JSON.parse( data[i] ) );

					// キューにデータを追加
					var flg = true, low = false, del = false;

					// データのフィルタリング
					if ( json.friends_str || json.friends )
					{
						flg = false;
					}
					else if ( json.retweeted_status )
					{
					}
					else if ( json.event )
					{
						low = true;

						switch ( json.event )
						{
							case 'favorite':
							case 'follow':
							case 'list_member_added':
							case 'quoted_tweet':
								break;
							case 'block':
							case 'unfollow':
							case 'unfavorite':
							case 'unblock':
							case 'list_member_removed':
							case 'user_update':
								flg = false;
								break;
							default:
								console.log( '** unknown event: ' + json.event + ' **' );
								console.log( json );
								break;
						}
					}
					else if ( json.direct_message )
					{
					}
					else if ( json.delete )
					{
						del = true;
					}
					else
					{
					}

					if ( flg )
					{
						if ( userstream[req.id].queue_high == undefined )
						{
							userstream[req.id].queue_high = new Array();
							userstream[req.id].queue_del = new Array();
							userstream[req.id].queue_low = new Array();
						}

						if ( low )
						{
							// イベント系は100件までしか溜め込まないようにする
							if ( userstream[req.id].queue_low.length >= 100 )
							{
								userstream[req.id].queue_low.splice( 0, 1 );
							}

							userstream[req.id].queue_low.push( json );
						}
						else if ( del )
						{
							// 削除は100件までしか溜め込まないようにする
							if ( userstream[req.id].queue_del.length >= 100 )
							{
								userstream[req.id].queue_del.splice( 0, 1 );
							}

							userstream[req.id].queue_del.push( json );
						}
						else
						{
							userstream[req.id].queue_high.push( json );
						}
					}

					json = {};
				}
				catch( e )
				{
					txt += data[i];
				}
			}

			return userstream[req.id].reader.read().then( processResult );
		} ).catch( function( err ) {
			// エラー
			console.log( err );
			StreamDataAnalyze( { account_id: req.id, json: { error_id: -1 } } );
		} );
	} ).catch( function( err ) {
		// エラー
		console.log( err );
		StreamDataAnalyze( { account_id: req.id, json: { error_id: -1 } } );
	} );
}

////////////////////////////////////////////////////////////////////////////////
// UserStreamを止める
////////////////////////////////////////////////////////////////////////////////
function StopUserStream( account_id )
{
	if ( userstream[account_id] == undefined )
	{
	}
	else
	{
		if ( userstream[account_id].reader )
		{
			userstream[account_id].reader.cancel();
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// UserStreamから切断する
////////////////////////////////////////////////////////////////////////////////
function DisconnectUserStream( account_id )
{
	if ( userstream )
	{
		if ( userstream[account_id] )
		{
			clearInterval( userstream[account_id].tm );
			delete userstream[account_id];
		}
	}
}
