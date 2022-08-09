# Onboarding

## Project Setup

First, ensure that you have [Node.js](https://nodejs.org/en/) installed.

[Clone the repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository), potentially using `git clone` in your preferred CLI to pull the project down to your computer.

Familiarize yourself with [common git commands](https://education.github.com/git-cheat-sheet-education.pdf), [CLI commands](https://www.w3schools.com/whatis/whatis_cli.asp), and [what Git is](https://www.atlassian.com/git/tutorials/what-is-git) if you aren't already.

In your CLI, navigate to the folder for the project and run `npm install` to instruct [npm](https://www.npmjs.com/about) to install all neccessary packages.

## Database

### Installation

The easiest way to install [PostgreSQL](https://www.postgresql.org) on a Mac is with [Postgres.app](https://postgresapp.com).
Alternative OS installs can be found [here](https://www.postgresql.org/download/).

### Database Initialization

After downloading and installing PostgreSQL properly, you'll need to run PostgreSQL and create a database named `nerpm`.
By default, PostgreSQL typically has a `postgres` database.
You can use `psql` in the CLI to create a database by running this SQL statement: `CREATE DATABASE nerpm;`.
Naming the new database `nerpm` will ensure it matches with the database URL specified in the project preparation section below.

### ENV Setup

Add a `.env` file to the project root directory via `touch .env` in the CLI or creating a file in your IDE.
Paste the following line into the `.env` file and replace `<USERNAME>` with your computer username.
`DATABASE_URL="postgresql://<USERNAME>:@localhost:5432/nerpm?schema=public"`

### Initial Database Migration

In order to run the database for the first time, you will need to execute the following command in the CLI.
Run `npm run prisma:reset`.
This should apply all the existing database migrations to the database (create the required tables in the database, see `npm run prisma:migrate`) and populate the database with seed data (see `npm run prisma:seed`).

Refer to [prisma migration tools](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/PrismaMigrationTools.md) for more information about these commands.

### Run and Test

To test that things are working, run `npm run start` in the CLI and go to an example API route.
Example: `localhost:3000/.netlify/functions/users`.

If the application does not launch, you can replace the line in the `.env` file with the following.
`DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/nerpm?schema=public"`
Change `<PASSWORD>` to your `postgres` database password.

Test again to ensure that the application launches correctly.

## IDE: VSCode

**IMPORTANT NOTE:** We have a settings file in the project that will automatically configure all of these settings for you.
If for some reason they don't work, come back here to do it manually.
(the settings that should work are formatting on save and using prettier to format)

Turn on `format on save` for Prettier.
Go to `Code > Preferences > Settings` (or via `cmd ,` on Mac) (or `File > Preferences > Settings` for Windows).
Search for `format on save` and make sure `Editor: Format On Save` is checked / yes.

Open the VSCode Command Palette (`Ctrl/Cmd`+`Shift`+`P`) and search for `open settings json`.
Select `Preferences: Open Settings (JSON)`, which should open a file called `settings.json`.

If `settings.json` doesn't open from the Command Palette, you can also navigate back to the settings and try searching for either of these:

- `open settings json`: Then click `Edit in settings.json` under the `[JSON] Configure settings to be overridden for [json] language` section.
- `json file schema`: Then click `Edit in settings.json` under the `JSON schemas` section.

Paste this into `settings.json`:

```json
"[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### VSCode Extensions

When you launch the project in VSCode, you should see a popup in the bottom right asking you to "install all recommendeded extensions".
Click "install" to easily install all of the below extensions.

If for some reason you don't see this popup you can install them manually using the extensions button on the left sidebar.
Below are the recommended extensions that you should install.
Only the starred ones are optional.

- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) (`orta.vscode-jest`)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) (`prisma.prisma`)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (`dbaeumer.vscode-eslint`)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (`esbenp.prettier-vscode`)
- [Babel\*](https://marketplace.visualstudio.com/items?itemName=mgmcdermott.vscode-language-babel) (`mgmcdermott.vscode-language-babel`)
- [Material Icon Theme\*](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) (`pkief.material-icon-theme`)
