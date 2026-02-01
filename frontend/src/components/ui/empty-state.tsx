import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
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
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
  variant?: "card" | "inline";
}) {
  const content = (
    <>
      <div className="mx-auto mb-4 h-14 w-14 rounded-3xl bg-card/60 border border-border flex items-center justify-center shadow-sm">
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {actionLabel && actionHref && (
            <Button asChild>
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Button asChild variant="outline">
              <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          )}
        </div>
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center py-10",
          className,
        )}>
        {content}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "shadow-sm bg-card/40 border border-border rounded-[2rem]",
        className,
      )}>
      <CardContent className="py-12 text-center">{content}</CardContent>
    </Card>
  );
}
