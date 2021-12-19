const ComponentCollector = require('./ComponentCollector');
const Components = require('./Components');

module.exports = class Pages {
	constructor(pages, startIndex = 0) {
		this.pages = pages;
		this.index = startIndex;
		this.components = new Components([
			new Components.Button(Components.emoji('◀️'), 'pages-back'),
			new Components.Button(Components.emoji('⏹️'), 'pages-stop'),
			new Components.Button(Components.emoji('▶️'), 'pages-next')
		]);
	}

	get data() {
		return typeof this.pages[this.index] == 'string'? {content: this.pages[this.index]}: {embeds: [this.pages[this.index].embed]};
	}

	get(index) {
		return this.pages[index];
	}

	add(data) {
		return this.pages.push(data);
	}

	goto(interaction, index) {
		if (index <= 0) {
			this.index = this.pages.length;
		} else if (index >= this.pages.length) {
			this.index = 0;
		} else {
			this.index = index;
		}
		
		return interaction.updateMessage(this.data);
	}

	start(client, message) {
		const collector = new ComponentCollector(client, message, this.components);
		collector.collect();

		collector.on('collect', (interaction) => {
			if (interaction.custom_id == 'pages-back') this.goto(interaction, this.index - 1);
			if (interaction.custom_id == 'pages-next') this.goto(interaction, this.index + 1);
			if (interaction.custom_id == 'pages-stop') {
				interaction.updateMessage({
					...this.data,
					components: []
				});

				return collector.stop();
			}

			collector.once('end', () => {
				return interaction.updateMessage({
					...this.data,
					components: []
				});
			});
		});
	}

	toMessage() {
		return {
			...this.data,
			...this.components
		}
	}
}