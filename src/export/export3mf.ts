import JSZip from 'jszip';
import type { BufferAttribute } from 'three';
import type { ExportPayload } from '../models/bracketParams';

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

type Triangle = readonly [number, number, number];

export interface Mesh3mfData {
  vertices: string[];
  triangles: Triangle[];
}

function vertexKey(pos: BufferAttribute, index: number): string {
  return [
    pos.getX(index).toFixed(4),
    pos.getY(index).toFixed(4),
    pos.getZ(index).toFixed(4),
  ].join(',');
}

export function meshDataFromGeometry(geometry: ExportPayload['geometry']): Mesh3mfData {
  const pos = geometry.getAttribute('position') as BufferAttribute | undefined;
  if (!pos) throw new Error('Cannot export 3MF: geometry has no position attribute');

  const sourceIndex = geometry.getIndex();
  const triangles: Triangle[] = [];

  if (sourceIndex) {
    const vertices = Array.from({ length: pos.count }, (_, index) => vertexKey(pos, index));

    for (let i = 0; i < sourceIndex.count; i += 3) {
      const triangle = [
        sourceIndex.getX(i),
        sourceIndex.getX(i + 1),
        sourceIndex.getX(i + 2),
      ] as const;

      if (triangle[0] !== triangle[1] && triangle[1] !== triangle[2] && triangle[2] !== triangle[0]) {
        triangles.push(triangle);
      }
    }

    return { vertices, triangles };
  }

  const vertices: string[] = [];
  const vertexByKey = new Map<string, number>();

  const remapVertex = (index: number) => {
    const key = vertexKey(pos, index);
    const existing = vertexByKey.get(key);
    if (existing !== undefined) return existing;

    const remapped = vertices.length;
    vertexByKey.set(key, remapped);
    vertices.push(key);
    return remapped;
  };

  for (let i = 0; i < pos.count; i += 3) {
    const triangle = [remapVertex(i), remapVertex(i + 1), remapVertex(i + 2)] as const;

    if (triangle[0] !== triangle[1] && triangle[1] !== triangle[2] && triangle[2] !== triangle[0]) {
      triangles.push(triangle);
    }
  }

  return { vertices, triangles };
}

export function modelXmlFromMeshData({ vertices, triangles }: Mesh3mfData): string {
  const vertexLines = vertices.map((vertex) => {
    const [x, y, z] = vertex.split(',');
    return `        <vertex x="${x}" y="${y}" z="${z}"/>`;
  });

  const triangleLines = triangles.map(([a, b, c]) =>
    `        <triangle v1="${a}" v2="${b}" v3="${c}"/>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertexLines.join('\n')}
        </vertices>
        <triangles>
${triangleLines.join('\n')}
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1"/>
  </build>
</model>`;
}

export async function export3mf(payload: ExportPayload): Promise<void> {
  const { geometry, filename } = payload;
  const modelXml = modelXmlFromMeshData(meshDataFromGeometry(geometry));

  const zip = new JSZip();
  zip.file('[Content_Types].xml', CONTENT_TYPES);
  zip.folder('_rels')!.file('.rels', RELS);
  zip.folder('3D')!.file('3dmodel.model', modelXml);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.3mf`;
  a.click();
  URL.revokeObjectURL(url);
}
