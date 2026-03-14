import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { PiBellSlashBold } from "react-icons/pi";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";

import {
  NotificationsListSkeleton,
  LoadMoreButton,
} from "@/components/ui/loading";
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
          {controller.initialLoading && <NotificationsListSkeleton />}

          {/* Error */}
          {controller.error && !controller.initialLoading && (
            <ErrorMessage
              description={controller.error}
              onRetry={() => window.location.reload()}
              showGoHome={false}
            />
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
