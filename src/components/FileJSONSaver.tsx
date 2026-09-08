import type { Canvas } from "fabric";
import { saveAs } from "file-saver";
import React from "react";
import { Button } from "react-bootstrap";

interface Props {
  canvas: Canvas;
}

const FileJSONSaver = ({ canvas }: Props) => {
  const exportCanvas = () => {
    if (!canvas) return;

    const json = canvas.toJSON();
    const blob = new Blob([JSON.stringify(json)], { type: "applicatoin/json" });
    saveAs(blob, "project.ief");
  };
  return <Button onClick={exportCanvas}>Download</Button>;
};

export default FileJSONSaver;
