import * as React from 'react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
}

export function Alert({ variant = 'default', className = '', children, ...props }: AlertProps) {
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
    destructive: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
  }

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variantStyles[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm ${className}`} {...props}>
      {children}
    </p>
  )
}
