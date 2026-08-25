import { useEffect, useState, type BaseSyntheticEvent } from "react";
import PTextField from "./PTextField";
import type { Canvas } from "fabric";

interface Props {
  canvas: Canvas | undefined;
}

const CanvasSettings = ({ canvas }: Props) => {
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [zoom, setZoom] = useState<number>();

  useEffect(() => {
    if (width === undefined || height === undefined) {
      setWidth(canvas?.width);
      setHeight(canvas?.height);
    }
    if (canvas && zoom === undefined) {
      setZoom(canvas?.getZoom() * 100);
    }
  }, [canvas]);
  useEffect(() => {
    if (canvas) {
      canvas.setDimensions({ width: width, height: height });
      canvas.renderAll();
    }
  }, [width, height, canvas]);

  const parseToInt = (x: string) => {
    return x === "" ? 0 : parseInt(x.replace(/,/g, ""), 10);
  };
  const handleWidthChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    if (intValue >= 0) {
      setWidth(intValue);
    }
  };

  const handleHeightChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    if (intValue >= 0) {
      setHeight(intValue);
    }
  };

  const handleZoom = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    if (intValue >= 0) {
      setZoom(intValue);
      canvas?.setZoom(intValue / 100);
    }
  };
  return (
    <div>
      <PTextField
        label="W:"
        value={width}
        unit="px"
        formId="canWidthForm"
        onChange={handleWidthChange}
      />
      <PTextField
        label="H:"
        value={height}
        unit="px"
        formId="canHeightForm"
        onChange={handleHeightChange}
      />
      <PTextField
        label="Z:"
        value={zoom}
        unit="%"
        formId="canZoomForm"
        onChange={handleZoom}
      />
    </div>
  );
};

export default CanvasSettings;
