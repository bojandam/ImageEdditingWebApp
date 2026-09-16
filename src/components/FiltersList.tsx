import { FabricImage, FabricObject, filters, type Canvas } from 'fabric';
import React, { useRef } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  Button,
  Dropdown,
  Form,
  Row,
  useAccordionButton,
} from 'react-bootstrap';
interface Props {
  canvas: Canvas;
  selectedObject: FabricImage | null;
}

const FiltersList = ({ canvas, selectedObject }: Props) => {
  //#region Constants
  const Filters: string[] = [
    'BlendColor',
    'BlendImage',
    'Blur',
    'Brightness',
    'ColorMatrix',
    'Composed',
    'Contrast',
    'Convolute',
    'Gamma',
    'Grayscale',
    'Invert',
    'Noise',
    'Pixelate',
    'RemoveColor',
    'Resize',
    'Saturation',
    'Vibrance',
  ];
  //#endregion

  const filterSelectRef = useRef<HTMLSelectElement>(null);
  const handleAddFilter = () => {
    console.log(filterSelectRef.current?.value);
  };
  //#region Return
  return (
    <>
      <Row>
        <Form.Label className="text-secondary mb-1">Add a Filter</Form.Label>
        <Form.Select
          style={{ width: '85%' }}
          ref={filterSelectRef}
          className="ms-2"
        >
          {Filters.map((el) => {
            return <option value={el}>{el}</option>;
          })}
        </Form.Select>
        <Button
          variant="secondary"
          className="col-1 p-0 my-1 ms-2"
          onClick={handleAddFilter}
        >
          <i className="bi bi-plus" />
        </Button>
      </Row>
      {selectedObject?.type === 'image' && (
        <Accordion flush>
          {selectedObject.filters.map((el, i) => {
            return (
              <Accordion.Item eventKey={i.toString()} className="p-1">
                <Accordion.Header className="p-1">{el.type}</Accordion.Header>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </>
  );
  //#endregion
};

export default FiltersList;
