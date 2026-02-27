import { PiCheckBold, PiTrashBold } from "react-icons/pi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { ApiNotification } from "@/types/api";
import { FaInfo } from "react-icons/fa";

export function NotificationRow({
  notification,
  onNavigate,
  onMarkAsRead,
  onDelete,
}: {
  notification: ApiNotification;
  onNavigate: (notification: ApiNotification) => void;
  onMarkAsRead: (notification: ApiNotification) => void;
  onDelete: (notification: ApiNotification) => void;
}) {
  const hasActor = !!notification.actor;
  const displayName =
    notification.actor?.displayName || notification.actor?.username || "";
  const avatarInitial = hasActor ? (
    displayName.charAt(0).toUpperCase()
  ) : (
    <FaInfo />
  );

  return (
    <div
      onClick={() => onNavigate(notification)}
      className={cn(
        "group relative flex gap-4 p-4 transition-all duration-200 cursor-pointer rounded-xl border border-border/40 hover:shadow-sm",
        !notification.isRead
          ? "bg-primary/5 hover:bg-primary/10 hover:border-primary/30"
          : "bg-card hover:bg-muted/40 hover:border-border/60",
      )}>
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      <Avatar className="h-10 w-10 shrink-0 border border-border/50">
        {notification.actor?.profileImage ? (
          <AvatarImage src={notification.actor.profileImage} />
        ) : (
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {avatarInitial}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-2">
          <div className="text-sm leading-snug">
            {hasActor && (
              <span className="font-semibold text-primary mr-1">
                @{displayName}
              </span>
            )}
            <span className="text-foreground/80">{notification.message}</span>
          </div>

          <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap pt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification);
            }}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
            title="Mark as read">
            <PiCheckBold className="w-4 h-4" />
          </Button>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification);
          }}
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
          title="Delete">
          <PiTrashBold className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
