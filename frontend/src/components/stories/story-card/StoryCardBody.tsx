import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getStorySnippet(content: string, maxLength: number = 140) {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

export function StoryCardBody({
  storyId,
  coverImage,
  title,
  content,
  authorUsername,
  authorProfileImage,
  readTime,
}: {
  storyId: string;
  coverImage?: string;
  title: string;
  content: string;
  authorUsername: string;
  authorProfileImage?: string;
  readTime?: number;
}) {
  const snippet = getStorySnippet(content);

  return (
    <>
      {/* Cover image */}
      {coverImage && (
        <Link to={`/app/stories/${storyId}`} className="block">
          <div className="p-3">
            <div className="aspect-video w-full overflow-hidden rounded-xl">
              <img
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Link>
      )}

      {/* Title and excerpt */}
      <div className="px-4 pb-4 space-y-2">
        <Link to={`/app/stories/${storyId}`} className="block space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {title}
          </h3>
          {snippet && (
            <p className="text-sm text-foreground/70 dark:text-muted-foreground line-clamp-2 leading-relaxed">
              {snippet}
            </p>
          )}
        </Link>

        {/* Author info and metadata */}
        <div className="flex items-center gap-2 pt-2">
          <Link
            to={`/app/profile/${authorUsername}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar className="h-6 w-6">
              <AvatarImage src={authorProfileImage} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {authorUsername.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {authorUsername}
            </span>
          </Link>
          {readTime && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {readTime} min read
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
