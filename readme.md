# FINKI Discord Bot

Discord bot for the `FINKI Students` Discord server, made with [discord.js](https://github.com/discordjs/discord.js) v14. Requires Node.js 18.

## Installation

1. `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. `npm install`

## Config

The `config` folder should contain:

1. `config.json` - the basic bot configuration
2. `questions.json` - an array questions and answers for the `faq` command
3. `links.json` - an array of links for the `link` command
4. `roles.json` - roles for the scripts and for the embeds
5. `rules.json` - an array of the server rules
6. `subjects.json` - an object mapping the roles to the full subject names
7. `allSubjects.json` - an array of the names of all subjects
8. `participants.csv` - a csv file containing the participants of all courses during all years, separated by ;
9. `professors.csv` - a csv file containing the professors of each course
10. `emails.json` - an object mapping the professors to their email addresses

Check the `example` folder for the correct format.

## Running

The bot can be run with `npm run start`.

In the `scripts` folder are a few single run scripts for different functionalities.

Currently there are:

1. `npm run colors <channel ID> <image> [newlines]` - send a colors embed to `channel ID` with `image` as the embed description and `newlines` number of newlines in the message content
2. `npm run years <channel ID> [newlines]` - send a years embed to `channel ID` with `newlines` number of newlines in the message content
3. `npm run activities <channel ID> [newlines]` - send an activities embed to `channel ID`  with `newlines` number of newlines in the message content  
4. `npm run subjects <channel ID> <newlines> <...semesters>` - send subjects embeds to `channel ID` for all semesters, as set in `roles.json` with `newlines` number of newlines in the message content
5. `npm run programs <channel ID> [newlines]` - send a programs embed to `channel ID` with `newlines` number of newlines in the message content
6. `npm run notifications <channel ID> [newlines]` - send a notifications embed to `channel ID` with `newlines` number of newlines in the message content
7. `npm run rules <channel ID>` - sends the rules embed to `channel ID`
8. `npm run subjectsForum <channel ID>` - creates threads for all subjects in `channel ID` forum
9. `npm run register` - registers all commands as global application commands
10. `npm run delete <...command IDs>` - delete the provided application commands

The arguments marked with `< >` are required, while the arguments marked with `[ ]` are optional.

## Logging

The bot logs `info` and above messages in the console, and logs `debug` and above messages in `bot.log`, which gets wiped on every bot restart.
