import {
  useContext,
  useEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type RefObject,
} from 'react';
import {
  Canvas,
  Circle,
  FabricObject,
  Polyline,
  Rect,
  Textbox,
  type TFiller,
} from 'fabric';
import { Button, Form, Row, ToggleButton } from 'react-bootstrap';
import PTextField from './PTextField';
import { handleMovingSnap, handleRotationSnap } from '../util/Snapping';
import { FakeCanvasContext } from '../context/FakeCanvasContext';

import FontPickerField from './FontPicker';
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
  //img
  iWidth?: number; //specifically for images, where you shouldn't play with width and height, but with scale
  iHeight?: number;
  lockXY?: boolean;
  //text
  fontFamily?: string;
  fontStyle?: string;
  underline?: boolean;
  linethrough?: boolean;
  overline?: boolean;
  textAlign?: string;
  fontWeight?: string | number;
}

const ObjSettings = ({ canvas, fakeCanvasRect }: props) => {
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null,
  );
  const [objProperties, setObjProperties] = useState<objProps>({});
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const ctrlDownRef = useRef<boolean>(false);
  const guidelinesRef = useRef<Polyline[]>([]);
  const { saveCanvasState } = useContext(FakeCanvasContext)!;
  //#region Effects
  useEffect(() => {
    if (canvas) {
      canvas.on('selection:created', (e) => {
        handleObjectSelection(e.selected[0]);
      });
      canvas.on('selection:updated', (e) => {
        handleObjectSelection(e.selected[0]);
      });
      canvas.on('selection:cleared', () => {
        setSelectedObject(null);
        clearSettings();
      });
      canvas.on('object:scaling', (e) => handleObjectSelection(e.target));
      canvas.on('object:moving', (e) => {
        if (ctrlDownRef.current)
          handleMovingSnap(canvas, fakeCanvasRect, e.target, [], guidelinesRef);
        else {
          canvas.remove(...guidelinesRef.current);
        }
        handleObjectSelection(e.target);
      });
      canvas.on('object:rotating', (e) => {
        if (ctrlDownRef.current) handleRotationSnap(e.target, canvas);
        handleObjectSelection(e.target);
      });
      canvas.on('object:modified', (e) => {
        handleObjectSelection(e.target);
        canvas.remove(...guidelinesRef.current);
        saveCanvasState();
      });
    }
  }, [canvas]);
  useEffect(() => {
    addEventListener('keydown', (e) => {
      if (e.ctrlKey) ctrlDownRef.current = true;
    });
    addEventListener('keyup', (e) => {
      if (!e.ctrlKey) ctrlDownRef.current = false;
    });
  }, []);
  //#endregion
  //#region Obj Selection
  const handleObjectSelection = (obj: FabricObject) => {
    let p: objProps = {};
    if (['rect'].includes(obj.type)) {
      p.width = Math.round(obj.width * obj.scaleX);
      p.height = Math.round(obj.height * obj.scaleY);
    } else if (obj.type === 'circle') {
      p.radius = Math.round((obj as Circle).radius * obj.scaleX);
    }
    if (canvas) {
      p.left = Math.round(obj.left - canvas.getCenterPoint().x);
      p.top = Math.round(obj.top - canvas.getCenterPoint().y);
    }
    if (!['activeselection', 'image'].includes(obj.type)) {
      p.fill = obj.fill;
      p.stroke = obj.stroke || '#FFFFFF';
      p.strokeWidth = obj.strokeWidth;
    }
    if (['image'].includes(obj.type)) {
      p.iWidth = Math.round(obj.width * obj.scaleX);
      p.iHeight = Math.round(obj.height * obj.scaleY);
      p.lockXY = (obj as any).lockXY;
    }
    if (['textbox'].includes(obj.type)) {
      p.fontFamily = (obj as Textbox).fontFamily;
      p.fontStyle = (obj as Textbox).fontStyle;
      p.underline = (obj as Textbox).underline;
      p.linethrough = (obj as Textbox).linethrough;
      p.overline = (obj as Textbox).overline;
      p.textAlign = (obj as Textbox).textAlign;
      p.fontWeight = (obj as Textbox).fontWeight;
    }
    p.angle = obj.angle;
    p.name = obj.type === 'activeselection' ? 'Selection' : obj.type;

    setObjProperties(p);
    setIsEmpty(false);
    setSelectedObject(obj);
  };

  const clearSettings = () => {
    setObjProperties({});
    setIsEmpty(true);
    setSelectedObject(null);
  };
  //#endregion
  //#region Change Handlers
  const parseToInt = (x: string) => {
    return x === '' ? 0 : parseInt(x.replace(/,/g, ''), 10);
  };
  const parseToFloat = (x: string) => {
    return x === '' ? 0 : parseFloat(x);
  };
  //#region Width & Height
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
  //#endregion
  //#region Img Width & Height
  const handleIWidthChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      if (objProperties.lockXY)
        selectedObject.scaleY *=
          intValue / selectedObject.width / selectedObject.scaleX;

      selectedObject.scaleX = intValue / selectedObject.width;

      setObjProperties({ ...objProperties, iWidth: intValue });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleIHeightChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      if (objProperties.lockXY)
        selectedObject.scaleX *=
          intValue / selectedObject.height / selectedObject.scaleY;

      selectedObject.scaleY = intValue / selectedObject.height;

      setObjProperties({ ...objProperties, iHeight: intValue });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  const handleLockXY = () => {
    (selectedObject as any).lockXY = !objProperties.lockXY;
    setObjProperties({
      ...objProperties,
      lockXY: !objProperties.lockXY,
    });
  };
  const handleResetWH = () => {
    if (selectedObject) {
      selectedObject.scaleX = 1;
      selectedObject.scaleY = 1;
      selectedObject.setCoords();
      handleObjectSelection(selectedObject);
      canvas?.requestRenderAll();
    }
  };
  //#endregion
  //#region Radius
  const handleRadiusChange = (e: BaseSyntheticEvent) => {
    const intValue = parseToInt(e.target?.value);

    if (selectedObject && intValue >= 0) {
      setObjProperties({ ...objProperties, radius: intValue });
      selectedObject.set({ radius: intValue / selectedObject.scaleX });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  //#endregion
  //#endregion
  //#region Top & Left
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
      // console.log("ObjProps:", { ...objProperties });
      selectedObject.set({ left: intValue + canvas.getCenterPoint().x });
      selectedObject.setCoords();
      canvas?.renderAll();
    }
  };
  //#endregion
  //#region Angle & Fill
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
  //#endregion
  //#region Text
  const handleFontChange = (e: BaseSyntheticEvent) => {
    const prev = objProperties.fontFamily;
    setObjProperties({ ...objProperties, fontFamily: e.target.value });
    (selectedObject as Textbox).set({ fontFamily: e.target.value });
    canvas?.requestRenderAll();
    if (prev != e.target.value) saveCanvasState();
  };
  const handleFontWeightChange = () => {
    (selectedObject as Textbox)?.set({
      fontWeight: objProperties.fontWeight == 'bold' ? 'normal' : 'bold',
    });
    objProperties.fontWeight =
      objProperties.fontWeight == 'bold' ? 'normal' : 'bold';
    canvas?.requestRenderAll();
    saveCanvasState();
  };
  const handleFontDecoChange = () => {
    (selectedObject as Textbox)?.set({
      fontStyle: objProperties.fontStyle == 'italic' ? 'normal' : 'italic',
    });
    objProperties.fontStyle =
      objProperties.fontStyle == 'italic' ? 'normal' : 'italic';
    canvas?.requestRenderAll();
    saveCanvasState();
  };
  const handleUnderlineChange = () => {
    (selectedObject as Textbox)?.set({
      underline: !objProperties.underline,
    });
    objProperties.underline = !objProperties.underline;
    canvas?.requestRenderAll();
    saveCanvasState();
  };
  //#endregion
  //#endregion
  //#region Return
  return (
    <>
      <div className=" ps-2 pe-1">
        <Row>
          <h1 className="text-capitalize fs-6 col">{objProperties.name}</h1>
          {selectedObject?.type === 'image' && (
            <Button
              className="col-2 p-0  border-0 bi bi-arrow-repeat"
              size="sm"
              variant="outline-secondary"
              onClick={handleResetWH}
            />
          )}
        </Row>
        <div className="d-flex flex-wrap justify-content-between ">
          <Row>
            <PTextField
              label="Width:"
              value={objProperties.width}
              formId="widthForm"
              unit="px"
              onChange={handleWidthChange}
            />
            <PTextField
              label="Height:"
              value={objProperties.height}
              formId="HeightForm"
              unit="px"
              onChange={handleHeightChange}
            />
          </Row>
          <div className="row d-flex justify-content-between">
            <PTextField
              label="Width:"
              value={objProperties.iWidth}
              formId="iWidthForm"
              unit="px"
              onChange={handleIWidthChange}
              xs={5}
            />
            {objProperties.lockXY !== undefined && (
              <div className="col-2 d-flex flex-column">
                <br />
                <ToggleButton
                  id="lockWHRatio"
                  value="Lock"
                  type="checkbox"
                  checked={objProperties.lockXY}
                  className="text-center  d-flex flex-column justify-content-center m-auto px-0 "
                  style={{ width: 25, height: 25 }}
                  variant="outline-secondary"
                  onClick={handleLockXY}
                >
                  <i className="bi bi-link p-0 m-0" />
                </ToggleButton>
              </div>
            )}
            <PTextField
              label="Height:"
              value={objProperties.iHeight}
              formId="iHeightForm"
              unit="px"
              xs={5}
              onChange={handleIHeightChange}
            />
          </div>

          <Row className=" d-flex justify-content-between">
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
              label="Radius:"
              value={objProperties.radius}
              formId="radiusForm"
              unit="px"
              onChange={handleRadiusChange}
            />
            <FontPickerField
              formId="FontPicker"
              label="Font Settings:"
              fontFamily={objProperties.fontFamily}
              onChangeFamily={handleFontChange}
              fontStyle={objProperties.fontStyle}
              handleFontDecoChange={handleFontDecoChange}
              underline={objProperties.underline}
              handleUnderlineChange={handleUnderlineChange}
              fontWeight={objProperties.fontWeight}
              handleFontWeightChange={handleFontWeightChange}
            />
            <PTextField
              label={'Rotation:'}
              value={objProperties.angle}
              formId="angleForm"
              unit="°"
              onChange={handleAngleChange}
            />
            <PTextField
              label="Color:"
              value={objProperties.fill?.toString()}
              formId="fillForm"
              type="color"
              onChange={handleFillChange}
            />
            <PTextField
              label="Border Color:"
              value={objProperties.stroke?.toString()}
              formId="strokeForm"
              type="color"
              onChange={handleStrokeChange}
            />
            <PTextField
              label="Border Width:"
              value={objProperties.strokeWidth}
              formId="strokeWidthForm"
              unit="px"
              onChange={handleStrokeWidthChange}
            />
          </Row>
          {isEmpty && (
            <p className="fs-6 ">
              {' '}
              Select an object to modifiy their properties
            </p>
          )}
        </div>
      </div>
    </>
  ); //#endregion
};

export default ObjSettings;
