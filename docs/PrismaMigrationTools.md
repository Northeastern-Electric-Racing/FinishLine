# Prisma Migration Tools

## `yarn prisma:seed`

### What it does

This command seeds the database, which means populating the database with initial data it requires to run.
It can be dummy data, basic user accounts, a default language, example data in various states, etc.

### Why to use it

While developing the application, we need some data to be present in order for something to appear on the front end to interact with.
Running this command populates the database with a basic set of data for development purposes.

For more detailed information about [prisma seed](https://www.prisma.io/docs/guides/database/seed-database), click the link.

## `yarn prisma:reset`

### What it does

This command drops the database if possible or performs a soft reset if the database cannot be deleted.
If the database is dropped, it creates a new database with the same name and runs all migrations and seed scripts.
If `yarn prisma:reset` runs without any errors, then the `yarn prisma:seed` function is auto-invoked.
This means you do not need to run the `yarn prisma:seed` command again.

### Why to use it

You use this command to restore the data to its original state if you sufficiently modified the data via the front end.
If you need to undo changes you made to the database schema or if there are migration history conflicts, you can also run this command.

For more detailed information about [prisma reset](https://www.prisma.io/docs/concepts/components/prisma-migrate), click the link.

## `yarn prisma:migrate`

### What it does

This command enables you to keep your database schema in sync with the prisma schema.

### Why to use it

After you make a change to the prisma schema, you should run this function to update the database schema.
The new migration created is associated with the changes made to the prisma schema.

There will be a `name` field that the terminal will ask you to enter for the migration.
Enter a concise and appropriate name that reflects the changes you made to the prisma schema.

Each time you run this command, if there are new changes, a SQL file will be generated that is added to the `migrations` folder.
Otherwise, `yarn prisma:migrate` will apply the existing migration SQL files onto the database and not require a `name` field to be entered.

For more detailed information about [prisma migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate), click the link.

## `yarn prisma:generate`

### What it does

This command generates and initializes the prisma client.
The prisma client is an auto-generated library that allows us to access data in our application.

Note: In v2, the command `npm install` would automatically run `npm run prisma:generate`. However, in v3, this does not happen, so you will need to run `yarn install` then `yarn prisma:generate` yourself OR you can just run `yarn i` which does both.

### Why to use it

After changes are made to the prisma schema, you need to run this function to update the prisma client.

For more detailed information about [prisma generate](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client), click the link.
