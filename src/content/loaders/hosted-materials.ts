import { z } from 'zod';
import hostedMaterialsData from '../../../data/hosted-materials.json';

export const HostedMaterialSchema = z
  .object({
    materialId: z.string().min(1),
    title: z.string().min(1),
    sourceId: z.string().min(1),
    documentType: z.string().min(1),
    assetType: z.enum(['pdf', 'image', 'external_url', 'worksheet']),
    assetPath: z.string().nullable(),
    officialUrl: z.string().url().nullable(),
    distributionBasis: z.enum([
      'author_owned',
      'explicit_permission',
      'open_license',
      'official_public_url',
    ]),
    rightsHolder: z.string().min(1),
    permissionNote: z.string().min(1),
    licenseName: z.string().nullable(),
    licenseUrl: z.string().url().nullable(),
    sha256: z.string().nullable(),
    publicationStatus: z.enum(['approved', 'pending', 'rejected']),
  })
  .superRefine((material, context) => {
    if (material.assetPath && !material.permissionNote) {
      context.addIssue({
        code: 'custom',
        message: 'Ein Asset-Pfad benötigt eine Rechte- und Erlaubnisnotiz.',
        path: ['permissionNote'],
      });
    }
    if (material.distributionBasis === 'official_public_url' && !material.officialUrl) {
      context.addIssue({
        code: 'custom',
        message: 'Offizielle öffentliche URLs müssen als externe URL angegeben werden.',
        path: ['officialUrl'],
      });
    }
    if (material.assetPath && material.distributionBasis === 'official_public_url') {
      context.addIssue({
        code: 'custom',
        message: 'official_public_url darf keine Datei kopieren.',
        path: ['assetPath'],
      });
    }
    if (material.assetPath && !material.assetPath.startsWith('/materials-approved/')) {
      context.addIssue({
        code: 'custom',
        message: 'Freigegebene Assets mÃ¼ssen unter /materials-approved/ liegen.',
        path: ['assetPath'],
      });
    }
    if (
      material.assetPath &&
      ['author_owned', 'explicit_permission', 'open_license'].includes(
        material.distributionBasis,
      ) &&
      !material.sha256
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Freigegebene kopierte Assets benÃ¶tigen einen SHA-256-Hash.',
        path: ['sha256'],
      });
    }
  });

export type HostedMaterial = z.infer<typeof HostedMaterialSchema>;

const HostedMaterialsFileSchema = z.array(HostedMaterialSchema);

export const hostedMaterials = HostedMaterialsFileSchema.parse(hostedMaterialsData);
export const approvedHostedMaterials = hostedMaterials.filter(
  (material) => material.publicationStatus === 'approved',
);

export function approvedHostedMaterialForSource(sourceId: string) {
  return approvedHostedMaterials.find((material) => material.sourceId === sourceId) ?? null;
}
