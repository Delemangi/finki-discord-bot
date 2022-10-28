# FINKI Discord Bot

Discord bot for the `FINKI Students` Discord server, made with [discord.js](https://github.com/discordjs/discord.js) v14. Requires Node.js 18.

## Installation

1. `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. `npm install`

## Config

The `config` folder should contain:

1. `config.json` - the basic bot configuration
2. `courses.json` - an array of the names of all courses
3. `links.json` - an array of links for the `link` command
4. `participants.json` - an array of all courses and their number of participants
5. `prerequisites.json` - an array of course prerequisites
6. `professors.json` - an array of all courses and their professors and assistants
7. `questions.json` - an array questions and answers for the `faq` command
8. `quiz.json` - an array of the quiz questions
9. `roles.json` - roles for the scripts and for the embeds
10. `rules.json` - an array of the server rules
11. `sessions.json` - an object of all exam sessions
12. `staff.json` - an array of the staff

Check the `example` folder for the correct format.

## Running

The bot can be run with `npm run start`.

In the `scripts` folder are a few single run scripts for different functionalities.

Currently there are:

1. `npm run embed:colors <channel ID> <image> [newlines]` - send a colors embed to `channel ID` with `image` as the embed description and `newlines` number of newlines in the message content
2. `npm run embed:years <channel ID> [newlines]` - send a years embed to `channel ID` with `newlines` number of newlines in the message content
3. `npm run embed:activities <channel ID> [newlines]` - send an activities embed to `channel ID`  with `newlines` number of newlines in the message content  
4. `npm run embed:courses <channel ID> <newlines> <...semesters>` - send courses embeds to `channel ID` for all semesters, as set in `roles.json` with `newlines` number of newlines in the message content
5. `npm run embed:programs <channel ID> [newlines]` - send a programs embed to `channel ID` with `newlines` number of newlines in the message content
6. `npm run embed:notifications <channel ID> [newlines]` - send a notifications embed to `channel ID` with `newlines` number of newlines in the message content
7. `npm run embed:rules <channel ID>` - sends the rules embed to `channel ID`
8. `npm run forum:courses <channel ID>` - creates threads for all courses in `channel ID` forum
9. `npm run command:register` - registers all commands as global application commands
10. `npm run command:delete [...command IDs]` - delete the provided application commands, otherwise delete all if none are provided

The arguments marked with `< >` are required, while the arguments marked with `[ ]` are optional.

## Logging

The bot logs `info` and above messages in the console, and logs `debug` and above messages in `bot.log`, which gets wiped on every bot restart.
