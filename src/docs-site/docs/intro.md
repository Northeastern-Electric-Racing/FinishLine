---
title: Introduction
description: Welcome to the FinishLine developer documentation
skill: false
---

# FinishLine Developer Documentation

Welcome to the FinishLine developer documentation! This site contains comprehensive guides for developing and maintaining the FinishLine project management platform.

## What is FinishLine?

FinishLine is a full-stack ERP and project management application built for **Northeastern Electric Racing (NER)**, a student engineering organization at Northeastern University that designs, builds, and races electric vehicles.

## Documentation Structure

The documentation is organized by topic in the sidebar. Browse the categories to find guides on:

- Setting up your development environment
- Backend architecture and patterns
- API development and testing
- Database queries and data transformations
- And more!

## Getting Started

If you're new to the project, we recommend starting with:

1. [Repository Overview](repository-overview) - Understand the overall architecture and set up your development environment
2. [Backend Endpoints](general-practices/backend-endpoints) - Learn the backend patterns and API structure
3. [Postman API Testing](general-practices/postman-api-testing) - Learn how to test APIs with Postman

## Contributing

This documentation is the source of truth for developer guides. To contribute:

1. Edit the relevant documentation file in `docs-site/docs/`
2. Run `yarn docs:dev` to see your changes
3. If you edited a skill doc (`skill: true`), run `yarn skills:sync` to update Claude's skills
4. Submit a pull request with your documentation changes

## Need Help?

- Check the [GitHub repository](https://github.com/Northeastern-Electric-Racing/FinishLine)
- Reach out to the development team on Slack
