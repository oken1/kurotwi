"use strict";

////////////////////////////////////////////////////////////////////////////////
// ツイート
////////////////////////////////////////////////////////////////////////////////
Contents.tweetbox = function( cp )
{
	var SAVEDRAFT_MAX = 100;
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var atimg = false;
	var checked_tag = new Array();

	cp.SetIcon( 'icon-pencil' );

	////////////////////////////////////////////////////////////
	// ハッシュタグプルダウンメニューを作成
	////////////////////////////////////////////////////////////
	function MakeHashTagPullDown()
	{
		var s = '';
		var text = '';

		for ( var i = 0, _len = g_cmn.hashtag.length ; i < _len ; i++ )
		{
			text = escapeHTML( g_cmn.hashtag[i].hashtag );
			s += '<div class="item" text="' + text + '"><input type="checkbox" ' + ( g_cmn.hashtag[i].checked ? 'checked' : '' ) + '>#' + text + '</div>';
		}

		for ( var i = 0, _len = g_cmn.notsave.tl_hashtag.length ; i < _len ; i++ )
		{
			text = escapeHTML( g_cmn.notsave.tl_hashtag[i].hashtag );
			s += '<div class="item tlhash" text="' + text + '"><input type="checkbox" ' + ( g_cmn.notsave.tl_hashtag[i].checked ? 'checked' : '' ) + '>#' + text + '</div>';
		}

		var pulldown = cont.find( '#hash_select' );

		pulldown.html( s );

		if ( s == '' )
		{
			pulldown.hide();
		}
	}

	////////////////////////////////////////////////////////////
	// 下書きプルダウンメニューを作成
	////////////////////////////////////////////////////////////
	function MakeDraftPullDown()
	{
		var s = '';
		var text = '';
		var cnt = ( g_cmn.draft.length ) ? '(' + g_cmn.draft.length + '/' + SAVEDRAFT_MAX + ')' : '';

		s += '<div id="savedraft" class="item">' + i18nGetMessage( 'i18n_0322' ) + cnt + '</div>';

		for ( var i = 0, _len = g_cmn.draft.length ; i < _len ; i++ )
		{
			text = escapeHTML( g_cmn.draft[i] );
			s += '<div class="item"' + text + '"><span class="icon-close off"></span><span class="tooltip" tooltip="' + text + '">' + text + '</span></div>';
		}

		var pulldown = cont.find( '#draft_select' );

		pulldown.html( s );

		if ( s == '' )
		{
			pulldown.hide();
		}

		pulldown.find( '.item' ).find( 'span:first-child' ).each( function() {
			var item = $( this );

			item.addClass( 'tooltip' )
				.attr( 'tooltip', i18nGetMessage( 'i18n_0223' ) )
				.hover(
					function( e ) {
						item.removeClass( 'off' ).addClass( 'on' );
					},
					function( e ) {
						item.removeClass( 'on' ).addClass( 'off' );
					}
				);
		} );

		if ( $( '#tweet' ).hasClass( 'disabled' ) || g_cmn.draft.length >= SAVEDRAFT_MAX )
		{
			$( '#savedraft' ).addClass( 'disabled' );
		}
		else
		{
			$( '#savedraft' ).removeClass( 'disabled' );
		}
	}

	////////////////////////////////////////////////////////////
	// 開始処理
	////////////////////////////////////////////////////////////
	this.start = function() {
		cp.SetTitle( i18nGetMessage( 'i18n_0083' ), false );

		// 最大文字数
		cp.param.maxlen = 280;
		
		cont.addClass( 'tweetbox' )
			.html( OutputTPL( 'tweetbox', { maxlen: cp.param['maxlen'] } ) );

		// ツイートボタンのツールチップを設定に合わせる
		var _tips = new Array( 'Ctrl+Enter', 'Shift+Enter', 'Enter' );
		$( '#tweet' ).attr( 'tooltip', i18nGetMessage( 'i18n_0083' ) + '(' + _tips[g_cmn.cmn_param.tweetkey] + ')' );

		////////////////////////////////////////
		// ファイルドロップ時の処理
		////////////////////////////////////////
		cont.on( 'drop',
			function( e ) {
				// データなし
				if ( !e.originalEvent.dataTransfer )
				{
					return;
				}

				// テキスト
				if ( e.originalEvent.dataTransfer.getData( 'text' ) )
				{
					return;
				}

				e.preventDefault();

				// ファイル
				for ( var i = 0, _len = e.originalEvent.dataTransfer.files.length ; i < _len ; i++ )
				{
					var _file = e.originalEvent.dataTransfer.files[i];

					if ( $( '#imageattach' ).hasClass( 'disabled' ) )
					{
						return false;
					}

					if ( _file.type.match( /^image\// ) )
					{
						AppendAttachFile( _file );
					}
				}
			}
		);

		////////////////////////////////////////
		// 返信情報削除ボタンクリック処理
		////////////////////////////////////////
		var ReplyDelClick = function() {
			var index = $( '#tweetbox_reply' ).find( '.del' ).find( 'span' ).index( this );

			var replyitem = $( this ).parent().parent();
			var height = replyitem.outerHeight( true );

			replyitem.remove();
			delete cp.param['reply'];

			cont.height( cont.height() - height );
			p.height( p.height() - height );
		};

		////////////////////////////////////////
		// 添付画像削除ボタンクリック処理
		////////////////////////////////////////
		var ImageDelClick = function() {
			// アップロード中は削除できないようにする
			if ( twflg )
			{
				return;
			}

			var index = $( '#tweetbox_image' ).find( '.del' ).find( 'span' ).index( this );

			var imageitem = $( this ).parent().parent();
			var height = imageitem.outerHeight( true );
			imageitem.remove();

			if ( $( '#tweetbox_image' ).find( '.imageitem' ).length == 0 )
			{
				cont.height( cont.height() - height );
				p.height( p.height() - height );
			}

			ImageFileReset();
			atimg = ( $( '#tweetbox_image' ).find( '.imageitem' ).length ) ? true :false;
			$( '#tweetbox_text' ).trigger( 'keyup' );

			// 画像添付ボタンのdisabled解除
			$( '#imageattach' ).removeClass( 'disabled' );
		};

		////////////////////////////////////////
		// fileの初期化
		////////////////////////////////////////
		var ImageFileReset = function() {
			var imgp = $( '#imageattach_input' ).parent();
			var ohtml = imgp.html();
			$( '#imageattach_input' ).remove();
			imgp.html( ohtml );

			$( '#imageattach_input' ).change( ImageAttachChange );
		};

		////////////////////////////////////////
		// ファイル選択変更時の処理
		////////////////////////////////////////
		var ImageAttachChange = function() {
			if ( $( '#imageattach_input' )[0].files.length == 1 )
			{
				AppendAttachFile( $( '#imageattach_input' )[0].files[0] );
			}
		};

		////////////////////////////////////////
		// 添付画像を追加
		////////////////////////////////////////
		var AppendAttachFile = function( f ) {
			var _itemcnt = $( '#tweetbox_image' ).find( '.imageitem' ).length;
			$( '#tweetbox_image' ).append( OutputTPL( 'tweetbox_image', { item: { filename: f.name }} ) );
			$( '#tweetbox_image' ).find( '.del' ).last().find( 'span' ).click( ImageDelClick );
			var _uid = GetUniqueID();
			$( '#tweetbox_image' ).find( '.imageitem' ).last().attr( 'uid', _uid );

			// カメラアイコンを画像のサムネイルにする
			if ( f.type.match( 'image.*' ) )
			{
				var reader = new FileReader();

				reader.onload = function( e ) {
					var result = e.target.result;
					var item = $( '#tweetbox_image' ).find( '.imageitem[uid=' + _uid + ']' );

					item.find( '.icon' ).find( 'img' ).attr( 'src', result )
						.hover(
							function() { $( this ).css( { cursor: 'pointer' } ) },
							function() { $( this ).css( { cursor: 'default' } ) }
						)
						.click( function( e ) {
							imageviewer.open( $( '#imageviewer' ), [result], 0 )
							e.stopPropagation();
						} );

					var height = item.outerHeight( true );

					if ( _itemcnt == 0 )
					{
						cont.height( cont.height() + height );
						p.height( p.height() + height );
					}
				};

				reader.readAsDataURL( f );
			}

			atimg = true;

			// 最大4枚まで
			if ( $( '#tweetbox_image' ).find( '.imageitem' ).length == 4 )
			{
				$( '#imageattach' ).addClass( 'disabled' );
			}

			ImageFileReset();
			$( '#tweetbox_text' ).trigger( 'keyup' );
		};

		////////////////////////////////////////
		// 返信先設定
		////////////////////////////////////////
		cont.on( 'repset', function( e, item ) {
			if ( item.status.length > 32 )
			{
				item.tooltip = item.status;
				item.status = item.status.substring( 0, 31 ) + '…';
			}

			$( '#tweetbox_reply' ).find( '.replyitem' ).find( '.del' ).find( 'span' ).trigger( 'click' );

			cp.param['reply'] = item;
			$( '#tweetbox_reply' ).html( OutputTPL( 'tweetbox_reply', { item: item } ) );

			if ( !item.start )
			{
				var height = $( '#tweetbox_reply' ).find( '.replyitem' ).outerHeight( true );

				cont.height( cont.height() + height );
				p.height( p.height() + height );
			}

			$( '#tweetbox_reply' ).find( '.del' ).find( 'span' ).each( function() {
				$( this ).click( ReplyDelClick );
			} );

			
		} );

		////////////////////////////////////////
		// 宛先追加
		////////////////////////////////////////
		cont.on( 'userset', function( e, item ) {
			var _text = $( '#tweetbox_text' );
			var period = '';
			var rep_users = '';

			if ( _text.val().match( /^\./ ) )
			{
				period = '.';
				_text.val( _text.val().replace( /^\./, '' ) );
			}

			if ( _text.val().match( /^(@\w+ )+/ ) )
			{
				rep_users = RegExp.lastMatch;
			}

			// 重複
			if ( rep_users.match( '@' + item + ' ' ) )
			{
				_text.val( period + _text.val() );
			}
			else
			{
				_text.val( period + '@' + item + ' ' + _text.val() );

				if ( period == '' && g_cmn.cmn_param['top_period'] && rep_users.length > 0 )
				{
					_text.val( '.' + _text.val() );
				}
			}

			$( '#tweetbox_text' ).focus().trigger( 'keyup' ).SetPos( 'end' );
		} );


		////////////////////////////////////////
		// ハッシュタグ追加
		////////////////////////////////////////
		cont.on( 'hashset', function( e, item ) {
			var _text = $( '#tweetbox_text' );

			_text.val( _text.val() + ' #' + item );
			$( '#tweetbox_text' ).focus().trigger( 'keyup' ).SetPos( 'end' );
		} );

		////////////////////////////////////////
		// ハッシュタグプルダウン更新
		////////////////////////////////////////
		cont.on( 'hashtag_pulldown_update', function( e ) {
			MakeHashTagPullDown();
		} );

		////////////////////////////////////////
		// 下書きプルダウン更新
		////////////////////////////////////////
		cont.on( 'draft_pulldown_update', function( e ) {
			MakeDraftPullDown();
		} );

		cp.param['geo'] = new Array();
		$( '#tweetbox_text' ).focus();

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			$( '#tweetbox_text' ).width( p.width() - 24 );
			$( '#tweetbox_box' ).find( 'div' ).first().width( p.width() - 12 );

			var acc_h = cont.find( '.account_select' ).outerHeight();

			var opt_h = $( '#tweetbox_reply' ).outerHeight() +
						$( '#tweetbox_image' ).outerHeight();

			var btn_h = $( '#tweetbox_btn' ).parent().outerHeight( true );

			$( '#tweetbox_box' ).height( cont.outerHeight() - acc_h - opt_h - 12 );
			$( '#tweetbox_text' ).height( $( '#tweetbox_box' ).outerHeight() - btn_h - 24 );

			cont.find( '#hash_select' ).css( {
				left: $( '#hashtag' ).position().left - $( '#hashtag' ).outerWidth() * 2,
			} );

			cont.find( '#draft_select' ).css( {
				left: $( '#draft' ).position().left,
			} );

		} );

		cont.trigger( 'contents_resize' );

		////////////////////////////////////////
		// アカウント情報更新
		////////////////////////////////////////
		cont.on( 'account_update', function() {
			// アカウントが0件の場合はパネルを閉じる
			if ( AccountCount() == 0 )
			{
				// ツイートパネルを閉じる
				p.find( '.close' ).trigger( 'click', [false] );
				return;
			}
			else
			{
				AccountSelectMake( cp );
			}
		} );

		cont.trigger( 'account_update' );

		////////////////////////////////////////
		// ハッシュタグボタンクリック処理
		////////////////////////////////////////
		$( '#hashtag' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var pulldown = cont.find( '#hash_select' );

			if ( pulldown.css( 'display' ) == 'none' )
			{
				$( 'div.contents' ).trigger( 'hashtag_pulldown_update' );
				SetFront( p );

				if ( pulldown.find( '.item' ).length )
				{
					pulldown.css( {
						width: $( '#hashtag' ).outerWidth() * 3 + $( '#tweet' ).outerWidth(),
						left: $( '#hashtag' ).position().left - $( '#hashtag' ).outerWidth() * 2,
						top: $( '#hashtag' ).position().top + $( '#hashtag' ).outerHeight()
					} ).show();

					cont.find( '#draft_select' ).hide();
				}
			}
			else
			{
				pulldown.hide();
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ハッシュタグチェック選択
		////////////////////////////////////////
		$( '#hash_select' ).on( 'click', '> div.item input[type=checkbox]', function( e ) {
			var checked = $( this ).prop( 'checked' );
			var index = $( this ).parent().index();

			if ( index < g_cmn.hashtag.length )
			{
				g_cmn.hashtag[index].checked = checked;
			}
			else
			{
				index = index - g_cmn.hashtag.length;
				g_cmn.notsave.tl_hashtag[index].checked = checked;
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ハッシュタグプルダウン選択
		////////////////////////////////////////
		$( '#hash_select' ).on( 'click', '> div.item', function( e ) {
			cont.trigger( 'hashset', [$( this ).attr( 'text' )] );

			//$( this ).parent().hide();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 下書きボタンクリック処理
		////////////////////////////////////////
		$( '#draft' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var pulldown = cont.find( '#draft_select' );

			if ( pulldown.css( 'display' ) == 'none' )
			{
				$( 'div.contents' ).trigger( 'draft_pulldown_update' );
				SetFront( p );

				if ( pulldown.find( '.item' ).length )
				{
					pulldown.css( {
						width: $( '#draft' ).outerWidth() * 4 + $( '#tweet' ).outerWidth(),
						left: $( '#draft' ).position().left,
						top: $( '#draft' ).position().top + $( '#draft' ).outerHeight()
					} ).show();

					cont.find( '#hash_select' ).hide();
				}
			}
			else
			{
				pulldown.hide();
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 下書き削除選択
		////////////////////////////////////////
		$( '#draft_select' ).on( 'click', '> div.item span:first-child', function( e ) {
			var index = $( this ).parent().index() - 1;

			g_cmn.draft.splice( index, 1 );
			$( '#tooltip' ).hide();

			$( 'div.contents' ).trigger( 'draft_pulldown_update' );

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// 下書きプルダウン選択
		////////////////////////////////////////
		$( '#draft_select' ).on( 'click', '> div.item', function( e ) {
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			var index = $( this ).index();

			// 下書き保存
			if ( index == 0 )
			{
				if ( g_cmn.draft.length < SAVEDRAFT_MAX )
				{
					g_cmn.draft.push( $( '#tweetbox_text' ).val() );
					$( 'div.contents' ).trigger( 'draft_pulldown_update' );
				}
			}
			else
			{
				var obj = $( '#tweetbox_text' ).get( 0 );
				var pos = obj.selectionStart;

				var s = obj.value;
				var np = pos + g_cmn.draft[index - 1].length;
				obj.value = s.substr( 0, pos ) + g_cmn.draft[index - 1] + s.substr( pos );
				$( '#tweetbox_text' ).focus().trigger( 'keyup' );
				obj.setSelectionRange( np, np );
			}

//			$( this ).parent().hide();

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// ツイートボタンクリック処理
		////////////////////////////////////////
		var twflg = false;

		$( '#tweet' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			// 連続投稿防止
			if ( twflg )
			{
				return;
			}

			$( this ).addClass( 'disabled' );

			var data = {};
			var status = '';

			status += $( '#tweetbox_text' ).val();

			// in_reply_to設定
			if ( cp.param['reply'] )
			{
				data['in_reply_to_status_id'] = cp.param['reply'].status_id;
			}

			data['status'] = status;

			var param = {
				type: 'POST',
				url: ApiUrl( '1.1' ) + 'statuses/update.json',
				data: data,
			};

			Blackout( true, false );
			$( '#blackout' ).activity( { color: '#808080', width: 8, length: 14 } );

			twflg = true;

			var TweetSend = function( media_ids ) {
				if ( media_ids )
				{
					param.data.media_ids = media_ids;
				}

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
						twflg = false;

						if ( res.status == 200 )
						{
							// テキストボックスを空にする
							$( '#tweetbox_text' ).val( '' )
								.trigger( 'keyup' );

							// 返信情報をクリア
							$( '#tweetbox_reply' ).find( '.del' ).find( 'span' ).each( function() {
								$( this ).trigger( 'click' );
							} );

							// 添付画像をクリア
							$( '#tweetbox_image' ).find( '.del' ).find( 'span' ).each( function() {
								$( this ).trigger( 'click' );
							} );

							// ハッシュタグを自動入力
							for ( var i = 0, _len = g_cmn.hashtag.length ; i < _len ; i++ )
							{
								if ( g_cmn.hashtag[i].checked == true )
								{
									cont.trigger( 'hashset', [g_cmn.hashtag[i].hashtag] );
								}
							}

							for ( var i = 0, _len = g_cmn.notsave.tl_hashtag.length ; i < _len ; i++ )
							{
								if ( g_cmn.notsave.tl_hashtag[i].checked == true )
								{
									cont.trigger( 'hashset', [g_cmn.notsave.tl_hashtag[i].hashtag] );
								}
							}

							$( '#tweetbox_text' ).SetPos( 'start' );

							// ツイート数表示の更新
							StatusesCountUpdate( cp.param['account_id'], 1 );
						}
						else
						{
							console.log( 'status[' + res.status + ']' );

							$( this ).removeClass( 'disabled' );

							ApiError( i18nGetMessage( 'i18n_0087' ), res );
						}

						Blackout( false, false );
						$( '#blackout' ).activity( false );
					}
				);
			};

			// 添付画像あり
			if ( $( '#tweetbox_image' ).find( '.imageitem' ).length > 0 )
			{
				var _idx = 0;
				var media_ids = '';
				var items = $( '#tweetbox_image' ).find( '.imageitem' ).length;

				var ImageUpload = function() {
					if ( _idx == items )
					{
						TweetSend( media_ids );
						return;
					}

					var media_data =  $( '#tweetbox_image' ).find( '.imageitem' ).eq( _idx ).find( 'img' ).attr( 'src' );
					media_data = media_data.replace(/^.*,/, '');

					SendRequest(
						{
							action: 'oauth_send',
							acsToken: g_cmn.account[cp.param['account_id']]['accessToken'],
							acsSecret: g_cmn.account[cp.param['account_id']]['accessSecret'],
							param: {
								type: 'POST',
								url: ApiUrl( '1.1', 'upload' ) + 'media/upload.json',
								data: {
									media_data: media_data
								}
							}
						},
						function( res )
						{
							if ( res.status == 200 )
							{
								if ( media_ids == '' )
								{
									media_ids = res.json.media_id_string;
								}
								else
								{
									media_ids += ',' + res.json.media_id_string;
								}

								_idx++;
								ImageUpload();
							}
							else
							{
								twflg = false;

								console.log( 'status[' + res.status + ']' );

								$( this ).removeClass( 'disabled' );

								ApiError( i18nGetMessage( 'i18n_0087' ), res );

								Blackout( false, false );
								$( '#blackout' ).activity( false );
							}
						}
					);

				}
				ImageUpload();
			}
			// なし
			else
			{
				TweetSend();
			}

			e.stopPropagation();
		} );

		////////////////////////////////////////
		// イベント用ボタン処理
		////////////////////////////////////////
		$( '#eventbtn' ).hide();

		var laputa_check = function() {
			var dt = new Date();
			var stdt = new Date( '2017/09/29 21:00:00' );
			var eddt = new Date( '2017/09/29 23:34:00' );

			if ( i18nGetMessage( 'i18n_9998' ) == "" )
			{
				return;
			}

			if ( dt.getTime() >= stdt.getTime() && dt.getTime() <= eddt.getTime() )
			{
				$( '#eventbtn' ).show();
			}
			else
			{
				$( '#eventbtn' ).hide();
			}

			if ( dt.getTime() <= eddt.getTime() )
			{
				setTimeout( laputa_check, 60 * 1000 );
			}
		};

		laputa_check();

		$( '#eventbtn' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) || i18nGetMessage( 'i18n_9998' ) == '' )
			{
				return;
			}

			$( this ).addClass( 'disabled' );

			var data = {};
			var status = i18nGetMessage( 'i18n_9998' );
//			var status = '';

			data['status'] = status;

			var param = {
				type: 'POST',
				url: ApiUrl( '1.1' ) + 'statuses/update.json',
				data: data,
			};

			Blackout( true, false );

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
						// ツイート数表示の更新
						StatusesCountUpdate( cp.param['account_id'], 1 );
					}
					else
					{
						console.log( 'status[' + res.status + ']' );
						ApiError( i18nGetMessage( 'i18n_0087' ), res );
					}

					Blackout( false, false );
					$( '#eventbtn' ).removeClass( 'disabled' );
				}
			);

			e.stopPropagation();
		} );

		var tweetbox_text = $( '#tweetbox_text' );

		////////////////////////////////////////
		// 入力文字数によるボタン制御
		////////////////////////////////////////
		$( '#tweetbox_text' ).on( 'keyup change', function( e ) {
			// 入力文字数カウント
			var slen = twttr.txt.parseTweet( tweetbox_text.val() ).weightedLength;

			var cnt = $( '#tweetbox_cnt' );
			var btn = $( '#tweet' );
			var savedraft = $( '#savedraft' );

			cnt.html( cp.param['maxlen'] - slen );

			if ( ( ( slen > 0 && slen <= cp.param['maxlen'] ) || ( slen == 0 && atimg ) ) && twflg == false )
			{
				btn.removeClass( 'disabled' );

				if ( g_cmn.draft.length < SAVEDRAFT_MAX )
				{
					savedraft.removeClass( 'disabled' );
				}
			}
			else
			{
				btn.addClass( 'disabled' );

				savedraft.addClass( 'disabled' );
			}

			if ( cp.param['maxlen'] - slen < 0 )
			{
				cnt.addClass( 'ng' );
			}
			else
			{
				cnt.removeClass( 'ng' );
			}
		} );

		////////////////////////////////////////
		// キーボードショートカット
		////////////////////////////////////////
		$( '#tweetbox_text' ).keydown( function( e ) {
			// Enterに設定されているときは、Ctrl+Enterで改行
			if ( g_cmn.cmn_param.tweetkey == 2 && ( e.keyCode == 13 && e.ctrlKey == true ) )
			{
				var obj = $( this ).get( 0 );
				var spos = obj.selectionStart;
				var epos = obj.selectionEnd;
				var s = obj.value;
				var np = spos + 1;
				obj.value = s.substr( 0, spos ) + '\n' + s.substr( epos );
				obj.setSelectionRange( np, np );
				return false;
			}

			if ( ( g_cmn.cmn_param.tweetkey == 0 && ( e.keyCode == 13 && e.ctrlKey == true ) ) ||
				 ( g_cmn.cmn_param.tweetkey == 1 && ( e.keyCode == 13 && e.shiftKey == true ) ) ||
				 ( g_cmn.cmn_param.tweetkey == 2 && ( e.keyCode == 13 && e.ctrlKey == false && e.shiftKey == false ) ) )
			{
				$( '#tweet' ).trigger( 'click' );
				return false;
			}
		} );

		////////////////////////////////////////
		// ドロップ処理
		////////////////////////////////////////
		cont.on( 'itemdrop', function( e, ui ) {
			// 宛先ユーザ
			if ( ui.draggable.hasClass( 'user' ) )
			{
				cont.trigger( 'userset', [ui.draggable.attr( 'screen_name' )] );
			}
			// ハッシュタグ
			else if ( ui.draggable.hasClass( 'hashtag' ) )
			{
				cont.trigger( 'hashset', [ui.draggable.attr( 'hashtag' )] );
			}
		} );

		cont.droppable( {
			accept: '.dropitem',
			greedy: true,
			drop: function( e, ui ) {
				cont.trigger( 'itemdrop', [ ui ] );
			},
		} );

		////////////////////////////////////////
		// 画像を添付ボタンクリック処理
		////////////////////////////////////////
		$( '#imageattach' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			$( '#imageattach_input' ).click();
			e.stopPropagation();
		} );

		$( '#imageattach_input' ).change( ImageAttachChange );
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
		// 添付画像をクリア
		$( '#tweetbox_image' ).find( '.imageitem' ).find( '.del' ).find( 'span' ).trigger( 'click' );
		atimg = false;

		// 返信先をクリア
		$( '#tweetbox_reply' ).find( '.replyitem' ).find( '.del' ).find( 'span' ).trigger( 'click' );
	};
}
