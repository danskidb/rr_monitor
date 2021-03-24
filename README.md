# RaceRoom Monitor
Simple tool that posts RaceRoom Racing Experience Dedicated Server results to a discord page.

Result browsing is made possible by https://simresults.net/
The bot posts the results json of a race, plus an additional metadata json file for simresults. Discord files are publicly available so simresults can reach them.

How an url is built up: https://simresults.net/remote?results= + https://cdn.discordapp.com/attachments/ + <uniquepath>.json

## Config Files
Create the following files in the root dir:

config.json - read-only config. Not all vars are used
```
{
    "path": "monitordir",
    "discord": {
        "client_secret": "",
        "client_id": ,
        "public_key": "",
        "bot_token": "",
        "prefix": "rrbot|"
    }
}
```

runtimedb.json - written to by the application
```
{}
```

## setup as service
1. open powershell
2. run: npm install -g qckwinsvc
3. Ensure we can run scripts (you may want other settings, read up on this command): Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope LocalMachine
4. run: qckwinsvc and follow instructions

## Set channel to post results to
1. Invite the bot to your server
2. Run the command rrbot|setchannel in the channel you would like to post your results into
3. Done!
