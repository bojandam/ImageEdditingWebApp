import { useState, useEffect, useRef } from "react";
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
} from "fabric";
import { saveAs } from "file-saver";
import ObjSettings from "./components/ObjSettings";
import CanvasSettings from "./components/CanvasSettings";
import Layers from "./components/Layers";

import { FocusContext } from "./context/FocusTracker";
import { FakeCanvasContext } from "./context/FakeCanvasContext";
import FileJSONSaver, {
  extendExportedProperties,
} from "./components/FileJSONSaver";
import { enterCropMode } from "./util/Cropping";
import { zoomToFitObject } from "./util/Transformations";

const App = () => {
  //Canvas stuff
  const [canvas, setCanvas] = useState<Canvas>();
  const [windowWidth, setWindowWidth] = useState<number>(innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(innerHeight);
  const [zoom, setZoom] = useState<number>(100);
  const canvasRef = useRef(null);
  //Fake canvas refs
  const fakeCanvasRect = useRef<Rect>(null);
  const fakeCanvasCenter = useRef<Point>(null);
  const fakeCanvasClip = useRef<Rect>(null);
  //fake Canvas dimensoins
  const [fakeWidth, setFakeWidth] = useState<number>(750);
  const [fakeHeight, setFakeHeight] = useState<number>(750);
  const [fill, setFill] = useState<string | TFiller>();

  //Focus stuff
  const canvasShellRef = useRef<HTMLInputElement>(null);
  const isImportaintFocusRef = useRef<boolean>(false);

  //Undo Redo
  const [history, setHistory] = useState<any[]>([]);
  const [currentHistoryState, setCurrentHistoryState] = useState<number>(0);

  //#region Window Resizing
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
  //#endregion

  //#region Focus & Deletion
  useEffect(() => {
    if (canvasShellRef.current) canvasShellRef.current.focus();
  }, [canvasShellRef]);

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
  //#endregion

  //#region  Object & Images
  const createObject = (obj: FabricObject) => {
    (obj as any).isObject = true;
    obj.set({
      top: canvas?.getCenterPoint().y,
      left: canvas?.getCenterPoint().x,
    });

    extendExportedProperties(obj, ["isObject", "selectable", "hoverCursor"]);
    if (canvas) canvas.add(obj);
    if (fakeCanvasClip.current) obj.clipPath = fakeCanvasClip.current;
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

  const handlePasteImage = ({ clipboardData }: React.ClipboardEvent) => {
    if (
      clipboardData.types.includes("Files") &&
      clipboardData.files[0].type.startsWith("image/")
    )
      addImage(clipboardData.files[0]);
  };
  //#endregion

  //#region Undo Redo
  const saveCanvasState = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    setHistory([json, ...history.slice(currentHistoryState)]);
    setCurrentHistoryState((i) => {
      return i > 0 ? i - 1 : 0;
    });
  };
  const loadCanvasState = (i: number) => {};
  //#endregion

  //#region Object Butons
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
            strokeWidth: 0,
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
  ];
  //#endregion
  //#region Return
  return (
    <div className="w-100 h-100">
      {/* Canvas */}
      <div className="bg-light d-flex flex-row justify-content-evenly min-vh-100 ">
        <div
          className="my-auto focus-ring shadow-none"
          onKeyDown={handleCanvasKeyDown}
          tabIndex={0}
          ref={canvasShellRef}
          onPaste={handlePasteImage}
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
                  {/* Object Buttons */}
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
  //#endregion
};

export default App;
