import { ActiveSelection, type Canvas, type FabricObject } from "fabric";
import React, { useContext, useEffect, useState } from "react";
import { Button, CardImg, Col, Row, ToggleButton } from "react-bootstrap";
import { FakeCanvasContext } from "../context/FakeCanvasContext";
import { FocusContext } from "../context/FocusContext";
import PTextField from "./PTextField";

interface customObjProps {
  isObject?: boolean;
  isVisible?: boolean;
  originalIndex?: number;
  canvasId?: number;
}

const Layers = ({ canvas }: { canvas: Canvas }) => {
  const [objList, setObjList] = useState<(FabricObject & customObjProps)[]>([]);
  const [forceRender, setForceRender] = useState<boolean>(false);
  const [selection, setSelection] = useState<FabricObject[]>([]);
  const { saveCanvasState } = useContext(FakeCanvasContext)!;
  const { deleteElemetnt } = useContext(FocusContext)!;
  useEffect(() => {
    if (canvas) {
      canvas.on("object:added", ({ target: obj }) => {
        if ((obj as customObjProps).isObject) {
          recalculateList();
        }
      });
      canvas.on("object:removed", ({ target: obj }) => {
        if ((obj as customObjProps).isObject) {
          recalculateList();
        }
      });
      canvas.on("selection:cleared", () => {
        setSelection([]);
      });
      canvas.on("selection:created", (e) => {
        setSelection(e.selected);
      });
      canvas.on("selection:updated", (e) => {
        setSelection((list) => {
          return [
            ...list.filter((el) => {
              return !e.deselected.includes(el);
            }),
            ...e.selected,
          ];
        });
      });
    }
  }, [canvas]);

  const recalculateList = () => {
    if (canvas)
      setObjList(
        canvas
          .getObjects()
          .filter((obj, i) => {
            if (objIsObject(obj)) {
              (obj as customObjProps).originalIndex = i;
              return true;
            }
            return false;
          })
          .reverse(),
      );
  };

  const objIsObject = (obj: FabricObject) => {
    return (obj as Object).hasOwnProperty("isObject");
  };
  // repositoin them in the canvas.getObjects() array via swap
  const moveLayer = (obj: FabricObject, offset: number) => {
    if (!objIsObject(obj)) {
      console.log('ERROR: Selected OBJECT does NOT have property "isObject"');
      return;
    }
    let arr = canvas.getObjects();
    const i = (obj as customObjProps).originalIndex!;
    // console.log("In:   i: ", i, "  n: ", arr.length);
    if (i + offset >= 0 && i + offset < arr.length) {
      let destObject = arr[i + offset];
      if (objIsObject(destObject)) {
        // console.log("Original: ", obj, " Destination: ", destObject);
        arr[i] = destObject;
        (arr[i] as customObjProps).originalIndex = i;
        arr[i + offset] = obj;
        (arr[i + offset] as customObjProps).originalIndex = i + offset;
      } else {
        console.log("FAILED");
      }
    } else {
      console.log("Out of range :(  :", i + offset);
    }
    const activeObj = new ActiveSelection(selection);
    const bgColor = canvas.backgroundColor;
    canvas.clear();
    canvas.add(...arr);
    canvas.backgroundColor = bgColor;
    if (activeObj) canvas.setActiveObject(activeObj);
  };
  const moveAll = (offset: number) => {
    const prev = canvas.getObjects().map((el) => {
      return (el as customObjProps).canvasId;
    });
    selection.forEach((el) => {
      moveLayer(el, offset);
    });
    const after = canvas.getObjects().map((el) => {
      return (el as customObjProps).canvasId;
    });
    if (
      prev.length !== after.length ||
      !prev.every((val, index) => val === after[index])
    ) {
      // console.log("Saved");
      saveCanvasState();
    }
  };

  const handleMoveUp = () => {
    moveAll(+1);
  };
  const handleMoveDown = () => {
    moveAll(-1);
  };

  const handleLock = (el: FabricObject) => {
    el.selectable = !el.selectable;
    el.set({ hoverCursor: el.selectable ? "move" : "default" });

    if (!el.selectable && selection.includes(el)) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
    setForceRender((x) => {
      return !x;
    });
  };

  return (
    <div>
      {objList.length ? (
        <Row className="mb-1">
          <Button
            className="text-center col-2 border-0"
            variant="outline-secondary"
            onClick={() => {
              handleMoveUp();
            }}
          >
            <i className="bi bi-arrow-up"></i>
          </Button>
          <Button
            className="text-center col-2 border-0"
            variant="outline-secondary"
            onClick={() => {
              handleMoveDown();
            }}
          >
            <i className="bi bi-arrow-down"></i>
          </Button>
          <Col
            className="text-secondary text-center ms-auto px-0 my-auto"
            xs={1}
          >
            <i className="bi bi-transparency" />
          </Col>
          <PTextField
            disabled={!!!canvas.getActiveObject()}
            value={
              canvas.getActiveObject() !== undefined
                ? canvas.getActiveObject()!.opacity * 100
                : 100
            }
            formId="opacityForm"
            onChange={(e) => {
              const intVal = Math.min(
                100,
                Math.max(0, Math.round(parseInt(e.target.value))),
              );
              canvas.getActiveObject()!.opacity = intVal / 100;
              canvas.requestRenderAll();
              setForceRender(!forceRender);
            }}
            type="range"
            xs={3}
          />
          <Button
            className="text-center col-2 border-0 ms-3 me-2"
            variant="outline-secondary"
            onClick={() => {
              deleteElemetnt();
            }}
          >
            <i className="bi bi-trash3-fill"></i>
          </Button>
        </Row>
      ) : (
        <div>Add an element to view layers</div>
      )}
      <div
        className="overflow-y-auto h-auto overflow-x-hidden "
        style={{ overflow: "auto", maxHeight: "20vh" }}
      >
        {objList.map((el, i) => {
          return (
            <Row key={i} className="px-2 mx-auto">
              <ToggleButton
                className="text-start col border-0 text-black  ps-2"
                variant="outline-light"
                type="radio"
                key={i}
                id="toggle-selected"
                checked={selection.includes(el)}
                value={i}
                onClick={(e) => {
                  if (e.shiftKey) {
                    if (selection.includes(el))
                      canvas.setActiveObject(
                        new ActiveSelection(
                          selection.filter((x) => {
                            return x !== el;
                          }),
                        ),
                      );
                    else
                      canvas.setActiveObject(
                        new ActiveSelection([...selection, el]),
                      );
                  } else {
                    setSelection([]);
                    canvas.setActiveObject(el);
                  }
                  canvas.requestRenderAll();
                }}
              >
                {(el as any).name || el.type}
              </ToggleButton>
              <Button
                className="text-center col-2 border-0"
                variant="outline-secondary"
                onClick={() => {
                  el.visible = !el.visible;
                  canvas.requestRenderAll();
                  setForceRender((x) => {
                    return !x;
                  });
                }}
              >
                <i className={" bi bi-eye" + (el.visible ? "" : "-slash")}></i>
              </Button>

              <Button
                className="text-center col-2 border-0"
                variant="outline-secondary"
                onClick={() => {
                  handleLock(el);
                }}
              >
                <i
                  className={"bi bi-" + (el.selectable ? "lock" : "lock-fill")}
                ></i>
              </Button>
            </Row>
          );
        })}
      </div>
    </div>
  );
};

export default Layers;
