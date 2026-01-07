import React, { type ReactNode } from "react";

export function highlight(text: string | undefined, query: string): ReactNode {
  if (!text) return null;
  const q = query.trim();
  if (!q) return text;

  const regex = new RegExp(
    `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "ig"
  );

  const parts = text.split(regex);

  return React.createElement(
    React.Fragment,
    null,
    parts.map((part, idx) =>
      regex.test(part)
        ? React.createElement(
            "mark",
            {
              key: idx,
              className:
                "bg-yellow-500/30 text-foreground font-medium rounded-sm px-0.5",
            },
            part
          )
        : React.createElement("span", { key: idx }, part)
    )
  );
}

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};
