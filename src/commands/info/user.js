const { Command, Embed } = require('../../structures');

module.exports = class User extends Command {
    constructor() {
        super({
            name: 'user',
            args: [
                {name: 'user'}
            ]
        });
    }

    async handler(client, responder, args) {
        const user = await client.api.users[args.user]();

        if (!user) return responder.error('Такого нет');

        console.log(user);
    
        const embed = new Embed({
            title: 'dasdad'
        });
        
        responder.send(embed);
    }
}