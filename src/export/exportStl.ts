import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import type { ExportPayload } from '../models/bracketParams';

export function exportStl(payload: ExportPayload): void {
  const { geometry, filename } = payload;

  const exporter = new STLExporter();
  const mesh = new THREE.Mesh(geometry);
  const result = exporter.parse(mesh, { binary: true }) as DataView;

  const blob = new Blob([result.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.stl`;
  a.click();
  URL.revokeObjectURL(url);
}
