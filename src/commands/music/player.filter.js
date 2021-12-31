const {
    Command,
    Lavalink: {
        Constants
    }
} = require('../../structures');

module.exports = class PlayerFilter extends Command {
    constructor() {
        super({
            name: 'player.filter',
            args: [
                {name: 'filter', required: true}
            ]
        });
    }

    handler(client, responder, args) {
        const session = client.lava.players.get(responder.message.guild_id);

        if (!session) return responder.error('Я не в войсе');
        
        if (!Constants.Filters[args.filter]) return responder.error(`Доступные фильтры: ${Object.keys(Constants.Filters).map(x => `\`${x}\``).join(' ')}`);
        if (args.filter == 'reset') {
            session.setFilter(args.filter);
            return responder.send(`${session.filtersName.map(x => `- \`${x}\``).join('\n')}`)
        }

        session.setFilter(args.filter);
        responder.send(`+ \`${args.filter}\``);
    }
}