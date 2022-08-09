# Contributor Guide

## Table of Contents

- [Creating Issues And Suggesting Features](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#creating-issues-and-suggesting-features)
- [Creating a Branch](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#creating-a-branch)
- [Writing Code](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#writing-code)
- [Creating a Commit](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#creating-a-commit)
- [Testing Your Code](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#testing-your-code)
- [Running the App Locally](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#running-the-app-locally)
- [Creating a Pull Request](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/docs/ContributorGuide.md#creating-a-pull-request)

## Creating Issues And Suggesting Features

Navigate to the [GitHub repository issues page](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/issues) and click the "New Issue" button.

### Issue Title

Give your issue an informative, but concise title that follows the naming syntax: `[Page] - [Description]`.
The page field should name one specific page within the application that the issue pertains to.
Alternatively, use `General` or `Docs` to indicate issues spanning the whole site or issues with the project's documentation.
The description field should briefly describe what the issue is.
Examples: `General - Increase Padding for Tables` or `Projects - Add Filter by Project Lead`.

### Issue Description

Include the required information in the issue description based on the kind of issue you are submitting.

Bugs -> Observed Behavior, Expected Behavior, Steps to Reproduce, and Screenshots

New Features -> Current Features, Desired Additional Features, and Screenshots (as needed)

Other -> Desired Changes, Screenshots (as needed)

Add labels as is appropriate for the issue, and assign it to `@kevinyu328` or `@jamescd18` for review.
Reviewers will determine whether the issue is valid, whether it will be accepted and worked on, and which milestone it will be a part of.
If the issue is determined to be ready to be worked on by the development team, the reviewers will add the "approved" label.

## Creating a Branch

Use `git checkout -b [branch name]` to create a new branch.
Give the branch a short name that follows the naming syntax: `#[issue number]-[short but meaningful description]` and replace spaces with dashes.
Example: `#12-add-login-endpoint` or `#275-refactor-projects-table`.

Use `git status` to check which branch you are on.
Ensure you stash, reset, or commit your changes before changing branches, unless you want to bring your changes to the other branch.
Use `git checkout main` to switch back to the `main` branch.

## Writing Code

Comment your code with JSDoc and inline comments to help others understand your code.

Test your code to the best of your ability and avoid writing overly complex code.

Follow good coding practices taught in Fundies 1 and Fundies 2.

If you edit code in any local package (e.g. utils), you must run `npm install` before the latest changes to the local package will be availible in the rest of the application.

## Creating a Commit

Commit early and often (within reason) to properly save your work and to make your changes more easily separable.

Use `git status` to see which files have been changed. If you see `package-lock.json` in there, run `git restore package-lock.json`. Do the same for `src/utils/package-lock.json` if it is also there. These files should only be committed in very specific circumstances.

Next, do `git add path/to/file` for each file you want to commit. You can also do `git add -A` to add all of them.

Next, use `git commit -m [message]` to commit your staged file with the message.
Use the following syntax for commit messages: `#[issue number] - [description of changes made]`.
Examples: `#12 - Expanded the creating commmits section` or `#79 - Increased list padding`.

See [common git commands](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2#onboarding) for alternative methods for staging and committing changes.

## Testing Your Code

Run the unit tests using `npm test` and try to ensure they all pass.

You can run a test coverage report using `npm run coverage` to see where there may be gaps in test cases.
Test coverage reports only go by lines of code, so make sure to also consider if edge cases have been tested.

## Running the App Locally

Use `npm run start` in order to boot up the React app and the back-end serverless functions on your local computer.
Navigate to `localhost:3000` if your browser does not automatically.
The API endpoint can be found at `localhost:3000/.netlify/functions/`.

## When to push package.json?

`package.json` contains all the dependencies of the project. 
Thus, when dependencies are added or removed from the project, or when the version of any dependency is changed, then `package.json` needs to be committed to the branch and pushed to the remote repository.
Unless there are changes to `package.json`, you should **_not_** commit and push any changes to `package-lock.json`.

## Creating a Pull Request

Pull requests (aka PRs) allow for others to review your code before it gets merged together with the `main` branch.
Don't be afraid to open a PR before you are finished if you want feedback on your code, just make sure to note this in your PR.
Pushing more commits to the GitHub repo will add them to the PR.

Ensure that you have pushed your branch to GitHub using `git push`.
You may need to run `git push --set-upstream origin [branch name]` as instructed by the git CLI if the branch does not already exist in the GitHub repo and only exists on your local computer.

Navigate to the [PRs page on GitHub](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/pulls) and click "New pull request".
You may have to select the branch which you would like to merge into the `main` branch.

Give your PR an informative and concise title.
PR titles often match the title of the issue they are linked to, but they do not have to match.

Use [closing keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue) in the description of the PR to link the PR with any associated issue(s).
Example: `closes #27`, `fixed #82`, or `resolve #23, closed #56`.

In the sidebar, request review from any interested team members, which must include `@kevinyu328` or `@jamescd18`.
