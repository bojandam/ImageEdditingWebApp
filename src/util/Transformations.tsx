import type { Canvas, FabricObject } from "fabric";

export const zoomToFitObject = (canvas: Canvas, targetObject: FabricObject) => {
  const boundingRect = targetObject.getBoundingRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;
  const newZoom = Math.min(scaleX, scaleY) * 0.95;

  const objCenterX = boundingRect.left + boundingRect.width / 2;
  const objCenterY = boundingRect.top + boundingRect.height / 2;
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;

  const tx = canvasCenterX - objCenterX * newZoom;
  const ty = canvasCenterY - objCenterY * newZoom;

  canvas.setViewportTransform([newZoom, 0, 0, newZoom, tx, ty]);
  // setZoom(newZoom * 100);
};
