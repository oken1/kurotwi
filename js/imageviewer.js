var imageviewer = {
	current: 0,
	urls: '',
	scrollbar_original: {},
	element: null,
	
	// カレント表示を変更
	changeCurrent: function( index ) {
		this.current = index;

		this.element.find( '.thumbnail' ).removeClass( 'current' ).eq( index ).addClass( 'current' )
		this.element.find( '.current' ).attr( 'src', this.urls[this.current] )
	},

	// キー押下イベント
	keyDown: function( e ) {
		switch ( e.keyCode ) {
			case 27: // ESC
				this.close()
				break
			case 37: // ←
				this.changeCurrent( ( this.current > 0 ) ? this.current - 1 : this.urls.length - 1 )
				break
			case 39: // →
				this.changeCurrent( ( this.current < this.urls.length - 1 ) ? this.current + 1 : 0 )
				break
			default:
				break
		}
	},

	// 描画
	render: function() {
		const _iv = this
		let thumbnails = ''

		this.urls.map( ( value, index ) => {
			thumbnails += '<img class="thumbnail" src="' + value + '">'
		} )

		this.element.html(
			'<div><img class="current"></div>' +
			'<div class="thumbnails">' + thumbnails + '</div>'
		)

		this.element.find( '.thumbnail' ).on( 'click', function( e ) {
			_iv.changeCurrent( _iv.element.find( '.thumbnail' ).index( this ) )
			e.stopPropagation()
		} )
	},

	// 画像ビューアを閉じる
	close: function() {
		this.element.off( 'click keydown wheel' ).html( '' ).hide()
	
		$( 'body' ).css( {
			'overflow-x': this.scrollbar_original.x,
			'overflow-y': this.scrollbar_original.y
		} )
	},

	// 画像ビューアを開く
	open: function( element, urls, index ) {
		const _iv = this

		this.element = element
		this.scrollbar_original = { x: $( 'body' ).css( 'overflow-x' ), y: $( 'body' ).css( 'overflow-y' ) }

		$( 'body' ).css( {
			'overflow-x': 'hidden',
			'overflow-y': 'hidden'
		} );
	
		this.element
			.html( '' )
			.attr( 'tabIndex', 0 )
			.show()
			.on( 'click', function() { _iv.close() } )
			.on( 'keydown', function( e ) { _iv.keyDown( e ) } )
			.on( 'wheel', function( e ) {
				if ( e.originalEvent.deltaY < 0 ) {
					_iv.changeCurrent( ( _iv.current > 0 ) ? _iv.current - 1 : _iv.urls.length - 1 )
				} else {
					_iv.changeCurrent( ( _iv.current < _iv.urls.length - 1 ) ? _iv.current + 1 : 0 )
				}
			} )
			.focus()
		
		this.urls = urls
		this.render()

		this.changeCurrent( index )
	}
}
