import { Link } from "react-router-dom";

import { MediaGallery } from "../MediaGallery";
import type { Post } from "@/types/post";

export function PostCardBody({
  postId,
  fullText,
  hasLongText,
  previewText,
  isSingleView,
  media,
}: {
  postId: string;
  fullText: string;
  hasLongText: boolean;
  previewText: string;
  isSingleView: boolean;
  media: Post["media"];
}) {
  return (
    <>
      {fullText && (
        <Link to={`/app/posts/${postId}`} className="block">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {isSingleView || !hasLongText ? fullText : previewText}
            {!isSingleView && hasLongText && (
              <span className="ml-1 text-primary font-medium hover:underline">
                See more
              </span>
            )}
          </p>
        </Link>
      )}

      {media && media.length > 0 && <MediaGallery media={media} />}
    </>
  );
}
