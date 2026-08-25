import type { TFiller } from "fabric";
import React, { type ReactNode, type SyntheticEvent } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

interface Props {
  label: string | ReactNode;
  value: number | string | undefined;
  formId: string;
  onChange: SyntheticEvent;
  type?: string;
  unit?: string;
}

const PTextField = ({ label, value, formId, type, unit, onChange }: Props) => {
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
