# TypeScript Migration Guide

This guide documents the process of migrating components from JavaScript (JSX) to TypeScript (TSX) in the Financial Dashboard application.

## Migration Process

1. **Create TypeScript Version**:

   - Copy the JSX file to a new TSX file with the same name
   - Keep the original JSX file as a backup initially

2. **Add Type Definitions**:

   - Define interfaces for component props
   - Add type annotations to state variables
   - Type function parameters and return values
   - Use TypeScript utility types where appropriate

3. **Use Shared Types**:

   - Import types from `src/types/dashboard.ts` for dashboard-related components
   - Reuse common types instead of redefining them

4. **Common Type Patterns**:
   - For event handlers: `React.MouseEvent<HTMLElement>`, `React.ChangeEvent<HTMLInputElement>`
   - For ref objects: `React.RefObject<HTMLDivElement>`
   - For state: `useState<string>()`, `useState<number[]>()`
   - For refs: `useRef<HTMLDivElement>(null)`

## Common Issues and Solutions

### Type Compatibility with Third-Party Libraries

When working with libraries that don't have perfect TypeScript support:

```typescript
// Use type assertions to overcome compatibility issues
<ThirdPartyComponent {...(props as any)} />;

// Or create properly typed wrappers
const EnhancedComponent = React.forwardRef<HTMLDivElement, MyComponentProps>((props, ref) => {
  // Implementation with proper typing
  return <ThirdPartyComponent {...props} ref={ref} />;
});
```

### DOM Element Type Issues

When working with DOM elements from query selectors:

```typescript
// Type assertion for DOM elements
document.querySelectorAll(".some-class").forEach((el) => {
  (el as HTMLElement).style.display = "none";
});
```

### ForwardRef Type Issues

When using `forwardRef`:

```typescript
// Proper typing for forwardRef
interface MyComponentProps {
  // props definition
}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>((props, ref) => {
  // Implementation
  return <div ref={ref} {...props} />;
});
```

## Organization of Types

- **Component-specific types**: Define in the component file
- **Shared types**: Define in `src/types/{feature}.ts`
- **API/Data types**: Define in `src/types/api.ts` or domain-specific files

## Testing TypeScript Components

After migration:

1. Run the linter to check for TypeScript errors
2. Test the component in the application to ensure functionality
3. Look for edge cases that might not be covered by types

## Resources

- [TypeScript React Cheatsheet](https://github.com/typescript-cheatsheets/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Docs](https://reactjs.org/docs/static-type-checking.html#typescript)
