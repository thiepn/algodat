import { describe, expect, it } from 'vitest';
import {
  HostedMaterialSchema,
  approvedHostedMaterials,
  hostedMaterials,
} from '../../src/content/loaders/hosted-materials';

const validHostedMaterial = {
  materialId: 'material-test',
  title: 'Freigegebenes Testmaterial',
  sourceId: 'src-test',
  documentType: 'exercise',
  assetType: 'pdf',
  assetPath: '/materials-approved/test.pdf',
  officialUrl: null,
  distributionBasis: 'explicit_permission',
  rightsHolder: 'Testrechteinhaber',
  permissionNote: 'Explizite Veröffentlichungserlaubnis liegt dokumentiert vor.',
  licenseName: null,
  licenseUrl: null,
  sha256: 'a'.repeat(64),
  publicationStatus: 'approved',
} as const;

describe('Hosted-Material-Manifest', () => {
  it('validiert das aktuelle Manifest und veröffentlicht initial keine privaten Assets', () => {
    expect(hostedMaterials).toEqual([]);
    expect(approvedHostedMaterials).toEqual([]);
  });

  it('akzeptiert nur geprüfte Asset-Pfade mit Hash', () => {
    expect(() => HostedMaterialSchema.parse(validHostedMaterial)).not.toThrow();
    expect(() =>
      HostedMaterialSchema.parse({
        ...validHostedMaterial,
        assetPath: '/private/test.pdf',
      }),
    ).toThrow();
    expect(() =>
      HostedMaterialSchema.parse({
        ...validHostedMaterial,
        sha256: null,
      }),
    ).toThrow();
  });

  it('erlaubt offizielle öffentliche URLs nur ohne kopiertes Asset', () => {
    expect(() =>
      HostedMaterialSchema.parse({
        ...validHostedMaterial,
        assetPath: null,
        officialUrl: 'https://example.edu/material.pdf',
        distributionBasis: 'official_public_url',
        sha256: null,
      }),
    ).not.toThrow();
    expect(() =>
      HostedMaterialSchema.parse({
        ...validHostedMaterial,
        officialUrl: 'https://example.edu/material.pdf',
        distributionBasis: 'official_public_url',
      }),
    ).toThrow();
  });
});
