import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as fabric from 'fabric';



const CanvasContext = createContext();

const initialState = {
  tool: 'pen',
  color: '#000000',
  strokeWidth: 2,
  opacity: 1,
  isDrawing: false,
  canvas: null,
  users: [],
  cursors: new Map()
};

const canvasReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.payload };
    case 'SET_COLOR':
      return { ...state, color: action.payload };
    case 'SET_STROKE_WIDTH':
      return { ...state, strokeWidth: action.payload };
    case 'SET_OPACITY':
      return { ...state, opacity: action.payload };
    case 'SET_CANVAS':
      return { ...state, canvas: action.payload };
    case 'SET_DRAWING':
      return { ...state, isDrawing: action.payload };
    case 'UPDATE_CURSOR':
      const newCursors = new Map(state.cursors);
      newCursors.set(action.payload.userId, action.payload);
      return { ...state, cursors: newCursors };
    case 'REMOVE_CURSOR':
      const cursorsWithoutUser = new Map(state.cursors);
      cursorsWithoutUser.delete(action.payload);
      return { ...state, cursors: cursorsWithoutUser };
    default:
      return state;
  }
};

export const CanvasProvider = ({ children, socket }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  useEffect(() => {
    if (!socket) return;

    // Handle remote drawing events
    socket.on('drawing-event', (data) => {
      if (state.canvas) {
        handleRemoteDrawing(data);
      }
    });

    // Handle cursor movements
    socket.on('cursor-move', (data) => {
      dispatch({ type: 'UPDATE_CURSOR', payload: data });
    });

    // Handle user disconnect
    socket.on('user-disconnected', (userInfo) => {
      dispatch({ type: 'REMOVE_CURSOR', payload: userInfo.userId });
    });

    // Handle canvas clear
    socket.on('canvas-cleared', () => {
      if (state.canvas) {
        state.canvas.clear();
      }
    });

    // Handle canvas state load
    socket.on('canvas-state', (canvasData) => {
      if (state.canvas && canvasData) {
        state.canvas.loadFromJSON(canvasData, () => {
          state.canvas.renderAll();
        });
      }
    });

    return () => {
      socket.off('drawing-event');
      socket.off('cursor-move');
      socket.off('user-disconnected');
      socket.off('canvas-cleared');
      socket.off('canvas-state');
    };
  }, [socket, state.canvas]);

  const handleRemoteDrawing = (data) => {
    const { eventType, tool, coordinates, style } = data;
    
    if (eventType === 'draw' && coordinates.length > 1) {
      drawPath(coordinates, style, tool);
    } else if (eventType === 'clear') {
      state.canvas.clear();
    }
  };

  const drawPath = (coordinates, style, tool) => {
    if (!state.canvas || coordinates.length < 2) return;

    const pathString = coordinates.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return acc + `${command} ${point.x} ${point.y} `;
    }, '');

    const path = new fabric.Path(pathString, {
      stroke: style.color,
      strokeWidth: style.width,
      opacity: style.opacity,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      selectable: false
    });

    state.canvas.add(path);
    state.canvas.renderAll();
  };

  return (
    <CanvasContext.Provider value={{ state, dispatch, socket }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
};
