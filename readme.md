# FINKI Discord Bot

Discord bot for the `FINKI Students` Discord server, made with [discord.js](https://github.com/discordjs/discord.js) v14.

## Installation

1. `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. `npm install`

## Config

The `config` folder should contain:

1. `config.json` - the basic bot configuration
2. `questions.json` - an array questions and answers for the `faq` command
3. `links.json` - an array of links for the `link` command
4. `roles.json` - roles for the scripts and for the embeds
5. `subjects.json` - an object mapping the roles to the full subject names

Check the `example` folder for the correct format.

## Running

The bot can be run with `npm run start`.

In the `scripts` folder are a few single run scripts for different functionalities.

Currently there are:

1. `npm run colors <channel ID>` - send a colors embed to `channel ID`
2. `npm run years <channel ID>` - send a years embed to `channel ID`
3. `npm run activities <channel ID>` - send an activities embed to `channel ID`  
4. `npm run subjects <channel ID> <...semesters>` - send subjects embeds to `channel ID` for all semesters, as set in `roles.json`
5. `npm run programs <channel ID>` - send a programs embed to `channel ID`
6. `npm run delete <...command IDs>` - delete the provided application commands

## Logging

The bot logs `info` and above messages in the console, and logs `debug` and above messages in `bot.log`, which gets wiped on every bot restart.
