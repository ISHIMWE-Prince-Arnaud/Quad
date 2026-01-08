export type CanvasElementBase = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotationDeg: number;
};

export type CanvasTextElement = CanvasElementBase & {
  kind: "text";
  text: string;
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
};

export type CanvasImageElement = CanvasElementBase & {
  kind: "image";
  src: string;
  alt?: string;
};

export type CanvasElement = CanvasTextElement | CanvasImageElement;

export type ResizeHandle = "nw" | "ne" | "sw" | "se";
