import { useNavigate } from "react-router-dom";
import { PiArrowLeftBold } from "react-icons/pi";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
  labelClassName?: string;
  hideLabelOnMobile?: boolean;
}

export function BackButton({
  label = "Back",
  fallbackPath = "/",
  className,
  labelClassName,
  hideLabelOnMobile = true,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // If there's history, navigate back
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Otherwise fallback to safe default
      navigate(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "group inline-flex items-center gap-3 text-muted-foreground hover:text-foreground font-bold transition-all",
        className,
      )}
      aria-label={label || "Go back"}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary group-hover:bg-accent transition-colors shrink-0">
        <PiArrowLeftBold className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
      </div>
      {label && (
        <span
          className={cn(
            "text-xl tracking-tight",
            hideLabelOnMobile && "hidden sm:block",
            labelClassName,
          )}>
          {label}
        </span>
      )}
    </button>
  );
}
