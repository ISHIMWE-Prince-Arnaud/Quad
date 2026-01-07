import { useNavigate } from "react-router-dom";

export function MentionText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const parts = text.split(/(@\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith("@") && /^@\w+$/.test(part)) {
          const username = part.slice(1);
          return (
            <button
              key={`${username}-${index}`}
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/profile/${username}`);
              }}>
              {part}
            </button>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
