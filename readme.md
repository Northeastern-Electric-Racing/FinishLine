# FinishLine by NER

Also known as PM Dashboard v3.

A project management web application built in React.
Read more [here](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/About.md).

All questions can be directed to `#software` in the [NER Slack](https://nu-electric-racing.slack.com) (emergency backup contact: [`@jamescd18`](https://github.com/jamescd18)).

## Getting Started for Developers Who Worked on v2

If you worked on PM Dashboard v2, then setting this up will be easy. Here are the steps:

1. make sure you have the database running like in pm-dashboard-v2
2. get the same .env file from pm-dashboard-v2 but put it in src/backend/
3. npm install -g yarn
4. npm install -g ts-node (this shouldn't be needed anymore since i added it as a dev dependency)
5. yarn install
6. yarn prisma:reset
7. yarn start

## Getting Started for New Developers

Start by understanding what the project is [all about](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/About.md).
Then go through either the [Mac onboarding](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/Onboarding.md) or [Windows onboarding](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/OnboardingWindows.md) steps.
And finally read through the [contributor guide](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/ContributorGuide.md).

If you're curious, check out the [deployment & production application documentation](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/Deployment.md) and the [product management](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/main/docs/ProductManagement.md) details too.
