import { FileText, Camera, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";

export default function CreatePage() {
  return (
    <ComponentErrorBoundary componentName="CreatePage">
      {/* Full screen flex container to center content */}
      <div className="flex items-center justify-center px-6 py-12 bg-background animate-fade-in">
        <div className="max-w-3xl w-full space-y-8">

          {/* Page Header */}
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
              </span>
              Create Something New
            </h1>

            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Start by choosing the type of content you want to publish.
            </p>
          </header>

          {/* Options Card */}
          <Card className="rounded-xl shadow-md border-border/60">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold text-center">Choose an Option</h2>
            </CardHeader>

            <CardContent className="pt-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CreateTile to="/app/create/post" label="Post" icon={FileText} />
                <CreateTile to="/app/create/story" label="Story" icon={Camera} />
                <CreateTile to="/app/create/poll" label="Poll" icon={BarChart3} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}

function CreateTile({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link to={to}>
      <div
        className="
          group flex h-32 flex-col items-center justify-center gap-3 
          rounded-xl border border-border/50 bg-card shadow-sm 
          transition-all duration-300

          hover:shadow-lg hover:bg-accent/40 
          hover:border-primary/40 hover:ring-1 hover:ring-primary/20
          active:scale-[0.97]
        "
      >
        <span
          className="
            rounded-full bg-primary/10 p-3 text-primary 
            transition-all group-hover:bg-primary/20 group-hover:scale-110
          "
        >
          <Icon className="h-6 w-6" />
        </span>

        <span className="font-medium text-sm">{label}</span>
      </div>
    </Link>
  );
}
