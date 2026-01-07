import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsAuthRequiredCard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to be signed in to view analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
