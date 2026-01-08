import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowDown,
  Grid3X3,
  ArrowUp,
  AtSign,
  ChevronsDown,
  ChevronsUp,
  Image as ImageIcon,
  RotateCw,
  Type as TypeIcon,
} from "lucide-react";

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
  const [textDraft, setTextDraft] = useState<string>("");
  const [snapToGrid, setSnapToGrid] = useState(true);

  const historyRef = useRef<{ past: CanvasElement[][]; future: CanvasElement[][] }>({
    past: [],
    future: [],
  });
  const actionRecordedRef = useRef(false);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selected = useMemo(() => {
    return elements.find((e) => e.id === selectedId) || null;
  }, [elements, selectedId]);

  const selectedEditingText = useMemo(() => {
    const el = elements.find((e) => e.id === editingTextId);
    return el && el.kind === "text" ? el : null;
  }, [elements, editingTextId]);

  const gridSize = 24;
  const snap = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const cloneElements = (els: CanvasElement[]) => {
    return els.map((el) => ({ ...el }));
  };

  const recordHistory = () => {
    if (actionRecordedRef.current) return;
    historyRef.current.past.push(cloneElements(elements));
    historyRef.current.future = [];
    actionRecordedRef.current = true;
  };

  const finishAction = () => {
    actionRecordedRef.current = false;
  };

  const normalizeZIndexes = (els: CanvasElement[]) => {
    const sorted = [...els].sort((a, b) => a.zIndex - b.zIndex);
    return sorted.map((el, i) => ({ ...el, zIndex: i + 1 }));
  };

  const setZOrder = (nextOrdered: CanvasElement[]) => {
    recordHistory();
    onChange(normalizeZIndexes(nextOrdered));
    finishAction();
  };

  const addTextElement = (text: string) => {
    recordHistory();
    const id = createId();
    const next: CanvasTextElement = {
      id,
      kind: "text",
      x: 24,
      y: 24,
      width: 220,
      height: 60,
      zIndex: elements.length + 1,
      rotationDeg: 0,
      text,
      fontSize: 20,
      color: "#ffffff",
      fontWeight: "bold",
    };

    const updated = [...elements, next];
    onChange(updated);
    setSelectedId(id);
    setEditingTextId(id);
    setTextDraft(text);
    finishAction();
  };

  const addText = () => {
    addTextElement("Double-click to edit");
  };

  const addMention = () => {
    const username = window.prompt("Enter username to mention (without @)");
    if (!username) return;
    addTextElement(`@${username}`);
  };

  const startDrag = (e: ReactPointerEvent, elementId: string) => {
    if (editingTextId) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const start = elements.find((el) => el.id === elementId);
    if (!start) return;

    recordHistory();

    setSelectedId(elementId);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const nextX = Math.max(0, Math.min(rect.width - start.width, snap(start.x + dx)));
      const nextY = Math.max(0, Math.min(rect.height - start.height, snap(start.y + dy)));

      onChange(
        elements.map((el) =>
          el.id === elementId ? { ...el, x: nextX, y: nextY } : el
        )
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      finishAction();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (
    e: ReactPointerEvent,
    elementId: string,
    handle: ResizeHandle
  ) => {
    if (editingTextId) return;
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const start = elements.find((el) => el.id === elementId);
    if (!start) return;

    recordHistory();

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

      x = snap(x);
      y = snap(y);
      w = snap(w);
      h = snap(h);

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
      finishAction();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const updateSelectedText = (patch: Partial<CanvasTextElement>) => {
    if (!selected || selected.kind !== "text") return;
    recordHistory();
    onChange(elements.map((el) => (el.id === selected.id ? { ...selected, ...patch } : el)));
    finishAction();
  };

  const updateSelected = (patch: Partial<Omit<CanvasElement, "kind">>) => {
    if (!selected) return;
    recordHistory();
    onChange(
      elements.map((el) => {
        if (el.id !== selected.id) return el;
        if (el.kind === "text") {
          return { ...el, ...patch };
        }
        return { ...el, ...patch };
      })
    );
    finishAction();
  };

  const bringForward = () => {
    if (!selected) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = ordered.findIndex((e) => e.id === selected.id);
    if (idx < 0 || idx === ordered.length - 1) return;
    const next = [...ordered];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setZOrder(next);
  };

  const sendBackward = () => {
    if (!selected) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = ordered.findIndex((e) => e.id === selected.id);
    if (idx <= 0) return;
    const next = [...ordered];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setZOrder(next);
  };

  const bringToFront = () => {
    if (!selected) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = ordered.findIndex((e) => e.id === selected.id);
    if (idx < 0 || idx === ordered.length - 1) return;
    const next = [...ordered];
    const [item] = next.splice(idx, 1);
    next.push(item);
    setZOrder(next);
  };

  const sendToBack = () => {
    if (!selected) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = ordered.findIndex((e) => e.id === selected.id);
    if (idx <= 0) return;
    const next = [...ordered];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    setZOrder(next);
  };

  const autoFitSelectedText = () => {
    if (!selected || selected.kind !== "text") return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const wrapLines = (fontSize: number) => {
      const font = `${selected.fontWeight} ${fontSize}px system-ui`;
      ctx.font = font;
      const maxWidth = Math.max(1, selected.width - 8);
      const paragraphs = selected.text.split("\n");
      const lines: string[] = [];

      for (const p of paragraphs) {
        const words = p.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
          lines.push("");
          continue;
        }
        let line = words[0] || "";
        for (let i = 1; i < words.length; i++) {
          const next = `${line} ${words[i]}`;
          if (ctx.measureText(next).width <= maxWidth) {
            line = next;
          } else {
            lines.push(line);
            line = words[i] || "";
          }
        }
        lines.push(line);
      }

      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const fitsHeight = totalHeight <= Math.max(1, selected.height - 8);

      const fitsWidth = lines.every((l) => ctx.measureText(l).width <= maxWidth);
      return fitsHeight && fitsWidth;
    };

    let lo = 10;
    let hi = 96;
    let best = 10;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (wrapLines(mid)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    updateSelectedText({ fontSize: best });
  };

  const startRotate = (e: ReactPointerEvent, elementId: string) => {
    if (editingTextId) return;
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const start = elements.find((el) => el.id === elementId);
    if (!start) return;

    recordHistory();

    setSelectedId(elementId);

    const centerX = rect.left + start.x + start.width / 2;
    const centerY = rect.top + start.y + start.height / 2;

    const startAngle = (ev: { clientX: number; clientY: number }) => {
      return (Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180) / Math.PI;
    };

    const initialPointerAngle = startAngle(e);
    const initialRotation = start.rotationDeg;

    const onMove = (ev: PointerEvent) => {
      const angle = startAngle(ev);
      const delta = angle - initialPointerAngle;
      let nextRotation = initialRotation + delta;
      if ((ev as unknown as { shiftKey?: boolean }).shiftKey) {
        const step = 15;
        nextRotation = Math.round(nextRotation / step) * step;
      }
      onChange(
        elements.map((el) =>
          el.id === elementId ? { ...el, rotationDeg: nextRotation } : el
        )
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      finishAction();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const deleteSelected = () => {
    if (!selected) return;
    recordHistory();
    onChange(elements.filter((el) => el.id !== selected.id));
    setSelectedId(null);
    setEditingTextId(null);
    finishAction();
  };

  const beginEditSelectedText = (textEl: CanvasTextElement) => {
    setSelectedId(textEl.id);
    setEditingTextId(textEl.id);
    setTextDraft(textEl.text);
  };

  const cancelTextEdit = () => {
    setEditingTextId(null);
  };

  const commitTextEdit = () => {
    if (!selectedEditingText) return;
    const textarea = editTextareaRef.current;
    const nextHeight = textarea ? Math.max(24, textarea.scrollHeight + 8) : selectedEditingText.height;
    recordHistory();
    onChange(
      elements.map((el) =>
        el.id === selectedEditingText.id && el.kind === "text"
          ? { ...el, text: textDraft, height: nextHeight }
          : el
      )
    );
    finishAction();
    setEditingTextId(null);
  };

  const undo = () => {
    const past = historyRef.current.past;
    if (past.length === 0) return;
    const prev = past.pop();
    if (!prev) return;
    historyRef.current.future.push(cloneElements(elements));
    onChange(cloneElements(prev));
  };

  const redo = () => {
    const future = historyRef.current.future;
    if (future.length === 0) return;
    const next = future.pop();
    if (!next) return;
    historyRef.current.past.push(cloneElements(elements));
    onChange(cloneElements(next));
  };

  const handleCanvasKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (editingTextId) return;
    if (!selected) return;

    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if (mod && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
      return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      deleteSelected();
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const step = snapToGrid ? gridSize : e.shiftKey ? 10 : 1;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    if (e.key === "ArrowRight") dx = step;
    if (e.key === "ArrowUp") dy = -step;
    if (e.key === "ArrowDown") dy = step;

    if (!dx && !dy) return;
    e.preventDefault();

    const nextX = Math.max(0, Math.min(rect.width - selected.width, selected.x + dx));
    const nextY = Math.max(0, Math.min(rect.height - selected.height, selected.y + dy));
    recordHistory();
    onChange(
      elements.map((el) =>
        el.id === selected.id ? { ...el, x: nextX, y: nextY } : el
      )
    );
    finishAction();
  };

  useEffect(() => {
    if (!selectedEditingText) return;
    const textarea = editTextareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    // Autosize
    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [selectedEditingText]);

  useEffect(() => {
    const textarea = editTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [textDraft]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={snapToGrid ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSnapToGrid((v) => !v)}>
          <Grid3X3 className="h-4 w-4 mr-2" />
          Snap
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addText}>
          <TypeIcon className="h-4 w-4 mr-2" />
          Add Text
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addMention}>
          <AtSign className="h-4 w-4 mr-2" />
          Mention
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selected}
          onClick={() => updateSelected({ rotationDeg: 0 })}>
          <RotateCw className="h-4 w-4 mr-2" />
          Reset Rotation
        </Button>

        <Button type="button" variant="outline" size="sm" disabled={!selected} onClick={sendToBack}>
          <ChevronsDown className="h-4 w-4 mr-2" />
          To Back
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!selected} onClick={sendBackward}>
          <ArrowDown className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!selected} onClick={bringForward}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Forward
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!selected} onClick={bringToFront}>
          <ChevronsUp className="h-4 w-4 mr-2" />
          To Front
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

            <Button type="button" variant="outline" size="sm" onClick={autoFitSelectedText}>
              Auto-fit
            </Button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative h-[560px] w-full overflow-hidden rounded-md border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
        tabIndex={0}
        onClick={() => containerRef.current?.focus()}
        onKeyDown={handleCanvasKeyDown}
        onPointerDown={() => {
          setSelectedId(null);
          if (!editingTextId) setEditingTextId(null);
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
                  transform: `rotate(${el.rotationDeg}deg)`,
                  transformOrigin: "center",
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, el.id);
                }}
                onDoubleClick={() => {
                  if (el.kind === "text") {
                    beginEditSelectedText(el);
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
                    <div className="p-1">{el.text}</div>
                  </div>
                )}

                {isSelected && (
                  <>
                    <button
                      type="button"
                      className="absolute left-1/2 -top-6 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow"
                      title="Rotate"
                      onPointerDown={(e) => startRotate(e, el.id)}
                    />
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

        {selectedEditingText && (
          <div
            className="absolute"
            style={{
              left: selectedEditingText.x,
              top: selectedEditingText.y,
              width: selectedEditingText.width,
              zIndex: 9999,
              transform: `rotate(${selectedEditingText.rotationDeg}deg)`,
              transformOrigin: "center",
            }}
            onPointerDown={(e) => e.stopPropagation()}>
            <div className="rounded-md border bg-background/90 p-2 shadow">
              <textarea
                ref={editTextareaRef}
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelTextEdit();
                    return;
                  }
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    commitTextEdit();
                  }
                }}
                className="w-full resize-none bg-transparent text-sm outline-none"
                style={{
                  fontSize: selectedEditingText.fontSize,
                  fontWeight: selectedEditingText.fontWeight,
                  color: selectedEditingText.color,
                  minHeight: 32,
                }}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={cancelTextEdit}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={commitTextEdit}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
