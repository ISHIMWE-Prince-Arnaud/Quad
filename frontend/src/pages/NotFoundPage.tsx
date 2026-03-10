import { useNavigate, useLocation } from "react-router-dom";
import { PiArrowLeftBold, PiHouseBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";

/**
 * NotFoundPage component
 * Uses the official Quad EmptyState for visual consistency across the app.
 * Integrated with PageTransition for smooth entry.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <PageTransition className="mx-auto max-w-[620px] space-y-6">
      <EmptyState
        icon={null}
        title="404 - Lost in the Quad"
        description={
          <span>
            The pulse you followed to{" "}
            <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm break-all font-bold">
              {location.pathname}
            </span>{" "}
            led to a void. This page doesn't exist or has been moved.
          </span>
        }
        className="mt-4">
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto rounded-full shadow-md font-bold px-8 h-11">
            <PiHouseBold className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto rounded-full shadow-sm font-bold px-8 h-11 border-border/40">
            <PiArrowLeftBold className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>
      </EmptyState>
    </PageTransition>
  );
}
