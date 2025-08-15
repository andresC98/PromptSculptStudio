import React, { useState, useCallback, useRef } from 'react';
import { ModelViewer } from './ModelViewer';

function App() {
  const [objFile, setObjFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#121212');
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.5);
  const [directionalLightIntensity, setDirectionalLightIntensity] = useState(0.8);
  const [modelInfo, setModelInfo] = useState(null);
  const orbitControlsRef = useRef();

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.obj')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setObjFile(e.target.result);
        setModelInfo(null); // Reset model info when a new file is loaded
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .obj file.');
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.obj')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setObjFile(e.target.result);
        setModelInfo(null); // Reset model info when a new file is loaded
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .obj file.');
    }
  }, []);

  const handleModelLoad = useCallback((info) => {
    setModelInfo(info);
  }, []);

  const resetView = useCallback(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  }, []);

  return (
    <div className="App">
      {!objFile ? (
        <div
          className="upload-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('objFileInput').click()}
        >
          <p>Drag & Drop your .obj file here, or click to select</p>
          <input
            type="file"
            id="objFileInput"
            accept=".obj"
            onChange={handleFileChange}
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
            <div className="control-group">
              <label htmlFor="directionalLight">Directional Light Intensity:</label>
              <input
                type="range"
                id="directionalLight"
                min="0" max="2" step="0.1"
                value={directionalLightIntensity}
                onChange={(e) => setDirectionalLightIntensity(parseFloat(e.target.value))}
              />
              <span>{directionalLightIntensity.toFixed(1)}</span>
            </div>
            <button onClick={resetView} className="reset-button">Reset View</button>

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
              backgroundColor={backgroundColor}
              ambientLightIntensity={ambientLightIntensity}
              directionalLightIntensity={directionalLightIntensity}
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