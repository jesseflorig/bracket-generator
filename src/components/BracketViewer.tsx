import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useBracketStore } from '../store/bracketStore';
import { buildBracket, faceplateWidth } from '../geometry/bracket';

function BracketMesh() {
  const params = useBracketStore((s) => s.params);

  const geometry = useMemo(() => buildBracket(params), [params]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CameraControls({ camDist, shelfDepth }: { camDist: number; shelfDepth: number }) {
  const { camera } = useThree();
  const controlsRef = useRef<{ target: THREE.Vector3; update: () => void } | null>(null);
  const target = useMemo(() => new THREE.Vector3(0, 0, shelfDepth / 2), [shelfDepth]);

  const animating = useRef(false);
  const destPosition = useRef(new THREE.Vector3());
  const destTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!animating.current || !controlsRef.current) return;
    camera.position.lerp(destPosition.current, 0.08);
    controlsRef.current.target.lerp(destTarget.current, 0.08);
    controlsRef.current.update();
    if (
      camera.position.distanceTo(destPosition.current) < 0.5 &&
      controlsRef.current.target.distanceTo(destTarget.current) < 0.5
    ) {
      camera.position.copy(destPosition.current);
      controlsRef.current.target.copy(destTarget.current);
      controlsRef.current.update();
      animating.current = false;
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      destPosition.current.set(camDist * 0.6, camDist * 0.4, camDist);
      destTarget.current.copy(target);
      animating.current = true;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camDist, target]);

  return (
    <OrbitControls
      ref={controlsRef as React.Ref<any>}
      makeDefault
      target={target}
      minDistance={10}
      maxDistance={2000}
    />
  );
}

export function BracketViewer() {
  const params = useBracketStore((s) => s.params);
  const fw = faceplateWidth(params);
  const camDist = Math.max(fw, 100) * 1.8;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          position: [camDist * 0.6, camDist * 0.4, camDist],
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

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -params.faceplateHeight / 2 - 1, 0]} receiveShadow>
          <planeGeometry args={[600, 600]} />
          <meshStandardMaterial color="#1e293b" roughness={1} />
        </mesh>

        <gridHelper
          args={[400, 40, '#1e293b', '#1e293b']}
          position={[0, -params.faceplateHeight / 2 - 0.9, 0]}
        />

        <CameraControls camDist={camDist} shelfDepth={params.shelfDepth} />

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
