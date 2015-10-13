"use strict";

// UserStreamオブジェクト
var userstream;

// 短縮URL展開
var shorturls;

// KuroTwiのタブID
var kurotwi_tab = null;

// KuroTwiのmanifest.json
var kurotwi_manifest = null;

// アップロードファイルオブジェクト
var uploadFile = null;

// アップロードアイコンファイルオブジェクト
var uploadIconFile = null;

// インポートファイルオブジェクト
var importFile = null;

// Ajax設定
$.ajaxSetup( {
	timeout: 30 * 1000,
} );

// Notifiy message
var notify_message = {};

var tpl_c = {};

var consumerKey = 'luFRvnO5KsUow9ZinOet7Q';
var consumerSecret = 'V7Jx1kC6vsidqjloC2iRfkXqp6V6kQzLqTAbKXcPTs';

// アプリタイプ
var app_type = '';

$.ajax( {
	type: 'GET',
	url: 'manifest.json',
	dataType: 'json',
	async: false,
	success: function( data, status ) {
		console.log( '-------------------------------------------------' );
		console.log( ' KuroTwi version ' + data.version );
		console.log( ' background page loaded.' );
		console.log( '-------------------------------------------------' );

		////////////////////////////////////////////////////////////////////////////////
		// ツールバーのアイコンがクリックされたらKuroTwiを起動
		// Chrome v29以降でエラーが出るため移動
		////////////////////////////////////////////////////////////////////////////////
		if ( data.browser_action )
		{
			app_type = 'extension';

			chrome.browserAction.onClicked.addListener( function( tab ) {
				ExecKuroTwi();
			} );
		}
	},
} );

// キューの送出間隔
var queue_interval = 500;

// 応答時間監視用
var rectime_chk_tm = null;


