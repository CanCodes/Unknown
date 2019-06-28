var fs = require("fs");
var events = require("events");
var eventEmitter = new events.EventEmitter();
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
        this.turn = "blue"
        this.captains = undefined
        this.running = false;
        this.words = [/* {word: "word", team: "red/blue/gray/dead"} */]
        this.guild = guild;
        this.channel = undefined;
        this.invitedPlayers = [];
        this.foundAnswers = [];
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
                this.words.push({ word: this.words[i], team: color, found: false })
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
        this.nextTurn(true)
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

    async invitePlayer(playerID){
        if (this.players.includes(playerID) || this.invitedPlayers.includes(playerID)) return new Error("USER_EXISTS")
        this.invitedPlayers.push(playerID)
        return true;
    }

    async newTargets(player, wordNumbers, identifier) {
        if (!this.captains.includes(player)) return false;
        
        this.currentTarget = {
            words: wordNumbers.map(number => number--),
            identifier: identifier
        }

        this.channel.send(`${this.turn} team's new target: \`${identifier} : ${wordNumbers.length}\` take your guesses!`);

        // !choose 2 3 4 5 - AVCILIK
    }
    /*
        {
            answer: answer,
            player: PlayerID
        }
    
    */
    async givePoints(arg) {
        switch (arg) {
            case "red": this.redPoint++; break;
            case "blue": this.bluePoint++; break;
        }
    }

    async handleAnswers(req) {
        var checkTeam = (arg) => {
            var buffer = 0;
            switch(arg) {
                case "red" : 
                buffer = this.redTeam.length()-1;
                break;
                case "blue": 
                buffer = this.blueTeam.length()-1;
                break;
            } return buffer;
        };

        var getTeam = (bool) => {
            if (bool) {
                switch (this.turn) {
                    case "red": return "blue"; break;
                    case "blue": return "red"; break;
                }
            } else {
                return this.turn;
            }
        };

        var endTurn = (arg) => {
            for (i in this.foundAnswers) {
                this.words[i].found = true;
            }
            this.foundAnswers = [];
            this.nextTurn(arg);
        }
        
        // Found subvarı ayrı test et.
        if (!(this.words[req.answer - 1].found)) return this.channel.send(`${this.guild.members.get(player).user.tag}, that word has already been found! It's ${this.words[req.answer - 1].team} team's word! Try again please.`)
        /*
        END TURN ARGLARI
        0 => Karşı takımın kartını buldun,
        1 => Innocent
        2 => Kırmızı takım kazandı turnu
        3 => Mavi takım turnu kazandı
        */

        if (!(this.foundAnswers.includes(answer))) {
            switch (this.words[req.answer - 1].color) {
                case getTeam(0): this.foundAnswers.push(req.answer-1); break;
                case getTeam(1):
                    this.foundAnswers.push(req.answer-1);
                    this.givePoints(getTeam(1));
                    endTurn(0);
                break;
                case "innocent":
                    this.foundAnswers.push(req.answer-1);
                    endTurn(1);
                break;
                case "killer": this.endGame(getTeam(1),true); break;
            }
        } else if (this.foundAnswers.length() == checkTeam(getTeam(0))){
            switch (getTeam(0)) {
                case "red" : 
                this.redPoint++; 
                endTurn(2)
                break;
                case "blue": 
                this.bluePoint++;
                endTurn(3)
                break;
            }
        }
    }

    async nextTurn() {
        switch (this.turn) {
            case "red":
                this.turn = "blue"
                this.redTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: false
                    })
                })
                this.blueTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: true
                    })
                })
                this.channel.send(`It's **Blue Team**'s Turn! Just a friendly reminder of the scoreboard:\n**Red Team: ${this.redPoint}\nBlue Team: ${this.bluePoint}**`)
                break;
            case "blue":
                this.turn = "red"
                this.blueTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: false
                    })
                })
                this.redTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: true
                    })
                })
                this.channel.send(`It's **Red Team**'s Turn! Just a friendly reminder of the scoreboard:\n**Red Team: ${this.redPoint}\nBlue Team: ${this.bluePoint}**`)
                break;
        }
    }

    // @argument arg => HANGI TAKIM KAZANDI
    async endGame(arg, killer=false) {
        this.channel.send(`Oh the game ended! Let's see the final results...\n\n**${arg} team won the game, Congrats!\n*This channel will self-destruct in 20 seconds.*`);
        setTimeout(() => {
            this.channel.delete();
        }, 20000);
    }
    async nextTurn() {
        switch (this.turn) {
            case "red":
                this.turn = "blue"
                this.redTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: false
                    })
                })
                this.blueTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: true
                    })
                })
                this.channel.send(`It's **Blue Team**'s Turn! Just a friendly reminder of the scoreboard:\n**Red Team: ${this.redPoint}\nBlue Team: ${this.bluePoint}**`)
                break;
            case "blue":
                this.turn = "red"
                this.blueTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: false
                    })
                })
                this.redTeam.forEach(user => {
                    this.channel.overwritePermissions(user, {
                        SEND_MESSAGES: true
                    })
                })
                this.channel.send(`It's **Red Team**'s Turn! Just a friendly reminder of the scoreboard:\n**Red Team: ${this.redPoint}\nBlue Team: ${this.bluePoint}**`)
                break;
        }
    }

    // @argument arg => HANGI TAKIM KAZANDI
    async endGame(arg, killer=false) {
        this.channel.send(`Oh the game ended! Let's see the final results...\n\n**${arg} team won the game, Congrats!\n*This channel will self-destruct in 20 seconds.*`);
        setTimeout(() => {
            this.channel.delete();
        }, 20000);
    }
}

module.exports = Game;