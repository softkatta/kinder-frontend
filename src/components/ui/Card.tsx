import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, glass, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        glass ? 'card-glass' : 'card',
        hover && 'hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
