const Components = require('./Components');

module.exports = class Pages {
	constructor(pages = [], options = {}) {
		this.pages = pages || [];
		this.page = options.page || 0;
		this.components = new Components([
			new Components.Button(Components.emoji('◀️'), 'pages-back'),
			new Components.Button(Components.emoji('⏹️'), 'pages-stop'),
			new Components.Button(Components.emoji('▶️'), 'pages-next')
		]);
		this.collector = options.collector;
		this.generator = options.generator;
		this.responder = options.responder;

		this.limit = false;
	}

	get data() {
		return {embeds: [this.pages[this.page].embed]};
	}

	add(data) {
		return this.pages.push(data);
	}

	async init(interaction) {
		if (!interaction.followed) await interaction.createFollowupMessage();

		this.interaction = interaction;

		const ret = await this.generator(this);
		
		this.add(ret);

		this.collector.update(this.components);

		await interaction.edit({
			...this.data,
			...this.components
		});
	}

	async goto(interaction, page) {
		if (page <= 0) {
			this.page = 0;
		} else if (page >= this.pages.length - 1) {
			if (this.generator && !this.limit) {
				this.page += 1;

				if (this.pages[this.page]) return interaction.edit(this.data);

				const ret = await this.generator(this);

				if (!ret) {
					this.limit = true;
					this.page = 0;
					return interaction.edit(this.data);
				}

				this.add(ret);
			} else this.page = 0;
		} else {
			this.page = page;
		}

		return interaction.edit(this.data);
	}

	async start(interaction = null) {
		if (interaction) {
			await this.init(interaction);
		} else if (this.responder) {
			const [ reply ] = await this.responder.send(this.pages[0], {
				components: this.components
			});

			this.collector = reply.collector;
			this.collector.collect();
		}

		this.collector.on('collect', async interaction => {
			if (!this.interaction) {
				await interaction.createFollowupMessage();
				this.interaction = interaction;
			}
			if (interaction.custom_id == 'pages-back') {
				interaction.createResponse(6, {});
				await this.goto(this.interaction, this.page - 1);
			}
			if (interaction.custom_id == 'pages-next') {
				interaction.createResponse(6, {});
				await this.goto(this.interaction, this.page + 1);
			}
			if (interaction.custom_id == 'pages-stop') {
				interaction.edit({
					...this.data,
					components: []
				});

				return this.collector.stop();
			}

			this.collector.once('end', () => {
				return interaction.edit({
					...this.data,
					components: []
				});
			});
		});
	}
}