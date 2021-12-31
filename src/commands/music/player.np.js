const { Command, Embed } = require('../../structures');

const parseTime = (ms) => {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

module.exports = class PlayerNowPlaying extends Command {
    constructor() {
        super({
            name: 'player.np'
        });
    }

    async handler(client, responder, args) {
        const session = client.lava.players.get(responder.message.guild_id);
        
        if (!session) return responder.error('Я не в войсе');
        if (session.queue.length <= 0) return responder.error('Очередь пуста');

        const track = session.queue[session.queue.current].info;
        const progress = Math.floor(((session.position * 100) / session.total) / 4);
        const progressBar = `${'▰'.repeat(progress)}${'▱'.repeat(25 - progress)}`;
        const embed = new Embed({
            title: track.title,
            description: `${progressBar}\n\`${parseTime(session.position)}\` - \`${parseTime(session.total)}\``,
            thumbnail: {
                url: `https://img.youtube.com/vi/${track.identifier}/maxresdefault.jpg`
            }
        });

        embed.addField('Фильтры', session.filtersName.map(x => `\`${x}\``).join('\n') || 'Пусто :(');

        responder.send(embed);
    }
}