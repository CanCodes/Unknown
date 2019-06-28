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
        if (!args[0]) return;
        switch (args[0].toLowerCase()) {
            case "c": case "create":
                if (message.channel.type === "dm") return;
                if (client.games.get(message.author.id) || client.games.find(game => game.players.indexOf(message.author.id) != -1)) return message.channel.send("<:error:594175676429369345> An error occured: You already in a game!")
                var newGame = new Game(message.author.id, [message.author.id], message.guild);
                client.games.set(message.author.id, newGame);
                message.channel.send(`:ok_hand: Succesfully created a lobby with the ID: \`${message.author.id}\` (*The lobby is currently invite-only! To make it public please type \`!game public\`*)`);
                break;
            case "del": case "delete":
                if (message.channel.type === "dm") return;
                if (!client.games.get(message.author.id)) return message.channel.send("<:error:594175676429369345> An error occured: You are not hosting a game!")
                client.games.get(message.author.id).endGame("fastEnd")
                client.games.delete(message.author.id).then(() => {
                    
                })
                break;
            case "p": case "public":
                if (message.channel.type === "dm") return;
                if (!client.games.get(message.author.id)) return message.channel.send("<:error:594175676429369345> An error occured: You are not hosting a game!")
                client.games.get(message.author.id).private = false;
                message.channel.send(`:ok_hand: Succesfully set the game to public! Players should type (\`!game join ${message.author.id}\`) to join your lobby.`)
                break;
            case "s": case "start":
                if (message.channel.type === "dm") return;
                if (!client.games.get(message.author.id)) return message.channel.send("<:error:594175676429369345> An error occured: You don't have a game running!")
                if (client.games.get(message.author.id).running) return message.channel.send(`<:error:594175676429369345> Game is already running!`)
                await client.games.get(message.author.id).startGame().catch(err => {
                    if (!err) return
                    if (err === "RULE_TWO") {
                        return message.channel.send("<:error:594175676429369345> An error occured: The player amount should be an even number!")
                    } else {
                        console.log(err)
                    }
                })
                message.channel.send(`:ok_hand: Succesfully started the game with the host ${message.author.id} (\`${message.author.id}\`)`)
                break;
            case "j": case "join":
                if (message.channel.type === "dm") return;   //BURAYA- USER_EXISTS ERRORU EKLENECEK
                if (!client.games.get(args[1])) return message.channel.send(`<:error:594175676429369345> An error occured: No lobby's found within the id: \`${args[1]}\``)
                if (client.games.get(args[1]).running) return message.channel.send(`Game is already running!`)
                if (client.games.get(args[1]).private && !client.games.get(args[1]).invitedPlayers.includes(message.author.id)) return message.channel.send(`<:error:594175676429369345> The game which is hosted by ${client.users.get(args[1]).tag} is invite-only and you are not invited!`)
                let res = await client.games.get(args[1]).addNewPlayer(message.author.id);
                if (typeof res != "boolean") {
                    return console.log(res)
                } else {
                    message.channel.send(`:ok_hand: You successfully joined the game which is hosted by ${client.users.get(args[1]).tag}! **(**\`${client.games.get(args[1]).players.length}/16\` players**)**`)
                }
                if (client.games.get(args[1]).invitedPlayers.includes(message.author.id)) {
                    client.games.get(args[1]).invitedPlayers.splice(client.games.get(args[1]).invitedPlayers.indexOf(message.author.id), 1)
                }
                break;
            case "k": case "kick": //BURAYA USER_NOT_FOUND ERRORU EKLENECEK
                if (message.channel.type === "dm") return;
                if (!client.games.get(message.author.id)) return message.channel.send(`<:error:594175676429369345> An error occured: You are not hosting a game.`)
                if (!args[1]) return message.channel.send(`<:error:594175676429369345> Please give a valid argument to kick a user from the game. (\`!game kick <user:@user/id>\`)`)
                let kickMember = message.guild.mentions.members.first() || message.guild.members.get(args[1])
                if (!kickMember) return message.channel.send(`<:error:594175676429369345> The argument is not a valid user to be removed. (\`!game kick <user:@user/id>\`)`)
                client.games.get(message.author.id).removePlayer(kickMember.id).then(res => {
                })
                break;
            case "i": case "invite":
                if (message.channel.type === "dm") return;
                if (!client.games.get(message.author.id)) return message.channel.send(`<:error:594175676429369345> An error occured: You are not hosting a game.`)
                if (!args[1]) return message.channel.send(`<:error:594175676429369345> Please give a valid argument to invite a user to the lobby. (\`!game invite <user:@user/id>\`)`)
                if (!client.games.get(message.author.id).private) return message.channel.send(`<:error:594175676429369345> The game which is hosted by ${client.users.get(args[1]).tag} is not invite-only!`)
                if (client.games.get(message.author.id).invitedPlayers.includes(args[0])) return message.channel.send(`<:error:594175676429369345> The user (${client.users.get(args[1]).tag}) is already invited!`)
                client.games.get(message.author.id).invitePlayer(args[1]).then(() => {
                    message.channel.send(`:ok_hand: You have succesfully invited ${client.users.get(args[1])} to your lobby! They can join the lobby by using \`!game join ${message.author.id}\``)
                })
                break;
            case "choose":
                if (message.guild) return;
                if (!client.games.find(a => a.captains.includes(message.author.id))) return message.channel.send(`<:error:594175676429369345> An error occured: You are not captain of a team.`)
                
                let numberz = args.slice(1).join(" ").split("-")[0].split(" ")
                let identifier = args.slice(1).join(" ").split("-")[1]
                if(!identifier) return message.channel.send("not") //not
                if(!numberz) return message.channel.send("yo") // not
                let chooseArr = []
                for (var i = 0; i < numberz.length -1; i++) {
                    chooseArr.push(parseInt(numberz[i]))
                }
                client.games.find(r => r.players.includes(message.author.id)).newTargets(chooseArr, identifier);
                break;
                case "guess":
                if(message.channel.type === "dm") return;
                if(message.channel.parentID !== "593932243442073640") return message.channel.send("<:error:594175676429369345> You only can guess your words in your game chat!")
                if(!client.games.find(a => a.players.includes(message.author.id))) return message.channel.send("<:error:594175676429369345> You are not playing a game!")
                if(!parseInt(args[1])) return message.channel.send("no args1") //not
                if(parseInt(args[1]) > 25) return message.channel.send("cannot be more than 25")
                client.games.find(a => a.players.has(message.author.id)).handleAnswers({answer: parseInt(args[1]), player: message.author.id})


        }

    }
}

module.exports = gameCmd;