import React, { Profiler } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Inter font
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// Set up the root element for React
const rootElement = document.getElementById("root");

// TypeScript check to ensure rootElement exists
if (!rootElement) {
  throw new Error(
    'Failed to find the root element. The "root" element is required in your HTML file.'
  );
}

// Create a React root and render the App
const root = ReactDOM.createRoot(rootElement);

// Only add profiler in development mode
if (process.env.NODE_ENV === "development") {
  const onRenderCallback = (
    id: string,
    phase: string,
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // Only log expensive renders (more than 10ms)
    if (actualDuration > 10) {
      // eslint-disable-next-line no-console
      console.log(`[Render Profiler] ${id} - ${phase}: ${Math.round(actualDuration)}ms`);
    }
  };

  root.render(
    <Profiler id="App" onRender={onRenderCallback}>
      <App />
    </Profiler>
  );
} else {
  root.render(<App />);
}
