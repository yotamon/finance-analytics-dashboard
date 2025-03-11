import { useEffect, useRef } from "react";

/**
 * Custom hook to track component rendering and log it for debugging purposes
 *
 * @param componentName - Name of the component being tracked
 * @param props - Optional props to log
 */
export function useRenderTracker(componentName: string, props?: Record<string, any>) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === "development") {
      const renderTime = performance.now() - startTime.current;
      // eslint-disable-next-line no-console
      console.log(
        `%c${componentName} rendered in ${renderTime.toFixed(2)}ms (${renderCount.current} times)`,
        "color: #3182ce; font-weight: bold;"
      );

      if (props && Object.keys(props).length > 0) {
        // eslint-disable-next-line no-console
        console.log("%cProps:", "color: #2b8a3e; font-weight: bold;", props);
      }
    }

    return () => {
      console.log(
        `%c[RenderTracker] ${componentName} unmounted`,
        "background: #fff5f5; color: #e03131; padding: 2px 4px; border-radius: 2px;"
      );
    };
  }, [componentName]);

  return renderCount.current;
}

export default useRenderTracker;
