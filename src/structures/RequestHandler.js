const { fetch, log, Constants } = require('../util');
const { inspect } = require('util');

module.exports = function(token) {
	return new Proxy(function() {}, {
		get: function(target, prop, receiver) {
			if (!target.path) target.path = [prop];
			else target.path.push(prop);

			return receiver;
		},
		apply: async function(target, that, args) {
			const url = `https://${Constants.DISCORD_DOMAIN}/api/v${Constants.API_VERSION}/${target.path.join('/')}`; 
			
			target.path = [];

			const options = args[0] || {};
			const response = await fetch(url, {
				method: options.method || 'GET',
				headers: {
					Authorization: `Bot ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(options.body || {})
			});

			if (response.ok) log.ok(response.statusCode, url);
			else log.error(response.statusCode, url, '\n', inspect(response.json(), {showHidden: true, depth: null}));

			return response.json();
		}
	})
}