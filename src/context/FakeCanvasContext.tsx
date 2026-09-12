import type { Canvas, Point, Rect, TFiller } from "fabric";
import { createContext, type RefObject } from "react";

interface fakeCavasProps {
  canvas: Canvas | undefined;
  fakeCanvasRect: RefObject<Rect | null>;
  fakeCanvasClip: RefObject<Rect | null>;
  fakeCanvasCenter: RefObject<Point | null>;
  zoom: number | undefined;
  setZoom: (value: React.SetStateAction<number>) => void;
  fakeWidth: number;
  setFakeWidth: (value: React.SetStateAction<number>) => void;
  fakeHeight: number;
  setFakeHeight: (value: React.SetStateAction<number>) => void;
  fill: string | TFiller | undefined;
  setFill: (value: React.SetStateAction<string | TFiller | undefined>) => void;
  saveCanvasState: () => void;
  clearHistory: () => void;
}

export const FakeCanvasContext = createContext<fakeCavasProps | undefined>(
  undefined,
);
