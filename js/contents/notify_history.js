"use strict";

////////////////////////////////////////////////////////////////////////////////
// デスクトップ通知履歴
////////////////////////////////////////////////////////////////////////////////
Contents.notify_history = function( cp )
{
	var p = $( '#' + cp.id );
	var cont = p.find( 'div.contents' );
	var notify_history_list;
	var scrollPos = null;

	cp.SetIcon( 'icon-bubble' );

	////////////////////////////////////////////////////////////
	// リスト部作成
	////////////////////////////////////////////////////////////
	var ListMake = function( type ) {
		var s = '';

		for ( var i = g_cmn.notsave.notify_history.length - 1 ; i >= 0 ; i-- )
		{
			var assign = {};

			for ( var arg in g_cmn.notsave.notify_history[i].data )
			{
				try {
					assign[arg] = decodeURIComponent_space( g_cmn.notsave.notify_history[i].data[arg] );
				}
				catch ( err )
				{
					assign[arg] = g_cmn.notsave.notify_history[i].data[arg];
				}
			}

			s += OutputTPL( 'notify_' + g_cmn.notsave.notify_history[i].type, assign );
		}

		notify_history_list.html( s )
			.scrollTop( 0 );

		cont.trigger( 'contents_resize' );
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
					scrollPos = notify_history_list.scrollTop();
				}
			}
			// 復元
			else
			{
				if ( scrollPos != null )
				{
					notify_history_list.scrollTop( scrollPos );
					scrollPos = null;
				}
			}
		} );

		////////////////////////////////////////
		// リサイズ処理
		////////////////////////////////////////
		cont.on( 'contents_resize', function() {
			$( '#notify_history_list' ).height( cont.height() - cont.find( '.panel_btns' ).height() - 1 );
		} );

		// 全体を作成
		cont.addClass( 'notify_history' )
			.html( OutputTPL( 'notify_history', {} ) );

		cp.SetTitle( i18nGetMessage( 'i18n_0094' ), false );
			
		notify_history_list = $( '#notify_history_list' );

		////////////////////////////////////////
		// 更新ボタンクリック
		////////////////////////////////////////
		$( '#notify_history_reload' ).click( function( e ) {
			// disabledなら処理しない
			if ( $( this ).hasClass( 'disabled' ) )
			{
				return;
			}

			ListMake();
		} );

		// リスト部作成処理
		ListMake();
	};

	////////////////////////////////////////////////////////////
	// 終了処理
	////////////////////////////////////////////////////////////
	this.stop = function() {
	};
}
