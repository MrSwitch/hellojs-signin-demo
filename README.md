# Hello Federated Login

This demonstrates federated authentication with [HelloJS](https://adodson.com/hello.js) libary in the client and [oauth-shim](https://github.com/MrSwitch/node-oauth-shim) on a node webserver to expose the Access Token to a back end for use in Federated Authentication.

The script binding this all together can be seen in [./index.js](./index.js) which intercepts the Access Token. And then using a PassportJS strategy such as [passport-google-oauth](https://github.com/jaredhanson/passport-google-oauth) makes an authorized request for the users Google profile information. In this demo the profile is merely store in session. Refresh the page to see the Users Profile name included in the document page.

## Install

	git clone [this repository] [path]
	cd [path]
	# Install dependencies
	npm install
	bower install

Create a `credentials.json` file. E.g...

	[
	   {
	   	name: "Identify service in App",
	   	client_id: 'abcKey',
	   	client_secret: 'abcSecret',
	   	grant_url: 'https://oauth2.grant.url/of_provider',
	   	domain: 'https://optional.callback.domain'
	   },
	   ...
	]

