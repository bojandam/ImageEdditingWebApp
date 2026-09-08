import type { Point, Rect, TFiller } from "fabric";
import { createContext, type RefObject } from "react";

interface fakeCavasProps {
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
}

export const FakeCanvasContext = createContext<fakeCavasProps | undefined>(
  undefined,
);
