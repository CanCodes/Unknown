var Discord = require("discord.js");
var fs = require("fs");
var client = new Discord.Client();

client.owners = ["316641074967871500", "478307244509888532"];
client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()

client.games = new Map();
const prefix = "!"

// Command init

fs.readdir("./src/cmds/", (err, cmds) => {
    cmds.forEach(cmdFile => {
        const cmdClass = require(`./src/cmds/${cmdFile}`);
        const cmd = new cmdClass;
        client.commands.set(cmdFile.split(".")[0], cmd);
        cmd.aliases.forEach(a => {
            client.aliases.set(a, cmd);
        })
    });

})

client.on("ready",() => {
    console.log(`Logged as in ${client.user.tag}, Space Cowboy!`)
})

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName) || client.aliases.get(cmdName);
    if (!cmd) return;
    return cmd.execute(client, message, args);
})

client.login(process.env.TOKEN || require("./config.json").TOKEN)