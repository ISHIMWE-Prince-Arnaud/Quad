import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return <div className={cn("animate-fade-in", className)}>{children}</div>;
}

export function SlideInFromBottom({
  children,
  className,
}: PageTransitionProps) {
  return (
    <div className={cn("animate-slide-in-from-bottom", className)}>
      {children}
    </div>
  );
}

export function SlideInFromTop({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-slide-in-from-top", className)}>{children}</div>
  );
}

export function ScaleIn({ children, className }: PageTransitionProps) {
  return <div className={cn("animate-scale-in", className)}>{children}</div>;
}
