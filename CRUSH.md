# Development Commands
- Start dev server: `ng serve`
- Build project: `ng build`
- Run all tests: `ng test`
- Run single test file: `ng test --include src/app/component-name.spec.ts`
- Lint code: `ng lint` (uses Prettier config in package.json)

# Code Style Guidelines
## TypeScript
- Use strict type checking
- Prefer type inference when obvious
- Avoid `any`; use `unknown` when uncertain

## Angular
- Use standalone components (default in v21)
- Use signals for state management
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Use native control flow (`@if`, `@for`, `@switch`)
- Prefer Reactive forms over Template-driven
- Use `NgOptimizedImage` for static images
- Use `inject()` function instead of constructor injection

## Formatting
- Line width: 100 characters
- Use single quotes for strings
- HTML files use Angular parser for Prettier

## Naming
- Use descriptive names for components, services, and variables
- Follow Angular naming conventions (kebab-case for file names, PascalCase for classes)