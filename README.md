# FINKI Discord Bot

Discord bot for the [`FINKI Students`](https://discord.gg/finki-studenti-810997107376914444) Discord server, powered by [discord.js](https://github.com/discordjs/discord.js) 14. Requires Node.js ≥ 18 and PostgreSQL.

It's recommended, but not required to run this inside a Docker container.

## Installation

### Installation (Docker)

1. Clone the repository: `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. Build the images: `docker compose build [--build-arg PLATFORM=...]`

### Installation (Normal)

1. Clone the repository: `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. Install the dependencies: `npm i`
3. Build the project: `npm run build`

## Running

### Running (Docker)

`docker compose up`

### Running (Normal)

`npm run start:prod`

## Configuration

### Basic configuration

1. Create a `.env` file in the root directory containing the environment variables as specified in the `.env.sample` file in the repository
2. Create a `config` folder in the root directory containing:
   1. `classrooms.json` - an array of all the classrooms
   2. `courses.json` - an array of the names of all courses
   3. `information.json` - an array of all the course information
   4. `participants.json` - an array of all courses and their number of participants
   5. `prerequisites.json` - an array of course prerequisites
   6. `professors.json` - an array of all courses and their professors and assistants
   7. `roles.json` - roles for the scripts and for the embeds
   8. `sessions.json` - an object of all exam sessions
   9. `staff.json` - an array of the staff

### Sessions

Create a `sessions` folder in the root directory. All the session schedule files should go there. The files names should match the respective names in the `sessions.json` config file.

## Logging

The bot logs `info` and above messages in the console, and logs `debug` and above messages in `bot.log`, which gets wiped on every bot restart.
