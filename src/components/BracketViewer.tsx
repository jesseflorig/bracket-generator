import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useBracketStore } from '../store/bracketStore';
import { buildBracket, getHolePositions } from '../geometry/bracket';

function BracketMesh() {
  const params = useBracketStore((s) => s.params);

  const geometry = useMemo(() => buildBracket(params), [params]);
  const holePositions = useMemo(() => getHolePositions(params), [params]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {holePositions.map((pos, i) => (
        <mesh
          key={i}
          position={[pos.x, pos.y, pos.z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[
              params.holeDiameter / 2,
              params.holeDiameter / 2,
              params.thickness + 2,
              24,
            ]}
          />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function BracketViewer() {
  const params = useBracketStore((s) => s.params);
  const camY = params.height / 2;
  const camZ = params.depth / 2;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          position: [params.width * 2, camY + 60, camZ + 140],
          fov: 45,
          near: 0.1,
          far: 10000,
        }}
        gl={{ antialias: true }}
        style={{ background: '#0f172a' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[150, 200, 150]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-80, 60, -80]} intensity={0.4} />

        <BracketMesh />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[600, 600]} />
          <meshStandardMaterial color="#1e293b" roughness={1} />
        </mesh>

        <gridHelper
          args={[400, 40, '#1e293b', '#1e293b']}
          position={[0, 0.1, 0]}
        />

        <OrbitControls
          makeDefault
          target={new THREE.Vector3(0, params.height / 2, params.depth / 2)}
          minDistance={20}
          maxDistance={2000}
        />

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#ef4444', '#22c55e', '#3b82f6']}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
