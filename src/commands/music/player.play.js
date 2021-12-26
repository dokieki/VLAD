const { Command } = require('../../structures');

module.exports = class MusicPlayerPlay extends Command {
    constructor() {
        super({
            name: 'player.play',
            admin: true
        });
    }

    async handler(client, responder, args) {
        if (!client.voiceSessions.get('703581952090832976')) return responder.error('Ч надо .');

        client.voiceSessions.get('703581952090832976').play();
    }
}