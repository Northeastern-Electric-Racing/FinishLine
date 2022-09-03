# Contributor Guide

## Table of Contents

- [Creating Issues And Suggesting Features](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#creating-issues-and-suggesting-features)
- [Creating a Branch](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#creating-a-branch)
- [Writing Code](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#writing-code)
- [Creating a Commit](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#creating-a-commit)
- [Testing Your Code](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#testing-your-code)
- [Running the App Locally](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#running-the-app-locally)
- [Creating a Pull Request](https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/ContributorGuide.md#creating-a-pull-request)

## Git

For an explanation of Git, see [this presentation by Nick DePatie](https://docs.google.com/presentation/d/18_T_kDgsussS3cp9YDVCT7ngH9Onzyu93btziPgIoC4/edit?usp=sharing)

## Creating Issues And Suggesting Features

Navigate to the [GitHub repository issues page](https://github.com/Northeastern-Electric-Racing/FinishLine/issues) and click the "New Issue" button.

### Issue Title

Give your issue an informative, but concise title that follows the naming syntax: `[Page] - [Description]`.
The page field should name one specific page within the application that the issue pertains to.
Alternatively, use `General` or `Docs` to indicate issues spanning the whole site or issues with the project's documentation.
The description field should briefly describe what the issue is.
Examples: `General - Increase Padding for Tables` or `Projects - Add Filter by Project Lead`.

### Issue Description

Include the required information in the issue description given by the template.

Add labels as is appropriate for the issue, and put it in the #software_product channel for review.
Reviewers will determine whether the issue is valid, whether it will be accepted and worked on, and which milestone it will be a part of.
Once it is approved, it will be added to the project board.

## Creating a Branch

Before making a new branch, make sure you are on `develop` and you have the latest changes (`git pull`).

Then use `git checkout -b [branch name]` to create and switch to a new branch.
Give the branch a short name that follows the naming syntax: `#[issue number]-[short but meaningful description]` and replace spaces with dashes.
Example: `#12-add-login-endpoint` or `#275-refactor-projects-table`.

Use `git status` to check which branch you are on.
Ensure you stash, reset, or commit your changes before changing branches, unless you want to bring your changes to the other branch.
Use `git checkout develop` to switch back to the `develop` branch.

## Writing Code

Comment your code with JSDoc and inline comments to help others understand your code.

Test your code to the best of your ability and avoid writing overly complex code.

Follow good coding practices taught in Fundies 1 and Fundies 2.

If you edit code in any local package (e.g. shared), you may need to run `yarn install` before the latest changes to the local package will be availible in the rest of the application.

## Creating a Commit

Commit early and often (within reason) to properly save your work and to make your changes more easily separable.

Use `git status` to see which files have been changed. If you see `yarn.lock` in there, run `git restore yarn.lock`. These files should only be committed if you are adding new packages to the repo.

Next, do `git add path/to/file` for each file you want to stage to your commit. You can also do `git add -A` to add all of them.

Next, use `git commit -m [message]` to commit your staged file with the message.
Use the following syntax for commit messages: `#[issue number]: [description of changes made]`.
Examples: `#12: Expanded the creating commmits section` or `#79: Increased list padding`.

Use `git push` to push your branch and commits to the remote GitHub repo. You may need to run `git push --set-upstream origin [branch name]` as instructed by the git CLI if the branch does not already exist in the GitHub repo and only exists on your local computer.

## Testing Your Code

Run the unit tests using `yarn test:frontend` or `yarn test:backend` and try to ensure they all pass.

Write tests for anything new that you write. If you're unsure of what you should test, ask someone.

## Running the App Locally

First make sure you have run `yarn install` and `yarn prisma:generate` on the branch you want to start. Then use `yarn start` to boot up the React app and the Express server on your local computer.
Navigate to `localhost:3000` to see the frontend of the app.
The API endpoint can be found at `localhost:3001/` (check out `localhost:3001/users` for example).

## When to commit yarn.lock?

`yarn.lock` contains all the dependencies of the project.
Thus, when dependencies are added or removed from the project, or when the version of any dependency is changed, then `yarn.lock` needs to be committed to the branch and pushed to the remote repository.
Unless there are changes to `yarn.lock`, you should **_not_** commit and push any changes to `yarn.lock`.

## Creating a Pull Request

Pull requests (aka PRs) allow for others to review your code before it gets merged together with the `develop` branch.
Don't be afraid to open a PR before you are finished if you want feedback on your code, just make sure to note this in your PR.
Pushing more commits to the GitHub repo will add them to the PR.

Ensure that you have pushed your branch to GitHub using `git push`.
You may need to run `git push --set-upstream origin [branch name]` as instructed by the git CLI if the branch does not already exist in the GitHub repo and only exists on your local computer.

Navigate to the [PRs page on GitHub](https://github.com/Northeastern-Electric-Racing/FinishLine/pulls) and click "New pull request".
You may have to select the branch which you would like to merge into the `develop` branch.

Give your PR an informative and concise title.
PR titles often match the title of the issue they are linked to, but they do not have to match.

Use [closing keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue) in the description of the PR to link the PR with any associated issue(s).
Example: `closes #27` will link issue `#27` to the PR and close the issue when the PR is merged.

In the sidebar, request review from any interested team members, which will usually include `@anthonybernardi`, `@jamescd18`, `@RChandler234`, or `@joshiarnav`.
