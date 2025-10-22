import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { theme } = useTheme();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-card-foreground shadow-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We're sorry, but an unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm">
              <code className="text-xs text-muted-foreground">
                {error.message || 'Unknown error occurred'}
              </code>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={resetErrorBoundary}
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
