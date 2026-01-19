import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
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
    <DialogHeader className="space-y-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-white/5">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <DialogTitle className="text-[15px] font-semibold text-white">
            Create Post
          </DialogTitle>
          <p className="text-xs text-[#94a3b8]">Share what's on your mind</p>
        </div>
      </div>
    </DialogHeader>
  );
}
