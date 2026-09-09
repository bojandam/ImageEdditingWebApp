import {
  FabricImage,
  Point,
  util,
  type ObjectEvents,
  type TPointerEventInfo,
} from "fabric";
// import { createImageCroppingControls } from "croppingControls";
// import { cropPanMoveHandler, renderGhostImage } from "./croppingHandlers";
import { createImageCroppingControls } from "fabric/extensions";
/**
 * Coordinates the change to image to enter crop mode and returns
 * a function to exit crop mode
 * This is a basic example for demos and your project may need persistent crop state,
 * in that case make your own function.
 */
export const enterCropMode = function enterCropMode(
  this: (args: TPointerEventInfo) => void,
  { target }: TPointerEventInfo,
) {
  const fabricImage = target as FabricImage;
  const { controls, padding, clipPath } = fabricImage;
  fabricImage.padding = 0;
  fabricImage.clipPath = undefined;
  fabricImage.controls = createImageCroppingControls();
  fabricImage.on("moving", cropPanMoveHandler);
  fabricImage.on("before:render", renderGhostImage);

  fabricImage.setCoords();
  const exitCropMode = () => {
    fabricImage.padding = padding;
    fabricImage.off("moving", cropPanMoveHandler);
    fabricImage.off("before:render", renderGhostImage);
    fabricImage.controls = controls;
    fabricImage.clipPath = clipPath;
    fabricImage.setCoords();
    fabricImage.once("mousedblclick", enterCropMode);
    fabricImage.canvas?.requestRenderAll();
  };
  fabricImage.once("mousedblclick", exitCropMode);
  fabricImage.canvas?.requestRenderAll();
};

const cropPanMoveHandler = ({ transform }: ObjectEvents["moving"]) => {
  // this makes the image pan too fast.
  const { target, original } = transform;
  const fabricImage = target as FabricImage;
  const p = new Point(
    target.left - original.left,
    target.top - original.top,
  ).transform(
    util.invertTransform(
      util.createRotateMatrix({ angle: fabricImage.getTotalAngle() }),
    ),
  );
  let cropX =
    original.cropX! - (p.x / fabricImage.scaleX) * (fabricImage.flipX ? -1 : 1);
  let cropY =
    original.cropY! - (p.y / fabricImage.scaleY) * (fabricImage.flipY ? -1 : 1);
  const { width, height, _element } = fabricImage;
  if (cropX < 0) {
    cropX = 0;
  }
  if (cropY < 0) {
    cropY = 0;
  }
  if (cropX + width > _element.width) {
    cropX = _element.width - width;
  }
  if (cropY + height > _element.height) {
    cropY = _element.height - height;
  }
  fabricImage.cropX = cropX;
  fabricImage.cropY = cropY;
  fabricImage.left = original.left;
  fabricImage.top = original.top;
};

function renderGhostImage(
  this: FabricImage,
  { ctx }: { ctx: CanvasRenderingContext2D },
) {
  const element = this.getElement();
  const ghostX = -this.width / 2 - this.cropX;
  const ghostY = -this.height / 2 - this.cropY;

  const alpha = ctx.globalAlpha;
  ctx.globalAlpha *= 0.5;
  ctx.drawImage(element, ghostX, ghostY);
  ctx.strokeStyle = this.borderColor;
  // we assume this.scaleX and this.scaleY are same in an image.
  // it is not common use case to stretch images, and if it is, and is brought up,
  // this border for the image needs to be drawn differently.
  //   ctx.lineWidth = this.borderScaleFactor / this.scaleX;
  ctx.strokeRect(ghostX, ghostY, element.width, element.height);

  ctx.globalAlpha = alpha;
}
