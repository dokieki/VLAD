const http = require('http');
const https = require('https');

const EventEmitter = require('events');
const WebSocket = require('ws');

module.exports = class Node extends EventEmitter {
    constructor(options) {
        super();

		this.host = options.host;
		this.port = options.port || 80;
		this.wsAddress = `ws://${this.host}:${this.port}`;
        this.address = `http${options.secure ? 's' : ''}://${this.host}:${this.port}`;
        this.password = options.password;
        this.user = options.user;
        this.shards = options.shards || 1;
        this.secure = options.secure;
        this.clientName = options.clientName;

        this.stats = null;
        this.ws = null;
    }

    request(path, options = {}) {
        let { method = 'GET', body = null, query = ''} = options;

        return new Promise((resolve, reject) => {
            query = new URLSearchParams(query);

            const request = (this.secure? https: http).request(`${this.address}${path}?${query}`, {
                method,
                headers: {
                    Authorization: this.password
                }
            }, res => {
                let text = '';

                res.on('data', chunk => text += chunk);
                res.once('end', () => {
                    return resolve({
                        json: JSON.parse(text) 
                    });
                });
            });

            request.once('error', reject);

            if (body) request.write(body);
            request.end();
        });
    }

    send(data) {
        return this.ws.send(JSON.stringify(data));
    }

    connect() {
        this.ws = new WebSocket(this.wsAddress, {
            headers: {
				'Authorization': this.password,
				'Num-Shards': this.shards,
                'Client-Name': this.clientName,
				'User-Id': this.user,
            }
        });

		this.ws.on('open', () => this.emit('ready'));
		this.ws.on('message', message => {
            const pkg = JSON.parse(message);

            if (pkg.op == 'stats') {
                this.stats = pkg;
                return;
            }

            if (pkg.op) this.emit(pkg.op, pkg);
        });
		this.ws.on('error', err => this.emit('error', err));
    }
}