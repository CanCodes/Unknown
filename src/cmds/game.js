const baseCmd = require("../structures/baseCmd.js")
const Game = require("../structures/game.js")

const MIN_PLAYERS = 4;

class gameCmd extends baseCmd {
    constructor() {
        super({
            name: `Game Command`,
            usage: `game <>`,
            info: `Shows how game command works.`,
            permLevel: 0,
            aliases: ["g"]
        })
    }
    async execute(client, message, args) {
        if(!args[0]) return;
        switch(args[0].toLowerCase()) {
            case "c": case"create":
                newGame = new Game(message.author.id, [message.author.id]);
                Game.games.set(message.author.id, newGame);
                message.channel.send(`:ok_hand: Succesfully created a lobby with the ID: \`${message.author.id}\`  (*The lobby is currently invite-only!*)`);
            break;
            case "p": case "public":
                if (!Game.games.get(message.author.id)) return //not
                Game.games.get(message.author.id).private = true;
                message.channel.send(`:ok_hand: Succesfully set the game to public!`)
            
        }

    }
}

module.exports = gameCmd;
