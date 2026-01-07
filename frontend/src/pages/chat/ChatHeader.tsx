import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "./types";

export function ChatHeader({ connection }: { connection: ConnectionStatus }) {
  const connectionDot =
    connection === "connected"
      ? "bg-green-500"
      : connection === "connecting"
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="mb-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Global Chat</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("h-2 w-2 rounded-full", connectionDot)} />
        <span className="capitalize">{connection}</span>
      </div>
    </div>
  );
}
