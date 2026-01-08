import type { CanvasElement } from "./canvasStory.types";

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export function canvasElementsToHtml(elements: CanvasElement[], heightPx = 560) {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const inner = sorted
    .map((el) => {
      const commonStyle = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;z-index:${el.zIndex};`;

      if (el.kind === "image") {
        const alt = escapeHtml(el.alt || "");
        return `<img src="${escapeHtml(el.src)}" alt="${alt}" style="${commonStyle}" />`;
      }

      const text = escapeHtml(el.text).replaceAll("\n", "<br/>");
      const style = `${commonStyle}font-size:${el.fontSize}px;font-weight:${el.fontWeight};color:${el.color};`;
      return `<span style="${style}">${text}</span>`;
    })
    .join("");

  return `<div style="position:relative;width:100%;height:${heightPx}px;">${inner}</div>`;
}
