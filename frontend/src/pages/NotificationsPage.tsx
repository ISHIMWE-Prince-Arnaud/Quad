import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { BellOff } from "lucide-react";

import { NotificationRow } from "./notifications/NotificationRow";
import { NotificationsHeader } from "./notifications/NotificationsHeader";
import { useNotificationsController } from "./notifications/useNotificationsController";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const controller = useNotificationsController({ navigate, limit: 20 });

  // UI ------------------------------------------------------

  return (
    <ComponentErrorBoundary componentName="NotificationsPage">
      <Card className="border-0 shadow-none rounded-none bg-transparent overflow-hidden">
        {/* Header */}
        <CardHeader className="sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b px-4 py-3">
          <NotificationsHeader
            filter={controller.filter}
            unreadLocalCount={controller.unreadLocalCount}
            onFilterChange={controller.handleFilterChange}
            onMarkAllAsRead={() => void controller.handleMarkAllAsRead()}
            onClearRead={() => void controller.handleClearRead()}
          />
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          {/* Skeleton loading */}
          {controller.initialLoading && (
            <div className="divide-y divide-border/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 animate-pulse">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {controller.error && !controller.initialLoading && (
            <div className="p-8 text-center">
              <p className="text-sm text-destructive font-medium mb-2">
                Something went wrong
              </p>
              <p className="text-xs text-muted-foreground">
                {controller.error}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty */}
          {!controller.initialLoading &&
            !controller.error &&
            controller.notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No notifications yet
                </h3>
                <p className="text-sm">
                  When you get notifications, they'll show up here.
                </p>
              </div>
            )}

          {/* Notifications list */}
          <div className="flex flex-col gap-2 p-2 sm:p-3">
            {controller.notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onNavigate={controller.handleNavigate}
                onMarkAsRead={controller.handleMarkAsRead}
                onDelete={controller.handleDelete}
              />
            ))}
          </div>
        </CardContent>

        {/* Footer - Only show if there's more content */}
        {controller.hasMore && controller.notifications.length > 0 && (
          <CardFooter className="flex justify-center py-4 bg-muted/5">
            <Button
              variant="ghost"
              size="sm"
              disabled={controller.loading}
              onClick={controller.handleLoadMore}
              className="text-muted-foreground hover:text-foreground">
              {controller.loading ? "Loading..." : "Load older notifications"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </ComponentErrorBoundary>
  );
}
