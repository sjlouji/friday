import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[#0969da] text-white",
        gray: "bg-[#eaeef2] text-[#24292f] hover:bg-[#d0d7de]",
        green: "bg-[#2da44e] text-white",
        yellow: "bg-[#d4a72c] text-white",
        red: "bg-[#cf222e] text-white",
        purple: "bg-[#8250df] text-white",
        blue: "bg-[#0969da] text-white",
        orange: "bg-[#bc4c00] text-white",
        pink: "bg-[#bf3989] text-white",
      },
      size: {
        default: "h-5",
        sm: "h-4",
        lg: "h-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 