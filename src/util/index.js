const http = require('http');
const https = require('https');
const querystring = require('querystring');
const util = require('util');

class Response {

    constructor({ resp, headers, respStatus, respCode } = options) {
        this.raw = resp;
        this.headers = new Map(Object.entries(headers));
        this.status = respStatus;
        this.statusCode = respCode;
        this.ok = this.statusCode >= 200 && this.statusCode < 400;
    }

    json() {
        try {
        	return JSON.parse(this.raw);
        } catch(e) {
        	return null;
        }
    }
}

function fetch(url, options = {}) {
	const { method = 'GET', body = null, headers = {}, query = {} } = options;

	return new Promise((resolve, reject) => {
		const module = url.startsWith('http:') ? http : https;
		const qs = Object.keys(query).length ? querystring.stringify(query) : null;

		const request = module.request(url + (qs ? `?${qs}` : ''), {
			method,
			headers
		}, (res) => {
			let respText = '';

			res.on('data', chunk => respText += chunk);
			res.once('end', () => {
				resolve(new Response({
					resp: respText,
					headers: res.headers,
					respStatus: res.statusMessage,
					respCode: res.statusCode
				}));
			});
		});

		request.once('error', reject);

		if (body) request.write(body);
		request.end();
	});
}

const colors = {
	reset: '\033[0m',
	red: '\033[0;31m',
	green: '\033[0;32m',
	yellow: '\033[0;33m',
	purple: '\033[0;35m'
}

const colorize = (color, text) => `${colors[color]}${text}${colors.reset}`;

module.exports = {
	Constants: require('./Constants'),
	log: {
		ok: (...args) => util.log(colorize('green', 'OK'), ...args),
		error: (...args) => util.log(colorize('red', 'ERROR'), ...args),
		warn: (...args) => util.log(colorize('yellow', 'WARN'), ...args),
		info: (...args) => util.log(colorize('purple', 'INFO'), ...args)
	},
	fetch
}