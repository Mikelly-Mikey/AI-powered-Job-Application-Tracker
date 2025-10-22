import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorFallback from './components/ErrorFallback';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Error Boundary fallback component
const ErrorFallbackComponent = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        We're sorry, but an unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                duration: 5000,
                success: {
                  className: '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-100',
                  iconTheme: {
                    primary: '#10B981',
                    secondary: 'white',
                  },
                },
                error: {
                  className: '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-100',
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);