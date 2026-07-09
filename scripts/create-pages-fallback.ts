import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { root } from './content-utils';

await copyFile(path.join(root, 'dist', 'index.html'), path.join(root, 'dist', '404.html'));
console.log('GitHub-Pages-Fallback dist/404.html erzeugt.');
