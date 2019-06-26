class baseCmd {
    constructor(args = {}) {
        this.name = args.name || "";
        this.permLevel = args.permLevel || 0
        this.secret = args.secret || false;
        this.usage = args.usage || "";
        this.info = args.info || "";
        this.aliases = args.aliases || [];
        this.beta = args.beta || false;
    }
    
    execute(client, message, args) {

    }

}

module.exports = baseCmd;