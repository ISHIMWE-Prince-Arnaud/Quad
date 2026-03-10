import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PiArrowLeftBold, PiHouseBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";

interface ContentNotFoundProps {
  title: string;
  description: string;
  icon?: ReactNode;
  backLabel?: string;
  backPath?: string;
  showHomeButton?: boolean;
}

/**
 * ContentNotFound component
 * A premium, consistent fallback for specific content that could not be found.
 * Aligns with the main NotFoundPage styling and PollsPage positioning.
 */
export function ContentNotFound({
  title,
  description,
  icon,
  backLabel = "Go Back",
  backPath,
  showHomeButton = true,
}: ContentNotFoundProps) {
  const navigate = useNavigate();

  return (
    <PageTransition className="mx-auto max-w-[620px] space-y-6 py-8">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        className="mt-4">
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          {showHomeButton && (
            <Button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto rounded-full shadow-md font-bold px-8 h-11">
              <PiHouseBold className="w-5 h-5 mr-2" />
              Home
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
            className="w-full sm:w-auto rounded-full shadow-sm font-bold px-8 h-11 border-border/40">
            <PiArrowLeftBold className="w-5 h-5 mr-2" />
            {backLabel}
          </Button>
        </div>
      </EmptyState>
    </PageTransition>
  );
}
