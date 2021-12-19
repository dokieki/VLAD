const EventEmitter = require('events');

const Components = require('./Components');

module.exports = class ComponentCollector extends EventEmitter {

	#client;
	#message;
	constructor(client, message, components, options = {}) {
		super();

		this.#client = client;
		this.#message = message;

		this.components = components.components.map(x => x.components).flat();
		this.filter = options.fillter || (() => true);
		this._timeout = options.timeout || 30 * 1000;
		this._callback = null;
	}

	collect() {
		this._callback = (data) => {
			if (data.message.id !== this.#message.id) return;
			if (this.components.filter(x => x.custom_id === data.data.custom_id).length <= 0) return;
			if (!this.filter(data)) return;

			data.data.updateMessage = (msg, type = 7) => {
				this._timeout += 7000;

				return this.#client.createInteractionResponse(type, data.id, data.token, msg);
			}

			this.emit('collect', data.data);
		}

		this.#client.on('INTERACTION_CREATE', this._callback);

		this.timeout = setTimeout(() => {
			this.#client.removeListener('INTERACTION_CREATE', this._callback);
			this.emit('end');
		}, this._timeout);
	}

	stop() {
		this.#client.removeListener('INTERACTION_CREATE', this._callback);
		this.emit('end');	
	}
}