import type { Canvas, FabricObject, Rect } from "fabric";
import { saveAs } from "file-saver";
import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { FakeCanvasContext } from "../context/FakeCanvasContext";
import { FocusContext } from "../context/FocusContext";

interface Props {
  canvas: Canvas;
  loadJsonToCanvas: (json: JSON) => Promise<void>;
}
type ReactInputEvent = React.ChangeEvent<HTMLInputElement, HTMLInputElement>;

export function extendExportedProperties(obj: FabricObject, extended: any[]) {
  const originalToObject = obj.toObject;
  obj.toObject = function (propertiesToInclude = []) {
    return originalToObject.call(this, [...propertiesToInclude, ...extended]);
  };
}

const FileJSONSaver = ({ canvas, loadJsonToCanvas }: Props) => {
  const { fakeCanvasRect, saveCanvasState, clearHistory } =
    useContext(FakeCanvasContext)!;
  const { focusCanvas } = useContext(FocusContext)!;
  const handleDownloadCanvas = () => {
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
          loadJsonToCanvas(json).then(() => {
            clearHistory();
            saveCanvasState();
            console.log("Saved State");
            focusCanvas();
          });
        } catch (error) {
          console.error("Invalid file", error);
        }
      };
      fileReader.readAsText(file);
    }
  };
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
  };

  return (
    <>
      <Button className="" onClick={handleExport}>
        <i className="bi bi-box-arrow-right"></i>
      </Button>
      <input
        type="file"
        id="importFile"
        accept=".ief, application/json"
        className="d-none"
        onChange={handleImportCanvas}
      />
      <label className="bi bi-upload btn btn-primary" htmlFor="importFile" />
      {/* </input> */}
      <Button onClick={handleDownloadCanvas}>
        <i className="bi bi-download" />
      </Button>
    </>
  );
};

export default FileJSONSaver;
