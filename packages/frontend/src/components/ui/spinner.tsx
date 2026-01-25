import { cn } from '@/lib/utils'
import { Loader, type LucideProps } from 'lucide-react'

export function Spinner({ className, ...props }: LucideProps) {
  return <Loader className={cn('animate-spin', className)} {...props} />
}
