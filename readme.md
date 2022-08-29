# FINKI Discord Bot

Discord bot for the FINKI Discord server, made in [discord.js](https://github.com/discordjs/discord.js) v14.

## Installation

1. `git pull git@github.com:Delemangi/finki-discord-bot.git`
2. `npm install`

## Running

The bot can be run normally using `npm run start`. However, the source code also contains single run scripts that send an embed to a channel.

Currently there are:

1. `npm run colors` - takes an argument of channel ID and image URL, in that order
2. `npm run years` - takes an argument of channel ID

## Config

The `config` folder should contain:

1. `config.json` - the basic bot configuration.
2. `questions.json` - questions and answers for the `faq` command.
3. `links.json` - links for the `link` command.

Check the `example` folder for example config files.

## Logging

The bot logs everything in `bot.log`, which is wiped on each bot restart.
