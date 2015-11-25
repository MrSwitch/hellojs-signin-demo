// Demonstation of integration
var oauthshim = require('oauth-shim'),
	express = require('express'),
	session = require('express-session');

var AuthServices = {
	github: [2, require('passport-github').Strategy],
	google: [2, require('passport-google-oauth').OAuth2Strategy],
	linkedin: [1, require('passport-linkedin').Strategy],
	twitter: [1, require('passport-twitter').Strategy],
	windows: [2, require('passport-windowslive').Strategy],
	yahoo: [1, require('passport-yahoo-oauth').Strategy]
}

// INSTALL
// Create a new file called "credentials.json", with a key value object literal {client_id => client_secret, ...}

// OAuth-Shim
// Configure OAuth-Shim with the credentials to use.
var creds = require('./credentials.js');

// Initiate the shim with Client ID's and secret, e.g.
oauthshim.init(creds);

// Passport Profile
// Configure PassportJS's Google service
var strategies = {};
creds.forEach(function(cred) {

	var network = cred.name;
	var service = AuthServices[network];

	if (!service) {
		throw "Could not find Auth Service for " + network;
	}

	var service_oauth_version = service[0];
	var constructor = service[1];

	if (service_oauth_version === 2) {
		strategies[network] = new constructor({
			clientID: cred.client_id,
			clientSecret: cred.client_secret,
			callbackURL: 'https://blank'
		}, function() {
			console.log(arguments);
			done();
		});
	}
	else if (service_oauth_version === 1) {
		strategies[network] = new constructor({
			consumerKey: cred.client_id,
			consumerSecret: cred.client_secret,
			callbackURL: 'https://blank'
		}, function() {
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

// Convert credentials into client_ids for HelloJS
var client_ids = {};
creds.forEach(function(cred) {
	client_ids[cred.name] = cred.client_id;
});

// Homepage
app.get('/', function (req, res) {

	// Session currently
	console.log(req.session);

	// Expose connections and credentials.
	res.render('index', {
		client_ids: client_ids,
		connections: req.session.connections
	});
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

			// Data
			console.log(data);

			// What is the network name
			var network = toJSON(data.state).network;

			// Is this an OAuth1 requesst
			var a = data.access_token.split(/[\:\@]/);

			// Make request for a User Profile
			if (a.length > 1) {

				console.log(a);
				console.log(network);

				data.oauth_token = a[0];
				data.oauth_token_secret = a[1];

				strategies[network].userProfile(data.oauth_token, data.oauth_token_secret, data, setSession.bind(null, req, network));
			}

			else {
				strategies[network].userProfile(data.access_token, setSession.bind(null, req, network));
			}

		}
	}

	next();
}


function toJSON(str) {
	try{
		return JSON.parse(str);
	}
	catch(e) {
		return {};
	}
}

function setSession(req, network, err, resp) {

	if (err) {
		console.log(err);
	}

	// Attach to the session
	req.session.connections[network] = resp;

	// Because the page has already returned, we'll explicitly call session.save();
	req.session.save(function(err) {
		// Print this user out to the console.
		console.log(req.session);
	});
}
