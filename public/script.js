
// Initiate the HelloJS
hello.init({
	google: '656984324806-sr0q9vq78tlna4hvhlmcgp2bs2ut8uj8.apps.googleusercontent.com'
}, {
	// Define this as the registered callback address
	redirect_uri: 'redirect',

	// Set this to always relay requests via the server
	response_type: 'code'
});


function login(network) {

	//
	var hi = hello(network);

	// Login
	hi.login()
	.then(function() {
		return hi.api('me');
	})
	.then(function(resp) {

		// Create a profile image
		var div = document.querySelector("." + network);

		// Append Image
		var img = create('img', {'src': resp.thumbnail});
		div.appendChild(img);

		// Append information to refresh the page to have the name showup
		var a = create('a', {'href': "./"});
		a.innerHTML = "Reload page to see this in the session";
		div.appendChild(a);
	});
}

function create(tag, attr) {

	var d = document.createElement(tag);

	for (var x in attr) {
		d[x] = attr[x];
	}

	return d;
}
