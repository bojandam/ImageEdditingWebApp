import { useState, useEffect, useRef, type BaseSyntheticEvent } from "react";
import { Accordion, Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  ActiveSelection,
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Point,
  Rect,
  type TFiller,
  type TPointerEventInfo,
} from "fabric";
import { saveAs } from "file-saver";
import ObjSettings from "./components/ObjSettings";
import CanvasSettings from "./components/CanvasSettings";
import Layers from "./components/Layers";
import { zoomToFitObject } from "./util/Transformations";
import FileJSONSaver, { propertiesExtender } from "./components/FileJSONSaver";

import { FocusContext } from "./context/FocusTracker";
import { FakeCanvasContext } from "./context/FakeCanvasContext";
import { createImageCroppingControls } from "fabric/extensions";

const enterCropMode = function enterCropMode(
  this: (args: TPointerEventInfo) => void,
  { target }: TPointerEventInfo,
) {
  const fabricImage = target as FabricImage;
  const { controls, padding } = fabricImage;
  fabricImage.padding = 0;
  fabricImage.controls = createImageCroppingControls();
  fabricImage.on("moving", cropPanMoveHandle);
  // fabricImage.on("before:render", renderGhostImage);
  fabricImage.setCoords();
  const exitCropMode = () => {
    fabricImage.padding = padding;
    // fabricImage.off("moving", cropPanMoveHandler);
    // fabricImage.off("before:render", renderGhostImage);
    fabricImage.controls = controls;
    fabricImage.setCoords();
    fabricImage.once("mousedblclick", enterCropMode);
    fabricImage.canvas?.requestRenderAll();
  };
  fabricImage.once("mousedblclick", exitCropMode);
  fabricImage.canvas?.requestRenderAll();
};

