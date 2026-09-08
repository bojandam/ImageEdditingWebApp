import {
  useContext,
  useEffect,
  useState,
  type BaseSyntheticEvent,
  type RefObject,
} from "react";
import PTextField from "./PTextField";
import { FabricObject, Point, Rect, type Canvas, type TFiller } from "fabric";
import { Row } from "react-bootstrap";
import { zoomToFitObject } from "../util/Transformations";
import { propertiesExtender } from "./FileJSONSaver";
import { FakeCanvasContext } from "../context/FakeCanvasContext";

interface Props {
  canvas: Canvas | undefined;
}

const CanvasSettings = ({ canvas }: Props) => {
  const {
    fakeCanvasRect,
    fakeCanvasClip,
    fakeCanvasCenter,
    zoom,
    setZoom,
    fakeHeight,
    setFakeHeight,
    fakeWidth,
    setFakeWidth,
    fill,
    setFill,
  } = useContext(FakeCanvasContext)!;

  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  //dimensions setup
  useEffect(() => {
    if (width === undefined || height === undefined) {
      setWidth(canvas?.width);
      setHeight(canvas?.height);
    }
    if (canvas && zoom === undefined) {
      setZoom(canvas.getZoom() * 100);
    }
  }, [canvas]);
  //Creating Rect, Group, Clip
  useEffect(() => {
    if (canvas && fakeCanvasRect && !fakeCanvasRect.current) {
      console.log("fakeCanvas Made");
      if (fakeCanvasCenter)
        fakeCanvasCenter.current = new Point(canvas.getCenterPoint());

      if (fakeCanvasClip)
        fakeCanvasClip.current = new Rect({
          width: fakeWidth,
          height: fakeHeight,
          left: canvas.getCenterPoint().x,
          top: canvas.getCenterPoint().y,
          absolutePositioned: true,
        });

      fakeCanvasRect.current = new Rect({
        width: canvas.width,
        height: canvas.height,
        left: canvas.getCenterPoint().x,
        top: canvas.getCenterPoint().y,
        fill: "#FFFFFF",
        selectable: false,
        hoverCursor: "default",
        stroke: "#FFFFFF",
        strokeWidth: 1,
      });
      propertiesExtender(fakeCanvasRect.current, ["selectable", "hoverCursor"]);
      setFill(fakeCanvasRect.current.fill!);
      if (fakeCanvasClip && fakeCanvasClip.current)
        fakeCanvasRect.current.clipPath = fakeCanvasClip.current;
      canvas.add(fakeCanvasRect.current);
      zoomToFitObject(canvas, fakeCanvasRect.current);
      setZoom(canvas.getZoom() * 100);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  // Reposition on window size change
  useEffect(() => {
    if (canvas) {
      canvas.setDimensions({ width: width, height: height });
      if (fakeCanvasCenter.current && fakeCanvasClip.current) {
        const newCenter = canvas.getCenterPoint();
        const dX = newCenter.x - fakeCanvasCenter.current.x;
        const dY = newCenter.y - fakeCanvasCenter.current.y;
        const translate = (Obj: FabricObject, dx: number, dy: number) => {
          Obj.set({
            left: Obj.left + dx,
            top: Obj.top + dy,
          });
        };
        translate(fakeCanvasClip.current, dX, dY);
        canvas.getObjects().forEach((el) => {
          console.log("Before: ", el.left);
          translate(el, dX, dY);
          console.log("After: ", el.left);
          console.log(el);
          el.setCoords();
        });
        fakeCanvasCenter.current.setFromPoint(newCenter);
        canvas.getActiveObject()?.setCoords();
        canvas.renderAll();
      }
    }
  }, [width, height, canvas]);

  // Set fakeCanvas dimensions
  useEffect(() => {
    if (fakeCanvasClip.current && fakeCanvasRect.current && canvas) {
      fakeCanvasRect.current.set({
        width: fakeWidth,
        height: fakeHeight,
      });
      fakeCanvasClip.current.set({
        width: fakeWidth,
        height: fakeHeight,
      });

      fakeCanvasRect.current.setCoords();
      console.log("Resizing fake canvas: ", fakeCanvasRect.current);
      canvas.renderAll();
    }
  }, [fakeWidth, fakeHeight, canvas]);

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }, []);
  //Zoom & Pan, (kopirano od fabric.js docs p5)
  useEffect(() => {
    if (canvas) {
      canvas.on("mouse:down", function (this: any, opt) {
        var evt: any = opt.e;
        if (evt.altKey === true) {
          (this as any).isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
      canvas.on("mouse:move", function (this: any, opt) {
        if (this.isDragging) {
          var e: any = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
      canvas.on("mouse:up", function (this: any) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });
      canvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint(canvas.getCenterPoint(), zoom);
        setZoom(zoom * 100);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        canvas.setViewportTransform(canvas.viewportTransform);
      });
    }
  }, [canvas]);

  const resizeCanvas = () => {
    console.log("windwos size changed");
    setWidth(innerWidth - 15);
    setHeight(innerHeight - 15);
  };

  const handleFakeWidthChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    if (intValue > 0) {
      setFakeWidth(intValue);
    }
  };

  const handleFakeHeightChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    if (intValue > 0) {
      setFakeHeight(intValue);
    }
  };

  const handleZoom = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    if (intValue > 0 && fakeCanvasRect && fakeCanvasRect.current) {
      setZoom(intValue);
      canvas?.zoomToPoint(canvas.getCenterPoint(), intValue / 100);
    }
  };
  const handleFakeFillChange = (e: BaseSyntheticEvent) => {
    const value = e.target.value;
    if (fakeCanvasRect.current) {
      setFill(value);
      fakeCanvasRect.current.set({ fill: value });
      canvas?.requestRenderAll();
    }
  };
  return (
    <Row className="flex-wrap ps-2 pe-1" style={{}}>
      {/* <Col xs={1}>W:</Col>
      <Col>{width}</Col>
      <Col xs={1}>H:</Col>
      <Col>{height}</Col> */}
      <PTextField
        label="Width:"
        value={fakeWidth}
        unit="px"
        formId="fakeWidthForm"
        onChange={handleFakeWidthChange}
      />
      <PTextField
        label="Height:"
        value={fakeHeight}
        unit="px"
        formId="fakeHeightForm"
        onChange={handleFakeHeightChange}
      />
      <PTextField
        label="Zoom:"
        value={zoom}
        unit="%"
        formId="canZoomForm"
        onChange={handleZoom}
      />
      <PTextField
        label="Color:"
        value={fill?.toString()}
        formId="fakeFillForm"
        onChange={handleFakeFillChange}
        type="color"
      />
    </Row>
  );
};
const parseToInt = (x: string) => {
  return x === "" ? 0 : parseInt(x.replace(/,/g, ""), 10);
};
export default CanvasSettings;
