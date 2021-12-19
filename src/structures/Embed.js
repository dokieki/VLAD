module.exports = class Embed {
	constructor(embed = {fields: []}) {
		if (!embed.fields) embed.fields = [];
		this.embed = embed;
	}

	setType(content) {
		this.embed.type = content;
		return this;
	}

	setTitle(content) {
		this.embed.title = content;
		return this;
	}

	setDescription(content) {
		this.embed.description = content;
		return this;
	}

	setColor(content) {
		this.embed.color = Number(typeof content == 'number'? content: content.startsWith('0x')? content: '0x' + content.replace('#', ''));
		return this;
	}

	setTimestamp(content) {
		this.embed.timestamp = content;
		return this;
	}

	setImage(content, opts = {}) {
		this.embed.image = {
			url: content,
			proxy_url: opts.proxy_url,
			height: opts.height,
			width: opts.width
		};
		return this;
	}

	setVideo(content, opts = {}) {
		this.embed.video = {
			url: content,
			height: opts.height || null,
			width: opts.width || null
		};
		return this;
	}

	setThumbnail(content, opts = {}) {
		this.embed.thumbnail = {
			url: content,
			proxy_url: opts.proxy_url || null,
			height: opts.height || null,
			width: opts.width || null
		};
		return this;
	}

	setProvider(name, url) {
		this.embed.provider = {
			name: name,
			url: url
		};

		return this;
	}

	addAuthor(content, opts = {}) {
		this.embed.author = {
			name: content,
			url: opts.url,
			proxy_url: opts.proxy_url,
			icon_url: opts.icon,
			proxy_icon_url: opts.proxy_icon_url
		};
		return this;
	}

	addFooter(content, opts = {}) {
		this.embed.footer = {
			text: content,
			icon_url: opts.icon || null,
			proxy_icon_url: opts.proxy_icon_url || null
		};
		return this
	}

	addField(title, value, inline = false) {
		if (this.embed.fields.length - 1 >= 25) return this;
        this.embed.fields.push({
			name: title.toString(),
			value: value?.toString(),
			inline: inline
		});
		return this;
	}
}