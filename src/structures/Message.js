module.exports = class Message {
	constructor(client, data) {
		this.client = client;

		this.id = data.id;
		this.channel_id = data.channel_id;
		this.author = data.author;
		this.type = data.type;
		this.content = data.content;
		this.attachments = data.attachments;
		this.embeds = data.embeds;
		this.mentions = data.mentions;
		this.mention_roles = data.mention_roles,
		this.pinned = data.pinned;
		this.mention_everyone = data.mention_everyone;
		this.tts = data.tts;
		this.timestamp = data.timestamp;
		this.edited_timestamp = data.edited_timestamp;
		this.flags = data.flags;
		this.components = data.components;
		this.referenced_message = data.referenced_message;
	}

	edit(body) {
		return this.client.api.channels[this.channel_id].messages[this.id]({
			method: 'PATCH',
			body
		});
	}

	delete() {
		return this.client.api.channels[this.channel_id].messages[this.id]({
			method: 'DELETE'
		});
	}
}