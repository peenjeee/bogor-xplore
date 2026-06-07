import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-[3px] border-[#111111] text-sm font-black uppercase tracking-normal shadow-[4px_4px_0_#111111] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff5caf] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#ffcc00] text-[#111111]",
        glow: "bg-[#ff5caf] text-[#111111]",
        secondary: "bg-[#00e5ff] text-[#111111]",
        outline: "bg-white text-[#111111]",
        ghost:
          "border-transparent bg-transparent text-[#111111] shadow-none hover:border-[#111111] hover:bg-[#32ff7e] hover:shadow-[4px_4px_0_#111111]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
