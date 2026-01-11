import { Loader2 } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/types/post";
import { MediaGallery } from "./MediaGallery";

export function OptimisticPostCard({ post }: { post: Post }) {
  const firstName = post.author.firstName ?? "";
  const lastName = post.author.lastName ?? "";
  const username = post.author.username;

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : firstName || username;

  return (
    <Card className="w-full bg-[#0f121a] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/5 shadow-inner">
              <AvatarImage src={post.author.profileImage} />
              <AvatarFallback className="bg-[#1e293b] text-white font-semibold">
                {displayName.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-[15px] leading-tight truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-medium text-[#64748b]">
                  @{username}
                </span>
                <span className="text-[#334155] text-[10px]">·</span>
                <span className="text-[11px] font-medium text-[#64748b] whitespace-nowrap flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting...
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-4">
        {post.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-white/90">
            {post.text}
          </p>
        )}

        {post.media && post.media.length > 0 && <MediaGallery media={post.media} />}
      </CardContent>

      <CardFooter className="px-6 py-4 flex items-center gap-2 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-6 flex-1 text-[#64748b]">
          <span className="text-xs font-bold">0</span>
          <span className="text-xs font-bold">0</span>
          <span className="text-xs font-bold">Share</span>
        </div>
      </CardFooter>
    </Card>
  );
}
