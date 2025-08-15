import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ModelViewer } from './ModelViewer';
import './App.css';

function App() {
  const [objFile, setObjFile] = useState(null);
  const [mtlFile, setMtlFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#121212');
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.5);
  const [materialColor, setMaterialColor] = useState('#cccccc'); // Default material color
  const [wireframe, setWireframe] = useState(false);
  const [modelInfo, setModelInfo] = useState(null); // Re-added modelInfo state
  const orbitControlsRef = useRef(null); // Single definition of orbitControlsRef

  const resetView = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };

  // State for multiple lights
  const [lights, setLights] = useState([
    { id: 1, position: [5, 5, 5], intensity: 0.8, color: '#ffffff' },
  ]);
  const nextLightId = useRef(2);

  const addLight = useCallback(() => {
    setLights((prevLights) => [
      ...prevLights,
      { id: nextLightId.current++, position: [0, 5, 0], intensity: 1.0, color: '#ffffff' },
    ]);
  }, []);

  const removeLight = useCallback((idToRemove) => {
    setLights((prevLights) => prevLights.filter((light) => light.id !== idToRemove));
  }, []);

  const updateLight = useCallback((idToUpdate, key, value) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === idToUpdate ? { ...light, [key]: value } : light
      )
    );
  }, []);

  const handleObjFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.obj')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setObjFile(e.target.result);
        setMtlFile(null); // Clear MTL when new OBJ is loaded
        setModelInfo(null); // Reset model info when a new file is loaded
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .obj file.');
    }
  }, []);

  const handleMtlFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.mtl')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMtlFile(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .mtl file.');
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleObjDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.obj')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setObjFile(e.target.result);
        setMtlFile(null); // Clear MTL when new OBJ is loaded
        setModelInfo(null); // Reset model info when a new file is loaded
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .obj file.');
    }
  }, []);

  const handleMtlDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.mtl')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMtlFile(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .mtl file.');
    }
  }, []);

  const handleModelLoad = useCallback((info) => {
    setModelInfo(info);
  }, []);

  const resetFiles = useCallback(() => {
    setObjFile(null);
    setMtlFile(null);
    setModelInfo(null);
  }, []);

  return (
    <div className="App">
      {!objFile ? (
        <div
          className="upload-container"
          onDragOver={handleDragOver}
          onDrop={handleObjDrop}
          onClick={() => document.getElementById('objFileInput').click()}
        >
          <p>Drag & Drop your .obj file here, or click to select</p>
          <input
            type="file"
            id="objFileInput"
            accept=".obj"
            onChange={handleObjFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <>
          <div className="controls-panel">
            <h3>Scene Controls</h3>
            <div className="control-group">
              <label htmlFor="bgColor">Background Color:</label>
              <input
                type="color"
                id="bgColor"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
            <div className="control-group">
              <label htmlFor="ambientLight">Ambient Light Intensity:</label>
              <input
                type="range"
                id="ambientLight"
                min="0" max="2" step="0.1"
                value={ambientLightIntensity}
                onChange={(e) => setAmbientLightIntensity(parseFloat(e.target.value))}
              />
              <span>{ambientLightIntensity.toFixed(1)}</span>
            </div>
            
            <button onClick={resetView} className="reset-button">Reset View</button>

            <h4>Lights</h4>
            {lights.map((light) => (
              <div key={light.id} className="light-control-group">
                <h5>Light {light.id}</h5>
                <div className="control-group">
                  <label>Intensity:</label>
                  <input
                    type="range"
                    min="0" max="2" step="0.1"
                    value={light.intensity}
                    onChange={(e) => updateLight(light.id, 'intensity', parseFloat(e.target.value))}
                  />
                  <span>{light.intensity.toFixed(1)}</span>
                </div>
                <div className="control-group">
                  <label>Color:</label>
                  <input
                    type="color"
                    value={light.color}
                    onChange={(e) => updateLight(light.id, 'color', e.target.value)}
                  />
                </div>
                <div className="control-group">
                  <label>Position (X, Y, Z):</label>
                  <input
                    type="number"
                    value={light.position[0]}
                    onChange={(e) => updateLight(light.id, 'position', [parseFloat(e.target.value), light.position[1], light.position[2]])}
                  />
                  <input
                    type="number"
                    value={light.position[1]}
                    onChange={(e) => updateLight(light.id, 'position', [light.position[0], parseFloat(e.target.value), light.position[2]])}
                  />
                  <input
                    type="number"
                    value={light.position[2]}
                    onChange={(e) => updateLight(light.id, 'position', [light.position[0], light.position[1], parseFloat(e.target.value)])}
                  />
                </div>
                <button onClick={() => removeLight(light.id)} className="remove-light-button">Remove Light</button>
              </div>
            ))}
            <button onClick={addLight} className="add-light-button">Add Light</button>

            <button onClick={resetFiles} className="reset-button" style={{ marginTop: '10px' }}>Load New Model</button>

            <div className="control-group">
              <label htmlFor="mtlFileInput">Add .mtl file (optional):</label>
              <input
                type="file"
                id="mtlFileInput"
                accept=".mtl"
                onChange={handleMtlFileChange}
                style={{ display: 'block', marginTop: '5px' }}
              />
            </div>

            <div className="control-group">
              <label htmlFor="materialColor">Material Color:</label>
              <input
                type="color"
                id="materialColor"
                value={materialColor}
                onChange={(e) => setMaterialColor(e.target.value)}
              />
            </div>
            <div className="control-group">
              <label htmlFor="wireframe">Wireframe:</label>
              <input
                type="checkbox"
                id="wireframe"
                checked={wireframe}
                onChange={(e) => setWireframe(e.target.checked)}
              />
            </div>

            {modelInfo && (
              <div className="model-info">
                <h3>Model Info</h3>
                <p>Vertices: {modelInfo.vertices}</p>
                <p>Faces: {modelInfo.faces}</p>
              </div>
            )}
          </div>
          <div className="model-container">
            <ModelViewer
              objFileContent={objFile}
              mtlFileContent={mtlFile}
              backgroundColor={backgroundColor}
              ambientLightIntensity={ambientLightIntensity}
              lights={lights}
              materialColor={materialColor}
              wireframe={wireframe}
              onModelLoad={handleModelLoad}
              orbitControlsRef={orbitControlsRef}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;