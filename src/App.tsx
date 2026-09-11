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
import ObjSettings from "./components/ObjSettings";
import CanvasSettings from "./components/CanvasSettings";
import Layers from "./components/Layers";

import { FocusContext } from "./context/FocusContext";
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

  //Objects stuff
  const extendedObjectProperties = [
    "isObject",
    "selectable",
    "hoverCursor",
    "canvasId",
  ];
  //Undo Redo
  const [history, setHistory] = useState<any[]>([]);
  const currentHistoryStateRef = useRef<number>(0);
  const idTrackerRef = useRef<number>(0);

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
  //#region Keyboard input
  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log("Keydown: ", e.key);
    if (["Backspace", "Delete"].includes(e.key)) {
      deleteElemetnt();
    }
    if (["z", "Z"].includes(e.key) && e.ctrlKey) {
      e.shiftKey ? redoCanvas() : undoCanvas();
    }
  };
  //#endregion
  //#region Focus & Deletion
  const focusCanvas = () => {
    if (canvasShellRef.current) canvasShellRef.current.focus();
  };
  useEffect(() => {
    focusCanvas();
  }, [canvasShellRef]);
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
    if (isImportaintFocusRef.current === false) {
      focusCanvas();
      console.log("Refocused to canvas");
    }
    console.log("Done outside");
  };
  //#endregion

  //#region  Object & Images
  const createObject = (obj: FabricObject) => {
    (obj as any).isObject = true;
    (obj as any).canvasId = idTrackerRef.current++;

    obj.set({
      top: canvas?.getCenterPoint().y,
      left: canvas?.getCenterPoint().x,
    });

    extendExportedProperties(obj, extendedObjectProperties);
    if (canvas) canvas.add(obj);
    if (fakeCanvasClip.current) obj.clipPath = fakeCanvasClip.current;
    saveCanvasState();
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
    const setIt = (i: number) => {
      setHistory((arr) => {
        return [json, ...arr.slice(i)];
      });
    };
    setIt(currentHistoryStateRef.current);
    currentHistoryStateRef.current = 0;
  };
  const clearHistory = () => {
    setHistory([]);
    currentHistoryStateRef.current = 0;
  };
  useEffect(() => {
    console.log("History: ", history, " now: ", currentHistoryStateRef.current);
  }, [history]);
  const loadCanvasState = (i: number) => {
    if (i < 0 || i >= history.length || !canvas) return;
    //to do: keep track of focsed element
    const selectedIds = canvas.getActiveObjects().map((el: any) => {
      return el.canvasId;
    });
    console.log("selcetd ids:", selectedIds);

    loadJsonToCanvas(history[i]).then(() => {
      currentHistoryStateRef.current = i;

      const left = canvas.getObjects().filter((el: any) => {
        return selectedIds.includes(el.canvasId);
      });
      console.log("left: ", left);
      if (left.length === 1) {
        console.log("IN");
        canvas.setActiveObject(left[0]);
      } else if (left.length > 1) {
        canvas.setActiveObject(new ActiveSelection(left));
      }
      console.log(
        "History: ",
        history,
        " now: ",
        currentHistoryStateRef.current,
      );
      canvas.requestRenderAll();
    });
  };

  const undoCanvas = () => {
    loadCanvasState(currentHistoryStateRef.current + 1);
  };
  const redoCanvas = () => {
    loadCanvasState(currentHistoryStateRef.current - 1);
  }; //#endregion
  //#region Load Json
  const loadJsonToCanvas = (json: JSON) => {
    // Promise
    return new Promise<void>((resolve, reject) => {
      if (!canvas)
        return reject(new Error("loadJsonToCanvas: No canvas to load to"));

      // canvas.clear();
      canvas.loadFromJSON(json).then(() => {
        canvas.renderOnAddRemove = false;
        const imagePromises = canvas
          .getObjects()
          .filter((obj): obj is FabricImage => obj.type === "image")
          .map((img) => {
            return new Promise<void>((resolve) => {
              const element = img.getElement();
              if (element && (element as any).complete) {
                resolve();
              } else if (element) {
                element.onload = () => resolve();
                element.onerror = () => resolve();
              } else {
                resolve();
              }
            });
          });

        Promise.all(imagePromises).then(() => {
          const newFakeRect = canvas.getObjects()[0] as Rect;
          console.log("Objects:", canvas.getObjects());
          fakeCanvasRect.current = newFakeRect;
          fakeCanvasRect.current.selectable = false;
          // Reposition
          if (fakeCanvasClip.current) {
            const newCenter = canvas.getCenterPoint();
            const dX = newCenter.x - fakeCanvasRect.current.left;
            const dY = newCenter.y - fakeCanvasRect.current.top;
            const translate = (Obj: FabricObject, dx: number, dy: number) => {
              Obj.set({
                left: Obj.left + dx,
                top: Obj.top + dy,
              });
            };
            canvas.getObjects().forEach((el) => {
              translate(el, dX, dY);
              el.setCoords();
            });
            canvas.getActiveObject()?.setCoords();
          }
          setFakeWidth(newFakeRect.width);
          setFakeHeight(newFakeRect.height);
          setFill(newFakeRect.fill!);
          canvas.getObjects().forEach((el) => {
            if (fakeCanvasClip.current) el.clipPath = fakeCanvasClip.current;
            extendExportedProperties(el, extendedObjectProperties);
          });
          canvas.renderOnAddRemove = true;
          canvas.requestRenderAll();
          resolve();
        });
      });
    });
  };
  // const loadJsonToCanvas = async (json: any) => {
  //   if (!canvas) throw new Error("loadJsonToCanvas: No canvas instance");

  //   // 1. Render off-screen or suppress rendering during load
  //   canvas.renderOnAddRemove = false;

  //   try {
  //     // 2. Load JSON (Fabric v6 return promise)
  //     await canvas.loadFromJSON(json);

  //     // 3. Ensure images are fully loaded before layout calculations
  //     const objects = canvas.getObjects();
  //     const imagePromises = objects
  //       .filter((obj): obj is FabricImage => obj.type === "image")
  //       .map((img) => {
  //         return new Promise<void>((resolve) => {
  //           const element = img.getElement();
  //           if (element && (element as any).complete) {
  //             resolve();
  //           } else if (element) {
  //             element.onload = () => resolve();
  //             element.onerror = () => resolve();
  //           } else {
  //             resolve();
  //           }
  //         });
  //       });

  //     await Promise.all(imagePromises);

  //     // 4. Perform your fakeCanvas / position transforms here
  //     const newFakeRect = objects[0] as Rect;
  //     if (newFakeRect) {
  //       fakeCanvasRect.current = newFakeRect;
  //       fakeCanvasRect.current.selectable = false;

  //       if (fakeCanvasClip.current) {
  //         const newCenter = canvas.getCenterPoint();
  //         const dX = newCenter.x - fakeCanvasRect.current.left;
  //         const dY = newCenter.y - fakeCanvasRect.current.top;

  //         objects.forEach((el) => {
  //           el.set({
  //             left: el.left + dX,
  //             top: el.top + dY,
  //           });
  //           if (fakeCanvasClip.current) el.clipPath = fakeCanvasClip.current;
  //           extendExportedProperties(el, extendedObjectProperties);
  //           el.setCoords();
  //         });
  //       }

  //       setFakeWidth(newFakeRect.width);
  //       setFakeHeight(newFakeRect.height);
  //       if (newFakeRect.fill) setFill(newFakeRect.fill);
  //     }
  //   } finally {
  //     // 5. Re-enable rendering and execute a single paint step
  //     canvas.renderOnAddRemove = true;
  //     canvas.requestRenderAll();
  //   }
  // };
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
      <FocusContext.Provider value={{ isImportaintFocusRef, focusCanvas }}>
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
            saveCanvasState,
            clearHistory,
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
                  <FileJSONSaver
                    canvas={canvas!}
                    loadJsonToCanvas={loadJsonToCanvas}
                  />
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
