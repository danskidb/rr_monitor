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
    // Helper funcs for messages
    function logAndReply(msg){
        console.log(msg);
        message.channel.send(msg);
    }

    function errorAndReply(msg){
        console.error(msg);
        message.channel.send(msg);
    }

    // Handling of incoming attachments.
    if (db.channels !== undefined && db.channels.length > 0 && db.channels.includes(message.channel.id) && message.attachments.size > 0)  {
        for (let [key, messageAttachment] of message.attachments) {
            // filter out json
            var attachmentName = path.parse(messageAttachment.name);
            if (attachmentName.ext !== ".json") {
                errorAndReply("Could not parse posted file - not a JSON!")
                return;
            }

            if (!attachmentName.name.includes(config.simresults.filesuffix)) {

                // generate simresults json if this is a race results
                var simresultsJson = {
                    name: config.simresults.leaguename,
                    results: [
                        {
                            "name": attachmentName.name,
                            "log": [
                                messageAttachment.url
                            ]
                        }
                    ]
                }
                var serialized = JSON.stringify(simresultsJson);
                var buffer = Buffer.from(serialized);
                message.channel.send("", new discord.MessageAttachment(buffer, attachmentName.name + config.simresults.filesuffix + ".json"));
                return;
            } else {
                
                // generate URL to view the race on simresults if this is a simresults json.
                var embed = new discord.MessageEmbed()
                    .setTitle("A race has been completed!")
                    .setDescription("Click the link to see the results on simresults.net")
                    .setURL(config.simresults.apibaseurl + messageAttachment.url)
                    .setThumbnail('https://simresults.net/media/img/logos/raceroom-racing-experience.png');

                message.channel.send(embed);
                return;
            }
        }
    }

    // Normal command handling
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
    //todo: ignore all non-json
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
});

watcher.on('add', path => {
    if (!discordReady) {
        return;
    }

    if (db.channels !== undefined && db.channels.length > 0)  {
        db.channels.forEach((item, index) => {
            client.channels.fetch(item)
                .then(channel => {
                    channel.send("", {
                        files: [ path ]
                    })
                })
                .catch(console.error);
        });
    }
});