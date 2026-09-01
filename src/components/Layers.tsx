import type { Canvas, FabricObject } from "fabric";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

interface customObjProps {
  isObject?: boolean;
  isVisible?: boolean;
}

const Layers = ({ canvas }: { canvas: Canvas }) => {
  const [objList, setObjList] = useState<(FabricObject & customObjProps)[]>([]);
  useEffect(() => {
    if (canvas)
      canvas.on("object:added", ({ target: obj }) => {
        if ((obj as customObjProps).isObject) {
          setObjList((list) => {
            return [...list, obj];
          });
        }
      });
  }, [canvas]);
  useEffect(() => {
    console.log("objList: ", objList);
  }, [objList]);
  return (
    <div>
      {objList.map((el, i) => {
        return (
          <Row>
            <Col>{i}: </Col>
            <Col>{el.type}</Col>
            <Col>{el.isVisible ? "O" : "U"}</Col>
          </Row>
        );
      })}
    </div>
  );
};

export default Layers;
