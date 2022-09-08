# Deployment & Production Application

This document serves to document the application deployment process and details, as well as documenting the production application upkeep details.
Deployment of the application and production application upkeep is primarily handled by the repository admins.

## Netlify

The frontend is deployed via Netlify.

## AWS

The backend is deployed via AWS Elastic Beanstalk. It uses the Dockerfile in the repo to build a docker image that AWS then deploys. The link to this is at `https://api.finishlinebyner.com`.

## Production Database

The application's production PostgreSQL database is hosted on AWS RDS (Amazon Web Services Relational Database Service).
The production database is set up with daily snapshots to ensure we can restore a recent copy of the data in the event of any data loss.
The production database is set up with a production database user, which is used for all API database access.

## Manual Database Interaction

Connecting to the production database via CLI is possible but generally discouraged.
Not only is it hazardous from a data safety and security perspective, but it also can disrupt the normal function of the production application.

Due to the way Prisma implements sequential integer IDs as sequences in PostgreSQL, inserting or deleting objects in a table with integer IDs is more difficult.
If I want to insert a new object in such a table, I would use an `INSERT` SQL statement including the next integer as its ID.
The problem is that the sequence which provides new IDs during API object creation would then be behind by 1.
In order to fix that, I've used an `ALTER SEQUENCE RESTART` SQL statement, but that still can cause issues because restarting the sequence messes with the other parts of the sequence.

In order to avoid any and all of these problems, manual database interaction should be done using the [`manual.ts`](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/src/backend/prisma/manual.ts) and `prisma:manual` command.
Write all the manual database interactions you want to do in that file utilizing the Prisma Client.
This will ensure that the underlying database implementation is not messed up due to manual interactions.
Common actions such as updating a user's role can be stored as functions in the `manual.ts` file to make it super easy.

Remember that manual database interaction is reserved for things that have not been productized.
Once we build admin functionality to allow changing users' roles within the application, we should no longer be doing manual database interactions to update user roles.
