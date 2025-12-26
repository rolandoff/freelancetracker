import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          // Base styles - Modern design
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',

          // Variants
          {
            // Primary - Modern gradient with shadow
            'bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-medium active:scale-95':
              variant === 'primary',

            // Secondary - Subtle with border
            'border-2 border-border bg-background hover:bg-accent hover:border-primary-300 hover:shadow-soft':
              variant === 'secondary',

            // Destructive - Red gradient
            'bg-gradient-to-br from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 hover:shadow-medium active:scale-95':
              variant === 'destructive',

            // Ghost - Minimal
            'hover:bg-accent/50 hover:text-accent-foreground hover:shadow-soft':
              variant === 'ghost',
          },

          // Sizes with varied border-radius
          {
            'h-8 px-3 text-sm rounded-md': size === 'sm',
            'h-11 px-6 text-base rounded-lg': size === 'md',
            'h-14 px-8 text-lg rounded-xl': size === 'lg',
          },

          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Chargement...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
