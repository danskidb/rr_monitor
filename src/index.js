const path = require('path');
const chokidar = require('chokidar');
const discord = require ('discord.js');
const database = require('./database.js');
const config = require('../config.json');


var baseDir = path.join(__dirname, "..\\"); // so we're not in src dir but parent dir.
var client = new discord.Client();
var db = database.readDB();
var discordReady = false;


client.once('ready', () => {
    console.log("Logged in to discord.");
    discordReady = true;
});

client.on('message', message => {
    function logAndReply(msg){
        console.log(msg);
        message.channel.send(msg);
    }

    function errorAndReply(msg){
        console.error(msg);
        message.channel.send(msg);
    }

    if (!message.content.startsWith(config.discord.prefix) || message.author.bot) return;
    const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command == 'setchannel') {
        if (db.channels === undefined) {
            db.channels = [];
        }

        if (db.channels.includes(message.channel.id)) {
            errorAndReply("Can't add channel with ID " + message.channel.id + " - was already monitored!");
            return;
        }

        db.channels.push(message.channel.id);
        database.saveDB(db);

        logAndReply("Added channel with ID " + message.channel.id + " to monitored list.");
    } else if (command == "removechannel") {
        if (db.channels === undefined) {
            db.channels = [];
        }

        if (!db.channels.includes(message.channel.id)) {
            errorAndReply("Can't remove channel with id " + message.channel.id + " - was not yet monitored!");
            return;
        }

        db.channels = db.channels.filter(function(item){
            return item !== message.channel.id
        });
        database.saveDB(db);

        logAndReply("Removed channel with ID " + message.channel.id + " from monitored list.");
    }
});

client.login(config.discord.bot_token);

console.log("Starting to monitor folder " + baseDir + config.path)
const watcher = chokidar.watch(baseDir + config.path, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
});

watcher.on('add', path => {
    if (!discordReady) {
        return;
    }

    db.channels.forEach((item, index) => {
        client.channels.fetch(item)
            .then(channel => {
                channel.send("", {
                    files: [ path ]
                })
            })
            .catch(console.error);
    });
});