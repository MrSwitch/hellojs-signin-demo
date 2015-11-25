require('dotenv').load();

module.exports = [
	{
		"name": "github",
		"domain": "localhost hellojs-signin-demo.herokuapp.com",
		"client_id": process.env.GITHUB_ID,
		"client_secret": process.env.GITHUB_SECRET,
		"grant_url": "https://github.com/login/oauth/access_token"
	},
	{
		"name": "google",
		"domain": "localhost hellojs-signin-demo.herokuapp.com",
		"client_id": process.env.GOOGLE_ID,
		"client_secret": process.env.GOOGLE_SECRET,
		"grant_url": "https://accounts.google.com/o/oauth2/token"
	},
	{
		"name": "twitter",
		"domain": "localhost hellojs-signin-demo.herokuapp.com",
		"client_id": process.env.TWITTER_ID,
		"client_secret": process.env.TWITTER_SECRET,
		"grant_url": "https://api.twitter.com/oauth/access_token"
	},
	{
		"name": "windows",
		"domain": "local.knarly.com hellojs-signin-demo.herokuapp.com",
		"client_id": process.env.WINDOWS_ID,
		"client_secret": process.env.WINDOWS_SECRET,
		"grant_url": "https://login.live.com/oauth20_token.srf"
	}
];
