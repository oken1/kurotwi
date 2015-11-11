{
	"manifest_version": 2,
	"name": "KuroTwi",
	"version": "1.7.3",
	"description": "__MSG_manifest_description__",
	"default_locale": "en",
	"content_security_policy": "script-src 'self'; object-src 'self';",
	"update_url": "http://www.jstwi.com/kurotwi/update_app.xml",

	"minimum_chrome_version": "20.0",

	"app": {
		"launch": {
			"local_path": "index.html"
		}
	},

	"icons": {
		"16": "images/icon128.png",
		"32": "images/icon128.png",
		"48": "images/icon128.png",
		"128": "images/icon128.png"
	},

	"background" : {
		"scripts": ["js/lib/jquery.js", "js/lib/oauth.js", "js/lib/sha1.js", "js/util.js", "js/background.js"]
	},

	"sandbox": {
		"pages": [ "map.sandbox.html", "feed.sandbox.html" ]
	},

	"permissions": [
		"notifications",
		"tabs",
		"http://*/*",
		"https://*/*"
	]
}
