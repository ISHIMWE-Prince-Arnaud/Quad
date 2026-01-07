import { useNavigate } from "react-router-dom";

import { MediaGallery } from "../MediaGallery";
import type { Post } from "@/types/post";
import { MentionText } from "@/components/ui/mention-text";

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
  const navigate = useNavigate();

  return (
    <>
      {fullText && (
        <>
          {isSingleView ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              <MentionText text={fullText} />
            </p>
          ) : (
            <div
              className="block"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/app/posts/${postId}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/app/posts/${postId}`);
                }
              }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                <MentionText text={!hasLongText ? fullText : previewText} />
                {hasLongText && (
                  <span className="ml-1 text-primary font-medium hover:underline">
                    See more
                  </span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {media && media.length > 0 && <MediaGallery media={media} />}
    </>
  );
}
