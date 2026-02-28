import type { ReactNode } from "react";
import { Link } from "react-router-dom";


import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  className,
  variant = "card",
  children,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
  variant?: "card" | "inline";
  children?: ReactNode;
}) {
  const content = (
    <div className="text-muted-foreground max-w-sm mx-auto">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/50 ring-1 ring-inset ring-border/50 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
      <div className="text-[15px] text-muted-foreground/80 leading-relaxed mb-6">
        {description}
      </div>

      {(actionLabel || secondaryActionLabel || children) && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionLabel && actionHref && (
            <Button asChild className="rounded-full shadow-md font-bold px-8">
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Button asChild variant="outline" className="rounded-full shadow-sm font-bold px-6">
              <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col flex-1 items-center justify-center text-center py-24 w-full h-full",
          className,
        )}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-center py-24 px-6 bg-card/10 rounded-[2.5rem] border-2 border-dashed border-border/50 hover:bg-card/30 transition-colors duration-300 w-full flex items-center justify-center",
        className,
      )}>
      {content}
    </div>
  );
}
