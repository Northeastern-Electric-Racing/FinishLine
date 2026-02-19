---
name: postman-api-testing
description: Guide for using Postman to test and interact with the FinishLine API during development. Use when testing API endpoints, debugging backend issues, verifying request/response formats, or when asked how to use Postman with the local development environment.
---

# Postman API Testing

> **Summary:** Postman enables developers to test API endpoints locally during development. This guide covers setup, authentication, common workflows, and troubleshooting for the FinishLine API running on localhost:3001.

## Overview

Postman is an API development tool that allows you to make HTTP requests to the FinishLine backend without needing the frontend interface. This is particularly useful for:

- Testing new endpoints during development
- Debugging backend issues in isolation
- Verifying request and response formats
- Exploring available API data without UI constraints

All API requests in local development target `http://localhost:3001`, which is the Express server running on your machine. Many endpoints require authentication using a user ID obtained from the `/users` endpoint.

## Prerequisites

Before you begin, ensure you have:

- [Postman](https://www.postman.com/downloads/) installed
- The FinishLine backend running locally
- The PostgreSQL database running in Docker with seeded data

## Verifying the API is Running

Before making requests, confirm the backend is accessible:

1. Start the backend server if not already running:

   ```bash
   yarn backend:dev
   ```

2. The console should show the server listening on port 3001

3. Make a test request to the base URL in Postman: `GET http://localhost:3001`

If you receive a "Welcome to NER" message, your backend is running and listening on port 3001. This is also the default message you will see if the router cannot resolve the url you requested, so if you get this while trying to test an endpoint it is likely that you have a typo in the url or are using the wrong HTTP method (e.g. POST instead of GET).

## Base URL

All API requests in local development should be made to:

```
http://localhost:3001
```

This is the Express server listening for HTTP requests. The backend handles routing, authentication, and business logic before querying the PostgreSQL database.

## Authentication

Many endpoints in the FinishLine API require authentication to enforce permission checks and organization scoping. Here's how to authenticate your Postman requests:

### Step 1: Get a User ID

First, fetch a user from the `/users` endpoint:

1. Create a new GET request in Postman
2. Enter URL: `http://localhost:3001/users`
3. Click **Send**
4. The response contains an array of users with their `userId` fields
5. Copy a `userId` from any user in the response (typically a string like `"abc-123-def"`)

### Step 2: Add Authorization Header

For endpoints requiring authentication:

1. Navigate to the **Headers** tab in your request
2. Add a new header with:
   - **Key:** `authorization`
   - **Value:** `<paste-the-user-id-here>`
3. Send your request

Without proper authorization, protected endpoints will return `401 Unauthorized` or `403 Forbidden` responses depending on the permission level required.

## Common Workflows

### Fetching All Users

**Endpoint:** `GET http://localhost:3001/users`

**Purpose:** Retrieve all users in the system. Use this to find user IDs for authentication in other requests.

**Authentication:** Not required

**Steps:**

1. Create a new request in Postman
2. Set method to **GET** using the dropdown menu
3. Enter URL: `http://localhost:3001/users`
4. Click **Send**

**Response:** Array of user objects with `userId`, `firstName`, `lastName`, `email`, and role information.

### Fetching All Projects

**Endpoint:** `GET http://localhost:3001/project`

**Purpose:** Retrieve all projects in the system. Useful for finding existing project data, WBS numbers, or materials associated with projects.

**Authentication:** Check the route definition to confirm if required

**Steps:**

1. Create a new request
2. Set method to **GET**
3. Enter URL: `http://localhost:3001/project`
4. Add authorization header if needed (see Authentication section)
5. Click **Send**

**Response:** Array of project objects with details like `projectId`, `name`, `wbsNum`, `status`, `teams`, and nested data.

### Making Authenticated Requests

For any endpoint that requires authentication:

1. Fetch a user ID from `GET /users` (see above)
2. Add the `authorization` header with the user ID as the value
3. Make your request normally

If you forget authorization on a protected route, the response will include an error message indicating permission denied or unauthorized access.

### Creating or Updating Data (POST Requests)

When testing endpoints that create or modify data:

1. Set request method to **POST**
2. Add authentication header with a valid user ID
3. Navigate to the **Body** tab
4. Select **raw** and **JSON** format from the dropdown
5. Enter the request payload as valid JSON
6. Click **Send**

Example JSON body structure (varies by endpoint):

```json
{
  "name": "New Project",
  "description": "Project description",
  "leadId": "user-id-here"
}
```

Refer to the backend route validation rules in `src/backend/src/routes/` to determine required fields and formats.

## Using Postman Features

### Request Type Selection

The dropdown menu to the left of the URL field allows you to select the HTTP request method. FinishLine follows this convention:

- **GET** — Retrieve data (read operations)
- **POST** — Create new data, update existing data, or delete data

Note: FinishLine does not use `PUT`, `PATCH`, or `DELETE` HTTP methods. All mutations use `POST`.

### Key Tabs in Postman

Postman provides several tabs for configuring requests:

- **Params** — Add query parameters to your URL (e.g., `?limit=10&offset=0`)
- **Authorization** — Alternative way to set auth (use Headers tab for FinishLine)
- **Headers** — Add HTTP headers like `authorization`, `Content-Type`, `organizationId`
- **Body** — Include request payload for POST requests (select raw → JSON format)

## Finding Endpoint URLs

To discover available endpoints and their paths:

1. **Check route files:** Backend routes are defined in `src/backend/src/routes/{feature}.routes.ts`
2. **Combine base paths:** The full URL is `index.ts` base path + route path
   - Example: If `index.ts` has `app.use('/calendar', calendarRouter)` and the route defines `POST /shop/create`, the full endpoint is `POST /calendar/shop/create`
3. **Review validation:** Route files show which fields are required and their validation rules using `express-validator`

## Organization Scoping

FinishLine is a multi-tenant application. Most endpoints filter data by `organizationId`. In local development with seed data, the organization ID is typically included automatically via middleware.

If an endpoint requires an explicit `organizationId` header:

1. Go to the **Headers** tab
2. Add key: `organizationId`
3. Set value to a valid organization ID (check your seed data or database)

## Troubleshooting

### "Welcome to NER" Message

**Problem:** You receive a plain text "Welcome to NER" response.

**Cause:** The endpoint URL is incorrect or the route doesn't exist. This is the default response when Express can't find a matching route handler.

**Solution:**

- Double-check the endpoint URL for typos
- Verify the HTTP method matches the route definition (GET vs POST)
- Confirm the route is registered in `src/backend/index.ts`
- Check that the feature router is imported and mounted on the correct base path

### Connection Refused or Network Error

**Problem:** Postman cannot connect to `http://localhost:3001`.

**Cause:** The backend server is not running.

**Solution:**

- Start the backend: `yarn backend:dev` or `yarn start`
- Verify the console shows "Server listening on port 3001"
- Check no other process is using port 3001
- Wait a few seconds for the server to fully start after running the command

### 401 Unauthorized or 403 Forbidden

**Problem:** The endpoint returns a 401 or 403 error.

**Cause:** Missing or invalid authentication, or insufficient permissions.

**Solution:**

- Ensure you've added the `authorization` header with a valid user ID
- Verify the user ID exists in the database (check `/users` response)
- Confirm the user has sufficient permissions for the operation (check the service method's permission check)
- Try using a different user with higher privileges (e.g., an admin user)

### 400 Bad Request

**Problem:** The endpoint returns a 400 error with validation messages.

**Cause:** The request payload doesn't match the validation rules defined in the route.

**Solution:**

- Check the route file (`src/backend/src/routes/`) for validation rules
- Verify all required fields are present in the request body
- Ensure field types match expectations (string, number, date, boolean)
- Check for typos in field names
- Review the error response for specific validation failure details

### Date Format Issues

**Problem:** Date fields are rejected or cause errors.

**Cause:** Invalid date string format.

**Solution:**

- Use ISO 8601 date format: `"2025-02-16T12:00:00.000Z"`
- Or use a simpler format: `"2025-02-16"`
- Avoid relative dates like "yesterday" or "last week"
- The backend controller parses date strings with `new Date()`, so any format recognized by JavaScript's Date constructor works

### Empty or Unexpected Response

**Problem:** The endpoint returns 200 OK but the data is empty or not what you expected.

**Cause:** Data may be filtered by organization scope, soft-deleted, or the query returned no matches.

**Solution:**

- Check the database for relevant data: `yarn prisma:studio`
- Verify `dateDeleted` is `null` on the records you expect to see
- Confirm the records belong to the organization you're querying
- Review the service method's query filters and transformers

## Available Endpoints Reference

This table lists some core endpoints available in the FinishLine API. For a complete list, review the route files in `src/backend/src/routes/`.

| Endpoint   | Method | Description                               | Auth Required |
| ---------- | ------ | ----------------------------------------- | ------------- |
| `/users`   | GET    | Fetch all users with roles and settings   | False         |
| `/project` | GET    | Fetch all projects with WBS and team data | True          |

_Note: This table is incomplete. When discovering new endpoints, add them here with their method, purpose, and authentication requirements._

## Key Rules

- The base URL is always `http://localhost:3001` for local development
- Use **GET** for reads and **POST** for all mutations (create, update, delete)
- Authentication uses the `authorization` header with a user ID value
- Fetch user IDs from the `/users` endpoint before testing protected routes
- Full endpoint URLs combine the base path from `index.ts` and the route path
- Expect "Welcome to NER" for non-existent or incorrectly typed endpoints
- Validate request payloads against the route's `express-validator` rules
- Organization scoping is enforced — data is filtered by `organizationId`

## Common Mistakes

- **Not starting the backend server** before making requests
- **Forgetting the authorization header** on protected endpoints
- **Using incorrect HTTP methods** (e.g., PUT or DELETE instead of POST)
- **Mistyping the endpoint URL** (check the full path: base + route)
- **Not checking route validation rules** before constructing POST request bodies
- **Assuming all endpoints require authentication** — check the route definition
- **Ignoring 400 error details** — the response usually explains what's invalid

## Reference Files

- `src/backend/index.ts` — Route registration and middleware setup
- `src/backend/src/routes/{feature}.routes.ts` — Route definitions with HTTP methods and validation rules
- `src/backend/src/controllers/{feature}.controllers.ts` — Request handling logic
- `src/backend/src/services/{feature}.services.ts` — Business logic and permission checks

## Tips for Efficient Testing

- **Save requests in collections:** Organize related endpoints into Postman collections for easy reuse
- **Use environments:** Create a Postman environment with variables like `baseUrl` and `userId` to avoid repetitive typing
- **Inspect responses:** Check the response status, headers, and body to verify expected behavior
- **Test edge cases:** Try invalid inputs, missing fields, and unauthorized access to verify error handling
- **Review console logs:** The backend terminal shows request logs and error stack traces

## Contributing to This Documentation

If you discover additional endpoints, common workflows, or troubleshooting tips, please update this document following the same structure. Add new endpoints to the reference table, new workflows under Common Workflows, and new issues under Troubleshooting.
