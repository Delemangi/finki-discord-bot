# FINKI Discord Bot

Discord bot for the [`FCSE Students`](https://discord.gg/finki-studenti-810997107376914444) Discord server, powered by [discord.js](https://github.com/discordjs/discord.js) 14. Requires Node.js and PostgreSQL. It is recommended to use the latest LTS versions of both.

## Quick Setup (Production)

If you would like to just run the bot:

1. Download [`compose.prod.yaml`](https://github.com/Delemangi/finki-discord-bot/blob/main/compose.prod.yaml)
2. Run `docker compose -f compose.prod.yaml up -d`

If you wish to avoid Docker, you will have to setup your own PostgreSQL instance and set the `DATABASE_URL` env. variable to point to it.

This Docker image is available as [ghcr.io/delemangi/finki-discord-bot](https://github.com/Delemangi/finki-discord-bot/pkgs/container/finki-discord-bot).

## Quick Setup (Development)

1. Clone the repository: `git clone https://github.com/Delemangi/finki-discord-bot.git`
2. Install dependencies (and pre-commit hooks): `npm i`
3. Generate the database schema typings: `npm run generate`
4. Prepare env. variables by coping `env.sample` to `.env` - minimum setup requires `BOT_TOKEN` and `APPLICATION_ID`
5. Build the project in Docker: `docker compose build`
6. Run it: `docker compose up -d`

There is also a dev container available. To use it, just clone the repository, define the env. variables and open the container. Your development environment will be prepared automatically.

## Setup Without Docker

1. Clone the repository: `git clone https://github.com/Delemangi/finki-discord-bot.git`
2. Install dependencies (and pre-commit hooks): `npm i`
3. Generate the database schema typings: `npm run generate`
4. Make sure to have a PostgreSQL instance running
5. Prepare env. variables by coping `env.sample` to `.env` - minimum setup requires `BOT_TOKEN`, `APPLICATION_ID` and `DATABASE_URL`
6. Deploy latest database schema: `npm run apply`
7. Build the project: `npm run build`
8. Run it: `npm run start:env` or `npm run dev` (for hot reloading)

## Configuration

### Environment

The env. variables are stored in `.env.sample`. Only the `BOT_TOKEN` and `APPLICATION_ID` variables are required (for logging in to Discord) and `DATABASE_URL` (for the database connection).

### Files

The data for the informational commands is stored in these files. It is not required to configure them. Here is a list of all files:

1. `classrooms.json` - an array of all the classrooms
2. `courses.json` - an array of the names of all courses
3. `information.json` - an array of all the course information
4. `participants.json` - an array of all courses and their number of participants
5. `prerequisites.json` - an array of course prerequisites
6. `professors.json` - an array of all courses and their professors and assistants
7. `roles.json` - roles for the scripts and for the embeds
8. `sessions.json` - an object of all exam sessions
9. `staff.json` - an array of the staff

### Sessions (Timetables)

All the session schedule files should be placed in the `sessions` folder. The names of the files should match the respective names in `sessions.json`.

## Integration With `finki-chat-bot`

This project features integration with [`finki-chat-bot`](https://github.com/Delemangi/finki-chat-bot) for enabling the FAQ and links functionality. The Discord bot fetches and mutates data from the chat bot using REST endpoints. If they are deployed in Docker, they should be on the same network to be able to communicate.

Please set the `CHATBOT_URL` env. variable to the URL of the chat bot.

## Frequently Asked Questions

1. How to create a database migration?
   - Make a change to `prisma.schema` and run `npm run migrate`
2. How to run all database migrations?
   - Run `npm run apply`
3. Can SQLite be used instead of PostgreSQL?
   - Unfortunately, no. Prisma does not allow the database provider to be changed after creating the first migration.
4. The hot reloading is too slow
   - This is a Discord limitation because the bot has to relogin each time
5. How do I create a Discord bot?
   - Refer to <https://discord.com/developers/applications>

## Frequently Encountered Errors

1. "The table `public.Config` does not exist in the current database."
   - You have not deployed the database migrations. Run `npm run apply`
2. "Error: Used disallowed intents"
   - You must enable all intents in the Discord Developer Portal
3. "Error \[TokenInvalid]: An invalid token was provided."
   - Your bot token is invalid.

## License

This project is licensed under the MIT license.
