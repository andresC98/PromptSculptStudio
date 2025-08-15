import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

function Model({ objFileContent, onModelLoad }) {
  const obj = useRef();
  const { scene } = useThree();

  useEffect(() => {
    const loader = new OBJLoader();
    const object = loader.parse(objFileContent);

    // Calculate model information
    let vertices = 0;
    let faces = 0;

    object.traverse((child) => {
      if (child.isMesh) {
        const geometry = child.geometry;
        if (geometry.isBufferGeometry) {
          vertices += geometry.attributes.position.count;
          if (geometry.index) {
            faces += geometry.index.count / 3;
          } else {
            faces += geometry.attributes.position.count / 3;
          }
        }
      }
    });

    onModelLoad({ vertices, faces });

    // Center the model and scale it to fit the view
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    object.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim; // Scale to fit within a 2x2x2 cube approximately
    object.scale.set(scale, scale, scale);

    obj.current = object;
    scene.add(object);

    return () => {
      scene.remove(object);
    };
  }, [objFileContent, onModelLoad, scene]);

  return obj.current ? <primitive object={obj.current} /> : null;
}

export function ModelViewer({ objFileContent, backgroundColor, ambientLightIntensity, directionalLightIntensity, onModelLoad, orbitControlsRef }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} style={{ background: backgroundColor }}>
      <ambientLight intensity={ambientLightIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={directionalLightIntensity} />
      <Suspense fallback={null}>
        <Model objFileContent={objFileContent} onModelLoad={onModelLoad} />
      </Suspense>
      <OrbitControls ref={orbitControlsRef} />
    </Canvas>
  );
}
