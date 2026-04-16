import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none outline-none",
  {
    variants: {
      variant: {
        default: "bg-charcoal text-white hover:opacity-90",
        outline:
          "bg-white text-charcoal hover:bg-secondary border border-border",
        secondary: "bg-secondary text-charcoal hover:opacity-80",
        ghost: "bg-transparent text-charcoal hover:bg-secondary",
        destructive:
          "bg-destructive text-[var(--destructive-foreground)] hover:opacity-90",
        danger: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        icon: "size-10",
        pill: "h-10 px-6 rounded-pill",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { isLoading?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin size-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        props.children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
