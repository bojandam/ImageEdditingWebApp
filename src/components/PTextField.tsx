import type { TFiller } from 'fabric';
import React, {
  useContext,
  useEffect,
  useRef,
  type BaseSyntheticEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { FocusContext } from '../context/FocusContext';
import { FakeCanvasContext } from '../context/FakeCanvasContext';

interface Props {
  label: string | ReactNode;
  value: number | string | undefined;
  formId: string;
  onChange: (e: BaseSyntheticEvent) => void;
  type?: string;
  unit?: string;
  xs?: any;
  trigerSave?: boolean;
}

const PTextField = ({
  label,
  value,
  formId,
  type,
  unit,
  onChange,
  xs = 6,
  trigerSave = true,
}: Props) => {
  const { isImportaintFocusRef } = useContext(FocusContext)!;
  const { saveCanvasState } = useContext(FakeCanvasContext)!;

  const valueRef = useRef<any>(undefined);
  const ongoingValueRef = useRef<any>(undefined);

  useEffect(() => {
    if (value !== undefined) ongoingValueRef.current = value;
    else if (valueRef.current !== undefined)
      handleOnBlur({
        target: { value: ongoingValueRef.current },
      } as BaseSyntheticEvent);
  }, [value]);

  const handleOnFocus = (e: BaseSyntheticEvent) => {
    console.log('InsideFocus');
    valueRef.current = ongoingValueRef.current = e.target.value;
    isImportaintFocusRef.current = true;
  };
  const handleOnBlur = (e: BaseSyntheticEvent) => {
    console.log(
      'InsideDefocus: ',
      label,
      ':   ',
      valueRef.current,
      '->',
      e.target.value,
    );
    if (
      trigerSave &&
      valueRef.current !== undefined &&
      valueRef.current != e.target.value
    ) {
      console.log('Saved');
      saveCanvasState();
    }
    valueRef.current = undefined;
    isImportaintFocusRef.current = false;
  };
  return (
    <>
      <Col
        hidden={value === undefined}
        xs={xs}
        className="row"
        style={{ boxSizing: 'content-box' }}
      >
        {label && (
          <Form.Label
            htmlFor={formId}
            className="col px-2 text-secondary text-start  my-auto"
          >
            {label}
          </Form.Label>
        )}
        <InputGroup className="col-9 px-1 my-1">
          <Form.Control
            className="border-end-0"
            type={type || 'number'}
            id={formId}
            value={value ?? (type == 'color' ? '#FFFFFF' : '')}
            onChange={onChange}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
          />
          {unit && (
            <InputGroup.Text className="border-start-0 bg-body ps-0" style={{}}>
              {unit}
            </InputGroup.Text>
          )}
        </InputGroup>
      </Col>
    </>
  );
};

export default PTextField;
