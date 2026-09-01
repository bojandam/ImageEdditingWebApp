import type { TFiller } from "fabric";
import React, { useContext, type ReactNode, type SyntheticEvent } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { FocusContext } from "../hooks/FocusTracker";

interface Props {
  label: string | ReactNode;
  value: number | string | undefined;
  formId: string;
  onChange: any;
  type?: string;
  unit?: string;
}

const PTextField = ({ label, value, formId, type, unit, onChange }: Props) => {
  const { isImportaintFocusRef } = useContext(FocusContext)!;
  const handleOnFocus = () => {
    console.log("InsideFocus");
    isImportaintFocusRef.current = true;
  };
  const handleOnBlur = () => {
    console.log("InsideDefocus");
    isImportaintFocusRef.current = false;
  };
  return (
    <>
      {value !== undefined && (
        <Col xs={6} className="row" style={{ boxSizing: "content-box" }}>
          {label && (
            <Form.Label
              htmlFor={formId}
              className="col-2 px-0 text-secondary  my-auto"
            >
              {label}
            </Form.Label>
          )}
          <InputGroup className="col ps-0 my-1">
            <Form.Control
              className="border-end-0"
              type={type || "number"}
              id={formId}
              value={value}
              onChange={onChange}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
            />
            {unit && (
              <InputGroup.Text
                className="border-start-0 bg-body ps-0"
                style={{}}
              >
                {unit}
              </InputGroup.Text>
            )}
          </InputGroup>
        </Col>
      )}
    </>
  );
};

export default PTextField;
