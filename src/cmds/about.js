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
        embed.addField("What is this game?","Dope answer")
        embed.addField("How to play the game?",`Hey ${message.author.username}!\n To play this...`)
        embed.addField("What are the rules?","Dope Rules here")
        message.channel.send(embed)
    }

}

module.exports = aboutCmd;