const App = () => {
  const [canvas, setCanvas] = useState<Canvas>();
  const canvasRef = useRef(null);

  const fakeCanvasRect = useRef<Rect>(null);
  const fakeCanvasCenter = useRef<Point>(null);
  const fakeCanvasClip = useRef<Rect>(null);
  const [zoom, setZoom] = useState<number>(100);
  //fake Canvas dimensoins
  const [fakeWidth, setFakeWidth] = useState<number>(750);
  const [fakeHeight, setFakeHeight] = useState<number>(750);
  const [fill, setFill] = useState<string | TFiller>();

  //For Mobile Detection
  const [windowWidth, setWindowWidth] = useState<number>(innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(innerHeight);

  //Focus stuff
  const canvasShellRef = useRef<HTMLInputElement>(null);
  const isImportaintFocusRef = useRef<boolean>(false);

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

  const handleOnFocusRefocusor = () => {
    console.log("Outside:");
    if (isImportaintFocusRef.current === false && canvasShellRef.current) {
      canvasShellRef.current.focus();
      console.log("Refocused to canvas");
    }
    console.log("Done outside");
  };

  const createObject = (obj: FabricObject) => {
    (obj as any).isObject = true;
    // (obj as any).isVisible = true;
    obj.set({
      top: canvas?.getCenterPoint().y,
      left: canvas?.getCenterPoint().x,
    });
    propertiesExtender(obj, ["isObject", "selectable", "hoverCursor"]);
    if (canvas) canvas.add(obj);
    if (fakeCanvasClip.current) obj.clipPath = fakeCanvasClip.current;
  };

  const buttonList = [
    {
      icon: "square",
      onClick: () => {
        console.log("Square Clicked");
        createObject(
          new Rect({
            width: 150,
            height: 150,
            top: canvas?.getCenterPoint().y,
            left: canvas?.getCenterPoint().x,
            fill: "#FFAAAA",
          }),
        );
      },
    },
    {
      icon: "circle",
      onClick: () => {
        createObject(
          new Circle({
            fill: "#AAFFFF",
            radius: 40,
            top: canvas?.getCenterPoint().y,
            left: canvas?.getCenterPoint().x,
          }),
        );
      },
    },
    {
      icon: "house-gear",
      onClick: () => {
        if (canvas && fakeCanvasRect.current) {
          zoomToFitObject(canvas, fakeCanvasRect.current);
          setZoom(canvas.getZoom() * 100);
        }
      },
    },

    // {
    //   icon: "house-gear-fill",
    //   onClick: () => {
    //     if (canvas) {
    //       canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    //       setZoom(100);
    //     }
    //   },
    // },
  ];

  const handleExport = () => {
    if (!fakeCanvasRect.current || !canvas) return;

    const oldViewTransform = canvas.viewportTransform;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    const getOptions = (x: FabricObject) => {
      return {
        left: x.left - (x.width * x.scaleX) / 2,
        top: x.top - (x.height * x.scaleY) / 2,
        width: x.width * x.scaleX,
        height: x.height * x.scaleY,
      };
    };
    canvas
      .toBlob({
        multiplier: 1,
        quality: 1,
        format: "png",
        ...getOptions(fakeCanvasRect.current),
      })
      .then((blob) => {
        if (blob) saveAs(blob, "Canvas.png");
        else console.error("Blob generation Failed :(");
      });
    canvas.setViewportTransform(oldViewTransform);
    //   canvas.getElement().toBlob((blob) => {
    //   if (blob) saveAs(blob, "Canvas.png");
    //   else console.error("Blob generation Failed :(");
    // });
  };
  const addImage = (file: Blob) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      console.log(fileReader.result);
      FabricImage.fromURL(fileReader.result!.toString()).then((img) => {
        (img as any).name = (file as File).name;
        (img as any).lockXY = true;
        img.once("mousedblclick", enterCropMode);
        createObject(img);
      });
    };
  };
  return (
    <div className="w-100 h-100">
      {/* Canvas */}
      <div className="bg-light d-flex flex-row justify-content-evenly min-vh-100 ">
        <div
          className="my-auto focus-ring shadow-none"
          onKeyDown={handleCanvasKeyDown}
          tabIndex={0}
          ref={canvasShellRef}
          onPaste={({ clipboardData }) => {
            if (
              clipboardData.types.includes("Files") &&
              clipboardData.files[0].type.startsWith("image/")
            )
              addImage(clipboardData.files[0]);
          }}
        >
          <canvas id="canvas1" ref={canvasRef}></canvas>
        </div>
      </div>
      <FocusContext.Provider value={{ isImportaintFocusRef }}>
        <FakeCanvasContext.Provider
          value={{
            fakeCanvasRect,
            fakeCanvasClip,
            fakeCanvasCenter,
            zoom,
            setZoom,
            fakeWidth,
            setFakeWidth,
            fakeHeight,
            setFakeHeight,
            fill,
            setFill,
          }}
        >
          <div className="d-flex w-100 h-100 position-fixed top-0 start-0 justify-content-between flex-md-row flex-column align-items-center pe-none">
            {/* Toolbar */}
            <div className="ms-1 pe-auto">
              <ButtonToolbar className={!isMobile() ? "flex-column " : ""}>
                <ButtonGroup
                  vertical={!isMobile()}
                  className="me-5 mb-5"
                  onFocus={handleOnFocusRefocusor}
                >
                  {/* Normal Buttons */}
                  {buttonList.map((el, i) => {
                    return (
                      <Button variant="secondary" onClick={el.onClick} key={i}>
                        <i className={"bi bi-" + el.icon}></i>
                      </Button>
                    );
                  })}
                </ButtonGroup>
                {/* File Buttons */}
                <ButtonGroup
                  vertical={!isMobile()}
                  className="me-5 mb-5"
                  onFocus={handleOnFocusRefocusor}
                >
                  {/* Export */}
                  <Button className="" onClick={handleExport}>
                    <i className="bi bi-box-arrow-right"></i>
                  </Button>
                  <FileJSONSaver canvas={canvas!} />
                </ButtonGroup>
              </ButtonToolbar>
            </div>
            {/* Settings */}
            <div className="me-3 pe-auto">
              <div className="" style={{ width: "350px" }}>
                <Accordion
                  defaultActiveKey={["0", "1", "2"]}
                  alwaysOpen
                  tabIndex={0}
                  onFocus={handleOnFocusRefocusor}
                  style={{ maxHeight: "95vh" }}
                  className="overflow-y-auto "
                >
                  <Accordion.Item eventKey="0" tabIndex={-1} id="PLs">
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
                      <CanvasSettings canvas={canvas}></CanvasSettings>
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="2" onFocus={handleOnFocusRefocusor}>
                    <Accordion.Header>Layers</Accordion.Header>
                    <Accordion.Body>
                      <Layers canvas={canvas!} />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </div>
          </div>
        </FakeCanvasContext.Provider>
      </FocusContext.Provider>
    </div>
  );
};

export default App;
