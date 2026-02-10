import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useSocketStore } from "@/stores/socketStore";

export function SocketManager() {
  const { isSignedIn, getToken } = useAuth();
  const setSocket = useSocketStore((state) => state.setSocket);

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (mounted && token) {
            const socket = connectSocket(token);
            setSocket(socket);
          }
        } catch (error) {
          console.error("Failed to get token for socket connection", error);
        }
      } else {
        disconnectSocket();
        setSocket(null);
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      // Disconnect on unmount to prevent leaks or stale state
      disconnectSocket();
      setSocket(null);
    };
  }, [isSignedIn, getToken, setSocket]);

  return null;
}
