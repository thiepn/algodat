import path from 'node:path';
import { root } from './content-utils';
import { inspectDeploymentAssets } from './deployment-safety';

const result = await inspectDeploymentAssets(path.join(root, 'dist'));
if (result.errors.length) {
  throw new Error(`Deployment-Sicherheitsprüfung fehlgeschlagen:\n${result.errors.join('\n')}`);
}

console.log(
  `Deployment sicher: ${result.fileCount} Artefakte geprüft, keine privaten Quellen oder lokalen Pfade.`,
);
