const discord = require("discord.js")
const baseCmd = require("../structures/baseCmd.js")

class aboutCmd extends baseCmd {
    constructor() {
        super({
            name: `About the game`,
            usage: `about`,
            info: `Describes how game works, rules and everything about the game.`,
            permLevel: 0,
            aliases: ["help","info","information"]
        })
    }
    async execute(client, message, args) {

        var embed = new discord.RichEmbed()
        embed.setAuthor("About Unknown Bot", client.user.avatarURL)
        embed.setThumbnail(client.user.avatarURL)
        embed.setColor("BLURPLE")
        embed.addField("What is this game?","Two teams compete to see who can make contact with all of their players first. Team Captains give one-word clues that can point to multiple words on the board. Their teammates try to guess words of the right color while avoiding those that belong to the opposing team. And everyone wants to avoid the assassin.")
        embed.addField("What are the rules?","Here are our game rules before you are ready to start a game!\n•Each game requires minimum of **4**, maximum of **16** players.\n•The player amount in a lobby must not be an odd number like: 5. The reason of that rule is, the players will be divided into 2 teams, which means player amount should be an even number.\n•Each player can attend to **1** game at the same time.\n•Every host can run **1** game at the same time.")
        embed.addField("How to use commands to start the game?","If you wanna be a host of the game, please type `!game create` .That command creates a lobby, and puts the lobby-id of your user-id.\n•After you have executed the command, the lobby mode will be invite-only. You can invite players yo join your game by using `!game invite <user:id>` To make it a public lobby you should type `!game public` which allows people to directly join your game.\n•Creating a game is done, now you need to find other people to play with you. Players should type !game join <lobby-id> without <> to join your lobby.\n•When you are done with players, please type `!game start` to start the game, and the lobby will be closed. People won't be able to join the team after the game has started.\n•After the game has started, bot sends a DM message to the team captains to let them choose which numbers they are going to opt.")
        message.channel.send(embed)
    }

}

module.exports = aboutCmd;