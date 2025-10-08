import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useCanvas } from "../../context/CanvasContext.jsx";

const CanvasBoard = () => {
  const canvasRef = useRef(null);
  const { state } = useCanvas();
  const fabricRef = useRef(null);

  useEffect(() => {
    // Initialize fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: state.tool === "pen",
      backgroundColor: "#ffffff",
    });

    fabricRef.current = canvas;

    // Make canvas resize dynamically
    canvas.setHeight(window.innerHeight - 100);
    canvas.setWidth(window.innerWidth - 300);

    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, []);

  // Update brush settings when tool/color/stroke changes
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    if (state.tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = state.strokeWidth;
      canvas.freeDrawingBrush.color = state.color;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [state.tool, state.color, state.strokeWidth]);

  // Handle shape drawing (rectangle, circle, text, line)
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    let shape;
    const startDrawing = (opt) => {
      const pointer = canvas.getPointer(opt.e);

      if (state.tool === "rectangle") {
        shape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: state.color,
          strokeWidth: state.strokeWidth,
        });
      } else if (state.tool === "circle") {
        shape = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          fill: "transparent",
          stroke: state.color,
          strokeWidth: state.strokeWidth,
        });
      } else if (state.tool === "line") {
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: state.color,
          strokeWidth: state.strokeWidth,
        });
      } else if (state.tool === "text") {
        shape = new fabric.Textbox("Type here", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: state.color,
        });
        canvas.add(shape);
        shape = null;
      }

      if (shape) canvas.add(shape);
    };

    const duringDrawing = (opt) => {
      if (!shape) return;
      const pointer = canvas.getPointer(opt.e);

      if (state.tool === "rectangle") {
        shape.set({
          width: pointer.x - shape.left,
          height: pointer.y - shape.top,
        });
      } else if (state.tool === "circle") {
        const radius =
          Math.sqrt(
            Math.pow(pointer.x - shape.left, 2) +
              Math.pow(pointer.y - shape.top, 2)
          ) / 2;
        shape.set({ radius });
      } else if (state.tool === "line") {
        shape.set({ x2: pointer.x, y2: pointer.y });
      }

      canvas.renderAll();
    };

    const stopDrawing = () => {
      shape = null;
    };

    canvas.on("mouse:down", startDrawing);
    canvas.on("mouse:move", duringDrawing);
    canvas.on("mouse:up", stopDrawing);

    return () => {
      canvas.off("mouse:down", startDrawing);
      canvas.off("mouse:move", duringDrawing);
      canvas.off("mouse:up", stopDrawing);
    };
  }, [state.tool, state.color, state.strokeWidth]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100">
      <canvas ref={canvasRef} className="border shadow-lg rounded-xl" />
    </div>
  );
};

export default CanvasBoard;
