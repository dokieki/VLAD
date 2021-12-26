module.exports = class Cache {
	constructor(client) {
		this.guilds = new Map();
		this.channels = new Map();

		client.on('GUILD_CREATE', data => this.guilds.set(data.id, data));
		client.on('CHANNEL_CREATE', data => this.guilds.set(data.id, data));
		
		client.on('GUILD_UPDATE', data => {
			this.guilds.set(data.id, {
				...this.guilds.get(data.id),
				...data
			});
		});

		client.on('CHANNEL_UPDATE', data => {
			this.channels.set(data.id, {
				...this.channels.get(data.id),
				...data
			});
		});

		client.on('CHANNEL_DELETE', data => this.channels.delete(data.id));
		client.on('GUILD_DELETE', data => this.channels.delete(data.id));
	}

	getGuildMember(guild, member) {
		return this.guilds.get(guild).members.filter(x => x.user.id == member)[0];
	}
}