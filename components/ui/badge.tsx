import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-[#111111] px-2.5 py-1 text-xs font-black uppercase transition-colors shadow-[3px_3px_0_#111111] focus:outline-none focus:ring-4 focus:ring-[#ff5caf] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#111111] text-white",
        secondary: "bg-[#00e5ff] text-[#111111]",
        destructive: "bg-[#ff3b30] text-white",
        outline: "bg-white text-[#111111]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
