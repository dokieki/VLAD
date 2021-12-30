const EventEmitter = require('events');
const ws = require('ws');

const Node = require('./Node');
const Player = require('./Player');

module.exports = class Andrey extends EventEmitter {
    constructor(options) {
        super();

        this.nodeOptions = {
            clientName: 'andrey',
            ...options
        };

        this.nodes = [];
        this.players = new Map();
        this.client = options.client;
    }

    createNode() {
        const node = new Node(this.nodeOptions);

        this.nodes.push(node);

        return this.nodes.length - 1;
    }

    createPlayer(guild, options) {
        if (this.players.get(guild)) return this.players.get(guild);

        const player = new Player(guild, {
            manager: this,
            ...options
        });

        this.players.set(guild, player);

        return player;
    }

    search(service, query) {
        return new Promise(async resolve => {
            const response = await this.nodes[0].request('/loadtracks', {
                query: {
                    identifier: `${service}search:${query}`
                } 
            });

            resolve(response.json);
        });
    }

    connect() {
        for (let node of this.nodes) node.connect();
        this.emit('ready');
    }
}