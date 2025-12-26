import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm hover:shadow-md hover:scale-105',
        secondary:
          'bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border/50 hover:border-primary-300',
        destructive:
          'bg-gradient-to-br from-error-500 to-error-600 text-white shadow-sm hover:shadow-md',
        success:
          'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-sm hover:shadow-md',
        warning:
          'bg-gradient-to-br from-warning-500 to-warning-600 text-white shadow-sm hover:shadow-md',
        outline: 'border-2 border-current text-foreground hover:bg-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
