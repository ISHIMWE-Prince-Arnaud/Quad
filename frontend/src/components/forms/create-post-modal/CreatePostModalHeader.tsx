import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HeaderUser = {
  profileImage?: string;
  firstName?: string;
  username?: string;
} | null;

export function CreatePostModalHeader({ user }: { user: HeaderUser }) {
  return (
    <DialogHeader>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>Share what's on your mind</DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
