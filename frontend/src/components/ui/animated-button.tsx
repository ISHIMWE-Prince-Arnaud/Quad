import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";

interface AnimatedLikeButtonProps extends Omit<ButtonProps, "onClick"> {
  isLiked: boolean;
  onClick: () => void;
  count?: number;
  icon?: React.ReactNode;
}

export function AnimatedLikeButton({
  isLiked,
  onClick,
  count,
  icon,
  className,
  ...props
}: AnimatedLikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "gap-2 transition-all duration-200",
        isLiked && "text-red-500",
        className
      )}
      {...props}>
      <span
        className={cn(
          "transition-transform duration-300",
          isAnimating && "animate-bounce-in scale-125"
        )}>
        {icon || (isLiked ? "❤️" : "🤍")}
      </span>
      {count !== undefined && (
        <span
          className={cn(
            "text-sm transition-all duration-200",
            isAnimating && "scale-110 font-semibold"
          )}>
          {count}
        </span>
      )}
    </Button>
  );
}

interface AnimatedIconButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive?: boolean;
  count?: number;
}

export function AnimatedIconButton({
  onClick,
  icon,
  activeIcon,
  isActive = false,
  count,
  className,
  ...props
}: AnimatedIconButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("gap-2 transition-all duration-200", className)}
      {...props}>
      <span
        className={cn(
          "transition-transform duration-200",
          isAnimating && "scale-125 rotate-12"
        )}>
        {isActive && activeIcon ? activeIcon : icon}
      </span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "text-sm transition-all duration-200",
            isAnimating && "scale-110"
          )}>
          {count}
        </span>
      )}
    </Button>
  );
}
