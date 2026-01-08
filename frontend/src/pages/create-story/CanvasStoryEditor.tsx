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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState<string>("");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [marquee, setMarquee] = useState<
    | null
    | {
        startX: number;
        startY: number;
        x: number;
        y: number;
        w: number;
        h: number;
        shift: boolean;
      }
  >(null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const historyRef = useRef<{ past: CanvasElement[][]; future: CanvasElement[][] }>({
    past: [],
    future: [],
  });
  const actionRecordedRef = useRef(false);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const primarySelectedId = useMemo(() => {
    return selectedIds.length ? selectedIds[selectedIds.length - 1] : null;
  }, [selectedIds]);

  const selected = useMemo(() => {
    if (!primarySelectedId) return null;
    return elements.find((e) => e.id === primarySelectedId) || null;
  }, [elements, primarySelectedId]);

  const selectedEditingText = useMemo(() => {
    const el = elements.find((e) => e.id === editingTextId);
    return el && el.kind === "text" ? el : null;
  }, [elements, editingTextId]);

  const gridSize = 24;
  const snap = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  useEffect(() => {
    if (!marquee) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const onMove = (ev: PointerEvent) => {
      const x2 = ev.clientX - rect.left;
      const y2 = ev.clientY - rect.top;
      const x = Math.min(marquee.startX, x2);
      const y = Math.min(marquee.startY, y2);
      const w = Math.abs(x2 - marquee.startX);
      const h = Math.abs(y2 - marquee.startY);
      setMarquee((prev) => (prev ? { ...prev, x, y, w, h } : prev));
    };

    const onUp = () => {
      setMarquee((prev) => {
        if (!prev) return prev;
        const x1 = prev.x;
        const y1 = prev.y;
        const x2 = prev.x + prev.w;
        const y2 = prev.y + prev.h;

        const hit = elements
          .filter((el) => {
            // axis-aligned hit test (ignores rotation)
            const ex1 = el.x;
            const ey1 = el.y;
            const ex2 = el.x + el.width;
            const ey2 = el.y + el.height;
            const intersects = ex1 <= x2 && ex2 >= x1 && ey1 <= y2 && ey2 >= y1;
            return intersects;
          })
          .map((el) => el.id);

        setSelectedIds((current) => {
          if (prev.shift) {
            const set = new Set(current);
            for (const id of hit) set.add(id);
            return Array.from(set);
          }
          return hit;
        });

        return null;
      });

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [elements, marquee]);

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

  const clearGuides = () => setGuides({ x: [], y: [] });

  const selectedIdSet = useMemo(() => {
    return new Set(selectedIds);
  }, [selectedIds]);

  const selectionBounds = useMemo(() => {
    if (!selectedIds.length) return null;
    const picked = elements.filter((el) => selectedIdSet.has(el.id));
    if (!picked.length) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const el of picked) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [elements, selectedIdSet, selectedIds.length]);

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
    setSelectedIds([id]);
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

  const startDrag = (
    e: ReactPointerEvent,
    activeSelectedIds: string[]
  ) => {
    if (editingTextId) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const activeSet = new Set(activeSelectedIds);
    const startMap = new Map(
      elements
        .filter((el) => activeSet.has(el.id))
        .map((el) => [el.id, { x: el.x, y: el.y, width: el.width, height: el.height }])
    );

    if (startMap.size === 0) return;

    recordHistory();

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      // Base positions (grid-snap first)
      const basePositions = new Map<string, { x: number; y: number }>();
      for (const [id, pos] of startMap.entries()) {
        const bx = pos.x + dx;
        const by = pos.y + dy;
        basePositions.set(id, {
          x: snapToGrid ? snap(bx) : bx,
          y: snapToGrid ? snap(by) : by,
        });
      }

      const group = (() => {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const [id, pos] of startMap.entries()) {
          const next = basePositions.get(id);
          if (!next) continue;
          minX = Math.min(minX, next.x);
          minY = Math.min(minY, next.y);
          maxX = Math.max(maxX, next.x + pos.width);
          maxY = Math.max(maxY, next.y + pos.height);
        }
        return { minX, minY, maxX, maxY };
      })();

      const groupLinesX = [group.minX, (group.minX + group.maxX) / 2, group.maxX];
      const groupLinesY = [group.minY, (group.minY + group.maxY) / 2, group.maxY];

      const other = elements.filter((el) => !activeSet.has(el.id));
      const candidateX = [rect.width / 2];
      const candidateY = [rect.height / 2];
      for (const el of other) {
        candidateX.push(el.x, el.x + el.width / 2, el.x + el.width);
        candidateY.push(el.y, el.y + el.height / 2, el.y + el.height);
      }

      const threshold = 6;
      let snapDx = 0;
      let snapDy = 0;
      let guideX: number | null = null;
      let guideY: number | null = null;

      let bestX = threshold + 1;
      for (const gl of groupLinesX) {
        for (const c of candidateX) {
          const diff = c - gl;
          const ad = Math.abs(diff);
          if (ad < bestX) {
            bestX = ad;
            if (ad <= threshold) {
              snapDx = diff;
              guideX = c;
            }
          }
        }
      }

      let bestY = threshold + 1;
      for (const gl of groupLinesY) {
        for (const c of candidateY) {
          const diff = c - gl;
          const ad = Math.abs(diff);
          if (ad < bestY) {
            bestY = ad;
            if (ad <= threshold) {
              snapDy = diff;
              guideY = c;
            }
          }
        }
      }

      if (guideX || guideY) {
        setGuides({ x: guideX ? [guideX] : [], y: guideY ? [guideY] : [] });
      } else {
        clearGuides();
      }

      onChange(
        elements.map((el) => {
          if (!activeSet.has(el.id)) return el;
          const pos = startMap.get(el.id);
          const base = basePositions.get(el.id);
          if (!pos || !base) return el;
          const nextX = Math.max(0, Math.min(rect.width - pos.width, base.x + snapDx));
          const nextY = Math.max(0, Math.min(rect.height - pos.height, base.y + snapDy));
          return { ...el, x: nextX, y: nextY };
        })
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      clearGuides();
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

    setSelectedIds([elementId]);

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
    if (!selectedIds.length) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const next = [...ordered];
    for (let i = next.length - 2; i >= 0; i--) {
      if (!selectedIdSet.has(next[i].id)) continue;
      if (selectedIdSet.has(next[i + 1].id)) continue;
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
    }
    setZOrder(next);
  };

  const sendBackward = () => {
    if (!selectedIds.length) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const next = [...ordered];
    for (let i = 1; i < next.length; i++) {
      if (!selectedIdSet.has(next[i].id)) continue;
      if (selectedIdSet.has(next[i - 1].id)) continue;
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
    }
    setZOrder(next);
  };

  const bringToFront = () => {
    if (!selectedIds.length) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const keep = ordered.filter((el) => !selectedIdSet.has(el.id));
    const picked = ordered.filter((el) => selectedIdSet.has(el.id));
    setZOrder([...keep, ...picked]);
  };

  const sendToBack = () => {
    if (!selectedIds.length) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const keep = ordered.filter((el) => !selectedIdSet.has(el.id));
    const picked = ordered.filter((el) => selectedIdSet.has(el.id));
    setZOrder([...picked, ...keep]);
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

    setSelectedIds([elementId]);

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
    if (!selectedIds.length) return;
    recordHistory();
    onChange(elements.filter((el) => !selectedIdSet.has(el.id)));
    setSelectedIds([]);
    setEditingTextId(null);
    finishAction();
  };

  const beginEditSelectedText = (textEl: CanvasTextElement) => {
    setSelectedIds([textEl.id]);
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
    if (!selectedIds.length) return;

    const selectedNow = elements.filter((el) => selectedIdSet.has(el.id));
    const primary = primarySelectedId
      ? elements.find((el) => el.id === primarySelectedId) || null
      : null;
    if (!primary) return;

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

    if (mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      const maxZ = elements.reduce((m, el) => Math.max(m, el.zIndex), 0);
      const offset = snapToGrid ? gridSize : 10;
      recordHistory();
      const clones = selectedNow.map((el, idx) => ({
        ...el,
        id: createId(),
        x: el.x + offset,
        y: el.y + offset,
        zIndex: maxZ + idx + 1,
      }));
      onChange([...elements, ...clones]);
      setSelectedIds(clones.map((c) => c.id));
      finishAction();
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

    recordHistory();

    const nextById = new Map<string, { x: number; y: number }>();
    for (const el of selectedNow) {
      const nextX = Math.max(0, Math.min(rect.width - el.width, el.x + dx));
      const nextY = Math.max(0, Math.min(rect.height - el.height, el.y + dy));
      nextById.set(el.id, { x: nextX, y: nextY });
    }
    onChange(
      elements.map((el) =>
        selectedIdSet.has(el.id) ? { ...el, ...nextById.get(el.id) } : el
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
          disabled={!selectedIds.length}
          onClick={deleteSelected}
          className="text-destructive hover:text-destructive">
          Delete
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selectedIds.length}
          onClick={() => updateSelected({ rotationDeg: 0 })}>
          <RotateCw className="h-4 w-4 mr-2" />
          Reset Rotation
        </Button>

        <Button type="button" variant="outline" size="sm" disabled={!selectedIds.length} onClick={sendToBack}>
          <ChevronsDown className="h-4 w-4 mr-2" />
          To Back
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!selectedIds.length} onClick={sendBackward}>
          <ArrowDown className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!selectedIds.length} onClick={bringForward}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Forward
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!selectedIds.length} onClick={bringToFront}>
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
        onPointerDown={(e) => {
          // only start marquee when clicking empty canvas
          if (e.target !== e.currentTarget) return;
          if (editingTextId) return;

          const rect = e.currentTarget.getBoundingClientRect();
          const startX = e.clientX - rect.left;
          const startY = e.clientY - rect.top;
          setMarquee({
            startX,
            startY,
            x: startX,
            y: startY,
            w: 0,
            h: 0,
            shift: e.shiftKey,
          });

          if (!e.shiftKey) {
            setSelectedIds([]);
          }
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

        {guides.x.map((x) => (
          <div
            key={`gx-${x}`}
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/70"
            style={{ left: x }}
          />
        ))}
        {guides.y.map((y) => (
          <div
            key={`gy-${y}`}
            className="pointer-events-none absolute left-0 right-0 h-px bg-primary/70"
            style={{ top: y }}
          />
        ))}

        {selectionBounds && selectedIds.length > 1 && (
          <div
            className="pointer-events-none absolute border border-primary/70"
            style={{
              left: selectionBounds.x,
              top: selectionBounds.y,
              width: selectionBounds.w,
              height: selectionBounds.h,
            }}
          />
        )}

        {marquee && (
          <div
            className="pointer-events-none absolute border border-primary/80 bg-primary/10"
            style={{
              left: marquee.x,
              top: marquee.y,
              width: marquee.w,
              height: marquee.h,
            }}
          />
        )}

        {elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => {
            const isSelected = selectedIdSet.has(el.id);
            const isPrimary = primarySelectedId === el.id;

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
                  if (editingTextId) return;

                  let nextSelected: string[];
                  if (e.shiftKey) {
                    nextSelected = isSelected
                      ? selectedIds.filter((id) => id !== el.id)
                      : [...selectedIds, el.id];
                  } else {
                    nextSelected = isSelected ? selectedIds : [el.id];
                  }

                  // only force non-empty selection on non-shift clicks
                  if (!e.shiftKey && !nextSelected.length) nextSelected = [el.id];
                  setSelectedIds(nextSelected);
                  startDrag(e, nextSelected);
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

                {isPrimary && (
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
