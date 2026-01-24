import type { Editor } from "@tiptap/core";
import {
  AlertTriangle,
  AtSign,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Info,
  Link as LinkIcon,
  Minus,
  Table2,
  Lightbulb,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

import { cn } from "@/lib/utils";

type SlashItem = {
  id: string;
  label: string;
  keywords: string;
  icon: ComponentType<{ className?: string }>;
  run: (editor: Editor) => void;
};

function getSlashQuery(editor: Editor): {
  isActive: boolean;
  query: string;
  rangeFrom: number;
  rangeTo: number;
} {
  const { state } = editor;
  const { $from } = state.selection;

  if (!$from.parent.isTextblock) {
    return { isActive: false, query: "", rangeFrom: 0, rangeTo: 0 };
  }

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\n");
  const match = textBefore.match(/(?:^|\s)\/([\w-]*)$/);
  if (!match) {
    return { isActive: false, query: "", rangeFrom: 0, rangeTo: 0 };
  }

  const query = match[1] ?? "";
  const matchedText = match[0] ?? "";
  const hasLeadingSpace = matchedText.startsWith(" ");
  const commandText = hasLeadingSpace ? matchedText.slice(1) : matchedText;
  const rangeFrom = state.selection.from - commandText.length;
  const rangeTo = state.selection.from;
  return { isActive: true, query, rangeFrom, rangeTo };
}

export function StoryEditorSlashMenu({
  editor,
  onInsertLink,
  onMention,
}: {
  editor: Editor | null;
  onInsertLink?: () => void;
  onMention?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items: SlashItem[] = useMemo(
    () => [
      {
        id: "h1",
        label: "Heading 1",
        keywords: "heading h1 title",
        icon: Heading1,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        id: "h2",
        label: "Heading 2",
        keywords: "heading h2",
        icon: Heading2,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: "h3",
        label: "Heading 3",
        keywords: "heading h3",
        icon: Heading3,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        id: "h4",
        label: "Heading 4",
        keywords: "heading h4",
        icon: Heading4,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 4 }).run(),
      },
      {
        id: "codeblock",
        label: "Code Block",
        keywords: "code block pre",
        icon: Code2,
        run: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "hr",
        label: "Divider",
        keywords: "hr divider line",
        icon: Minus,
        run: (ed) => ed.chain().focus().setHorizontalRule().run(),
      },
      {
        id: "table",
        label: "Table (3×3)",
        keywords: "table grid",
        icon: Table2,
        run: (ed) =>
          ed
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
      ...(onMention
        ? [
            {
              id: "mention",
              label: "Mention user",
              keywords: "mention @ user",
              icon: AtSign,
              run: () => onMention(),
            } satisfies SlashItem,
          ]
        : []),
      ...(onInsertLink
        ? [
            {
              id: "link",
              label: "Insert link",
              keywords: "link url",
              icon: LinkIcon,
              run: () => onInsertLink(),
            } satisfies SlashItem,
          ]
        : []),
      {
        id: "callout-info",
        label: "Callout: Info",
        keywords: "callout info note",
        icon: Info,
        run: (ed) => ed.chain().focus().insertCallout("info").run(),
      },
      {
        id: "callout-warning",
        label: "Callout: Warning",
        keywords: "callout warning caution",
        icon: AlertTriangle,
        run: (ed) => ed.chain().focus().insertCallout("warning").run(),
      },
      {
        id: "callout-tip",
        label: "Callout: Tip",
        keywords: "callout tip hint",
        icon: Lightbulb,
        run: (ed) => ed.chain().focus().insertCallout("tip").run(),
      },
    ],
    [onInsertLink, onMention]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.label} ${it.keywords}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const res = getSlashQuery(editor);
      if (!res.isActive) {
        setOpen(false);
        return;
      }

      const pos = editor.state.selection.from;
      const c = editor.view.coordsAtPos(pos);
      setCoords({ top: c.bottom + 8, left: c.left });
      setQuery(res.query);
      setRange({ from: res.rangeFrom, to: res.rangeTo });
      setOpen(true);
      setActiveIndex(0);
    };

    update();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === "Enter") {
        if (!filtered[activeIndex]) return;
        e.preventDefault();
        const item = filtered[activeIndex];

        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        item.run(editor);
        setOpen(false);
      }
    };

    editor.view.dom.addEventListener("keydown", handler);
    return () => {
      editor.view.dom.removeEventListener("keydown", handler);
    };
  }, [editor, open, filtered, activeIndex, range]);

  if (!editor || !open || !coords || filtered.length === 0) return null;

  return (
    <div
      className="fixed z-50"
      style={{ top: coords.top, left: coords.left }}>
      <div className="w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f121a]/95 shadow-xl shadow-black/40">
        <div className="px-3 py-2 text-[11px] font-semibold text-[#64748b] border-b border-white/5">
          Commands
        </div>
        <div className="max-h-64 overflow-auto py-1">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  idx === activeIndex
                    ? "bg-white/5 text-white"
                    : "text-[#cbd5e1] hover:bg-white/5"
                )}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (range) {
                    editor.chain().focus().deleteRange(range).run();
                  }
                  item.run(editor);
                  setOpen(false);
                }}>
                <span className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#94a3b8]" />
                </span>
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
