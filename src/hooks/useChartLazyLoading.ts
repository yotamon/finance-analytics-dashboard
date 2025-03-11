/**
 * Custom hook that handles lazy loading of charts based on visibility
 * Only renders the chart when it becomes visible in the viewport
 */

import { useState, useEffect, useRef, RefObject } from "react";

/**
 * Options for the chart lazy loading hook
 */
interface ChartLazyLoadingOptions {
  /**
   * Intersection threshold (0 to 1) - percentage of component that must be visible
   */
  threshold?: number;

  /**
   * Delay in ms before rendering after visibility
   */
  delay?: number;
}

/**
 * Return value from the chart lazy loading hook
 */
interface ChartLazyLoadingReturn {
  /**
   * Whether the component is currently visible in the viewport
   */
  isVisible: boolean;

  /**
   * Whether the chart should be rendered (after delay)
   */
  shouldRender: boolean;

  /**
   * Ref to attach to the container element
   */
  ref: RefObject<HTMLDivElement>;
}

/**
 * Custom hook that handles lazy loading of charts based on visibility
 * Only renders the chart when it becomes visible in the viewport
 *
 * @param options - Configuration options
 * @returns Object containing visibility state and ref
 */
function useChartLazyLoading(options: ChartLazyLoadingOptions = {}): ChartLazyLoadingReturn {
  const { threshold = 0.1, delay = 200 } = options;

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    let timeoutId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);

        // Only start the timer if the component is now visible and not yet rendered
        if (entry.isIntersecting && !shouldRender) {
          timeoutId = window.setTimeout(() => {
            setShouldRender(true);
          }, delay);
        } else if (!entry.isIntersecting && !shouldRender) {
          // If the component is no longer visible but the timer is running, clear it
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
          }
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [threshold, delay, shouldRender]);

  return { isVisible, shouldRender, ref };
}

export default useChartLazyLoading;
