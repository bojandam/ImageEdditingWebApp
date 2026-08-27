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
}

const CanvasSettings = ({
  canvas,
  fakeCanvasRect,
  fakeCanvasGroup,
  fakeCanvasClip,
  fakeCanvasCenter,
}: Props) => {
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [zoom, setZoom] = useState<number>();
  const [fakeWidth, setFakeWidth] = useState<number>(750);
  const [fakeHeight, setFakeHeight] = useState<number>(750);

  //dimensions setup
  useEffect(() => {
    if (width === undefined || height === undefined) {
      setWidth(canvas?.width);
      setHeight(canvas?.height);
    }
    if (canvas && zoom === undefined) {
      setZoom(canvas?.getZoom() * 100);
    }
  }, [canvas]);
  //Creating Rect, Group, Clip
  useEffect(() => {
    if (canvas && !fakeCanvasRect.current) {
      console.log("fakeCanvas Made");
      fakeCanvasRect.current = new Rect({
        width: canvas.width * 2,
        height: canvas.height * 2,
        left: 0,
        top: 0,
        fill: "#FFFFFF",
        selectable: false,
        hoverCursor: "default",
        stroke: "#FFFFFF",
        strokeWidth: 1,
      });
      fakeCanvasGroup.current = new Group([fakeCanvasRect.current], {
        left: canvas.getCenterPoint().x,
        top: canvas.getCenterPoint().y,
      });
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
      if (fakeCanvasGroup.current) {
        const newCenter = canvas.getCenterPoint();
        const dX = newCenter.x - fakeCanvasCenter.current.x;
        const dY = newCenter.y - fakeCanvasCenter.current.y;
        const translate = (Obj, dx, dy) => {
          Obj.set({ left: Obj.left + dx, top: Obj.top + dy });
        };
        translate(fakeCanvasClip.current, dX, dY);
        translate(fakeCanvasGroup.current, dX, dY);
        fakeCanvasCenter.current.setFromPoint(newCenter);
        // fakeCanvasGroup.current.set(pos);
        // fakeCanvasRect.current.set({ left: 0, top: 0 });
        canvas.getActiveObject()?.setCoords();
        console.log("Reposition fakeCanvas: ", fakeCanvasGroup.current);
      }
      canvas.renderAll();
    }
  }, [width, height, canvas]);

  // Set fakeCanvas dimensions
  useEffect(() => {
    if (fakeCanvasRect.current && canvas) {
      fakeCanvasRect.current.set({
        width: canvas.width,
        height: canvas.height,
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

  const resizeCanvas = () => {
    console.log("windwos size changed");
    setWidth(innerWidth - 15);
    setHeight(innerHeight - 15);
  };
  // const handleWidthChange = (e: BaseSyntheticEvent) => {
  //   const intValue = parseToInt(e.target?.value);
  //   if (intValue >= 0) {
  //     setWidth(intValue);
  //   }
  // };

  // const handleHeightChange = (e: BaseSyntheticEvent) => {
  //   const intValue = parseToInt(e.target?.value);
  //   if (intValue >= 0) {
  //     setHeight(intValue);
  //   }
  // };

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
      // canvas?.setZoom(intValue / 100);
      canvas?.zoomToPoint(
        fakeCanvasRect.current?.getCenterPoint(),
        intValue / 100,
      );
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
