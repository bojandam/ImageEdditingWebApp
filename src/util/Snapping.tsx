import { Canvas, FabricObject, Polyline, Rect } from "fabric";

import { useState, type RefObject } from "react";

const snapingDistance = 40;

interface GuidePoint {
  point: number;
  vertical: boolean;
  //   name?: string;
}

export function handleMovingSnap(
  canvas: Canvas,
  fakeCanvasRect: RefObject<Rect | null>,
  obj: FabricObject,
  guidePoints: GuidePoint[],
  guidelinesRef: RefObject<Polyline[] | null>,
) {
  if (canvas && fakeCanvasRect.current && guidelinesRef.current) {
    const defaultPoints = [
      {
        point: fakeCanvasRect.current
          ? ((a) => {
              return (-a.width * a.scaleX) / 2;
            })(fakeCanvasRect.current)
          : 0,
        vertical: true,
      },
      {
        point: 0,
        vertical: true,
      },
      {
        point: fakeCanvasRect.current
          ? ((a) => {
              return (a.width * a.scaleX) / 2;
            })(fakeCanvasRect.current)
          : 0,
        vertical: true,
      },
      {
        point: fakeCanvasRect.current
          ? ((a) => {
              return (-a.height * a.scaleY) / 2;
            })(fakeCanvasRect.current)
          : 0,
        vertical: false,
      },
      {
        point: 0,
        vertical: false,
      },
      {
        point: fakeCanvasRect.current
          ? ((a) => {
              return (a.height * a.scaleY) / 2;
            })(fakeCanvasRect.current)
          : 0,
        vertical: false,
      },
    ];
    guidePoints = [...guidePoints, ...defaultPoints];

    const left =
      obj.left - fakeCanvasRect.current.left - (obj.width * obj.scaleX) / 2;
    const right = left + obj.width * obj.scaleX;
    const top =
      obj.top - fakeCanvasRect.current.top - (obj.height * obj.scaleY) / 2;
    const bottom = top + obj.height * obj.scaleY;
    const centerX = obj.left - fakeCanvasRect.current.left;
    const centerY = obj.top - fakeCanvasRect.current.top;

    canvas.remove(...guidelinesRef.current);
    let newGuidelines: Polyline[] = [];
    let minVDist = snapingDistance + 1;
    let minVPoint: number;
    let minVPos: number;
    let snappedV = false;
    let minHDist = snapingDistance;
    let minHPoint: number;
    let minHPos: number;
    let snappedH = false;
    guidePoints.forEach(({ point, vertical }) => {
      if (vertical && dist(centerX, point) < minVDist) {
        minVDist = dist(centerX, point);
        minVPoint = point;
        minVPos = point;
        snappedV = true;
      }
      if (vertical && dist(left, point) < minVDist) {
        minVDist = dist(left, point);
        minVPoint = point;
        minVPos = point + (centerX - left);
        snappedV = true;
      }
      if (vertical && dist(right, point) < minVDist) {
        minVDist = dist(right, point);
        minVPoint = point;
        minVPos = point - (centerX - left);
        snappedV = true;
      }
      if (!vertical && dist(centerY, point) < minHDist) {
        minHDist = dist(centerY, point);
        minHPoint = point;
        minHPos = point;
        snappedH = true;
      }
      if (!vertical && dist(top, point) < minHDist) {
        minHDist = dist(top, point);
        minHPoint = point;
        minHPos = point + (centerY - top);
        snappedH = true;
      }
      if (!vertical && dist(bottom, point) < minHDist) {
        minHDist = dist(bottom, point);
        minHPoint = point;
        minHPos = point - (centerY - top);
        snappedH = true;
      }
    });

    if (snappedV) {
      const newVGuideline = new Polyline(
        [
          { x: 0, y: 0 },
          { x: 0, y: fakeCanvasRect.current!.height + 50 },
        ],
        {
          stroke: "purple",
          opacity: 0.8,
          left: minVPoint! + fakeCanvasRect.current.left,
          top: fakeCanvasRect.current.top,
          strokeDashArray: [5, 5],
          strokeWidth: 1,
        },
      );
      newGuidelines.push(newVGuideline);
      canvas.add(newVGuideline);
      obj.set({ left: minVPos! + fakeCanvasRect.current.left });
    }
    if (snappedH) {
      const newHGuideline = new Polyline(
        [
          { y: 0, x: 0 },
          { y: 0, x: fakeCanvasRect.current!.width + 50 },
        ],
        {
          stroke: "purple",
          opacity: 0.8,
          left: fakeCanvasRect.current.left,
          top: minHPoint! + fakeCanvasRect.current.top,
          strokeDashArray: [5, 5],
          strokeWidth: 1,
        },
      );
      newGuidelines.push(newHGuideline);
      canvas.add(newHGuideline);
      obj.set({ top: minHPos! + fakeCanvasRect.current.top });
    }
    if (snappedV || snappedH) {
      console.log("NewLines: ", newGuidelines);
      guidelinesRef.current = [...newGuidelines];
      canvas.requestRenderAll();
    }
  }
}

function dist(a: number, b: number) {
  return Math.abs(a - b);
}
