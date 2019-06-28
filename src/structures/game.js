var fs = require("fs");
var wordsList = fs.readFileSync("D:/Yazılım/Unknown/src/words.txt", "utf8");
wordsList = wordsList.split("\n")
// Guild eski bilgilerle devam edebilir dikkat etmek gerek.
class Game {
    constructor(userID, players, guild, state) {
        this.host = userID
        this.lobbyID = userID;
        this.players = players
        this.private = true || state
        this.redTeam = []
        this.blueTeam = []
        this.redPoint = 0;
        this.bluePoint = 0;
        this.turn = "red"
        this.captains = undefined
        this.running = false;
        this.words = [/* {word: "word", team: "red/blue/gray/dead"} */]
        this.guild = guild;
        this.channel = undefined;
    }

    async startGame() {
        //teams
        if (this.players.length % 2 != 0 /*|| this.players.length < 4*/) return new Error("RULE_TWO");
        this.players = this.players.sort(() => Math.random() - 0.5);
        this.red = this.players.slice(0, this.players.length / 2)
        this.blue = this.players.slice(this.players.length / 2 + 1, this.players.length)

        //team caps

        var randomBlueCap = this.blue[Math.floor(Math.random() * this.blue.length)];
        var randomRedCap  = this.red[Math.floor(Math.random() * this.red.length)];
        this.red = this.red.splice(this.red.indexOf(this.host), 1);
        this.blue = this.blue.splice(this.blue.indexOf(randomBlueCap), 1);
        this.captains = [randomRedCap, randomBlueCap];
        //channel creation and Perms
        var permissionOverwrites = [{
            id: this.guild.id,
            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
        }];
        this.players.forEach(player => {
            permissionOverwrites.push({
                id: player,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
            });
        })

        this.channel = await this.guild.createChannel(`game ${this.host}`, {
            type: "text",
            topic: "A new Unknown Game!",
            permissionOverwrites: permissionOverwrites,
            parent: "593932243442073640"
        })

        this.channel.send(`Hello Players! Here are your Captains:\n**:red_circle: ${this.guild.members.get(this.captains[0]).user.tag}\n:large_blue_circle: ${this.guild.members.get(this.captains[1]).user.tag}**`) //not

        //words
        this.words = wordsList.sort(() => Math.random() - 0.5).slice(0, 25);
        [9, 8, 7, 1].forEach(element => {
            var color;

            switch (element) {
                case 9: color = "red";      break;
                case 8: color = "blue";     break;
                case 7: color = "innocent"; break;
                case 1: color = "killer";   break;
            }   

            for (var i = 0; i < element; i++) {
                this.words.push({ word: this.words[i], team: color })
            }
        })
        this.words = this.words.slice(25, this.words.length);
        this.words = this.words.sort(() => Math.random() - 0.5).slice(0, 25);
        console.log(this.words);
        // Valve, pls fix.
        
        //end
        // console.log()
        this.channel.send("Ok here are the words!\n**" + this.words.map(word => `${this.words.indexOf(word) + 1}. ${word.word}`).join("\n") + "**").then(msg => msg.pin());
        this.captains.forEach(captain => { this.guild.members.get(captain).user.send("Ok here are the words and the map!\n**" + this.words.map(word => {
            `${this.words.indexOf(word) + 1}. ${word.word} *${word.team}*`
        }).join("\n") + "**")})
        return true;
    }

    async addNewPlayer(playerID) {
        if (this.players.includes(playerID)) return new Error("USER_EXISTS")
        this.players.push(playerID);
        return true;
    }
    
    async removePlayer(playerID) {
        if (!this.players.includes(playerID)) return new Error("USER_NOT_FOUND")
        this.players.splice(this.players.indexOf(playerID), 1);
        this.channel.overwritePermissions(playerID, {
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false
        })
        this.channel.send(`playerleft`)
        return true;
    }
}

module.exports = Game;