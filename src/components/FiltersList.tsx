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
  label?: string;
  create: () => filters.BaseFilter<any>;
  properties?: Array<{
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
  const Filters: Record<string, FilterProps> = {
    //#region Blur
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
    //#endregion
    //#region Brightness
    Brightness: {
      create: () => {
        return new filters.Brightness();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Brightness).brightness = (val - 50) / 50;
          },
          getValue: (filter) => {
            return (filter as filters.Brightness).brightness * 50 + 50;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
    //#region BlendColor
    BlendColor: {
      label: "Color Overlay",
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
        {
          label: "Opacity",
          onChange: (val, filter) => {
            (filter as filters.BlendColor).alpha = val / 100;
          },
          getValue: (filter) => {
            return (filter as filters.BlendColor).alpha * 100;
          },
          type: "range",
          // xs: 4,
        },
      ],
    },
    //#endregion
    //#region Contrast
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
    //#endregion

    //#region Gamma
    Gamma: {
      create: () => {
        return new filters.Gamma();
      },
      properties: [
        {
          label: "Red:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Gamma).gamma[0] = val * 0.022;
          },
          getValue: (filter) => {
            return (filter as filters.Gamma).gamma[0] / 0.022;
          },
          xs: 10,
        },
        {
          label: "Green:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Gamma).gamma[1] = val * 0.022;
          },
          getValue: (filter) => {
            return (filter as filters.Gamma).gamma[1] / 0.022;
          },
          xs: 10,
        },
        {
          label: "Blue:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Gamma).gamma[2] = val * 0.022;
          },
          getValue: (filter) => {
            return (filter as filters.Gamma).gamma[2] / 0.022;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
    //#region Grayscale
    Grayscale: {
      create: () => {
        return new filters.Grayscale();
      },
    },
    //#endregion
    //#region HueRotation
    HueRotation: {
      create: () => {
        return new filters.HueRotation();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.HueRotation).rotation = (val - 50) / 50;
          },
          getValue: (filter) => {
            return (filter as filters.HueRotation).rotation * 50 + 50;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
    //#region Invert
    Invert: {
      create: () => {
        return new filters.Invert();
      },
    },
    //#endregion
    //#region Noise
    Noise: {
      create: () => {
        return new filters.Noise();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Noise).noise = val * 10;
          },
          getValue: (filter) => {
            return (filter as filters.Noise).noise / 10;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
    //#region Pixelate
    Pixelate: {
      create: () => {
        return new filters.Pixelate();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Pixelate).blocksize = val;
          },
          getValue: (filter) => {
            return (filter as filters.Pixelate).blocksize;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
    //#region RemoveColor
    RemoveColor: {
      label: "Remove Color",
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
    //#endregion
    //#region Saturation
    Saturation: {
      create: () => {
        return new filters.Saturation();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Saturation).saturation = (val - 50) / 50;
          },
          getValue: (filter) => {
            return (filter as filters.Saturation).saturation * 50 + 50;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
    //#region Vibrance
    Vibrance: {
      create: () => {
        return new filters.Vibrance();
      },
      properties: [
        {
          label: "Ammount:",
          type: "range",
          onChange: (val, filter) => {
            (filter as filters.Vibrance).vibrance = (val - 50) / 50;
          },
          getValue: (filter) => {
            return (filter as filters.Vibrance).vibrance * 50 + 50;
          },
          xs: 10,
        },
      ],
    },
    //#endregion
  };

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
              {Object.entries(Filters).map(([key, val]) => {
                return <option value={key}>{val.label || key}</option>;
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
                    {Filters[filter.type].label || filter.type}
                  </Accordion.Button>
                  <Accordion.Body>
                    <Row>
                      {filterData.properties &&
                        filterData.properties.map((prop) => {
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
                        className="col-2 mt-auto mb-1 ms-auto"
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
