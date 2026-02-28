import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { PiBellSlashBold, PiWarningCircleBold } from "react-icons/pi";
import { EmptyState } from "@/components/ui/empty-state";

import { NotificationSkeleton, LoadMoreButton } from "@/components/ui/loading";
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
        <CardHeader className="sticky top-0 backdrop-blur-md z-20 border-b px-4 py-3">
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
            <div className="flex flex-col gap-2 p-2 sm:p-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {controller.error && !controller.initialLoading && (
            <EmptyState
              variant="inline"
              icon={
                <PiWarningCircleBold className="h-8 w-8 text-destructive" />
              }
              title="Something went wrong"
              description={controller.error}>
              <Button
                variant="default"
                className="rounded-full shadow-md font-bold px-8 mt-2"
                onClick={() => window.location.reload()}>
                Retry
              </Button>
            </EmptyState>
          )}

          {/* Empty */}
          {!controller.initialLoading &&
            !controller.error &&
            controller.notifications.length === 0 && (
              <EmptyState
                variant="inline"
                icon={
                  <PiBellSlashBold className="h-8 w-8 text-muted-foreground/80" />
                }
                title="No notifications yet"
                description="When you get notifications, they'll show up here."
              />
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
          <LoadMoreButton
            loading={controller.loading}
            onClick={controller.handleLoadMore}
            label="Load older notifications"
          />
        )}
      </Card>
    </ComponentErrorBoundary>
  );
}
