import { Link } from "react-router-dom";
import { PiWarningCircleBold } from "react-icons/pi";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface ErrorMessageProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  goHomeLabel?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  className?: string;
  variant?: "default" | "network" | "not-found";
}

export function ErrorMessage({
  title = "Something went wrong",
  description,
  onRetry,
  onGoHome,
  retryLabel = "Try Again",
  goHomeLabel = "Go to Home",
  showRetry = true,
  showGoHome = true,
  className,
  variant = "default",
}: ErrorMessageProps) {
  const getIcon = () => {
    return <PiWarningCircleBold className="h-8 w-8 text-destructive" />;
  };

  const getTitle = () => {
    switch (variant) {
      case "network":
        return "Connection Problem";
      case "not-found":
        return "Page Not Found";
      default:
        return title;
    }
  };

  const getDescription = () => {
    switch (variant) {
      case "network":
        return "Unable to connect to our servers. Please check your internet connection and try again.";
      case "not-found":
        return "The page you're looking for doesn't exist or may have been moved.";
      default:
        return description;
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      <EmptyState
        icon={getIcon()}
        title={getTitle()}
        description={getDescription()}>
        {(showRetry || showGoHome) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                className="rounded-full shadow-md font-bold px-8">
                {retryLabel}
              </Button>
            )}
            {showGoHome && (
              <Button
                asChild={!onGoHome}
                onClick={onGoHome}
                variant="outline"
                className="rounded-full shadow-sm font-bold px-6">
                {!onGoHome ? <Link to="/">{goHomeLabel}</Link> : goHomeLabel}
              </Button>
            )}
          </div>
        )}
      </EmptyState>
    </motion.div>
  );
}
