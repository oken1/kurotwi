"use strict";

////////////////////////////////////////////////////////////////////////////////
// ユニークID発行
////////////////////////////////////////////////////////////////////////////////
function GetUniqueID()
{
	var rnd = Math.floor( Math.random() * 10000 );
	var cur = new Date();
	var p = Date.parse( cur );
	p += cur.getMilliseconds();

	return rnd + p.toString();
}

////////////////////////////////////////////////////////////////////////////////
// 日付変換
// type = 0 : 絶対時間
//        1 : 相対時間(過去)
//        2 : 相対時間(未来)
//        3 : 絶対時間(1年以内の場合は年省略、同日の場合は月日も省略)
////////////////////////////////////////////////////////////////////////////////
function DateConv( src, type, digit )
{
	var time = Date.parse( src.replace( '+', 'GMT+' ) );
	var date = new Date();

	digit = digit || 4;

	if ( type == 0 || type == 3 )
	{
		date.setTime( time );
		var yyyy = ( "0000" + date.getFullYear() ).slice( -1 * digit ) + "/";
		var mmdd = ( "00" + ( date.getMonth() + 1 ) ).slice( -2 ) + "/" + ( "00" + date.getDate() ).slice( -2 ) + " ";

		if ( type == 3 )
		{
			var curdate = new Date();

			if ( Math.floor( ( curdate - date ) / 1000 ) < 60 * 60 * 24 * 365 )
			{
				yyyy = '';


				if ( curdate.getMonth() == date.getMonth() && curdate.getDate() == date.getDate() &&
					 curdate.getFullYear() == date.getFullYear() )
				{
					mmdd = '';
				}
			}
		}

		return yyyy + mmdd +
				( "00" + date.getHours() ).slice( -2 ) + ":" +
				( "00" + date.getMinutes() ).slice( -2 ) + ":" +
				( "00" + date.getSeconds() ).slice( -2 );
	}
	else
	{
		date.setTime( time );

		var curdate = new Date();
		var relt;

		if ( type == 1 )
		{
			relt = Math.floor( ( curdate - date ) / 1000 );
		}
		else
		{
			relt = Math.floor( ( date - curdate ) / 1000 );
		}

		if ( relt < 0 )
		{
			return '0' + i18nGetMessage( 'i18n_0270' );
		}
		else if ( relt < 60 )
		{
			return relt + i18nGetMessage( 'i18n_0270' );
		}
		else if ( relt < 60 * 60 )
		{
			return Math.floor( relt / 60 ) + i18nGetMessage( 'i18n_0272' );
		}
		else if ( relt < 60 * 60 * 24 )
		{
			return Math.floor( relt / 60 / 60 ) + i18nGetMessage( 'i18n_0299' );
		}
		else
		{
			return DateConv( src, 0, 4 );
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// 日時をyyyy/mm/dd hh:mm:ss形式で返す
////////////////////////////////////////////////////////////////////////////////
function DateYYYYMMDD( msec, digit )
{
	var date;

	if ( msec )
	{
		date = new Date( msec );
	}
	else
	{
		date = new Date();
	}

	return ( "0000" + date.getFullYear() ).slice( -1 * digit ) + "/" +
			( "00" + ( date.getMonth() + 1 ) ).slice( -2 ) + "/" +
			( "00" + date.getDate() ).slice( -2 ) + " " +
			( "00" + date.getHours() ).slice( -2 ) + ":" +
			( "00" + date.getMinutes() ).slice( -2 ) + ":" +
			( "00" + date.getSeconds() ).slice( -2 ) ;
}

////////////////////////////////////////////////////////////////////////////////
// 日付の差
////////////////////////////////////////////////////////////////////////////////
function CompareDate(year1, month1, day1, year2, month2, day2)
{
	var dt1 = new Date(year1, month1 - 1, day1);
	var dt2 = new Date(year2, month2 - 1, day2);
	var diff = dt1 - dt2;
	var diffDay = diff / 86400000;//1日は86400000ミリ秒
	return diffDay;
}

////////////////////////////////////////////////////////////////////////////////
// テキストに含まれるURL、@ユーザ名、#ハッシュタグをリンク化
////////////////////////////////////////////////////////////////////////////////
function Txt2Link( text, entities )
{
	var repcnt = 0;
	var rep = new Array();

	// entitiesの指定あり
	if ( entities )
	{
		var map = {};

		// URL
		if ( entities.urls )
		{
			$.each( entities.urls, function( i, val ) {
				map[val.indices[0]] = {
					end: val.indices[1],
					func: function() {
						var url = ( val.expanded_url == null ) ? val.url : val.expanded_url;
						var durl = val.display_url;

						if ( url.match( /https?:\/\/ln\.is/ ) )
						{
							return "<span class='tooltip warning' tooltip='" + i18nGetMessage( 'i18n_0358' ) + "'>" + durl + "</span>";
						}
						else
						{
							return "<a href='" + url + "' class='url anchor' rel='nofollow noopener noreferrer' target='_blank'>" + durl + "</a>";
						}
					}
				};
			} );
		}

		// @user
		if ( entities.user_mentions )
		{
			$.each( entities.user_mentions, function( i, val ) {
				map[val.indices[0]] = {
					end: val.indices[1],
					func: function() {
						return "<span class='user anchor'>@" + val.screen_name + "</span>";
					}
				};
			} );
		}

		// #hashtag
		if ( entities.hashtags )
		{
			$.each( entities.hashtags, function( i, val ) {
				map[val.indices[0]] = {
					end: val.indices[1],
					func: function() {
						return "<span class='hashtag anchor'>#" + val.text + "</span>";
					}
				};
			} );
		}

		// media
		if ( entities.media )
		{
			var mediaurls = '';
			var videourls = '';
			var contenttypes = '';

			// 複数画像対応
			for ( var i = 0, _len = entities.media.length ; i < _len ; i++ )
			{
				if ( entities.media[i].type == 'photo' || entities.media[i].type == 'animated_gif' || entities.media[i].type == 'video' )
				{
					mediaurls += entities.media[i].media_url_https + ',';
				}

				if ( entities.media[i].type == 'animated_gif' || entities.media[i].type == 'video' )
				{
					var variant, maxrate = 0;

					for ( var j = 0, __len = entities.media[i].video_info.variants.length ; j < __len ; j++ )
					{
						if ( entities.media[i].video_info.variants[j].content_type == 'video/mp4' )
						{
							if ( entities.media[i].video_info.variants[j].bitrate >= maxrate )
							{
								maxrate = entities.media[i].video_info.variants[j].bitrate;
								variant = entities.media[i].video_info.variants[j];
							}
						}
					}

					videourls += variant.url + ',';
					contenttypes += variant.content_type + ',';
				}
				else
				{
					videourls += ',';
					contenttypes += ',';
				}
			}

			mediaurls = mediaurls.replace( /,$/, '' );
			videourls = videourls.replace( /,$/, '' );
			contenttypes = contenttypes.replace( /,$/, '' );

			$.each( entities.media, function( i, val ) {
				map[val.indices[0]] = {
					end: val.indices[1],
					func: function() {
						switch ( val.type )
						{
							// 画像
							case 'photo':
							case 'animated_gif':
							case 'video':
								return "<a href='" + val.expanded_url + "' class='url anchor' mediaurl='" + mediaurls + "' mediatype='" + val.type + "' videourl='" +
									videourls + "' contenttype='" + contenttypes + "'>" + val.display_url + "</a>";
								break;
						}
					}
				};
			} );
		}

		var res = '';
		var last = 0;

		for ( var i = 0, _len = text.length ; i < _len ; ++i )
		{
			if ( map[i] )
			{
				if ( i > last )
				{
					res += uc_substring( text, last, i );
				}

				res += map[i].func();
				last = map[i].end;
				i = map[i].end - 1;
			}
		}

		if ( i > last )
		{
			res += uc_substring( text, last, i );
		}

		return res;
	}

	// URL
	var urls = text.match( /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g );
	var durl;

	// '
	if ( urls )
	{
		for ( var i = 0, _len = urls.length ; i < _len ; i++ )
		{
			text = text.replace( urls[i], '__REP' + repcnt + '__' );

			try {
				durl = escapeHTML( decodeURI( urls[i] ) );
			}
			catch ( e )
			{
				console.log( 'decode error [' + urls[i] + ']' );
				durl = urls[i];
			}

			rep.push( {
				cnt: repcnt++,
				repstr: "<a href='" + urls[i] + "' class='url anchor' rel='nofollow noopener noreferrer' target='_blank'>" + durl + "</a>"
			} );
		}
	}

	// @ユーザ名
	var users = text.match( /@[0-9a-zA-Z_]+/g );

	if ( users )
	{
		for ( var i = 0, _len = users.length ; i < _len ; i++ )
		{
			text = text.replace( users[i], '__REP' + repcnt + '__' );
			rep.push( {
				cnt: repcnt++,
				repstr: "<span class='user anchor'>" + users[i] + "</span>"
			} );
		}
	}

	// #ハッシュタグ
	var tags = text.match( /([,.!?　、。！？「」]|\s|^)[#＃]([^\s「」。、!"#\$%&'\(\)=\-~\^\\@`\[\{;\+\*:\]\}<,>\.\?\/]+)/g );

	// "
	if ( tags )
	{
		for ( var i = 0, _len = tags.length ; i < _len ; i++ )
		{
			text = text.replace( tags[i], '__REP' + repcnt + '__' );

			tags[i].match( /([,.!?　、。！？「」]|\s|^)[#＃]([^\s「」。、!"#\$%&'\(\)=\-~\^\\@`\[\{;\+\*:\]\}<,>\.\?\/]+)/ );

			// "
			rep.push( {
				cnt: repcnt++,
				repstr: RegExp.$1 + "<span class='hashtag anchor'>#" + RegExp.$2 + "</span>"
			} );
		}
	}

	for ( var i = 0, _len = rep.length ; i < _len ; i++ )
	{
		text = text.replace( '__REP' + rep[i].cnt + '__', rep[i].repstr );
	}

	return text;
}

////////////////////////////////////////////////////////////////////////////////
// テキストからURLを抽出
////////////////////////////////////////////////////////////////////////////////
function GetURL( text )
{
	var urls = text.match( /(https?:\/\/){1}([-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]{1,})/g );

	// '
	return urls;
}

////////////////////////////////////////////////////////////////////////////////
// 数値に3桁ごとにカンマ
////////////////////////////////////////////////////////////////////////////////
function NumFormat( num )
{
	if ( num == null ) return "";

	return num.toString().replace( /([0-9]+?)(?=(?:[0-9]{3})+$)/g , '$1,' );
}

////////////////////////////////////////////////////////////////////////////////
// localStorage取得
////////////////////////////////////////////////////////////////////////////////
function getUserInfo( key )
{
	if ( localStorage[key] )
	{
		return localStorage[key];
	}
	else
	{
		return "";
	}
}

////////////////////////////////////////////////////////////////////////////////
// localStorage設定
////////////////////////////////////////////////////////////////////////////////
function setUserInfo( key, val )
{
	localStorage[key] = val;
}

////////////////////////////////////////////////////////////////////////////////
// localStorage消去
////////////////////////////////////////////////////////////////////////////////
function clearUserInfo( key )
{
	localStorage.removeItem( key );
}

////////////////////////////////////////////////////////////////////////////////
// 短縮URLかチェック
////////////////////////////////////////////////////////////////////////////////
function isShortURL( url )
{
	if ( url.match( /^https?:\/\/(bit\.ly|j\.mp)/ ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}

////////////////////////////////////////////////////////////////////////////////
// 画像URLかチェック
////////////////////////////////////////////////////////////////////////////////
function isImageURL( url )
{
	if ( url.match( /^https?:\/\/(((www\.)?instagram\.com|instagr\.am)\/p\/([\w\-]+)|twitter\.com.*\/(photo|video)\/1$|twitter\.com.*\/messages\/media\/\d+|(?:(www|m)\.youtube\.com\/watch\?.*v=|youtu\.be\/)([\w-]+)|(www\.nicovideo\.jp\/watch|nico\.ms)\/\w+|.*\.(png|jpg|jpeg|gif)$)/i ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}

////////////////////////////////////////////////////////////////////////////////
// htmlエスケープ
////////////////////////////////////////////////////////////////////////////////
function escapeHTML( _strTarget )
{
	var div = document.createElement('div');
	var text =  document.createTextNode('');
	div.appendChild(text);
	text.data = _strTarget;

	var ret = div.innerHTML;
	ret = ret.replace( /\"/g, '&quot;' );	// "
	ret = ret.replace( /\'/g, '&#39;' );	// '

	return ret;
}

////////////////////////////////////////////////////////////////////////////////
// 絵文字対応substring
////////////////////////////////////////////////////////////////////////////////
function uc_substring( string, start, end )
{
	var accumulator = "";
	var character;
	var stringIndex = 0;
	var unicodeIndex = 0;
	var length = string.length;

	while ( stringIndex < length )
	{
		character = uc_charAt( string, stringIndex );

		if ( unicodeIndex >= start && unicodeIndex < end )
		{
			accumulator += character;
		}

		stringIndex += character.length;
		unicodeIndex += 1;
	}

	return accumulator;
}

function uc_charAt( string, index ) {
	var first = string.charCodeAt( index );
	var second;

	if ( first >= 0xD800 && first <= 0xDBFF && string.length > index + 1 )
	{
		second = string.charCodeAt( index + 1 );

		if ( second >= 0xDC00 && second <= 0xDFFF )
		{
			return string.substring( index, index + 2 );
		}
	}

	return string[index];
}

////////////////////////////////////////////////////////////////////////////////
// '#rrggbb'から'hsl(h,s,l)'に変換(明るさ指定)
////////////////////////////////////////////////////////////////////////////////
function HSLConvert( col, ll )
{
	var r, g, b;
	var max, min;
	var h, s, l;

	r = parseInt( col.substr( 1, 2 ), 16 ) / 255;
	g = parseInt( col.substr( 3, 2 ), 16 ) / 255;
	b = parseInt( col.substr( 5, 2 ), 16 ) / 255;

	max = Math.max( r, g, b );
	min = Math.min( r, g, b );

	l = ( max + min ) / 2 * ll;

	if ( max == min )
	{
		h = s = 0;
	}
	else
	{
		var d = max - min;
		s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );

		switch( max )
		{
			case r: h = ( g - b ) / d + ( g < b ? 6 : 0 ); break;
			case g: h = ( b - r ) / d + 2; break;
			case b: h = ( r - g ) / d + 4; break;
		}

		h /= 6;
	}

	return 'hsl( ' + h * 360 + ',' + s * 100 + '%,' + l * 100 + '% )';
}
