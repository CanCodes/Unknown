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
                if (client.games.get(message.author.id)) return message.channel.send("You already have a game running!")
                var newGame = new Game(message.author.id, [message.author.id], message.guild);
                client.games.set(message.author.id, newGame);
                message.channel.send(`:ok_hand: Succesfully created a lobby with the ID: \`${message.author.id}\`  (*The lobby is currently invite-only!*)`);
            break;
            case "del": case "delete":
                
            break;
            case "p": case "public":
                if (!client.games.get(message.author.id)) return //not
                client.games.get(message.author.id).private = false;
                message.channel.send(`:ok_hand: Succesfully set the game to public!`)
            break;
            case "s": case"start":
                    if (!client.games.get(message.author.id)) return //not
                await client.games.get(message.author.id).startGame().catch(err => {
                    if(!err) return
                    if(err === "RULE_TWO"){
                        return message.channel.send("error") //not
                    } else {
                        console.log(err)
                    }
                })
                message.channel.send(`Succesfully started the game.`) //not
            break;
            case "j": case "join":
                if(!client.games.get(args[1])) return //not
                if (client.games.get(args[1]).private) return message.channel.send("The game is invite-only!")
                let res = await client.games.get(args[1]).addNewPlayer(message.author.id);
                if (typeof res != "boolean") {
                    return console.log(res)
                } else {
                    message.channel.send(`You successfully joined the game ${message.author.tag}! ${client.games.get(args[1]).players.length}/16`)
                }
            break;
            case"k": case"kick":
                if(!client.games.get(message.author.id)) return //not
                if (!args[1]) return //not
                let kickMember = message.guild.mentions.members.first() || message.guild.members.get(args[1])
                if(!kickMember) return //not
                client.games.get(message.author.id).removePlayer(kickMember.id).then(res => {

                })
        }

    }
}

module.exports = gameCmd;