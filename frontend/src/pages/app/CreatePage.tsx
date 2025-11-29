import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";

export default function CreatePage() {
  return (
    <ComponentErrorBoundary componentName="CreatePage">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                variant="outline"
                className="flex h-20 flex-col gap-2"
                asChild>
                <Link to="/app/create/post">
                  <Plus className="h-6 w-6" />
                  <span>Create Post</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex h-20 flex-col gap-2"
                asChild>
                <Link to="/app/create/story">
                  <Plus className="h-6 w-6" />
                  <span>Create Story</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex h-20 flex-col gap-2"
                asChild>
                <Link to="/app/create/poll">
                  <Plus className="h-6 w-6" />
                  <span>Create Poll</span>
                </Link>
              </Button>
              <Button variant="outline" className="flex h-20 flex-col gap-2">
                <Plus className="h-6 w-6" />
                <span>Create Event</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
}
