import { useState, useEffect, useRef } from "react";
import { Accordion, Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Canvas, Circle, Group, initFilterBackend, Rect } from "fabric";
import ObjSettings from "./components/ObjSettings";
import CanvasSettings from "./components/CanvasSettings";
const App = () => {
  const [canvas, setCanvas] = useState<Canvas>();
  const canvasRef = useRef(null);
  const fakeCanvasRect = useRef<Rect>(null);
  const fakeCanvasGroup = useRef<Group>(null);
  const [windowWidth, setWindowWidth] = useState<number>(innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(innerHeight);
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
          top: 200,
          left: 200,
          fill: "#FFAAAA",
          stroke: "#FFFFFF00",
        });
        canvas?.add(square);
      },
    },
    {
      id: 1,
      icon: "circle",
      onClick: () => {
        const circle = new Circle({
          top: 200,
          left: 200,
          fill: "#AAFFFF",
          radius: 40,
          stroke: "#FFFFFF00",
        });
        if (canvas) canvas.add(circle);
      },
    },
  ];

  return (
    <div className="w-100 h-100">
      {/* Canvas */}
      <div className="bg-light d-flex flex-row justify-content-evenly min-vh-100 ">
        <div className="my-auto">
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
            <Accordion defaultActiveKey={["0", "1"]} alwaysOpen>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Object Properties</Accordion.Header>
                <Accordion.Body className="">
                  <ObjSettings canvas={canvas}></ObjSettings>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Canvas Properties</Accordion.Header>
                <Accordion.Body>
                  <CanvasSettings
                    canvas={canvas}
                    fakeCanvasRect={fakeCanvasRect}
                    fakeCanvasGroup={fakeCanvasGroup}
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
