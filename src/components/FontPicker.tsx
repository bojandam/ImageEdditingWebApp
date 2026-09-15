import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type BaseSyntheticEvent,
} from 'react';
import { FocusContext } from '../context/FocusContext';
import { FakeCanvasContext } from '../context/FakeCanvasContext';
import { Col, Form, ToggleButton } from 'react-bootstrap';
interface props {
  label: string | ReactNode;
  formId: string | undefined;

  fontFamily?: string;
  onChangeFamily: (e: BaseSyntheticEvent) => void;
  fontStyle?: string;
  handleFontDecoChange: () => void;
  underline?: boolean;
  handleUnderlineChange: () => void;
  fontWeight?: string | number;
  handleFontWeightChange: () => void;
}
const FontPickerField = ({
  label,
  formId,
  fontFamily,
  onChangeFamily,
  fontStyle,
  handleFontDecoChange,
  underline,
  handleUnderlineChange,
  fontWeight,
  handleFontWeightChange,
}: props) => {
  const { isImportaintFocusRef } = useContext(FocusContext)!;
  const { saveCanvasState } = useContext(FakeCanvasContext)!;

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Impact',
  ];
  return (
    <>
      {fontFamily && (
        <>
          <Form.Label
            htmlFor={formId}
            className="col-12 px-2 text-secondary text-start  my-auto"
          >
            {label}
          </Form.Label>
          <Form.Select
            id={formId}
            className="me-auto ms-1  my-1"
            style={{ fontFamily: fontFamily, width: '65%' }}
            onChange={onChangeFamily}
          >
            {fonts.map((el, i) => {
              return (
                <option
                  key={i}
                  style={{ fontFamily: el }}
                  selected={el == fontFamily}
                >
                  {el}
                </option>
              );
            })}
          </Form.Select>
          <ToggleButton
            id="boldButton"
            type="checkbox"
            value="bold"
            variant="outline-secondary"
            className="col-1 bi bi-type-bold p-0 my-auto me-2"
            checked={fontWeight == 'bold'}
            style={{ width: 25, height: 25 }}
            onChange={handleFontWeightChange}
          />
          <ToggleButton
            id="italicButton"
            type="checkbox"
            value="bold"
            variant="outline-secondary"
            className="col-1 bi bi-type-italic p-0 my-auto me-2"
            checked={fontStyle == 'italic'}
            style={{ width: 25, height: 25 }}
            onChange={handleFontDecoChange}
          />
          <ToggleButton
            id="underlineButton"
            type="checkbox"
            value="bold"
            variant="outline-secondary"
            className="col-1 bi bi-type-underline p-0 my-auto me-2"
            checked={underline}
            style={{ width: 25, height: 25 }}
            onChange={handleUnderlineChange}
          />
        </>
      )}
    </>
  );
};

export default FontPickerField;
