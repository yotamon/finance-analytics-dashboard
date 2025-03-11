import { useState, useEffect } from "react";

/**
 * Custom hook for managing localStorage values with TypeScript support
 * @template T The type of the value being stored
 * @param {string} key The localStorage key
 * @param {T} initialValue The initial value if key is not found in localStorage
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} A tuple containing the value, setter, and clear function
 */
export default function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Create state to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to clear the stored value
  const clearValue = () => {
    try {
      // Remove from localStorage
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }

      // Reset state to initial value
      setStoredValue(initialValue);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  };

  // Update local state if localStorage changes in another tab/window
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        // If the key was removed
        setStoredValue(initialValue);
      }
    };

    // Listen for changes to localStorage
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);

      // Cleanup the event listener
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }

    return undefined;
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}
