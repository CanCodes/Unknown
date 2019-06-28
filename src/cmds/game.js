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
                if (client.games.get(message.author.id)) return message.channel.send("<:error:594175676429369345> An error occured: You already have a game running!")
                var newGame = new Game(message.author.id, [message.author.id], message.guild);
                client.games.set(message.author.id, newGame);
                message.channel.send(`:ok_hand: Succesfully created a lobby with the ID: \`${message.author.id}\` (*The lobby is currently invite-only! To make it public please type \`!game public\`*)`);
            break;
            case "del": case "delete":
            break;
            case "p": case "public":
                if (!client.games.get(message.author.id)) return message.channel.send("<:error:594175676429369345> An error occured: You are not hosting a game!")
                client.games.get(message.author.id).private = false;
                message.channel.send(`:ok_hand: Succesfully set the game to public! Players should type (\`!game join ${message.author.id}\`) to join your lobby.`)
            break;
            case "s": case"start":
                    if (!client.games.get(message.author.id)) return message.channel.send("<:error:594175676429369345> An error occured: You already have a game running!")
                await client.games.get(message.author.id).startGame().catch(err => {
                    if(!err) return
                    if(err === "RULE_TWO"){
                        return message.channel.send("<:error:594175676429369345> An error occured: The player amount should be an even number!")
                    } else {
                        console.log(err)
                    }
                })
                message.channel.send(`:ok_hand: Succesfully started the game with the host ${message.author.id} (\`${message.author.id}\`)`)
            break;
            case "j": case "join":   //BURAYA- USER_EXISTS ERRORU EKLENECEK
                if(!client.games.get(args[1])) return message.channel.send(`<:error:594175676429369345> An error occured: No lobby's found within the id: \`${args[1]}\``)
                if (client.games.get(args[1]).private && !client.games.get(args[1]).invitedPlayers.includes(args[1])) return message.channel.send(`<:error:594175676429369345> The game which is hosted by ${client.users.get(args[1]).tag} is invite-only and you are not invited!`)
                let res = await client.games.get(args[1]).addNewPlayer(message.author.id);
                if (typeof res != "boolean") {
                    return console.log(res)
                } else {
                    message.channel.send(`:ok_hand: You successfully joined the game which is hosted by ${client.users.get(args[1]).tag}! **(**\`${client.games.get(args[1]).players.length}/16\` players**)**`)
                }
                if(client.games.get(args[1]).invitedPlayers.includes(message.author.id)){
                    client.games.get(args[1]).invitedPlayers.splice(client.games.get(args[1]).invitedPlayers.indexOf(message.author.id), 1)
                }
            break;
            case"k": case"kick": //BURAYA USER_NOT_FOUND ERRORU EKLENECEK
                if(!client.games.get(message.author.id)) return message.channel.send(`<:error:594175676429369345> An error occured: You are not hosting a game.`)
                if (!args[1]) return message.channel.send(`<:error:594175676429369345> Please give a valid argument to kick a user from the game. (\`!game kick <user:@user/id>\`)`)
                let kickMember = message.guild.mentions.members.first() || message.guild.members.get(args[1])
                if(!kickMember) return message.channel.send(`<:error:594175676429369345> The argument is not a valid user to be removed. (\`!game kick <user:@user/id>\`)`)
                client.games.get(message.author.id).removePlayer(kickMember.id).then(res => {
                })
                break;
                case "i": case"invite":
                if(!client.games.get(message.author.id)) return message.channel.send(`<:error:594175676429369345> An error occured: You are not hosting a game.`)
                if(!args[1]) return message.channel.send(`<:error:594175676429369345> Please give a valid argument to invite a user to the lobby. (\`!game invite <user:@user/id>\`)`)
                if (!client.games.get(args[1]).private) return message.channel.send(`<:error:594175676429369345> The game which is hosted by ${client.users.get(args[1]).tag} is not invite-only!`)
                if(client.games.get(args[1]).invitedPlayers.includes(args[0])) return message.channel.send(`<:error:594175676429369345> The user (${client.users.get(args[1]).tag}) is already invited!`)
                    client.games.get(args[1]).invitePlayer(args[1]).then(resolve => {
                        resolve(message.channel.send(`:ok_hand: You have succesfully invited ${client.users.get(args[1])} to your lobby! They can join the lobby by using \`!game join ${message.author.id}\``))
                })
        }

    }
}

module.exports = gameCmd;