import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PiSpinnerBold } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { logError } from "@/lib/errorHandling";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "success"
    | "warning";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses = cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
      {
        "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md":
          variant === "default",
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md":
          variant === "destructive",
        "bg-success text-success-foreground hover:bg-success/90 hover:shadow-md":
          variant === "success",
        "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-md":
          variant === "warning",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20":
          variant === "outline",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm":
          variant === "secondary",
        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
        "text-primary underline-offset-4 hover:underline": variant === "link",
      },
      {
        "h-10 px-4 py-2": size === "default",
        "h-9 rounded-md px-3": size === "sm",
        "h-11 rounded-md px-8": size === "lg",
        "h-10 w-10 p-0": size === "icon",
      },
      className,
    );

    const content = (
      <span className="relative flex items-center justify-center gap-2">
        {loading && <PiSpinnerBold className="h-4 w-4 animate-spin absolute" />}
        <span
          className={cn(
            "flex items-center gap-2 transition-all duration-200",
            loading ? "opacity-0 scale-95" : "opacity-100 scale-100",
          )}>
          {children}
        </span>
      </span>
    );

    if (asChild) {
      if (!React.isValidElement(children)) {
        if (import.meta.env.DEV) {
          logError(
            new Error(
              "Button with asChild expects a single React element child.",
            ),
            {
              component: "Button",
              action: "asChildInvalidChild",
              metadata: { receivedType: typeof children },
            },
          );
        }
        return (
          <button
            className={baseClasses}
            ref={ref}
            disabled={disabled || loading}
            {...props}>
            {content}
          </button>
        );
      }

      const childElement = children as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      const originalChildren = childElement.props?.children;

      return (
        <Slot
          className={baseClasses}
          ref={ref}
          aria-disabled={disabled || loading ? true : undefined}
          data-disabled={disabled || loading ? "" : undefined}
          {...props}>
          {React.cloneElement(
            childElement,
            undefined,
            <span className="relative flex items-center justify-center gap-2">
              {loading && (
                <PiSpinnerBold className="h-4 w-4 animate-spin absolute" />
              )}
              <span
                className={cn(
                  "flex items-center gap-2 transition-opacity duration-200",
                  loading ? "opacity-0" : "opacity-100",
                )}>
                {originalChildren}
              </span>
            </span>,
          )}
        </Slot>
      );
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}>
        {content}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
