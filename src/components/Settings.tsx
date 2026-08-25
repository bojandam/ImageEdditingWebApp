import { useEffect, useState, type BaseSyntheticEvent } from "react";
import { Canvas, FabricObject, type TFiller } from "fabric";
import { Accordion, Row } from "react-bootstrap";
import PTextField from "./PTextField";
interface props {
  canvas: Canvas | undefined;
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
}

const Settings = ({ canvas }: props) => {
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [objProperties, setObjProperties] = useState<objProps>({});
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  //   const [width, setWidth] = useState<number | null>();
  //   const [height, setHeight] = useState<number | null>();
  //   const [top, setTop] = useState<number | null>();
  //   const [left, setLeft] = useState<number | null>();
  //   const [radius, setRadius] = useState<number | null>();
  //   const [fill, setFill] = useState<string | TFiller | null>();

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
      canvas.on("object:moving", (e) => handleObjectSelection(e.target));
    }
  }, [canvas]);

  const handleObjectSelection = (obj: FabricObject) => {
    let p: objProps = {};
    if (obj.type === "rect") {
      p.width = Math.round(obj.width * obj.scaleX);
      p.height = Math.round(obj.height * obj.scaleY);
    } else if (obj.type === "circle") {
      p.radius = Math.round(obj.radius * obj.scaleX);
    }

    p.left = Math.round(obj.getX());
    p.top = Math.round(obj.getY());
    p.fill = obj.fill;
    p.stroke = obj.stroke;
    p.strokeWidth = obj.strokeWidth;
    console.log(p.stroke?.toString);

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

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, top: intValue });
      selectedObject.set({ top: intValue });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleLeftChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, left: intValue });
      selectedObject.set({ left: intValue });
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
      <div className="" style={{ width: "300px" }}>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Properties</Accordion.Header>
            <Accordion.Body className="">
              <Row className="flex-wrap ps-2 pe-1" style={{}}>
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
                {/* </Row><Row> */}
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
                {/* </Row>
                    <Row> */}
                <PTextField
                  label="R:"
                  value={objProperties.radius}
                  formId="radiusForm"
                  unit="px"
                  onChange={handleRadiusChange}
                />
                {/* </Row>
              <Row> */}
                <PTextField
                  label="C:"
                  value={objProperties.fill?.toString()}
                  formId="fillForm"
                  type="color"
                  onChange={handleFillChange}
                />
              </Row>
              <Row>
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
              </Row>
              <Row>
                {isEmpty && (
                  <p className="fs-6 ">
                    {" "}
                    Select an object to modifiy their properties
                  </p>
                )}
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </>
  );
};

export default Settings;
