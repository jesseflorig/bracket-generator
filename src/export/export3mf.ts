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

export async function export3mf(payload: ExportPayload): Promise<void> {
  const { geometry, filename } = payload;

  // Use non-indexed geometry for simple flat-triangle output
  const flat = geometry.toNonIndexed();
  const pos = flat.getAttribute('position') as BufferAttribute;
  const count = pos.count;

  const vertexLines: string[] = [];
  for (let i = 0; i < count; i++) {
    vertexLines.push(
      `        <vertex x="${pos.getX(i).toFixed(4)}" y="${pos.getY(i).toFixed(4)}" z="${pos.getZ(i).toFixed(4)}"/>`
    );
  }

  const triangleLines: string[] = [];
  for (let i = 0; i < count; i += 3) {
    triangleLines.push(
      `        <triangle v1="${i}" v2="${i + 1}" v3="${i + 2}"/>`
    );
  }

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
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

  flat.dispose();

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
