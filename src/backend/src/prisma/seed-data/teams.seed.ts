/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

const about = `# About the Project

FinishLine by NER is intended to assist NER’s Project Management Office (PMO) and other leadership with increasing efficiency in two aspects:

1. understanding the state of the club’s projects and
2. handling the processes and procedures associated with a formal project and change management system

To access the app, you can go [here](https://finishlinebyner.com) and sign in with your husky Google email.

## Tech Stack

This project is a full-stack Typescript web application that uses React on the frontend and Express on the backend. Yarn workspaces are used to maintain it as a monorepo.

As the project evolves, technologies may be added or removed.
The current tech stack list is provided below:

- TypeScript
- Node.js
- Express
- React
- Prisma
- PostgreSQL
- Jest

The app is deployed on AWS Elastic Beanstalk using the Docker configuration for the backend and Netlify for the frontend. It uses AWS RDS for the database.

## History

The NER PM Dashboard v1 was created in July of 2020 as a Google Apps Script web application attached to the database Google Sheet file.
Major development took place during July and August prior to the start of the Fall 2020 semester.
During Fall 2020, two developers make incremental improvements, and then in Spring 2020 a team of developers was formed.

The NER PM Dashboard v2 was hypothesized during the Fall 2020 semester as the v1 developers ran into platform and framework limitations.
Research, planning, and project initiation for v2 began in Spring 2021.
The end of Summer 2021 was selected as the initial launch deadline for v2, but was not met.
In Fall 2021, the team of developers was formalized into NER's Software Solutions team and grew to 20+ members.
January 18, 2022 was selected as the adjusted launch deadline for v2, but was yet again not met.
In Spring 2022, the Software Solutions team grew to 70+ members.
The application finally launched in May of 2022.

However, there were more technical limitations with v2. This led to the creation of NER PM Dashboard v3 in Summer 2022. The biggest change was using Express on the backend instead of Netlify Lambdas. It also generally cleaned up the repo and used Yarn workspaces as a better way to keep the monorepo instead of the workarounds used in v2. It was also rebranded to FinishLine by NER.

## More Reading

If you're curious, check out the [deployment & production application documentation](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/Deployment.md) and the [product management](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ProductManagement.md) details too.
`;

const dbSeedTeam1 = {
  fields: {
    teamName: 'Ravens',
    slackId: 'asdf',
    description:
      '# Welcome!\nThanks for joining our team! Here are some onboarding docs or something idk:\n\n[very important please read](https://crouton.net)'
  },
  leaderId: 1,
  projectIds: [{ projectId: 1 }, { projectId: 2 }],
  memberIds: [{ userId: 2 }, { userId: 3 }]
};

const dbSeedTeam2 = {
  fields: {
    teamName: 'Orioles',
    slackId: 'jkl;',
    description: about
  },
  leaderId: 2,
  projectIds: [{ projectId: 3 }, { projectId: 4 }, { projectId: 5 }],
  memberIds: [{ userId: 4 }, { userId: 5 }]
};

const dbSeedTeam3 = {
  fields: {
    teamName: 'Team Rocket',
    slackId: 'slacky'
  },
  leaderId: 3,
  projectIds: [],
  memberIds: [{ userId: 6 }]
};

export const dbSeedAllTeams = [dbSeedTeam1, dbSeedTeam2, dbSeedTeam3];
