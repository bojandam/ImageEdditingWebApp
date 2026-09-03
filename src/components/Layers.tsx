import { ActiveSelection, type Canvas, type FabricObject } from "fabric";
import React, { useEffect, useState } from "react";
import { Button, CardImg, Col, Row, ToggleButton } from "react-bootstrap";

interface customObjProps {
  isObject?: boolean;
  isVisible?: boolean;
  originalIndex?: number;
}

const Layers = ({ canvas }: { canvas: Canvas }) => {
  const [objList, setObjList] = useState<(FabricObject & customObjProps)[]>([]);
  const [forceRender, setForceRender] = useState<boolean>(false);
  const [selection, setSelection] = useState<FabricObject[]>([]);
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
    console.log("In:   i: ", i, "  n: ", arr.length);
    if (i + offset >= 0 && i + offset < arr.length) {
      let destObject = arr[i + offset];
      if (objIsObject(destObject)) {
        console.log("Original: ", obj, " Destination: ", destObject);
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
  const handleMoveUp = () => {
    selection.reverse().forEach((el) => {
      moveLayer(el, +1);
    });
  };
  const handleMoveDown = () => {
    selection.forEach((el) => {
      moveLayer(el, -1);
    });
  };

  const handleLock = (el: FabricObject) => {
    el.selectable = !el.selectable;
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
      <Row>
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
      </Row>
      <div
      // className="overflow-y-scroll h-auto overflow-x-hidden "
      // style={{ overflow: "auto", maxHeight: "20vh" }}
      >
        {objList.map((el, i) => {
          return (
            <Row key={i}>
              <ToggleButton
                className="text-start col border-0 text-black"
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
