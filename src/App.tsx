import { useState, useEffect, useRef } from "react";
import { Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Canvas, Circle, initFilterBackend, Rect } from "fabric";
import Settings from "./components/Settings";
const App = () => {
  const [canvas, setCanvas] = useState<Canvas>();
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) {
      console.log("yes\n");
      console.log(canvasRef.current);
      const innitCanvas = new Canvas(canvasRef.current, {
        width: Math.min(innerWidth - 10, innerHeight - 10, 750),
        height: Math.min(innerWidth - 10, innerHeight - 10, 750),
        backgroundColor: "white",
      });
      innitCanvas.renderAll();
      setCanvas(innitCanvas);
      return () => {
        innitCanvas.dispose();
      };
    } else {
      console.log("No\n");
      console.log(canvasRef.current);
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
        canvas?.add(circle);
        console.log("circle clicked");
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
      {/* Toolbar */}
      <div className="position-absolute top-50 translate-middle-y ms-1">
        <ButtonToolbar className=" ">
          <ButtonGroup vertical>
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
      <div className="position-absolute top-50 end-0 translate-middle-y me-3">
        <Settings canvas={canvas}></Settings>
      </div>
    </div>
  );
};

export default App;
