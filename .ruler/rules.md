# Coding Rules

## Core Principles

1. **Prefer Built-in Solutions** - Always use npm packages or built-in language features over custom implementations
2. **Search Before Building** - Always search online for existing packages or services before implementing custom solutions
3. **No Dead Code** - Remove unused code after implementation, keep codebase clean
4. **Meaningful Comments Only** - Only add comments that explain "why", not "what"
5. **Read Docs First** - Read existing documentation before starting any implementation
6. **Suggest Improvements** - If a better approach exists, suggest it before implementing

## Type Safety

- Use TypeScript strict mode
- Never use `any` type, prefer `unknown` if type is uncertain
- Use Zod for runtime validation at system boundaries
- Define explicit return types for public functions

## Error Handling

- Use proper error types (TRPCError, custom Error classes)
- Never swallow errors silently
- Log errors with appropriate context and level
- Handle errors at the right layer

## Testing

- Write tests for new features and bug fixes
- Use Vitest with the existing configuration
- Test edge cases and error paths

## Security

- Validate all user inputs
- Sanitize outputs to prevent XSS
- Follow OWASP guidelines
- Never commit secrets or credentials

## Performance

- Avoid premature optimization - optimize only when needed with measured data
- Use lazy loading for routes and heavy components
- Prefer pagination over loading large datasets
- Cache expensive operations appropriately

## Code Style

- Follow existing Biome configuration
- Use tabs for indentation
- Double quotes for strings
- Self-closing JSX elements
