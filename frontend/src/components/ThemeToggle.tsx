import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { cn } from '../utils/cn';

export interface ThemeToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size of the toggle button
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Show label next to the icon
   * @default false
   */
  showLabel?: boolean;
  /**
   * Custom class name for the icon
   */
  iconClassName?: string;
}

/**
 * A theme toggle button that switches between light and dark mode.
 * Uses the `useTheme` hook from the nearest `ThemeProvider`.
 */
export function ThemeToggle({
  className,
  size = 'default',
  showLabel = false,
  iconClassName,
  ...props
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={cn(
          'h-auto w-auto p-2 opacity-0 transition-opacity',
          className
        )}
        aria-hidden="true"
      >
        <span className="sr-only">Loading theme...</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn('h-auto w-auto p-2', className)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      {...props}
    >
      {isDark ? (
        <Sun className={cn('h-5 w-5', iconClassName)} />
      ) : (
        <Moon className={cn('h-5 w-5', iconClassName)} />
      )}
      {showLabel && (
        <span className="ml-2">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
}

export default ThemeToggle;
