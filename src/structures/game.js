var fs = require("fs");
var wordsList = fs.readFileSync("../words.txt");
wordsList = wordsList.split("\n")

class Game {
    constructor(userID, players, state) {
        this.host = userID
        this.lobbyID = userID;
        this.players = players
        this.private = true || state
        this.redTeam = []
        this.blueTeam = []
        this.redPoint = 0;
        this.bluePoint = 0;
        this.turn = "red"
        this.captains = [userID]
        this.running = false;
        this.words = [/* {word: "word", team: "red/blue/gray/dead"} */]
    }
    static games = new Map()
    static hosts = new Map()
    
    async startGame() {
        //teams
        if (this.players % 2 != 0) return new Error("RULE_TWO");
        this.players = this.players.sort(() => Math.random() - 0.5);
        this.red = this.players.slice(0, this.players.length / 2)
        this.blue = this.players.slice(this.players.length / 2 + 1, this.players.length)

        // KAPTANLARI TAKIMDAN ÇIKARTMAYI UNUTMA

        //words
        this.words = wordsList.sort(() => Math.random() - 0.5).slice(0, 25)
        this.words.forEach(a => {
            //9 red - 8 blue - 7 innocent - 1 killer
        })
    }


}

module.exports = Game;