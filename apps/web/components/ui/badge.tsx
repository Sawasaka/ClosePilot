import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-[#F3F4F6] text-[#374151] border-transparent',
        primary: 'bg-[#EEF2FF] text-[#4F46E5] border-transparent',
        success: 'bg-[#ECFDF5] text-[#059669] border-transparent',
        warning: 'bg-[#FFFBEB] text-[#D97706] border-transparent',
        error: 'bg-[#FEF2F2] text-[#DC2626] border-transparent',
        info: 'bg-[#EFF6FF] text-[#2563EB] border-transparent',
        outline: 'bg-transparent text-[#374151] border-[#E5E7EB]',
        'rank-s': 'bg-[#ECFDF5] text-[#059669] border-transparent',
        'rank-a': 'bg-[#EFF6FF] text-[#2563EB] border-transparent',
        'rank-b': 'bg-[#FFFBEB] text-[#D97706] border-transparent',
        'rank-c': 'bg-[#FFF7ED] text-[#EA580C] border-transparent',
        'rank-d': 'bg-[#F3F4F6] text-[#6B7280] border-transparent',
        'ai-auto': 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
        'ai-low': 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
