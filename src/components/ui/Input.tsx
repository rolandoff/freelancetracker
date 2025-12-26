import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-lg border-2 border-border bg-background px-4 py-2',
            'text-sm placeholder:text-muted-foreground',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-4 focus-visible:ring-primary-500/20',
            'hover:border-primary-300',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
            error && 'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
