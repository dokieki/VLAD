const EventEmitter = require('events');

const Components = require('./Components');
const Interaction = require('./Interaction');

module.exports = class ComponentCollector extends EventEmitter {
	constructor(client, message, components, options = {}) {
		super();

		this.client = client;
		this.message = message;

		this.components = components?.components.map(x => x.components).flat();
		this.filter = options.filter || ((data) => data);
		this.timeout = null;
		this.killed = false;
		this._timeout = options.timeout || 30 * 1000;
		this._callback = null;
	}

	collect() {
		this._callback = (data) => {
			if (data.message.id !== this.message.id) return;
			if (this.components.filter(x => x.custom_id === data.data.custom_id).length <= 0) return;
			if (!this.filter(data)) return;

			const interaction = new Interaction(this.client, data);

			this.emit('collect', interaction);
		}

		this.client.on('INTERACTION_CREATE', this._callback);

		this.timeout = setTimeout(() => this.stop, this._timeout);
	}

	update(components) {
		this.components = components.components.map(x => x.components).flat();
	}

	stop() {
		clearTimeout(this.timeout);
		
		this.killed = true;

		this.client.removeListener('INTERACTION_CREATE', this._callback);
		this.emit('end');	
	}
}