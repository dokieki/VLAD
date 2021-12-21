const { Constants } = require('../util');

class Components {
	constructor(components) {
		this.components = [{
			type: Constants.COMPONENT_TYPES.ACTION_ROW,
			components: components
		}];
	}
}

Components.Button = class Button {
	constructor(name, id, style = 1, disabled = false) {
		this.type = Constants.COMPONENT_TYPES.BUTTON
		this.style = style;
		this.custom_id = id;
		this.label = typeof name == 'object'? null: name;
		this.disabled = disabled;
		this.emoji = typeof name == 'object'? name: null 
	}
}

Components.SelectMenu = class SelectMenu {
	constructor(placeholder, id, options) {
		this.type = Constants.COMPONENT_TYPES.SELECT_MENU,
		this.placeholder = placeholder;
		this.custom_id = id;

		this.options = options;
	}

	addOption(label, value) {
		this.options.push({
			label,
			value
		})
	}
}

Components.emoji = (name) => ({id: null, name});

module.exports = Components;