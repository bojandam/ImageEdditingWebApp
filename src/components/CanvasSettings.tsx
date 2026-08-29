import {
  useEffect,
  useState,
  type BaseSyntheticEvent,
  type RefObject,
} from "react";
import PTextField from "./PTextField";
import { Group, Point, Rect, type Canvas } from "fabric";
import { Col, Row } from "react-bootstrap";

interface Props {
  canvas: Canvas | undefined;
  fakeCanvasRect: RefObject<Rect>;
  fakeCanvasGroup: RefObject<Group>;
  fakeCanvasClip: RefObject<Rect>;
  fakeCanvasCenter: RefObject<Point>;
  zoom: number | undefined;
  setZoom: (zoom: number) => {};
}

const CanvasSettings = ({
  canvas,
  fakeCanvasRect,
  fakeCanvasClip,
  fakeCanvasCenter,
  zoom,
  setZoom,
}: Props) => {
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [fakeWidth, setFakeWidth] = useState<number>(750);
  const [fakeHeight, setFakeHeight] = useState<number>(750);

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
    if (canvas && !fakeCanvasRect.current) {
      console.log("fakeCanvas Made");
      fakeCanvasRect.current = new Rect({
        width: canvas.width * 2,
        height: canvas.height * 2,
        left: canvas.getCenterPoint().x,
        top: canvas.getCenterPoint().y,
        fill: "#FFFFFF",
        selectable: false,
        hoverCursor: "default",
        stroke: "#FFFFFF",
        strokeWidth: 1,
      });
      // fakeCanvasGroup.current = new Group([fakeCanvasRect.current], {
      //   left: canvas.getCenterPoint().x,
      //   top: canvas.getCenterPoint().y,
      // });
      fakeCanvasClip.current = new Rect({
        width: fakeWidth,
        height: fakeHeight,
        left: canvas.getCenterPoint().x,
        top: canvas.getCenterPoint().y,
        absolutePositioned: true,
      });
      fakeCanvasCenter.current = new Point(canvas.getCenterPoint());
      fakeCanvasRect.current.clipPath = fakeCanvasClip.current;
      canvas.add(fakeCanvasRect.current);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      console.log("Canvas reposition");
      canvas.setDimensions({ width: width, height: height });

      const newCenter = canvas.getCenterPoint();
      const dX = newCenter.x - fakeCanvasCenter.current.x;
      const dY = newCenter.y - fakeCanvasCenter.current.y;
      const translate = (Obj, dx, dy) => {
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
      // fakeCanvasRect.current.set({ left: newCenter.x, top: newCenter.y });
      canvas.getActiveObject()?.setCoords();
      // console.log("Reposition fakeCanvas: ", fakeCanvasGroup.current);

      canvas.renderAll();
    }
  }, [width, height, canvas]);

  // Set fakeCanvas dimensions
  useEffect(() => {
    if (fakeCanvasRect.current && canvas) {
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
    console.log("Adding resize event listener");
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.on("mouse:down", function (opt) {
        var evt = opt.e;
        if (evt.altKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
      canvas.on("mouse:move", function (opt) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
      canvas.on("mouse:up", function (opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
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
  });

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
    if (intValue > 0 && fakeCanvasRect.current) {
      setZoom(intValue);
      canvas?.zoomToPoint(canvas.getCenterPoint(), intValue / 100);
    }
  };
  return (
    <Row className="flex-wrap ps-2 pe-1" style={{}}>
      <Col xs={1}>W:</Col>
      <Col>{width}</Col>
      <Col xs={1}>H:</Col>
      <Col>{height}</Col>
      <PTextField
        label="W:"
        value={fakeWidth}
        unit="px"
        formId="fakeWidthForm"
        onChange={handleFakeWidthChange}
      />
      <PTextField
        label="H:"
        value={fakeHeight}
        unit="px"
        formId="fakeHeightForm"
        onChange={handleFakeHeightChange}
      />
      <PTextField
        label="Z:"
        value={zoom}
        unit="%"
        formId="canZoomForm"
        onChange={handleZoom}
      />
    </Row>
  );
};
const parseToInt = (x: string) => {
  return x === "" ? 0 : parseInt(x.replace(/,/g, ""), 10);
};
export default CanvasSettings;
