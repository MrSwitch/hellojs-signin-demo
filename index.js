// Demonstation of integration
var oauthshim = require('oauth-shim'),
	express = require('express'),
	session = require('express-session'),
	GoogleAuthService = require('passport-google-oauth').OAuth2Strategy;

// INSTALL
// Create a new file called "credentials.json", with a key value object literal {client_id => client_secret, ...}

// OAuth-Shim
// Configure OAuth-Shim with the credentials to use.
var creds = require('./credentials.json');

// Initiate the shim with Client ID's and secret, e.g.
oauthshim.init(creds);

// Passport Profile
// Configure PassportJS's Google service
var googleStrategy = null;
creds.forEach(function(cred) {
	if (cred.name === 'google') {
		googleStrategy = new GoogleAuthService({
			clientID: cred.client_id,
			clientSecret: cred.client_secret,
			callbackURL: 'https://notuser'
		}, function(){
			console.log(arguments);
			done();
		});
	}
});

// WebServer
// Set up the WebServer
var app = express();
app.use(session({
	secret: 'test',
	resave: false,
	saveUninitialized: true
}));

app.use(function(req, res, next) {
	if (!req.session) {
		req.session = {};
	}
	if (!req.session.connections) {
		req.session.connections = {};
	}
	next();
});

// Port?
var port = process.env.PORT || 8080;

// Set application to list on PORT
app.listen(port);

console.log('OAuth Shim listening on ' + port);

// Lets use Jade
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));

// Homepage
app.get('/', function (req, res) {

	// Session currently
	console.log(req.session);

	res.render('index', {connections: req.session.connections});
});

// '/redirect' is the path of the OAuth Shim
app.all('/redirect',

	// An incoming request will have an OAuth response like ?code=123
	// oauthshim.interpret will make the exchange for a token using this request
	oauthshim.interpret,

	// Capture the response AccessToken
	// Request got User Profile Data
	captureAuthentication,

	// [ignore for now] oauthshim.proxy is here to sign OAuth1 requests requests
	oauthshim.proxy,

	// oauthshim.redirect will redirect back to this page, but the parameters will now include the token in the location.
	oauthshim.redirect,

	// Finally an HTML page is displayed including HelloJS, which saves the token, amongst other things...
	function(req, res) {

		// Redirect to a page which contains HelloJS clientside script
		// To Store the credentials in the client
		// To Trigger any callbacks attached to the login
		res.render('redirect');
	}
);


// Was the login for this server
// auth-server maintains its own list of users
function captureAuthentication(req, res, next) {

	if (req.oauthshim && req.oauthshim.data && req.oauthshim.redirect) {

		var data = req.oauthshim.data;
		var opts = req.oauthshim.options;
		var redirect = req.oauthshim.redirect;

		// Was this an OAuth Login response and does it contain a new access_token?
		if ("access_token" in data && !("path" in opts)) {

			// Store this access_token
			console.log("Session created", data.access_token.substr(0,8) + '...' );

			// Make request for a User Profile
			googleStrategy.userProfile(data.access_token, function(err, resp) {

				// Attach to the session
				req.session.connections.google = resp;

				// Because the page has already returned, we'll explicitly call session.save();
				req.session.save(function(err) {
					// Print this user out to the console.
					console.log(req.session);
				});
			});
		}
	}

	next();
}
