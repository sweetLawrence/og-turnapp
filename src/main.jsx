
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// =====================================================
// CONSOLE LOGGING
// =====================================================

const isDev = import.meta.env.MODE === 'development';

// Add ?debug=true to the URL to enable all logs in production
//
// Example:
// https://yourdomain.com/events/123?debug=true
const isDebug =
  new URLSearchParams(window.location.search).get('debug') === 'true';

// -----------------------------------------------------
// Production logging
// -----------------------------------------------------
//
// Development:
//   console.log()   -> visible
//   console.info()  -> visible
//   console.debug() -> visible
//   console.warn()  -> visible
//   console.error() -> visible
//
// Production:
//   console.log()   -> hidden
//   console.info()  -> hidden
//   console.debug() -> hidden
//   console.warn()  -> visible
//   console.error() -> hidden
//
// Production + ?debug=true:
//   Everything -> visible
// -----------------------------------------------------

if (!isDev && !isDebug) {
  // Hide normal/debug logs
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.table = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
  console.groupCollapsed = () => {};
  console.trace = () => {};
  console.dir = () => {};

  // Keep console.warn() visible
  // console.warn is intentionally NOT disabled.

  // Hide console.error() in production
  console.error = () => {};
}

// Show a message when production debug mode is enabled
if (!isDev && isDebug) {
  console.log('Debug mode enabled');
}

// =====================================================
// REACT APPLICATION
// =====================================================

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
