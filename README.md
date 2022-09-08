# FinishLine by NER

Also known as PM Dashboard v3.

A project management web application built in Typescript, React, and Express.
Start by reading what the project is [all about](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/About.md).

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

NOTE: the environment setup docs have not been updated from v2 yet!!!!!

Go through either the [Mac onboarding](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/Onboarding.md) or [Windows onboarding](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/OnboardingWindows.md) steps.

## How to Contribute

First read the [Git contributor guide](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md).

Next, head over to the [Project Board](https://github.com/orgs/Northeastern-Electric-Racing/projects/3) and find a ticket you like. Once you've chosen one, or if you need help, reach out to your Tech Lead or someone in the #software channel.
