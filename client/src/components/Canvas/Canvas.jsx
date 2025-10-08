import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { useCanvas } from '../../context/CanvasContext.jsx';
import './Canvas.css';

const Canvas = () => {
  const canvasRef = useRef(null);
  const { state, dispatch, socket } = useCanvas();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  // useEffect(() => {
  //   // Initialize Fabric.js canvas
  //   const canvas = new fabric.Canvas(canvasRef.current, {
  //     width: window.innerWidth - 300,
  //     height: window.innerHeight - 100,
  //     backgroundColor: 'white',
  //     isDrawingMode: false
  //   });

  //   dispatch({ type: 'SET_CANVAS', payload: canvas });

  //   // Handle mouse events
  //   canvas.on('mouse:down', handleMouseDown);
  //   canvas.on('mouse:move', handleMouseMove);
  //   canvas.on('mouse:up', handleMouseUp);

  //   // Handle window resize
  //   const handleResize = () => {
  //     canvas.setWidth(window.innerWidth - 300);
  //     canvas.setHeight(window.innerHeight - 100);
  //     canvas.renderAll();
  //   };

  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     canvas.dispose();
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  // // Update canvas drawing mode when tool changes
  // useEffect(() => {
  //   if (state.canvas) {
  //     state.canvas.isDrawingMode = state.tool === 'pen' || state.tool === 'eraser';
  
  //     if (state.canvas.isDrawingMode) {
  //       // Ensure the freeDrawingBrush exists
  //       if (!state.canvas.freeDrawingBrush) {
  //         state.canvas.freeDrawingBrush = new fabric.PencilBrush(state.canvas);
  //       }
  
  //       state.canvas.freeDrawingBrush.width = state.strokeWidth;
  //       state.canvas.freeDrawingBrush.color =
  //         state.tool === 'eraser' ? 'white' : state.color;
  //     }
  //   }
  // }, [state.tool, state.color, state.strokeWidth, state.canvas]);

  // Initialize Fabric.js canvas (runs only once)
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 300,
      height: window.innerHeight - 100,
      backgroundColor: 'white',
      isDrawingMode: false
    });

    dispatch({ type: 'SET_CANVAS', payload: canvas });

    const handleResize = () => {
      canvas.setWidth(window.innerWidth - 300);
      canvas.setHeight(window.innerHeight - 100);
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update brush when tool/color/width changes
  useEffect(() => {
    if (!state.canvas) return;

    if (state.tool === 'pen' || state.tool === 'eraser') {
      state.canvas.isDrawingMode = true;
      if (!state.canvas.freeDrawingBrush) {
        state.canvas.freeDrawingBrush = new fabric.PencilBrush(state.canvas);
      }
      state.canvas.freeDrawingBrush.width = state.strokeWidth;
      state.canvas.freeDrawingBrush.color =
        state.tool === 'eraser' ? 'white' : state.color;
    } else {
      state.canvas.isDrawingMode = false; // Shapes/text handled separately
    }
  }, [state.tool, state.color, state.strokeWidth, state.canvas]);


  // Handle rectangle, circle, and text drawing
  useEffect(() => {
    if (!state.canvas) return;

    let startX, startY, shape;

    const handleMouseDown = (opt) => {
      if (state.tool === 'rectangle' || state.tool === 'circle' || state.tool === 'text') {
        const pointer = state.canvas.getPointer(opt.e);
        startX = pointer.x;
        startY = pointer.y;

        if (state.tool === 'rectangle') {
          shape = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            stroke: state.color,
            strokeWidth: state.strokeWidth,
            fill: 'transparent',
            selectable: false
          });
          state.canvas.add(shape);
        } else if (state.tool === 'circle') {
          shape = new fabric.Circle({
            left: startX,
            top: startY,
            radius: 0,
            stroke: state.color,
            strokeWidth: state.strokeWidth,
            fill: 'transparent',
            selectable: false
          });
          state.canvas.add(shape);
        } else if (state.tool === 'text') {
          const text = new fabric.Textbox('Type here', {
            left: startX,
            top: startY,
            fontSize: 20,
            fill: state.color
          });
          state.canvas.add(text);
        }
      }
    };

    const handleMouseMove = (opt) => {
      if (!shape) return;
      const pointer = state.canvas.getPointer(opt.e);

      if (state.tool === 'rectangle') {
        shape.set({ width: pointer.x - startX, height: pointer.y - startY });
      } else if (state.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
        ) / 2;
        shape.set({ radius });
      }
      state.canvas.renderAll();
    };

    const handleMouseUp = () => {
      shape = null;
    };

    state.canvas.on('mouse:down', handleMouseDown);
    state.canvas.on('mouse:move', handleMouseMove);
    state.canvas.on('mouse:up', handleMouseUp);

    return () => {
      state.canvas.off('mouse:down', handleMouseDown);
      state.canvas.off('mouse:move', handleMouseMove);
      state.canvas.off('mouse:up', handleMouseUp);
    };
  }, [state.tool, state.color, state.strokeWidth, state.canvas]);


  const handleMouseDown = (event) => {
    if (!socket) return;

    setIsDrawing(true);
    const pointer = state.canvas.getPointer(event.e);
    setCurrentPath([{ x: pointer.x, y: pointer.y, pressure: 1 }]);

    // Send cursor position
    socket.emit('cursor-move', {
      x: pointer.x,
      y: pointer.y,
      isDrawing: true
    });
  };

  const handleMouseMove = (event) => {
    if (!socket) return;

    const pointer = state.canvas.getPointer(event.e);
    
    if (isDrawing && state.tool === 'pen') {
      setCurrentPath(prev => [...prev, { x: pointer.x, y: pointer.y, pressure: 1 }]);
    }

    // Send cursor position to other users
    socket.emit('cursor-move', {
      x: pointer.x,
      y: pointer.y,
      isDrawing
    });
  };

  const handleMouseUp = () => {
    if (!socket || !isDrawing) return;

    setIsDrawing(false);

    if (currentPath.length > 1 && state.tool === 'pen') {
      // Send drawing data to other users
      socket.emit('drawing-event', {
        eventType: 'draw',
        tool: state.tool,
        coordinates: currentPath,
        style: {
          color: state.color,
          width: state.strokeWidth,
          opacity: state.opacity
        }
      });

      // Save canvas state periodically
      setTimeout(() => {
        if (state.canvas) {
          const canvasData = JSON.stringify(state.canvas.toJSON());
          socket.emit('save-canvas', canvasData);
        }
      }, 1000);
    }

    setCurrentPath([]);
  };

  const clearCanvas = () => {
    if (state.canvas && socket) {
      state.canvas.clear();
      socket.emit('clear-canvas');
    }
  };

  const exportCanvas = (format = 'png') => {
    if (!state.canvas) return;

    const dataURL = state.canvas.toDataURL({
      format,
      quality: 1
    });

    const link = document.createElement('a');
    link.download = `whiteboard.${format}`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-controls">
        <button onClick={clearCanvas} className="control-btn clear-btn">
          Clear Canvas
        </button>
        <button onClick={() => exportCanvas('png')} className="control-btn export-btn">
          Export PNG
        </button>
        <button onClick={() => exportCanvas('pdf')} className="control-btn export-btn">
          Export PDF
        </button>
      </div>
      
      <div className="canvas-container">
        <canvas ref={canvasRef} />
        
        {/* Render other users' cursors */}
        {Array.from(state.cursors.entries()).map(([userId, cursor]) => (
          <div
            key={userId}
            className="user-cursor"
            style={{
              left: cursor.x,
              top: cursor.y,
              borderColor: cursor.color
            }}
          >
            <div className="cursor-name" style={{ backgroundColor: cursor.color }}>
              {cursor.userName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Canvas;