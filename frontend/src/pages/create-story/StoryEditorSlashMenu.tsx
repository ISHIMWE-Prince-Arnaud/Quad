import type { Editor } from "@tiptap/core";
import {
  PiWarningCircleBold,
  PiAtBold,
  PiCodeBold,
  PiTextHOneBold,
  PiTextHTwoBold,
  PiTextHThreeBold,
  PiTextHFourBold,
  PiInfoBold,
  PiLinkBold as LinkIcon,
  PiMinusBold,
  PiTableBold,
  PiLightbulbBold,
  PiTrashBold,
} from "react-icons/pi";
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

  const textBefore = $from.parent.textBetween(
    0,
    $from.parentOffset,
    "\n",
    "\n",
  );
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
    null,
  );
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 3, cols: 3 });
  const [tableWithHeaderRow, setTableWithHeaderRow] = useState(true);
  const TABLE_MAX = 8;

  const isInTable = Boolean(editor?.isActive("table"));
  const isInCallout = Boolean(editor?.isActive("callout"));
  const isInCodeBlock = Boolean(editor?.isActive("codeBlock"));

  const items: SlashItem[] = useMemo(
    () => [
      {
        id: "h1",
        label: "Heading 1",
        keywords: "heading h1 title",
        icon: PiTextHOneBold,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        id: "h2",
        label: "Heading 2",
        keywords: "heading h2",
        icon: PiTextHTwoBold,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: "h3",
        label: "Heading 3",
        keywords: "heading h3",
        icon: PiTextHThreeBold,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        id: "h4",
        label: "Heading 4",
        keywords: "heading h4",
        icon: PiTextHFourBold,
        run: (ed) => ed.chain().focus().toggleHeading({ level: 4 }).run(),
      },
      {
        id: "codeblock",
        label: "Code Block",
        keywords: "code block pre",
        icon: PiCodeBold,
        run: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "hr",
        label: "Divider",
        keywords: "hr divider line",
        icon: PiMinusBold,
        run: (ed) => ed.chain().focus().setHorizontalRule().run(),
      },
      {
        id: "table",
        label: "Table",
        keywords: "table grid",
        icon: PiTableBold,
        run: () => setTablePickerOpen(true),
      },
      ...(isInTable
        ? [
            {
              id: "delete-table",
              label: "Delete table",
              keywords: "delete remove table",
              icon: PiTrashBold,
              run: (ed) => ed.chain().focus().deleteTable().run(),
            } satisfies SlashItem,
          ]
        : []),
      ...(onMention
        ? [
            {
              id: "mention",
              label: "Mention user",
              keywords: "mention @ user",
              icon: PiAtBold,
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
        icon: PiInfoBold,
        run: (ed) => ed.chain().focus().insertCallout("info").run(),
      },
      {
        id: "callout-warning",
        label: "Callout: Warning",
        keywords: "callout warning caution",
        icon: PiWarningCircleBold,
        run: (ed) => ed.chain().focus().insertCallout("warning").run(),
      },
      {
        id: "callout-tip",
        label: "Callout: Tip",
        keywords: "callout tip hint",
        icon: PiLightbulbBold,
        run: (ed) => ed.chain().focus().insertCallout("tip").run(),
      },
      ...(isInCallout
        ? [
            {
              id: "delete-callout",
              label: "Delete callout",
              keywords: "delete remove callout",
              icon: PiTrashBold,
              run: (ed) => ed.chain().focus().unsetCallout().run(),
            } satisfies SlashItem,
          ]
        : []),
      ...(isInCodeBlock
        ? [
            {
              id: "delete-codeblock",
              label: "Remove code block",
              keywords: "delete remove code block",
              icon: PiTrashBold,
              run: (ed) => ed.chain().focus().toggleCodeBlock().run(),
            } satisfies SlashItem,
          ]
        : []),
    ],
    [onInsertLink, onMention, isInTable, isInCallout, isInCodeBlock],
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
        setTablePickerOpen(false);
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
        setTablePickerOpen(false);
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

        if (item.id === "table") {
          setTablePickerOpen(true);
          return;
        }

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
    <div className="fixed z-50" style={{ top: coords.top, left: coords.left }}>
      <div className="w-[260px] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
        <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground border-b border-border/40">
          {tablePickerOpen ? "Insert table" : "Commands"}
        </div>
        {tablePickerOpen ? (
          <div className="p-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setTablePickerOpen(false);
                }}>
                Back
              </button>
              <div className="text-xs font-semibold text-foreground">
                {tableHover.rows}×{tableHover.cols}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-8 gap-1">
              {Array.from({ length: TABLE_MAX }).map((_, r) =>
                Array.from({ length: TABLE_MAX }).map((__, c) => {
                  const rows = r + 1;
                  const cols = c + 1;
                  const active =
                    rows <= tableHover.rows && cols <= tableHover.cols;
                  return (
                    <button
                      key={`${rows}-${cols}`}
                      type="button"
                      className={cn(
                        "h-5 w-5 rounded-md border transition-colors",
                        active
                          ? "bg-primary/30 border-primary/60"
                          : "bg-muted border-border hover:bg-muted/80",
                      )}
                      onMouseEnter={() => setTableHover({ rows, cols })}
                      onMouseDown={(e) => {
                        e.preventDefault();

                        if (range) {
                          editor.chain().focus().deleteRange(range).run();
                        }

                        editor
                          .chain()
                          .focus()
                          .insertTable({
                            rows,
                            cols,
                            withHeaderRow: tableWithHeaderRow,
                          })
                          .run();
                        setOpen(false);
                      }}
                    />
                  );
                }),
              )}
            </div>

            <button
              type="button"
              className={cn(
                "mt-3 w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors",
                tableWithHeaderRow
                  ? "bg-muted border-border text-foreground"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                setTableWithHeaderRow((prev) => !prev);
              }}>
              Header row: {tableWithHeaderRow ? "On" : "Off"}
            </button>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto scrollbar-hide py-1">
            {filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                    idx === activeIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50",
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();

                    if (item.id === "table") {
                      setTablePickerOpen(true);
                      return;
                    }

                    if (range) {
                      editor.chain().focus().deleteRange(range).run();
                    }
                    item.run(editor);
                    setOpen(false);
                  }}>
                  <span className="h-7 w-7 rounded-xl bg-muted border border-border flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
