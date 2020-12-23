# RaceRoom Monitor
Simple tool that monitors a raceroom server results dir and posts the JSON to discord.

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