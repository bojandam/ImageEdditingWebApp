import type { Canvas, FabricObject, Rect } from "fabric";
import { saveAs } from "file-saver";
import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { FakeCanvasContext } from "../context/FakeCanvasContext";

interface Props {
  canvas: Canvas;
}
type ReactInputEvent = React.ChangeEvent<HTMLInputElement, HTMLInputElement>;

export function propertiesExtender(obj: FabricObject, extended: any[]) {
  const originalToObject = obj.toObject;
  obj.toObject = function (propertiesToInclude = []) {
    return originalToObject.call(this, [...propertiesToInclude, ...extended]);
  };
}

const FileJSONSaver = ({ canvas }: Props) => {
  const {
    fakeCanvasRect,
    fakeCanvasClip,
    setFakeWidth,
    setFakeHeight,
    setFill,
  } = useContext(FakeCanvasContext)!;

  const handleExportCanvas = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    saveAs(blob, "project.json");
  };
  const handleImportCanvas = (e: ReactInputEvent) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    console.log("Imported file:", file);
    if (file && file.type === "application/json") {
      console.log("Happened");
      const fileReader = new FileReader();
      fileReader.onload = () => {
        console.log("Inside");
        try {
          const json = JSON.parse(fileReader.result!.toString());
          canvas.clear();
          canvas.loadFromJSON(json).then(() => {
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
                console.log("Before: ", el.left);
                translate(el, dX, dY);
                console.log("After: ", el.left);
                console.log(el);
                el.setCoords();
              });
              canvas.getActiveObject()?.setCoords();
            }
            setFakeWidth(newFakeRect.width);
            setFakeHeight(newFakeRect.height);
            setFill(newFakeRect.fill!);
            canvas.getObjects().forEach((el) => {
              if (fakeCanvasClip.current) el.clipPath = fakeCanvasClip.current;
              propertiesExtender(el, ["isObject", "selectable", "hoverCursor"]);
            });
            canvas.renderAll();
          });
        } catch (error) {
          console.error("Invalid file", error);
        }
      };
      fileReader.readAsText(file);
    }
  };
  return (
    <>
      <input
        type="file"
        id="importFile"
        accept=".ief, application/json"
        className="d-none"
        onChange={handleImportCanvas}
      />
      <label className="bi bi-upload btn btn-primary" htmlFor="importFile" />
      {/* </input> */}
      <Button onClick={handleExportCanvas}>
        <i className="bi bi-download" />
      </Button>
    </>
  );
};

export default FileJSONSaver;
