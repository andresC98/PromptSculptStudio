import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

function Model({ objFileContent, mtlFileContent, onModelLoad, materialColor, wireframe }) {
  const obj = useRef();
  const { scene } = useThree();

  useEffect(() => {
    const objLoader = new OBJLoader();

    let materials;
    if (mtlFileContent) {
      const mtlLoader = new MTLLoader();
      materials = mtlLoader.parse(mtlFileContent);
      materials.preload();
      objLoader.setMaterials(materials);
    }

    const object = objLoader.parse(objFileContent);

    // If MTL materials were loaded, apply them to the object's meshes
    if (mtlFileContent) {
      object.traverse((child) => {
        if (child.isMesh && child.material.name) {
          console.log('Mesh material name:', child.material.name);
          const material = materials.materials[child.material.name];
          if (material) {
            console.log('Applying material:', material);
            // Ensure transparency and double-sided rendering for MTL materials
            if (material.opacity < 1) {
              material.transparent = true;
            }
            material.side = THREE.DoubleSide;
            child.material = material;
          }
        }
      });
    } else { // No MTL file, apply a default material
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(materialColor) });
        }
      });
    }

    // Apply wireframe and color override if specified
    object.traverse((child) => {
      if (child.isMesh) {
        if (wireframe) {
          child.material.wireframe = true;
        } else {
          child.material.wireframe = false;
        }
        // Override color if materialColor is provided and not using MTL
        if (!mtlFileContent) {
          child.material.color.set(materialColor);
        }
      }
    });

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
  }, [objFileContent, mtlFileContent, onModelLoad, scene]);

  return obj.current ? <primitive object={obj.current} /> : null;
}

export function ModelViewer({ objFileContent, mtlFileContent, backgroundColor, ambientLightIntensity, lights, materialColor, wireframe, onModelLoad, orbitControlsRef }) {
  const controls = useRef();

  // Expose reset function to parent component via ref
  React.useImperativeHandle(orbitControlsRef, () => ({
    reset: () => {
      controls.current.reset();
    }
  }));
  return (
    <Canvas camera={{ position: [0, 0, 5] }} style={{ background: backgroundColor }}>
      <ambientLight intensity={ambientLightIntensity} />
      {lights.map((light) => (
        <directionalLight
          key={light.id}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
        />
      ))}
      <gridHelper args={[10, 10, 0x888888, 0x444444]} />
      <Suspense fallback={null}>
        <Model objFileContent={objFileContent} mtlFileContent={mtlFileContent} onModelLoad={onModelLoad} materialColor={materialColor} wireframe={wireframe} />
      </Suspense>
      <OrbitControls ref={controls} />
    </Canvas>
  );
}
