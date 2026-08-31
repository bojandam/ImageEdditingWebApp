import { useState, useEffect, useRef, type BaseSyntheticEvent } from "react";
import { Accordion, Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  ActiveSelection,
  Canvas,
  Circle,
  FabricObject,
  Group,
  initFilterBackend,
  Point,
  Polyline,
  Rect,
} from "fabric";
import ObjSettings from "./components/ObjSettings";
import CanvasSettings from "./components/CanvasSettings";
import { handleMovingSnap } from "./util/Snapping";
const App = () => {
  const [canvas, setCanvas] = useState<Canvas>();
  const canvasRef = useRef(null);
  const fakeCanvasRect = useRef<Rect>(null);
  const fakeCanvasCenter = useRef<Point>(null);
  const fakeCanvasClip = useRef<Rect>(null);
  const [windowWidth, setWindowWidth] = useState<number>(innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(innerHeight);
  const [zoom, setZoom] = useState<number>(100);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
  }, []);
  const handleResize = () => {
    setWindowWidth(innerWidth);
    setWindowHeight(innerHeight);
  };
  const isMobile = () => {
    const treshold = 768;
    return windowWidth < treshold;
  };

  useEffect(() => {
    if (canvasRef.current) {
      const innitCanvas = new Canvas(canvasRef.current, {
        width: innerWidth - 15,
        height: innerHeight - 15,
        backgroundColor: "#F0F8FF",
      });

      innitCanvas.renderAll();
      setCanvas(innitCanvas);
      return () => {
        innitCanvas.dispose();
      };
    }
  }, []);

  const buttonList = [
    {
      id: 0,
      icon: "square",
      onClick: () => {
        console.log("square clicked");
        const square = new Rect({
          width: 150,
          height: 150,
          top: canvas?.getCenterPoint().y,
          left: canvas?.getCenterPoint().x,
          fill: "#FFAAAA",
          stroke: "#FFFFFF00",
        });
        // fakeCanvasGroup.current?.add(square);
        canvas?.add(square);
        if (fakeCanvasClip.current) square.clipPath = fakeCanvasClip.current;
      },
    },
    {
      id: 1,
      icon: "circle",
      onClick: () => {
        const circle = new Circle({
          fill: "#AAFFFF",
          radius: 40,
          stroke: "#FFFFFF00",
          top: canvas?.getCenterPoint().y,
          left: canvas?.getCenterPoint().x,
        });
        // fakeCanvasGroup.current?.add(circle);
        canvas?.add(circle);
        console.log(fakeCanvasClip.current);
        if (fakeCanvasClip.current) circle.clipPath = fakeCanvasClip.current;
      },
    },
    {
      id: 2,
      icon: "arrows-angle-expand",
      onClick: () => {
        const line = new Polyline(
          [
            { x: 10, y: 10 },
            { x: 50, y: 30 },
            { x: 40, y: 70 },
            { x: 60, y: 50 },
            { x: 100, y: 150 },
            { x: 40, y: 100 },
          ],
          {
            stroke: "red",
            left: canvas?.getCenterPoint().x,
            top: canvas?.getCenterPoint().y,
          },
        );
        canvas?.add(line);
        if (fakeCanvasClip.current) line.clipPath = fakeCanvasClip.current;
      },
    },
    {
      id: 3,
      icon: "house-gear",
      onClick: () => {
        if (canvas) {
          canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
          setZoom(100);
        }
      },
    },
  ];
  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log("Keydown: ", e);
    if (["Backspace", "Delete"].includes(e.key)) {
      console.log("Delete");
      deleteElemetnt();
    }
  };
  const deleteElemetnt = () => {
    if (canvas) {
      const obj = canvas.getActiveObject();
      if (obj) {
        if (obj.type === "activeselection") {
          (obj as ActiveSelection).getObjects().forEach((el) => {
            canvas.remove(el);
          });
        } else {
          canvas.remove(obj);
        }
        canvas.discardActiveObject();
      }
    }
  };

  return (
    <div className="w-100 h-100">
      {/* Canvas */}
      <div className="bg-light d-flex flex-row justify-content-evenly min-vh-100 ">
        <div
          className="my-auto focus-ring shadow-none"
          onKeyDown={handleCanvasKeyDown}
          tabIndex={0}
        >
          <canvas id="canvas1" ref={canvasRef}></canvas>
        </div>
      </div>
      <div className="d-flex w-100 h-100 position-fixed top-0 start-0 justify-content-between flex-md-row flex-column align-items-center pe-none">
        {/* Toolbar */}
        <div className="ms-1 pe-auto">
          <ButtonToolbar className="">
            <ButtonGroup vertical={!isMobile()} className="">
              {buttonList.map((el) => {
                return (
                  <Button variant="secondary" onClick={el.onClick} key={el.id}>
                    <i className={"bi bi-" + el.icon}></i>
                  </Button>
                );
              })}
            </ButtonGroup>
          </ButtonToolbar>
        </div>
        {/* Settings */}
        <div className="me-3 pe-auto">
          <div className="" style={{ width: "300px" }}>
            <Accordion defaultActiveKey={["0", "1"]} alwaysOpen tabIndex={0}>
              <Accordion.Item eventKey="0" tabIndex={-1}>
                <Accordion.Header tabIndex={-1}>
                  Object Properties
                </Accordion.Header>
                <Accordion.Body className="">
                  <ObjSettings
                    canvas={canvas}
                    fakeCanvasRect={fakeCanvasRect}
                  ></ObjSettings>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Canvas Properties</Accordion.Header>
                <Accordion.Body>
                  <CanvasSettings
                    canvas={canvas}
                    fakeCanvasRect={fakeCanvasRect}
                    fakeCanvasClip={fakeCanvasClip}
                    fakeCanvasCenter={fakeCanvasCenter}
                    zoom={zoom}
                    setZoom={(zoom) => {
                      setZoom(zoom);
                    }}
                  ></CanvasSettings>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
