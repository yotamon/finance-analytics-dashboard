# Context Restructuring Plan

This document outlines the plan for reorganizing and consolidating the React Context providers in the Finance Analyzer application.

## Current Context Structure

Currently, we have several overlapping context providers:

1. `FinancialDataContext.tsx` - TypeScript version for financial data
2. `DataContext.jsx` - JavaScript version for data management
3. `CurrencyContext.jsx` - For currency settings and conversions
4. `ConfigContext.jsx` - For application configuration
5. `ThemeContext.tsx` - TypeScript version for theme
6. `ThemeContext.jsx` - JavaScript version for theme (duplicate)
7. `I18nContext.jsx` - For internationalization
8. `UiContext.jsx` - For UI state management

## Proposed Context Structure

We will reorganize contexts into clear domains:

1. **Data Management**

   - `FinancialDataContext.tsx` - All financial data (transactions, accounts, etc.)

2. **Application Settings**

   - `SettingsContext.tsx` - Consolidated from ConfigContext and parts of UiContext
     - User preferences
     - Application configuration
     - Feature flags

3. **UI & Presentation**

   - `ThemeContext.tsx` - Visual theme settings and mode toggling
   - `UiStateContext.tsx` - UI state like sidebar open/closed, active view, dialogs

4. **Internationalization**
   - `I18nContext.tsx` - Language settings and translations
   - `CurrencyContext.tsx` - Currency formatting and conversion

## Implementation Steps

### 1. Refine FinancialDataContext

1. Keep the existing TypeScript version
2. Migrate any unique functionality from DataContext.jsx
3. Improve type safety and error handling
4. Add more robust filtering capabilities

### 2. Create New SettingsContext

1. Create `src/context/SettingsContext.tsx` with proper TypeScript typing
2. Migrate relevant settings from ConfigContext.jsx
3. Add user preference management
4. Add persistence via localStorage

### 3. Standardize Theme Context

1. Keep the TypeScript version
2. Migrate any unique functionality from the JSX version
3. Enhance theme customization capabilities
4. Ensure proper dark/light mode switching

### 4. Enhance UI State Context

1. Create `src/context/UiStateContext.tsx` with proper TypeScript typing
2. Focus on UI-specific state (navigation, active views, dialogs)
3. Separate from application settings
4. Add proper state management for modals and drawers

### 5. Update I18n and Currency Contexts

1. Convert I18nContext to TypeScript
2. Convert CurrencyContext to TypeScript
3. Add proper error handling and fallbacks
4. Implement proper separation of concerns

## Context Dependencies

```
FinancialDataContext → CurrencyContext
                      ↓
       UiStateContext → ThemeContext
                      ↓
      SettingsContext → I18nContext
```

## Migration Strategy

1. Create new TypeScript context files
2. Implement the basic functionality in each
3. Refactor components to use the new contexts one by one
4. Run tests to ensure functionality is maintained
5. Remove deprecated contexts once all components have been migrated

## Context API Best Practices

1. Use the reducer pattern for complex state
2. Provide memoized values to prevent unnecessary re-renders
3. Split complex contexts into smaller, more focused providers
4. Use proper TypeScript typing for all context values and functions
5. Document context interfaces and examples of usage
6. Add error boundaries around context providers
7. Implement proper fallbacks for missing context values

## Example Context Usage Pattern

```tsx
// Context definition
export interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

export const MyContext = createContext<MyContextType | undefined>(undefined);

// Context hook
export const useMyContext = (): MyContextType => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};

// Context provider
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState<string>("");

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      value,
      setValue,
    }),
    [value]
  );

  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};
```
