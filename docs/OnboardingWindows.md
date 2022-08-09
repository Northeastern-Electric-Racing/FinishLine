# Onboarding

## Project Setup

First, ensure that you have [Node.js v14](https://nodejs.org/download/release/v14.18.3/) installed (you can also navigate to the Node.js website and find any v14 update you prefer).
However, you MUST have version 14 (not newer) installed for the dashboard to work.
Check your node version with `node -v`.
It must be version 14.
If any strange node related errors occur or any errors without descriptive messages, check this step again.

[Clone the repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository), potentially using `git clone` in your preferred CLI to pull the project down to your computer.

Familiarize yourself with [common git commands](https://education.github.com/git-cheat-sheet-education.pdf), [CLI commands](https://www.w3schools.com/whatis/whatis_cli.asp), and [what Git is](https://www.atlassian.com/git/tutorials/what-is-git) if you aren't already. You may also follow tutorials found in the NER curriculum for this information.

In your CLI, navigate to the folder for the project and run `npm install` to instruct [npm](https://www.npmjs.com/about) to install all neccessary packages.

## Database

### Installation

Install [PostgreSQL](https://www.postgresql.org) and follow all default steps.
At points where it asks for any `psql` package installs, please include them.
If a password or multiple are required, remember these passwords (they will be important later).
If you are on a Mac, please follow the other onboarding steps. Alternative OS installs can be found [here](https://www.postgresql.org/download/).
After the installation, please restart your CLI of choice (Powershell, Command Prompt, etc).

### Database Initialization

After downloading and installing PostgreSQL properly, you'll need to run PostgreSQL and create a database named `nerpm`.
By default, PostgreSQL typically has a `postgres` database.
You can use `psql` in the CLI to create a database by running this SQL statement: `CREATE DATABASE nerpm;`.
Naming the new database `nerpm` will ensure it matches with the database URL specified in the project preparation section below.

Alternatively, if the `psql` command does not work, try the command `psql -U postgres` (as postgres is the default username) and mimic the above steps after that.
If these both fail, you can use pgAdmin instead.
Search for the "pgAdmin 4" application on your computer's search bar and open it.
Here, click on "Servers" and right click on "Databases" and then navigate to "Create" and then "Database..." and then use the name `nerpm` (for the same reason as above).

### ENV Setup

Add a `.env` file to the project root directory via `ni .env` in the CLI or creating a file in your IDE.
Paste the following line into the `.env` file and replace `<USERNAME>` with your computer username.
`DATABASE_URL="postgresql://<USERNAME>:@localhost:5432/nerpm?schema=public"`

Note: if the following step does not work with this database URL, try `DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/nerpm?schema=public"` instead with the password you created earlier.

### Initial Database Migration

In order to run the database for the first time, you will need to execute the following command in the CLI.
Run `npm run prisma:reset`.
This should apply all the existing database migrations to the database (create the required tables in the database, see `npm run prisma:migrate`) and populate the database with seed data (see `npm run prisma:seed`).

Refer to [prisma migration tools](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/PrismaMigrationTools.md) for more information about these commands.

### Run and Test

To test that things are working, run `npm run start` in the CLI and go to an example API route.
Example: `localhost:3000/.netlify/functions/users`.

Once again, if the application does not launch, you can replace the line in the `.env` file with the following.
`DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/nerpm?schema=public"`.
Change `<PASSWORD>` to your `postgres` database password.

Test again to ensure that the application launches correctly.

## IDE: VSCode

Turn on `format on save` for Prettier.
Go to `File > Preferences > Settings`.
Search for `format on save` and make sure `Editor: Format On Save` is checked / yes.

Select Preferences: Open Settings (JSON) to open and edit settings.json.
Paste this into `settings.json` (make sure to put a comma after the last item or before the first item if necessary):

```json
"[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

Below are extensions for VSCode that might make your developer experience more enjoyable.
Only the starred ones are optional.

- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) (`orta.vscode-jest`)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) (`prisma.prisma`)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (`dbaeumer.vscode-eslint`)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (`esbenp.prettier-vscode`)
- [Babel\*](https://marketplace.visualstudio.com/items?itemName=mgmcdermott.vscode-language-babel) (`mgmcdermott.vscode-language-babel`)
- [Material Icon Theme\*](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) (`pkief.material-icon-theme`)

## FAQ

- [Prisma keeps giving me strange bugs/I don't understand it, how do I learn more?](#prisma-bugs)
- [I'm getting strange compilation errors or TypeScript errors that seem like the project is broken or incomplete, what should I do?](#possible-wrong-prisma-version)
- [My CLI says that node/any needed package is not recognized! What should I do?](#cli-package-bugs)

### Prisma Bugs

There is a lot of useful information in the [prisma docs](https://www.prisma.io/docs/)!
Specifically, the [environment files docs](https://www.prisma.io/docs/guides/development-environment/environment-variables/managing-env-files-and-setting-variables#manage-env-files-manually) and the [database URL formatting docs](https://www.prisma.io/docs/concepts/database-connectors/postgresql#connection-url).

### Possible Wrong Prisma Version

You may have the wrong prisma version installed or may not have run `npm install`.
If `npm install` does not work, try `git reset --hard` and then `npm ci` to get the right version of prisma.

### CLI Package Bugs

Try restarting your CLI first (in VS Code this means hitting the little trash can icon to the right of "powershell" and then going to "Terminal" on the top of your screen and clicking "New Terminal").
If that doesn't work, try `npm install` again and then restart your CLI. If `psql` is the problem and restarting or the other commands don't work, try using "pgAdmin" instead.
Finally, the path variables for that package may not have set up correctly. For this, google the package name followed by "path variable" to find a solution (each package is slightly different).
