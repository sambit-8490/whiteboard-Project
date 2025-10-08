import React from 'react';
import { SketchPicker } from 'react-color';
import { useCanvas } from '../../context/CanvasContext.jsx';
import './Toolbar.css';

const Toolbar = () => {
  const { state, dispatch } = useCanvas();
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧽' },
    { id: 'rectangle', name: 'Rectangle', icon: '⬛' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'text', name: 'Text', icon: '📝' }
  ];

  const strokeWidths = [1, 2, 4, 6, 8, 12, 16, 20];

  return (
    <div className="toolbar">
      <h3>Tools</h3>
      <div className="tool-section">
        <label>Drawing Tool:</label>
        <div className="tool-grid">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${state.tool === tool.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TOOL', payload: tool.id })}
              title={tool.name}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <label>Color:</label>
        <div className="color-controls">
          <div
            className="color-display"
            style={{ backgroundColor: state.color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          {showColorPicker && (
            <div className="color-picker-popup">
              <div 
                className="color-picker-overlay"
                onClick={() => setShowColorPicker(false)}
              />
              <SketchPicker
                color={state.color}
                onChange={(color) => dispatch({ type: 'SET_COLOR', payload: color.hex })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="tool-section">
        <label>Stroke Width: {state.strokeWidth}px</label>
        <div className="stroke-width-grid">
          {strokeWidths.map(width => (
            <button
              key={width}
              className={`stroke-btn ${state.strokeWidth === width ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_STROKE_WIDTH', payload: width })}
            >
              <div 
                className="stroke-preview"
                style={{ 
                  width: `${Math.min(width * 2, 20)}px`,
                  height: `${Math.min(width * 2, 20)}px`,
                  backgroundColor: state.color
                }}
              />
              <span>{width}px</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <label>Opacity: {Math.round(state.opacity * 100)}%</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={state.opacity}
          onChange={(e) => dispatch({ 
            type: 'SET_OPACITY', 
            payload: parseFloat(e.target.value) 
          })}
          className="opacity-slider"
        />
      </div>
    </div>
  );
};

export default Toolbar;



