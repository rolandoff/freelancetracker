import { cn } from '@/utils/cn'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 shadow-soft">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

interface TableHeaderProps {
  children: React.ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gradient-to-r from-muted/30 to-muted/50 border-b-2 border-border/50">
      <tr>{children}</tr>
    </thead>
  )
}

interface TableHeadProps {
  children: React.ReactNode
  className?: string
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-6 py-4 text-left font-semibold text-sm uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      {children}
    </th>
  )
}

interface TableBodyProps {
  children: React.ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'hover:bg-accent/50 transition-all duration-150',
        onClick && 'cursor-pointer hover:shadow-soft',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export function TableCell({ children, className }: TableCellProps) {
  return <td className={cn('px-6 py-4', className)}>{children}</td>
}
