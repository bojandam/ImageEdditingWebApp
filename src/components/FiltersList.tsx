import { FabricImage, FabricObject, filters, type Canvas } from "fabric";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type ReactNode,
} from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Row,
  useAccordionButton,
} from "react-bootstrap";
import PTextField from "./PTextField";
import FormRange from "react-bootstrap/esm/FormRange";
import { FakeCanvasContext } from "../context/FakeCanvasContext";
interface Props {
  canvas: Canvas;
  selectedObject: FabricImage | null;
}

interface FilterProps {
  create: () => filters.BaseFilter<any>;
  properties: Array<{
    label: string;
    onChange: (value: any, filter: filters.BaseFilter<any>) => void;
    getValue: (filter: filters.BaseFilter<any>) => any;
    wholeElement?(props: {
      filter: filters.BaseFilter<any>;
      label: string;
      onChange: (value: any, filter: filters.BaseFilter<any>) => void;
      getValue: (filter: filters.BaseFilter<any>) => any;
    }): React.JSX.Element;
    type: "color" | "number" | "range" | "neither";
    unit?: string;
    xs?: number;
  }>;
}

const FiltersList = ({ canvas, selectedObject }: Props) => {
  //#region Filter Settings
  const Filters: Record<string, FilterProps> = {
    BlendColor: {
      create: () => {
        return new filters.BlendColor();
      },
      properties: [
        {
          label: "Color",
          onChange: (val, filter) => {
            (filter as filters.BlendColor).color = val;
          },
          getValue: (filter) => {
            return (filter as filters.BlendColor).color;
          },
          type: "color",
          xs: 4,
        },
        {
          label: "Mixing",
          onChange: (val, filter) => {
            (filter as filters.BlendColor).mode = val;
          },
          getValue: (filter) => {
            return (filter as filters.BlendColor).mode;
          },
          type: "neither",
          wholeElement: function ({ filter, onChange, getValue, label }) {
            return (
              <Col xs={6} className="mx-0">
                <Form.Label className="text-secondary ms-2">{label}</Form.Label>
                <Form.Select
                  onChange={(e) => {
                    console.log("new val", e.target.value);
                    onChange(e.target.value, filter);
                    selectedObject!.applyFilters();
                    canvas.requestRenderAll();
                    setRefresher(!refresher);
                  }}
                  className="mt-auto mb-1 w-auto mx-auto"
                >
                  {[
                    "multiply",
                    "add",
                    "difference",
                    "screen",
                    "subtract",
                    "darken",
                    "lighten",
                    "overlay",
                    "exclusion",
                    "tint",
                  ].map((el, i) => {
                    return (
                      <option
                        key={i}
                        value={el}
                        selected={el === getValue(filter)}
                      >
                        {el}
                      </option>
                    );
                  })}
                </Form.Select>
              </Col>
            );
          },
        },
      ],
    },
    BlendImage: {
      create: () => {
        return new filters.BlendImage();
      },
    },
    Blur: {
      create: () => {
        return new filters.Blur();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Blur).blur = val / 100;
          },
          getValue: (filter) => {
            return (filter as filters.Blur).blur * 100;
          },
          xs: 10,
        },
      ],
    },
    Brightness: {
      create: () => {
        return new filters.Brightness();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Brightness).brightness = val / 100;
          },
          getValue: (filter) => {
            return (filter as filters.Brightness).brightness * 100;
          },
          xs: 10,
        },
      ],
    },

    Contrast: {
      create: () => {
        return new filters.Contrast();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Contrast).contrast = val / 100;
          },
          getValue: (filter) => {
            return (filter as filters.Contrast).contrast * 100;
          },
          xs: 10,
        },
      ],
    },

    Gamma: {
      create: () => {
        return new filters.Gamma();
      },
    },
    Grayscale: {
      create: () => {
        return new filters.Grayscale();
      },
    },
    Invert: {
      create: () => {
        return new filters.Invert();
      },
    },
    Noise: {
      create: () => {
        return new filters.Noise();
      },
    },
    Pixelate: {
      create: () => {
        return new filters.Pixelate();
      },
    },
    RemoveColor: {
      create: () => {
        return new filters.RemoveColor();
      },
      properties: [
        {
          label: "Color:",
          type: "color",
          onChange: (val, filter) => {
            console.log("Val:", val, "Filter: ", filter);
            (filter as filters.RemoveColor).color = val;
          },
          getValue: (filter) => {
            return (filter as filters.RemoveColor).color;
          },
          xs: 4,
        },
        {
          label: "Threshold:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.RemoveColor).distance = val / 100;
          },
          getValue: (filter) => {
            return (filter as filters.RemoveColor).distance * 100;
          },
          xs: 6,
        },
      ],
    },
    Resize: {
      create: () => {
        return new filters.Resize();
      },
    },
    Saturation: {
      create: () => {
        return new filters.Saturation();
      },
    },
    Vibrance: {
      create: () => {
        return new filters.Vibrance();
      },
    },
  };
  //#endregion
  const [refresher, setRefresher] = useState(false);
  const filterSelectRef = useRef<HTMLSelectElement>(null);
  const { saveCanvasState } = useContext(FakeCanvasContext)!;
  const handleAddFilter = () => {
    const type = filterSelectRef.current?.value;
    console.log(type);
    if (type && selectedObject) {
      selectedObject.filters.push(Filters[type].create());
      selectedObject.applyFilters();
      canvas.requestRenderAll();
      saveCanvasState();
    }
  };

  //#region Return
  return (
    <>
      {selectedObject && selectedObject.type === "image" ? (
        <>
          <Row>
            <Form.Label className="text-secondary mb-1">
              Add a Filter
            </Form.Label>
            <Form.Select
              style={{ width: "85%" }}
              ref={filterSelectRef}
              className="ms-2"
            >
              {Object.keys(Filters).map((el) => {
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
          <Form.Label className="text-secondary mt-2">
            Current Filters:
          </Form.Label>
          <Accordion className="rounded-0">
            {selectedObject.filters.map((filter, i) => {
              const filterData = Filters[filter.type];
              return (
                <Accordion.Item eventKey={i.toString()} className="rounded-0">
                  <Accordion.Button className="py-1">
                    {filter.type}
                  </Accordion.Button>
                  <Accordion.Body>
                    <Row>
                      {filterData.properties.map((prop) => {
                        return prop.wholeElement ? (
                          <prop.wholeElement
                            filter={filter}
                            label={prop.label}
                            onChange={prop.onChange}
                            getValue={prop.getValue}
                          />
                        ) : (
                          <PTextField
                            formId={filter.type + prop.label + "Form"}
                            label={prop.label}
                            type={prop.type}
                            onChange={(e) => {
                              prop.onChange(e.target.value, filter);
                              selectedObject.applyFilters();
                              canvas.requestRenderAll();
                              setRefresher(!refresher);
                            }}
                            value={prop.getValue(filter)}
                            xs={prop.xs}
                          />
                        );
                      })}

                      <Button
                        className="col-2 mt-auto mb-1"
                        onClick={() => {
                          selectedObject.filters =
                            selectedObject.filters.filter((_, I) => {
                              return i != I;
                            });
                          selectedObject.applyFilters();
                          canvas.requestRenderAll();
                          setRefresher(!refresher);
                          saveCanvasState();
                        }}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </Button>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </>
      ) : (
        <Form.Label className=" mb-1">
          Select an image to control filters
        </Form.Label>
      )}
    </>
  );
  //#endregion
};

export default FiltersList;
