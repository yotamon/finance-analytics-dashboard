import { useState, useEffect, useRef } from "react";

/**
 * Custom hook that handles lazy loading of charts based on visibility
 * Only renders the chart when it becomes visible in the viewport
 *
 * @param {Object} options
 * @param {number} options.threshold - Intersection threshold (0 to 1)
 * @param {number} options.delay - Delay in ms before rendering after visibility
 * @returns {Object} state and ref object
 */
function useChartLazyLoading({ threshold = 0.1, delay = 200 } = {}) {
	const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const currentRef = ref.current;
		let timeoutId = null;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);

				// Only start the timer if the component is now visible and not yet rendered
				if (entry.isIntersecting && !shouldRender) {
					timeoutId = setTimeout(() => {
						setShouldRender(true);
					}, delay);
				} else if (!entry.isIntersecting && !shouldRender) {
					// If the component is no longer visible but the timer is running, clear it
					clearTimeout(timeoutId);
				}
			},
			{ threshold }
		);

		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [threshold, delay, shouldRender]);

	return { isVisible, shouldRender, ref };
}

export default useChartLazyLoading;
