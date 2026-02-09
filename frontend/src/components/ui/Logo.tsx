import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function Logo({ className, size = "lg" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Quad"
      draggable={false}
      className={cn(
        "object-contain select-none transition-transform duration-300 ease-out",
        sizeClasses[size],
        className,
      )}
    />
  );
}

// Logo with text for branding
export function LogoWithText({ className, size = "lg" }: LogoProps) {
  const gapClass =
    size === "sm" ? "gap-3" : size === "md" ? "gap-3.5" : "gap-4";
  const titleClass =
    size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-[22px]";

  return (
    <div className={cn("flex items-center group", gapClass, className)}>
      <div className="relative">
        <Logo
          size={size}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        />
        {/* Subtle glow effect behind logo */}
        <div
          className={cn(
            "absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            size === "sm" ? "scale-125" : "scale-150",
          )}
        />
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            titleClass,
            "font-extrabold tracking-tight transition-all duration-300",
            "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
            "group-hover:tracking-normal", // Subtle expansion on hover
          )}>
          Quad
        </span>
      </div>
    </div>
  );
}
