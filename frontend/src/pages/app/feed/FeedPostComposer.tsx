import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Image, Video, BarChart2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedPostComposer() {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="bg-[#0f121a] border border-white/5 rounded-[2rem] p-4 shadow-xl transition-all hover:border-white/10">
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-white/5">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="bg-[#1e293b] text-white">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-[#64748b] text-lg resize-none min-h-[48px] py-2"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <BarChart2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <Button
              className={cn(
                "rounded-full px-8 font-bold transition-all shadow-lg",
                text.trim()
                  ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white scale-100"
                  : "bg-[#2563eb]/20 text-white/20 cursor-not-allowed"
              )}
              disabled={!text.trim()}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
