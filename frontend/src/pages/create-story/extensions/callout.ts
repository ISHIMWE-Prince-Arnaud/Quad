import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutType = "info" | "warning" | "tip";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      insertCallout: (type: CalloutType) => ReturnType;
      toggleCallout: (type: CalloutType) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => {
          if (element.classList.contains("callout-warning")) return "warning";
          if (element.classList.contains("callout-tip")) return "tip";
          return "info";
        },
        renderHTML: (attributes) => {
          return {
            class: `callout-${String(attributes.type)}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.callout",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { class: _className, ...rest } = HTMLAttributes;
    const className = ["callout", _className].filter(Boolean).join(" ");
    return [
      "div",
      mergeAttributes(rest, {
        class: className,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCallout:
        (type) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { type },
            content: [{ type: "paragraph" }],
          });
        },
      toggleCallout:
        (type) =>
        ({ commands, state }) => {
          const { $from } = state.selection;
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === this.name) {
              return commands.updateAttributes(this.name, { type });
            }
          }
          return commands.insertContent({
            type: this.name,
            attrs: { type },
            content: [{ type: "paragraph" }],
          });
        },
      unsetCallout:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from } = state.selection;

          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name !== this.name) continue;

            const pos = $from.before(depth);
            tr.replaceWith(pos, pos + node.nodeSize, node.content);
            if (dispatch) dispatch(tr);
            return true;
          }

          return false;
        },
    };
  },
});
