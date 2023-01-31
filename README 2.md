# FinishLine by NER

Also known as PM Dashboard v3.

A project management web application built in Typescript, React, and Express.

Almost all of our documentation is on [our Confluence page](https://nerdocs.atlassian.net/wiki/spaces/NER/pages/5603329/Software). Start there to learn what the project is all about.

All questions can be directed to `#software` in the [NER Slack](https://nu-electric-racing.slack.com) (backup contact: [`@anthonybernardi`](https://github.com/anthonybernardi)).

## Environment Setup for Developers Who Worked on v2

If you worked on PM Dashboard v2, then setting this up will be easy. Here are the steps:

1. make sure you have the database running like in pm-dashboard-v2
2. get the same .env file from pm-dashboard-v2 but put it in src/backend/
3. `npm install -g yarn`
4. `yarn install`
5. `yarn prisma:reset`
6. `yarn start`

Note: no more `npm` commands! Any time you would run `npm run ...` run `yarn ...` instead!

## Environment Setup for New Developers

We have redone our onboarding docs and moved them to Confluence! [Check them out here](https://nerdocs.atlassian.net/wiki/spaces/NER/pages/5079215/Software+Onboarding). If you have questions, ask them in the `#software_env-setup` channel in Slack. When you're done, check out the contributor guide (see below).

## How to Contribute

Check out the [contributor guide](https://nerdocs.atlassian.net/wiki/spaces/NER/pages/8060929/Software+Contributor+Guide). This will take you through the steps of finding a ticket, making a branch, committing code, creating a pull request, etc!
