# Testing Guidelines

## Testing Principles

- All new features should include appropriate tests.
- Tests should be maintainable, readable, and follow best practices.
- Tests should be isolated and independent so they can run reliably multiple times.
- Each test should set up its own data and avoid relying on the state of other tests.
- Setup and teardown hooks are required to ensure tests are repeatable and do not leak state.

## Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Unit tests should use the naming convention `*.test.js` or `*.test.ts`.
- Backend unit tests should be placed in `packages/backend/__tests__/`.
- Frontend unit tests should be placed in `packages/frontend/src/__tests__/`.
- Name unit test files to match what they are testing, for example `app.test.js` for testing `app.js`.

## Integration Tests

- Use Jest and Supertest to test backend API endpoints with real HTTP requests.
- Integration tests should be placed in `packages/backend/__tests__/integration/`.
- Integration tests should also use the naming convention `*.test.js` or `*.test.ts`.
- Name integration test files intelligently based on what they test, for example `todos-api.test.js` for TODO API endpoints.

## End-to-End (E2E) Tests

- Use Playwright as the required framework to test complete UI workflows through browser automation.
- E2E tests should be placed in `tests/e2e/`.
- E2E tests should use the naming convention `*.spec.js` or `*.spec.ts`.
- Name E2E test files based on the user journey they test, for example `todo-workflow.spec.js`.
- Playwright tests must use one browser only.
- Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- Limit E2E tests to 5-8 critical user journeys, focusing on happy paths and key edge cases rather than exhaustive coverage.

## Port Configuration

- Always use environment variables with sensible defaults for port configuration.
- Backend example: `const PORT = process.env.PORT || 3030;`
- Frontend React apps default to port `3000`, but can be overridden with the `PORT` environment variable.
- This approach allows CI/CD workflows to detect ports dynamically.
