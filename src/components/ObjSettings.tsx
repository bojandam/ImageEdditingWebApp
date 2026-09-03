import {
  useEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type RefObject,
} from "react";
import {
  Canvas,
  Circle,
  FabricObject,
  Polyline,
  Rect,
  type TFiller,
} from "fabric";
import { Button, Row } from "react-bootstrap";
import PTextField from "./PTextField";
import { handleMovingSnap } from "../util/Snapping";
interface props {
  canvas: Canvas | undefined;
  fakeCanvasRect: RefObject<Rect | null>;
}

interface objProps {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  radius?: number;
  fill?: string | TFiller | null;
  strokeWidth?: number;
  stroke?: string | TFiller | null;
  angle?: number;
  name?: string;
  iWidth?: number; //specifically for images, where you shouldn't play with width and height, but with scale
  iHeight?: number;
}

const ObjSettings = ({ canvas, fakeCanvasRect }: props) => {
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [objProperties, setObjProperties] = useState<objProps>({});
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const ctrlDownRef = useRef<boolean>(false);
  const guidelinesRef = useRef<Polyline[]>([]);

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", (e) => {
        handleObjectSelection(e.selected[0]);
      });
      canvas.on("selection:updated", (e) => {
        handleObjectSelection(e.selected[0]);
      });
      canvas.on("selection:cleared", () => {
        setSelectedObject(null);
        clearSettings();
      });
      canvas.on("object:modified", (e) => handleObjectSelection(e.target));
      canvas.on("object:scaling", (e) => handleObjectSelection(e.target));
      canvas.on("object:moving", (e) => {
        if (ctrlDownRef.current)
          handleMovingSnap(canvas, fakeCanvasRect, e.target, [], guidelinesRef);
        else {
          canvas.remove(...guidelinesRef.current);
        }
      });
      canvas.on("object:modified", () => {
        canvas.remove(...guidelinesRef.current);
      });
      canvas.on("object:moving", (e) => {
        handleObjectSelection(e.target);
      });
    }
  }, [canvas]);
  useEffect(() => {
    addEventListener("keydown", (e) => {
      if (e.ctrlKey) ctrlDownRef.current = true;
    });
    addEventListener("keyup", (e) => {
      if (!e.ctrlKey) ctrlDownRef.current = false;
    });
  }, []);

  const handleObjectSelection = (obj: FabricObject) => {
    let p: objProps = {};
    if (["rect"].includes(obj.type)) {
      p.width = Math.round(obj.width * obj.scaleX);
      p.height = Math.round(obj.height * obj.scaleY);
    } else if (obj.type === "circle") {
      p.radius = Math.round((obj as Circle).radius * obj.scaleX);
    }
    if (canvas) {
      p.left = Math.round(obj.left - canvas.getCenterPoint().x);
      p.top = Math.round(obj.top - canvas.getCenterPoint().y);
    }
    if (!["activeselection", "image"].includes(obj.type)) {
      p.fill = obj.fill;
      p.stroke = obj.stroke || "#FFFFFF";
      p.strokeWidth = obj.strokeWidth;
    }
    p.angle = obj.angle;
    p.name = obj.type === "activeselection" ? "Selection" : obj.type;

    setObjProperties(p);
    setIsEmpty(false);
    setSelectedObject(obj);
  };

  const clearSettings = () => {
    setObjProperties({});
    setIsEmpty(true);
    setSelectedObject(null);
  };

  const parseToInt = (x: string) => {
    return x === "" ? 0 : parseInt(x.replace(/,/g, ""), 10);
  };
  const parseToFloat = (x: string) => {
    return x === "" ? 0 : parseFloat(x);
  };
  const handleWidthChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, width: intValue });
      selectedObject.set({ width: intValue / selectedObject.scaleX });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleHeightChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, height: intValue });
      selectedObject.set({ height: intValue / selectedObject.scaleY });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleTopChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);
    (selectedObject as any).selektirano = true;

    if (selectedObject && canvas && (intValue >= 0 || intValue < 0)) {
      setObjProperties({ ...objProperties, top: intValue });
      selectedObject.set({ top: intValue + canvas.getCenterPoint().y });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleLeftChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && canvas && (intValue >= 0 || intValue < 0)) {
      setObjProperties({ ...objProperties, left: intValue });
      selectedObject.set({ left: intValue + canvas.getCenterPoint().x });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };

  const handleRadiusChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, radius: intValue });
      selectedObject.set({ radius: intValue / selectedObject.scaleX });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleAngleChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToFloat(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, angle: intValue });
      selectedObject.set({ angle: intValue });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleFillChange = (e: BaseSyntheticEvent) => {
    const value = e.target.value;

    if (selectedObject) {
      setObjProperties({ ...objProperties, fill: value });
      selectedObject.set({ fill: value });
      canvas?.requestRenderAll();
    }
  };
  const handleStrokeChange = (e: BaseSyntheticEvent) => {
    const value = e.target.value;

    if (selectedObject) {
      setObjProperties({ ...objProperties, stroke: value });
      selectedObject.set({ stroke: value });
      canvas?.requestRenderAll();
    }
  };
  const handleStrokeWidthChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, strokeWidth: intValue });
      selectedObject.set({ strokeWidth: intValue / selectedObject.scaleX });
      selectedObject.setCoords();
      canvas?.requestRenderAll();
    }
  };

  return (
    <>
      <Row className="flex-wrap ps-2 pe-1" style={{}}>
        <h6 className="text-capitalize">{objProperties.name}</h6>
        <PTextField
          label="W:"
          value={objProperties.width}
          formId="widthForm"
          unit="px"
          onChange={handleWidthChange}
        />
        <PTextField
          label="H:"
          value={objProperties.height}
          formId="widthForm"
          unit="px"
          onChange={handleHeightChange}
        />
        <PTextField
          label="X:"
          value={objProperties.left}
          formId="leftForm"
          unit="px"
          onChange={handleLeftChange}
        />
        <PTextField
          label="Y:"
          value={objProperties.top}
          formId="topForm"
          unit="px"
          onChange={handleTopChange}
        />
        <PTextField
          label="R:"
          value={objProperties.radius}
          formId="radiusForm"
          unit="px"
          onChange={handleRadiusChange}
        />
        <PTextField
          label={<i className="bi bi-arrow-clockwise"></i>}
          value={objProperties.angle}
          formId="angleForm"
          unit="°"
          onChange={handleAngleChange}
        />
        <PTextField
          label="C:"
          value={objProperties.fill?.toString()}
          formId="fillForm"
          type="color"
          onChange={handleFillChange}
        />
        <PTextField
          label="BC:"
          value={objProperties.stroke?.toString()}
          formId="strokeForm"
          type="color"
          onChange={handleStrokeChange}
        />
        <PTextField
          label="BW:"
          value={objProperties.strokeWidth}
          formId="strokeWidthForm"
          unit="px"
          onChange={handleStrokeWidthChange}
        />
        {isEmpty && (
          <p className="fs-6 "> Select an object to modifiy their properties</p>
        )}
      </Row>
    </>
  );
};

export default ObjSettings;
