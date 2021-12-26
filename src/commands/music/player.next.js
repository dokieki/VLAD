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

        const session = client.voiceSessions.get('703581952090832976');
        
        if (!session.get(session.current + 1)) return responder.error('TAKOGO NET');

        session.stop();
        session.play(session.current + 1);

        responder.send('ок ладно');
    }
}