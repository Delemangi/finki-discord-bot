# FINKI Discord Bot

Discord bot for the [`FCSE Students`](https://discord.gg/finki-studenti-810997107376914444) Discord server, powered by [discord.js](https://github.com/discordjs/discord.js) 14. Requires Node.js and PostgreSQL. It is recommended to use the latest LTS versions of both.

It's recommended, but not required to run this inside a Docker container.

## Features

This discord bot contains many features personalized for the above-mentioned Discord server. Some of the highlights include:

- Extensible FAQ and common links system
- Providing about courses: general information, participants, professors, and so on
- Providing information about other aspects, such as professors' contact information, classrooms, previous timetables of exam sessions, and so on
- Management of user content through commands
- Extensible permissions system
- Fully featured polls
- Automation of the entire management of the server, allowing members to vote in new admins and such
- Experience & leveling
- Moderation
- Miscellaneous functionalities, such as reminders, sending embeds for rules, role assignments

## Installation

For development purposes, be sure to run `npm run prepare` to install the Git pre-commit hooks.

Also, this project contains a dev container configuration for hot reloading. If you encounter issues in the dev container with Prisma, then run `npm run generate` to regenerate the Prisma client.

### Installation (Docker)

The project is available as a Docker image on DockerHub as `delemangi/finki-discord-bot`.

Using the provided production Docker Compose setup:

1. Download the `docker-compose.prod.yaml` from the repository, put it in a folder and rename it to `docker-compose.yaml`
2. Pull the images: `docker compose pull`

Using the repository:

1. Clone the repository: `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. Build the images: `docker compose build`

### Installation (Normal)

1. Clone the repository: `git clone git@github.com:Delemangi/finki-discord-bot.git`
2. Install the dependencies: `npm i`
3. Build the project: `npm run build`

## Running

### Running (Docker)

Regardless of the Docker steps you have followed above for installation, run `docker compose up`

### Running (Normal)

`npm run start`

## Configuration

### Main

The configuration is currently split into a `.env` file which contains login information for the bot and for the database, and several `json` configuration files for command output.

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

## Future

Here is a list of features that are planned:

- Moving away from configuration files as much as possible, and keeping everything in the database
- Web application for configuring the bot
- Testing
- More moderation and lockdown functionalities
- Bundling, if there is an easy way to achieve it

## License

This project is licensed under the MIT license.