////////////////////////////////////////////////////////////////////////////////
// KuroTwiを起動
////////////////////////////////////////////////////////////////////////////////
function ExecKuroTwi()
{
	chrome.windows.getAll( { populate: true }, function( wins ) {
		var multi = false;
		var focuswin = null;

		for ( var i = 0, _len = wins.length ; i < _len ; i++ )
		{
			if ( wins[i].focused )
			{
				focuswin = wins[i];
			}

			for ( var j = 0, __len = wins[i].tabs.length ; j < __len ; j++ )
			{
				if ( wins[i].tabs[j].url.match( /^chrome-extension:\/\// ) &&
					 wins[i].tabs[j].title == 'KuroTwi' )
				{
					// 多重起動
					multi = true;

					// 既に開いているウィンドウ＆タブにフォーカス
					chrome.windows.update( wins[i].id, { focused: true } );
					chrome.tabs.update( wins[i].tabs[j].id, { selected: true } );

					break;
				}
			}
		}

		if ( multi == false )
		{
			var param = { url: chrome.extension.getURL( 'index.html' ) };

			if ( focuswin != null )
			{
				param.windowId = focuswin.id;
			}

			chrome.tabs.create( param );
		}
	} );
}

////////////////////////////////////////////////////////////////////////////////
// コンテントスクリプトからの要求を受け付ける
////////////////////////////////////////////////////////////////////////////////
chrome.extension.onMessage.addListener(
	function( req, sender, sendres )
	{
		switch( req.action )
		{
			// consumerKey、consumerSecretを変更
			case 'change_consumer':
				consumerKey = req.consumerKey;
				consumerSecret = req.consumerSecret;

				break;
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
					success: function ( data, status, xhr ) {
						sendres( data );
					},
					error: function( xhr, status, errorThrown ) {
						sendres( status );
					},
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
//					action: 'https://api.twitter.com/oauth/authorize',
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
				sendres( target );
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
					success: function ( data, status, xhr ) {
						sendres( data );
					},
					error: function( xhr, status, errorThrown ) {
						sendres( status );
					},
				} );

				break;
			// OAuth認証付きAPI呼び出し
			// req : acsToken
			//       acsSecret
			//       param
			//       id
			//       guest
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

					// Oauth認証なし
					if ( req.guest )
					{
						target = message.action + '?';

						for ( var key in req.param.data )
						{
							target += key + '=' + OAuth.percentEncode( req.param.data[key] ) + '&';
						}

						target = target.replace( /[&|\?]$/, '' );
					}

					$.ajax( {
						url: target,
						dataType: 'json',
						type: req.param.type,
						success: function ( data, status, xhr ) {
							sendres( {
								status: xhr.status,
								json: data,
								id: req.id,
							} );
						},
						error: function ( xhr, status, errorThrown ) {
							var message = errorThrown;

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

							// API1.1の429エラー
							if ( xhr.status == 429 )
							{
								var dt = new Date();
								dt.setTime( xhr.getResponseHeader( 'x-rate-limit-reset' ) * 1000 );
								var date = ( '00' + dt.getHours() ).slice( -2 ) + ':' +
											( '00' + dt.getMinutes() ).slice( -2 ) + ':' +
											( '00' + dt.getSeconds() ).slice( -2 );

								message = chrome.i18n.getMessage( 'i18n_0285', [ xhr.getResponseHeader( 'x-rate-limit-limit' ), date ] );
							}

							// 401,403エラー
							if ( ( xhr.status == 401 || xhr.status == 403 ) &&
								( req.param.url.match( /statuses\/user_timeline\.json$/) || req.param.url.match( /statuses\/show\/\w+\.json$/ ) ) )
							{
								message = chrome.i18n.getMessage( 'i18n_0286' );
							}

							sendres( {
								status: xhr.status,
								id: req.id,
								message: message,
							} );
						},
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
								sendres( {
									status: xhr.status,
									json: data,
									id: req.id,
								} );
							}
							catch ( err )
							{
								sendres( {
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

							sendres( {
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
				// すでに開始済み
				if ( userstream[req.id] != undefined )
				{
				}
				else
				{
					// UserStreamに接続
					ConnectUserStream( req );

					// タイマー
					userstream[req.id].tm = setInterval( function() { SendQueue( req ); }, queue_interval );
				}

				sendres();
				break;
			// ストリーミング停止
			// req : acsToken
			//       acsSecret
			case 'stream_stop':
				// 動いていない
				if ( userstream[req.id] == undefined )
				{
				}
				else
				{
					// 再接続対応
					userstream[req.id].disconnect_req = true;

					userstream[req.id].xhr.abort();
				}

				sendres();
				break;
			// URL展開
			// req : acsToken
			//       acsSecret
			//       url
			//       service_id
			//         0. unity.me
			//         1. ux.nu
			//         2. jstwi.com
			case 'url_expand':
				// 既に展開済み？
				for ( var i = 0, _len = shorturls.length ; i < _len ; i++ )
				{
					if ( shorturls[i].shorturl == req.url )
					{
						sendres( shorturls[i].longurl );
						return true;
					}
				}

				var ExtService = new Array();

				////////////////////////////////////////////////////////////
				// untiny.meで展開
				////////////////////////////////////////////////////////////
				ExtService.push( function() {
					$.ajax( {
						url: 'http://untiny.me/api/1.0/extract',
						dataType: 'json',
						type: 'GET',
						success: function ( data, status, xhr ) {
							if ( data.org_url != undefined )
							{
								shorturls.push( { shorturl: req.url, longurl: data.org_url } );
								sendres( data.org_url );
							}
							else
							{
								sendres( '' );
							}
						},
						error: function ( xhr, status, errorThrown ) {
							sendres( '' );
						},
						data: {
							format: 'json',
							url: req.url,
						},
					} );
				} );

				////////////////////////////////////////////////////////////
				// ux.nuで展開
				////////////////////////////////////////////////////////////
				ExtService.push( function() {
					// ux.nuの展開サービスを使用
					$.ajax( {
						url: 'http://ux.nu/hugeurl',
						dataType: 'json',
						type: 'GET',
						success: function ( data, status, xhr ) {
							shorturls.push( { shorturl: req.url, longurl: data.exp } );
							sendres( data.exp );
						},
						error: function ( xhr, status, errorThrown ) {
							sendres( '' );
						},
						data: {
							format: 'json',
							url: req.url,
						},
					} );
				} );

				////////////////////////////////////////////////////////////
				// jstwi.comで展開
				////////////////////////////////////////////////////////////
				ExtService.push( function() {
					// jstwi.comの展開サービスを使用
					$.ajax( {
						url: 'http://www.jstwi.com/exturl',
						dataType: 'json',
						type: 'GET',
						success: function ( data, status, xhr ) {
							if ( data.exturl != undefined )
							{
								shorturls.push( { shorturl: req.url, longurl: data.exturl } );
								sendres( data.exturl );
							}
							else
							{
								sendres( '' );
							}
						},
						error: function ( xhr, status, errorThrown ) {
							sendres( '' );
						},
						data: {
							format: 'json',
							url: req.url,
						},
					} );
				} );

				////////////////////////////////////////////////////////////
				// bit.ly(j.mp)は本家に任せる
				////////////////////////////////////////////////////////////
				if ( req.url.match( '^http:\/\/(bit\.ly|j\.mp)\/' ) )
				{
					$.ajax( {
						url: 'http://api.bitly.com/v3/expand',
						dataType: 'json',
						type: 'GET',
						success: function ( data, status, xhr ) {
							if ( data.data.expand )
							{
								shorturls.push( { shorturl: req.url, longurl: data.data.expand[0].long_url } );
								sendres( data.data.expand[0].long_url );
							}
							else
							{
								sendres( '' );
							}
						},
						error: function ( xhr, status, errorThrown ) {
							// bit.ly(j.mp)が使えないときは、設定で指定したサービスを利用
							ExtService[req.service_id]();
						},
						data: {
							format: 'json',
							shortUrl: req.url,
							login: 'jstwi',
							apikey: 'R_26cedce380968a01d28df347bf5d16df',
						},
					} );

					return true;
				}
				////////////////////////////////////////////////////////////
				// htn.toは本家に任せる
				////////////////////////////////////////////////////////////
				if ( req.url.match( '^http:\/\/htn\.to\/' ) )
				{
					$.ajax( {
						url: 'http://b.hatena.ne.jp/api/htnto/expand',
						dataType: 'json',
						type: 'GET',
						success: function ( data, status, xhr ) {
							if ( data.data.expand )
							{
								shorturls.push( { shorturl: req.url, longurl: data.data.expand[0].long_url } );
								sendres( data.data.expand[0].long_url );
							}
							else
							{
								sendres( '' );
							}
						},
						error: function ( xhr, status, errorThrown ) {
							// htn.toが使えないときは、設定で指定したサービスを利用
							ExtService[req.service_id]();
						},
						data: {
							shortUrl: req.url,
						},
					} );

					return true;
				}
				else
				{
					ExtService[req.service_id]();
				}

				break;
			// KuroTwi開始
			// req : tab
			case 'start_routine':
				// 初期化
				userstream = {};
				shorturls = new Array();

				// 応答時間監視
				rectime_chk_tm = setInterval( function() {
					for ( var id in userstream )
					{
						if ( userstream[id] != undefined )
						{
							var curtime = new Date().getTime();

							// 一定時間以上応答なし
							if ( curtime - userstream[id].rectime > 180 * 1000 )
							{
								// 強制切断
								userstream[id].xhr.abort();
							}
						}
					}
				}, 2000 );

				sendres( '' );
				break;
			// KuroTwi終了
			case 'exit_routine':
				// ストリームを止める
				for ( var id in userstream )
				{
					// 動いていない
					if ( userstream[id] == undefined )
					{
					}
					else
					{
						clearInterval( userstream[id].tm );

						// 再接続対応
						userstream[id].disconnect_req = true;

						userstream[id].xhr.abort();
					}
				}

				// 変数をクリア
				userstream = {};
				shorturls = [];
				kurotwi_tab = null;
				kurotwi_manifest = null;

				clearInterval( rectime_chk_tm );

				sendres( '' );
				break;
			// yfrogのイメージURL取得
			// req : imgid
			case 'yfrog_url':
				$.ajax( {
					url: 'http://yfrog.com/api/xmlInfo?path=' + req.imgid,
					dataType: 'xml',
					type: 'GET',
					success: function ( data, status, xhr ) {
						if ( data.getElementsByTagName( 'image_link' )[0] != undefined )
						{
							sendres( data.getElementsByTagName( 'image_link' )[0].firstChild.nodeValue );
						}
						else
						{
							sendres( '' );
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
				} );

				break;
			// plixiのイメージURL取得
			// req : imgurl
			case 'plixi_url':
				$.ajax( {
					url: 'http://api.plixi.com/api/tpapi.svc/json/metadatafromurl',
					dataType: 'json',
					type: 'GET',
					success: function ( data, status, xhr ) {
						if ( data.BigImageUrl != undefined && data.ThumbnailUrl != undefined )
						{
							sendres( { thumb: data.ThumbnailUrl, original: data.BigImageUrl } );
						}
						else
						{
							sendres( '' );
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
					data: {
						url: req.imgurl,
						format: 'json',
					},
				} );

				break;
			// フォト蔵のイメージURL取得
			// req : imgid
			case 'photozou_url':
				$.ajax( {
					url: 'http://api.photozou.jp/rest/photo_info',
					dataType: 'xml',
					type: 'GET',
					success: function ( data, status, xhr ) {
						if ( data.getElementsByTagName( 'original_image_url' )[0] != undefined &&
							 data.getElementsByTagName( 'thumbnail_image_url' )[0] != undefined )
						{
							sendres( { thumb: data.getElementsByTagName( 'thumbnail_image_url' )[0].firstChild.nodeValue,
									   original: data.getElementsByTagName( 'original_image_url' )[0].firstChild.nodeValue } );
						}
						else
						{
							sendres( '' );
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
					data: {
						photo_id: req.imgid,
					},
				} );

				break;
			// TINAMIのイメージURL取得
			// req : imgid
			case 'tinami_url':
				var contid = parseInt( req.imgid + '', 36 | 0 ).toString( 10 | 0 );

				$.ajax( {
					url: 'http://api.tinami.com/content/info',
					dataType: 'xml',
					type: 'GET',
					success: function ( data, status, xhr ) {
						if ( data.getElementsByTagName( 'url' )[0] != undefined &&
							 data.getElementsByTagName( 'thumbnail_150x150' )[0] != undefined )
						{
							sendres( { thumb: data.getElementsByTagName( 'thumbnail_150x150' )[0].getAttribute( 'url' ),
									   original: data.getElementsByTagName( 'url' )[0].firstChild.nodeValue } );
						}
						else
						{
							sendres( '' );
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
					data: {
						api_key: '50c01dc59c313',
						cont_id: contid
					},
				} );

				break;
			// VineのイメージURL取得
			// req : url
			case 'vine_url':
				$.ajax( {
					url: req.imgurl,
					dataType: 'html',
					type: 'GET',
					success: function ( data, status, xhr ) {
						if ( data.match( /<meta property="?og:image"? content="?(.*?)"?>/ ) )
						{
							var imgurl = RegExp.$1;

							sendres( { thumb: imgurl, original: imgurl } );
						}
						else
						{
							sendres( '' );
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
				} );

				break;
			// GyazoのイメージURL取得
			// req : url
			case 'gyazo_url':
				$.ajax( {
					url: req.imgurl,
					dataType: 'html',
					type: 'GET',
					success: function ( data, status, xhr ) {

						var _d = data.match( /<meta.*?\/+>/g );

						for ( var i = 0, _len = _d.length ; i < _len ; i++ )
						{
							if ( _d[i].match( /name=\"twitter:image\"/ ) )
							{
								if ( _d[i].match( /content=\"(.*?)\"/ ) )	// "
								{
									var imgurl = RegExp.$1;
									sendres( { thumb: imgurl.replace( /\/\/gyazo\.com\//, '//gyazo.com/thumb/' ), original: imgurl } );
									break;
								}
								else
								{
									sendres( '' );
								}
							}
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
				} );

				break;
			// twitchのイメージURL取得
			// req : 
			case 'twitch_url':
				var stream = false;

				if ( req.id == '' )
				{
					stream = true;
				}

				$.ajax( {
					headers: {
						'Accept': 'application/vnd.twitchtv.v2+json',
					},
					url: ( stream ) ? 'https://api.twitch.tv/kraken/streams/' + req.channel : 'https://api.twitch.tv/kraken/videos/' + req.id,
					dataType: 'json',
					type: 'GET',
					success: function ( data, status, xhr ) {
						if ( stream && data.stream == null )
						{
							sendres( '' );
						}
						else
						{
							if ( stream )
							{
								sendres( { thumb: data.stream.preview, original: data.stream.preview } );
							}
							else
							{
								sendres( { thumb: data.preview, original: data.preview } );
							}
						}
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
				} );

				break;
			// 外部サービス画像アップロード
			// req : acsToken
			//       acsSecret
			//       id
			//       service_id
			//         0. twitpic
			//         1. twipple photo
			//         2. yfrog
			case 'image_upload':
				var xhr = new XMLHttpRequest();

				// エンドポイント
				var url = new Array( 'http://api.twitpic.com/2/upload.json',
									 'http://p.twipple.jp/api/upload2',
									 'http://yfrog.com/api/xauth_upload' );

				xhr.open( 'POST', url[req.service_id], true );

				// OAuth Echo
				var verify_credentials_url = 'https://api.twitter.com/1.1/account/verify_credentials.json';

				var accessor = {
					consumerSecret: consumerSecret,
					tokenSecret: req.acsSecret
				};

				var message = {
					method: 'GET',
					action: verify_credentials_url,
					parameters: {
						oauth_signature_method: 'HMAC-SHA1',
						oauth_consumer_key: consumerKey,
						oauth_token: req.acsToken,
						oauth_version: '1.0',
					}
				};

				OAuth.setTimestampAndNonce( message );
				OAuth.SignatureMethod.sign( message, accessor );

				var auth = OAuth.getAuthorizationHeader( 'http://api.twitter.com/', message.parameters );

				xhr.setRequestHeader( 'X-Auth-Service-Provider', verify_credentials_url );
				xhr.setRequestHeader( 'X-Verify-Credentials-Authorization', auth );

				var formdata = new FormData();

				// twitpic
				if ( req.service_id == 0 )
				{
					formdata.append( 'key', '17c626776bf6424f38d4c24282159237' );
				}
				// yfrog
				else if ( req.service_id == 2 )
				{
					formdata.append( 'key', '3ADHITVY56539bbd406dca2ff9ef0fbbb023a471' );
				}

				formdata.append( 'media', uploadFile );

				xhr.onreadystatechange = function() {
					if ( xhr.readyState != 4 )
					{
						return;
					}
					if ( xhr.status == 200 && xhr.responseText )
					{
						// twitpic
						if ( req.service_id == 0 )
						{
							try
							{
								var json = JSON.parse( xhr.responseText );

								if ( json.url != undefined )
								{
									sendres( json.url );
								}
								else
								{
									sendres( '' );
								}
							}
							catch ( err )
							{
								sendres( '' );
							}
						}
						// twipple photo
						else if ( req.service_id == 1 )
						{
							var parser = new DOMParser();
							var data = parser.parseFromString( xhr.responseText, 'text/xml' );

							if ( data.getElementsByTagName( 'mediaurl' )[0] != undefined )
							{
								sendres( data.getElementsByTagName( 'mediaurl' )[0].firstChild.nodeValue );
							}
							else
							{
								sendres( '' );
							}
						}
						// yfrog
						else if ( req.service_id == 2 )
						{
							try
							{
								var json = JSON.parse( xhr.responseText );

								if ( json.rsp.mediaurl != undefined )
								{
									sendres( json.rsp.mediaurl );
								}
								else
								{
									sendres( '' );
								}
							}
							catch ( err )
							{
								sendres( '' );
							}
						}
					}
					else
					{
						sendres( '' );
					}
				};

				xhr.send( formdata );

				break;

			// アイコンアップロード
			// req : acsToken
			//       acsSecret
			//       id
			case 'icon_upload':
				// アップロードファイルが設定されていない場合は処理しない
				if ( uploadIconFile == null )
				{
					sendres( '' );
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
								sendres( json.profile_image_url_https );
							}
							else
							{
								sendres( '' );
							}
						}
						catch ( err )
						{
							sendres( '' );
						}
					}
					else
					{
						sendres( '' );
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
					url: 'http://api.microsofttranslator.com/v2/Ajax.svc/Translate?appId=C9739C3837CBBD166870AF1C6EFFDEBE433DC2A8&from=' + req.src + '&to=' + req.targ + '&text=' + req.word,
					dataType: 'json',
					type: 'GET',
					success: function ( data, status, xhr ) {
						sendres( data );
					},
					error: function ( xhr, status, errorThrown ) {
						sendres( '' );
					},
				} );

				break;

			// デスクトップ通知
			// req : type
			//       data
			//       notify_time
			case 'notification':
				var uid = GetUniqueID();

				// 旧版通知が生きている場合
//				if ( webkitNotifications.createHTMLNotification )
//				{
//					notify_message[uid] = req.html;

//					var pp = webkitNotifications.createHTMLNotification( './notification.html?uid=' + uid + '&fontsize=' + req.font_size );

//					pp.show();

					// 設定された時間で自動消滅
//					setTimeout( function() { pp.cancel(); }, req.notify_time * 1000 );
//				}
				// 新版通知対応
//				else
				{
					var options = {
						type: 'basic',
						iconUrl: 'images/icon128.png',
					};

					if ( req.data.simg )
					{
						options.iconUrl = req.data.simg;
					}
					else if ( req.data.img )
					{
						if ( req.data.img.match( /^http.*/ ) )
						{
							options.iconUrl = req.data.img;
						}
					}

					switch ( req.type ) {
						case 'retweet':
							options.title = chrome.i18n.getMessage( 'i18n_0332', [req.data.src] );

							options.message = req.data.msg + '\n' + req.data.date;
							break;
						case 'favorite':
							options.title = chrome.i18n.getMessage( 'i18n_0330', [req.data.src] );
							options.message = req.data.msg + '\n' + req.data.date;
							break;
						case 'follow':
							options.title = chrome.i18n.getMessage( 'i18n_0329', [req.data.src, req.data.target] );
							options.message = '';
							options.buttons = [
								{ title: req.data.src, iconUrl: req.data.simg },
								{ title: req.data.target, iconUrl: req.data.timg }
							];
							break;
						case 'dmrecv':
							options.title = chrome.i18n.getMessage( 'i18n_0331', [req.data.src, req.data.target] );
							options.message = '';
							options.buttons = [
								{ title: req.data.src, iconUrl: req.data.simg },
								{ title: req.data.target, iconUrl: req.data.timg }
							];
							break;
						case 'mention':
							options.title = chrome.i18n.getMessage( 'i18n_0337', [req.data.src] );
							options.message = req.data.msg + '\n' + req.data.date;
							break;
						case 'incoming':
							options.title = chrome.i18n.getMessage( 'i18n_0333', [req.data.user, req.data.count] );
							options.message = '';
							break;
						case 'list_add':
							options.title = chrome.i18n.getMessage( 'i18n_0336', [req.data.src, req.data.target] );
							options.message = req.data.list_fullname;
							options.buttons = [
								{ title: req.data.src, iconUrl: req.data.simg },
								{ title: req.data.target, iconUrl: req.data.timg }
							];
							break;
						case 'new':
							options.title = chrome.i18n.getMessage( 'i18n_0237' );
							options.message = req.data.user + ' ' + req.data.count + chrome.i18n.getMessage( 'i18n_0204' );
							break;
						case 'alltweets':
						case 'quoted_tweet':
							options.title = req.data.src;

							if ( req.data.rtsrc )
							{
								if ( req.data.rtcnt > 0 )
								{
									options.message = chrome.i18n.getMessage( 'i18n_0335', [req.data.rtsrc, req.data.rtcnt] ) + '\n';
								}
								else
								{
									options.message = chrome.i18n.getMessage( 'i18n_0334', [req.data.rtsrc] ) + '\n';
								}
							}
							else
							{
								options.message = '';
							}

							options.message += req.data.msg + '\n' + req.data.date;
							break;
					}

/* 2014/05/23 webkitNotifications.createNotificationがchrome35で使えなくなったため
					// アプリの場合
					if ( app_type != 'extension' )
					{
						var pp = webkitNotifications.createNotification( options.iconUrl, options.title, options.message );
						pp.show();
						setTimeout( function() { pp.cancel(); }, req.notify_time * 1000 );
					}
					// 拡張機能の場合
					else

					{
						chrome.notifications.create(
							uid.toString(),
							options,
							function( id ) {
								setTimeout( function() { chrome.notifications.clear( id, function(){} ); }, req.notify_time * 1000 );
							}
						);
					}
*/

					var pp = new Notification( options.title, {
						body: options.message,
						icon: options.iconUrl
					} );

					pp.onshow = function() {
						setTimeout( function() { pp.close() }, req.notify_time * 1000 );
					};
				}

				break;
		}

		return true;
	}
);

////////////////////////////////////////////////////////////////////////////////
// キュー送出
////////////////////////////////////////////////////////////////////////////////
function SendQueue( req )
{
	if ( userstream[req.id].queue_high == undefined || userstream[req.id].queue_low == undefined || userstream[req.id].queue_del == undefined )
	{
		return;
	}

	// ツイート、RT等
	var len = userstream[req.id].queue_high.length;

	if ( len > 0 )
	{
		var cnt = 1;

		while ( cnt > 0 )
		{
			if ( kurotwi_tab != null )
			{
				chrome.tabs.sendMessage(
					kurotwi_tab.id,
					{
						action: 'stream',
						account_id: req.id,
						json: userstream[req.id].queue_high.shift(),
					}
				);
			}

			cnt--;
		}
	}

	// イベント系
	len = userstream[req.id].queue_low.length;

	if ( len > 0 )
	{
		var cnt = 1;

		while ( cnt > 0 )
		{
			if ( kurotwi_tab != null )
			{
				chrome.tabs.sendMessage(
					kurotwi_tab.id,
					{
						action: 'stream',
						account_id: req.id,
						json: userstream[req.id].queue_low.shift(),
					}
				);
			}

			cnt--;
		}
	}

	// 削除
	len = userstream[req.id].queue_del.length;

	if ( len > 0 )
	{
		var cnt = 1;

		while ( cnt > 0 )
		{
			if ( kurotwi_tab != null )
			{
				chrome.tabs.sendMessage(
					kurotwi_tab.id,
					{
						action: 'stream',
						account_id: req.id,
						json: userstream[req.id].queue_del.shift(),
					}
				);
			}

			cnt--;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// UserStreamへ接続する
////////////////////////////////////////////////////////////////////////////////
function ConnectUserStream( req )
{
	var param = {
		type: 'GET',
		url: 'https://userstream.twitter.com/1.1/user.json',
	};

	var accessor = {
		consumerSecret: consumerSecret,
		tokenSecret: req.acsSecret,
	};

	var message = {
		method: param.type,
		action: param.url,
		parameters: {
			oauth_signature_method: 'HMAC-SHA1',
			oauth_consumer_key: consumerKey,
			oauth_token: req.acsToken,
			oauth_version: '1.0',
		}
	};

	message.parameters['delimited'] = 'length';

	OAuth.setTimestampAndNonce( message );
	OAuth.SignatureMethod.sign( message, accessor );
	var target = OAuth.addToURL( message.action, message.parameters );

	// UserStreamオブジェクト作成
	userstream[req.id] = {
		xhr: null,
		lastLoaded: 0,
		lastChunkLen: null,

		// フォロー数が多い時に取得がおかしくなる不具合対策
		firstLoad: true,

		// 再接続対応
		disconnect_req: false,

		// 応答時間監視用
		rectime: new Date().getTime(),
	};

	userstream[req.id].xhr = new XMLHttpRequest();

	////////////////////////////////////////////////////////////
	// 進行中処理
	////////////////////////////////////////////////////////////
	var OnProgress = function( e ) {
		// 応答時間監視用
		{
			var curtime = new Date().getTime();
			userstream[req.id].rectime = curtime;
		}

		var text = userstream[req.id].xhr.responseText;

		// フォロー数が多い時に取得がおかしくなる不具合対策
		if ( userstream[req.id].firstLoad )
		{
			// 初回のレスポンスを無視する
			userstream[req.id].firstLoad = false;
			return;
		}

		while( userstream[req.id].lastLoaded < e.loaded )
		{
			if( !userstream[req.id].lastChunkLen )
			{
				userstream[req.id].lastChunkLen = '';

				var curChar = text.charAt( userstream[req.id].lastLoaded );

				while( curChar != '\n' || userstream[req.id].lastChunkLen.length === 0 )
				{
					if( curChar.match(/\d/) )
					{
						userstream[req.id].lastChunkLen += curChar;
					}

					userstream[req.id].lastLoaded += 1;

					if( userstream[req.id].lastLoaded >= e.loaded )
					{
						return;
					}

					curChar = text.charAt( userstream[req.id].lastLoaded );
				}

				userstream[req.id].lastLoaded += 1;
				userstream[req.id].lastChunkLen = parseInt( userstream[req.id].lastChunkLen, 10 );
			}

			if ( userstream[req.id].lastLoaded + userstream[req.id].lastChunkLen > e.loaded )
			{
				return;
			}

			var jsonChunk = text.substring( userstream[req.id].lastLoaded,
											userstream[req.id].lastLoaded + userstream[req.id].lastChunkLen );

			try
			{
				var json = JSON.parse( jsonChunk );
			}
			catch ( err )
			{
				console.log( err );
			}

			// キューにデータを追加
			var flg = true;
			var low = false;
			var del = false;

			// 送信データのフィルタリング
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
				}

				if ( userstream[req.id].queue_low == undefined )
				{
					userstream[req.id].queue_low = new Array();
				}

				if ( userstream[req.id].queue_del == undefined )
				{
					userstream[req.id].queue_del = new Array();
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

			userstream[req.id].lastLoaded += userstream[req.id].lastChunkLen;
			userstream[req.id].lastChunkLen = null;
		}

		// responseTextのサイズが4096KBを超えたら、一旦接続を切って繋ぎ直す
		if ( e.loaded > 4096 * 1024 )
		{
			userstream[req.id].xhr.removeEventListener( 'progress', OnProgress, false );

			// キューを保存
			var queue_high_bak = userstream[req.id].queue_high;
			var queue_low_bak = userstream[req.id].queue_low;
			var queue_del_bak = userstream[req.id].queue_del;

			// 再接続対応
			userstream[req.id].disconnect_req = true;

			userstream[req.id].xhr.abort();

			ConnectUserStream( req );

			// キューを戻してタイマーを再起動
			userstream[req.id].queue_high = queue_high_bak;
			userstream[req.id].queue_low = queue_low_bak;
			userstream[req.id].queue_del = queue_del_bak;
			userstream[req.id].tm = setInterval( function() { SendQueue( req ); }, queue_interval );
		}
	};

	userstream[req.id].xhr.open( param.type, target, true );
	userstream[req.id].xhr.addEventListener( 'progress', OnProgress, false );
	userstream[req.id].xhr.setRequestHeader( 'X-User-Agent', kurotwi_manifest.name + ' ' + kurotwi_manifest.version );

	// 接続試行中
	if ( kurotwi_tab != null )
	{
		var json = {
			error_id: 1,
			error: 'UserStream connect trying',
		};

		chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'stream', account_id: req.id, json: json } );
	}

	////////////////////////////////////////////////////////////
	// 状態変更時処理
	////////////////////////////////////////////////////////////
	userstream[req.id].xhr.onreadystatechange = function() {
		// 接続
		if (  userstream[req.id].xhr.readyState == 2 )
		{
			if ( userstream[req.id].xhr.status != 200 )
			{
				userstream[req.id].xhr.removeEventListener( 'progress', OnProgress, false );

				// コンテントスクリプトへストリーム接続失敗を通知
				if ( kurotwi_tab != null )
				{
					var json = {
						error_id: -1,
						error: 'UserStream connect error',
						status: userstream[req.id].xhr.status,
					};

					chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'stream', account_id: req.id, json: json } );

					// 切断
					userstream[req.id].disconnect_req = true;

					userstream[req.id].xhr.abort();
				}
			}
			else
			{
				// コンテントスクリプトへストリーム接続成功を通知
				if ( kurotwi_tab != null )
				{
					var json = {
						error_id: 2,
						error: 'UserStream connect success',
					};

					chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'stream', account_id: req.id, json: json } );
				}
			}
		}
		// HTTP通信完了
		else if ( userstream[req.id].xhr.readyState == 4 )
		{
			userstream[req.id].xhr.removeEventListener( 'progress', OnProgress, false );

			// タイマーを止める
			clearInterval( userstream[req.id].tm );

			// 再接続対応
			var disconnect_req = userstream[req.id].disconnect_req;

			delete userstream[req.id];

			// コンテントスクリプトへストリーム切断成功を通知
			if ( kurotwi_tab != null )
			{
				var json = {
					error_id: 0,
					error: 'UserStream disconnect success',
				};

				chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'stream', account_id: req.id, json: json } );
			}

			// 再接続対応
			if ( !disconnect_req )
			{
				// 意図しないユーザーストリーム切断
				// ステータスを接続試行中にしておく
				if ( kurotwi_tab != null )
				{
					var json = {
						error_id: 1,
						error: 'UserStream connect trying',
					};

					chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'stream', account_id: req.id, json: json } );

					// 再接続要求
					chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'reconnect', account_id: req.id } );
				}
			}
		}
	};

	userstream[req.id].xhr.send();
}


////////////////////////////////////////////////////////////////////////////////
// コンテントスクリプトのコンソールへメッセージを出力
////////////////////////////////////////////////////////////////////////////////
function ConsoleLog( msg )
{
	if ( kurotwi_tab != null )
	{
		chrome.tabs.sendMessage( kurotwi_tab.id, { action: 'log', msg: msg } );
	}
	else
	{
		console.log( msg );
	}
}

////////////////////////////////////////////////////////////////////////////////
// デスクトップ通知の文字列を取得＆クリア
////////////////////////////////////////////////////////////////////////////////
function GetNotifyMessage( uid )
{
	var ret = notify_message[uid];
	notify_message[uid] = void 0;

	return ret;
}
