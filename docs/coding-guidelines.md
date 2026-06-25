# Coding Guidelines

This project should follow a clean, consistent, and maintainable coding style. Code is expected to be easy to read, easy to extend, and easy to review. The goal is not just to make things work, but to make them understandable and reliable over time.

## General Style

Write code that is clear and intentional. Favor readability over cleverness, and prefer straightforward solutions that other developers can understand quickly. Use descriptive names for variables, functions, and components so the purpose of each piece of code is obvious.

Keep formatting consistent across the project. Use indentation that is easy to scan, keep lines reasonably short, and break long logic into smaller, well-named pieces when needed. Follow the conventions already used in the repository so new code feels like it belongs with the existing codebase.

## Structure and Organization

Organize code into small, focused units with a single responsibility whenever possible. Group related logic together and keep files scoped to a clear purpose. Avoid placing unrelated behavior in the same function, component, or module.

Keep imports organized and intentional. Group built-in modules, third-party packages, and local project files in a predictable order. Remove unused imports and avoid circular dependencies when possible.

## Readability and Maintainability

Write code that is easy to debug and modify. Favor explicit logic over hidden behavior, and make important decisions clear in the implementation. When a piece of logic becomes complex, consider breaking it into helper functions or smaller components.

Follow the DRY principle by avoiding unnecessary duplication. If the same logic appears in multiple places, extract it into a shared function, utility, or component. At the same time, avoid over-abstracting simple code just for the sake of reuse.

## Linting and Quality

Use the project linter and follow its warnings consistently. Linting helps enforce a shared standard and catches common issues early. Fix problems rather than suppressing them unless there is a clear and justified reason.

Code should be tested where appropriate. New features and bug fixes should include tests that validate the behavior they introduce. Prefer simple, focused tests that verify real outcomes rather than overly brittle implementations.

## Best Practices

- Keep functions and components small and focused.
- Use comments sparingly and only when they add real value.
- Prefer clear naming over overly short or vague identifiers.
- Handle errors gracefully and avoid silent failures.
- Keep dependencies minimal and justified.
- Refactor when code becomes hard to follow.

Overall, the project should value clarity, consistency, and quality in every change that is made.
