# FINKI Discord Bot

Discord bot for the FINKI Discord server, made in [discord.js](https://github.com/discordjs/discord.js) v14.

## Installation

1. `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. `npm install`

## Running

The bot can be run normally using `npm run start`. However, the source code also contains single run scripts that send an embed to a channel.

Currently there are:

1. `npm run colors` - takes an argument of channel ID and image URL, in that order
2. `npm run years` - takes an argument of channel ID
3. `npm run activities` - takes an argument of channel ID
4. `npm run subjects` - takes an argument of channel ID and role sets, as set in `roles.json`
5. `npm run programs` - takes an argument of channel ID
6. `npm run delete` - takes arguments of application command IDs

## Config

The `config` folder should contain:

1. `config.json` - the basic bot configuration.
2. `questions.json` - questions and answers for the `faq` command.
3. `links.json` - links for the `link` command.
4. `roles.json` - roles for the scripts.
5. `subjects.json` - full names of the subjects

Check the `example` folder for example config files.

## Logging

The bot logs everything in `bot.log`, which is wiped on each bot restart.
