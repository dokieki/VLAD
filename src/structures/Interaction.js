module.exports = class Interaction {
	constructor(client, data) {
		this.client = client;
		this.id = data.id;
		this.token = data.token;
		this.custom_id = data.data.custom_id;
		this.data = data.data;
		this.values = data.data?.values;

		this.followed = false;
	}

	async createFollowupMessage(data, type = 6) {
		this.followed = true;

		this.createResponse(type, {});

		return this.client.api.webhooks[this.client.user.id][this.token]({
			method: 'POST',
			query: {
				wait: true
			},
			body: {
				...data
			}
		});
	}

	edit(body) {
		return this.client.api.webhooks[this.client.user.id][this.token].messages['@original']({
			method: 'PATCH',
			body
		});		
	}

	updateMessage(body) {
		return this.createResponse(6, body);
	}

	createResponse(type, body) {
		return this.client.api.interactions[this.id][this.token].callback({
			method: 'POST',
			body: {
				type,
				...body
			}
		});
	}
}