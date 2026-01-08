import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Image as ImageIcon, Type as TypeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  CanvasElement,
  CanvasTextElement,
  ResizeHandle,
} from "./canvasStory.types";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function CanvasStoryEditor({
  elements,
  onChange,
  onRequestAddImage,
  className,
}: {
  elements: CanvasElement[];
  onChange: (next: CanvasElement[]) => void;
  onRequestAddImage: () => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const selected = useMemo(() => {
    return elements.find((e) => e.id === selectedId) || null;
  }, [elements, selectedId]);

  const addText = () => {
    const id = createId();
    const next: CanvasTextElement = {
      id,
      kind: "text",
      x: 24,
      y: 24,
      width: 220,
      height: 60,
      zIndex: elements.length + 1,
      text: "Double-click to edit",
      fontSize: 20,
      color: "#ffffff",
      fontWeight: "bold",
    };

    const updated = [...elements, next];
    onChange(updated);
    setSelectedId(id);
    setEditingTextId(id);
  };

  const startDrag = (e: ReactPointerEvent, elementId: string) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const start = elements.find((el) => el.id === elementId);
    if (!start) return;

    setSelectedId(elementId);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const nextX = Math.max(0, Math.min(rect.width - start.width, start.x + dx));
      const nextY = Math.max(0, Math.min(rect.height - start.height, start.y + dy));

      onChange(
        elements.map((el) =>
          el.id === elementId ? { ...el, x: nextX, y: nextY } : el
        )
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (
    e: ReactPointerEvent,
    elementId: string,
    handle: ResizeHandle
  ) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const start = elements.find((el) => el.id === elementId);
    if (!start) return;

    setSelectedId(elementId);

    const minW = 40;
    const minH = 24;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let x = start.x;
      let y = start.y;
      let w = start.width;
      let h = start.height;

      if (handle === "se") {
        w = Math.max(minW, start.width + dx);
        h = Math.max(minH, start.height + dy);
      }
      if (handle === "sw") {
        w = Math.max(minW, start.width - dx);
        h = Math.max(minH, start.height + dy);
        x = start.x + (start.width - w);
      }
      if (handle === "ne") {
        w = Math.max(minW, start.width + dx);
        h = Math.max(minH, start.height - dy);
        y = start.y + (start.height - h);
      }
      if (handle === "nw") {
        w = Math.max(minW, start.width - dx);
        h = Math.max(minH, start.height - dy);
        x = start.x + (start.width - w);
        y = start.y + (start.height - h);
      }

      x = Math.max(0, Math.min(rect.width - w, x));
      y = Math.max(0, Math.min(rect.height - h, y));

      onChange(
        elements.map((el) =>
          el.id === elementId ? { ...el, x, y, width: w, height: h } : el
        )
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const updateSelectedText = (patch: Partial<CanvasTextElement>) => {
    if (!selected || selected.kind !== "text") return;
    onChange(elements.map((el) => (el.id === selected.id ? { ...selected, ...patch } : el)));
  };

  const deleteSelected = () => {
    if (!selected) return;
    onChange(elements.filter((el) => el.id !== selected.id));
    setSelectedId(null);
    setEditingTextId(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addText}>
          <TypeIcon className="h-4 w-4 mr-2" />
          Add Text
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onRequestAddImage}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selected}
          onClick={deleteSelected}
          className="text-destructive hover:text-destructive">
          Delete
        </Button>

        {selected?.kind === "text" && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateSelectedText({ fontWeight: selected.fontWeight === "bold" ? "normal" : "bold" })}>
              {selected.fontWeight === "bold" ? "Bold" : "Normal"}
            </Button>
            <input
              type="number"
              value={selected.fontSize}
              min={10}
              max={96}
              onChange={(e) => updateSelectedText({ fontSize: Number(e.target.value) })}
              className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
            />
            <input
              type="color"
              value={selected.color}
              onChange={(e) => updateSelectedText({ color: e.target.value })}
              className="h-9 w-10 rounded-md border bg-background p-1"
            />
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative h-[560px] w-full overflow-hidden rounded-md border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
        onPointerDown={() => {
          setSelectedId(null);
          setEditingTextId(null);
        }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => {
            const isSelected = el.id === selectedId;

            return (
              <div
                key={el.id}
                className={cn(
                  "absolute select-none",
                  isSelected && "ring-2 ring-primary"
                )}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: el.zIndex,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, el.id);
                }}
                onDoubleClick={() => {
                  if (el.kind === "text") {
                    setSelectedId(el.id);
                    setEditingTextId(el.id);
                  }
                }}>
                {el.kind === "image" ? (
                  <img
                    src={el.src}
                    alt={el.alt || ""}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="h-full w-full whitespace-pre-wrap break-words"
                    style={{
                      fontSize: el.fontSize,
                      fontWeight: el.fontWeight,
                      color: el.color,
                    }}>
                    {editingTextId === el.id ? (
                      <textarea
                        value={el.text}
                        onChange={(e) => {
                          onChange(
                            elements.map((it) =>
                              it.id === el.id && it.kind === "text"
                                ? { ...it, text: e.target.value }
                                : it
                            )
                          );
                        }}
                        onBlur={() => setEditingTextId(null)}
                        className="h-full w-full resize-none bg-transparent p-1 outline-none"
                      />
                    ) : (
                      <div className="p-1">{el.text}</div>
                    )}
                  </div>
                )}

                {isSelected && (
                  <>
                    {([
                      ["nw", "left-0 top-0 -translate-x-1/2 -translate-y-1/2"],
                      ["ne", "right-0 top-0 translate-x-1/2 -translate-y-1/2"],
                      ["sw", "left-0 bottom-0 -translate-x-1/2 translate-y-1/2"],
                      ["se", "right-0 bottom-0 translate-x-1/2 translate-y-1/2"],
                    ] as const).map(([handle, pos]) => (
                      <button
                        key={handle}
                        type="button"
                        className={cn(
                          "absolute h-3 w-3 rounded-sm bg-primary",
                          "shadow",
                          pos
                        )}
                        onPointerDown={(e) => startResize(e, el.id, handle)}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
