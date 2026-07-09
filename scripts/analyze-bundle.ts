import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface AssetMetric {
  name: string;
  bytes: number;
  gzipBytes: number;
}

const assetsDirectory = resolve('dist/assets');
const names = await readdir(assetsDirectory);
const javascriptNames = names.filter((name) => name.endsWith('.js')).sort();

if (javascriptNames.length === 0) {
  throw new Error('Bundle-Analyse fehlgeschlagen: keine JavaScript-Assets in dist/assets.');
}

const metrics: AssetMetric[] = await Promise.all(
  javascriptNames.map(async (name) => {
    const content = await readFile(resolve(assetsDirectory, name));
    return { name, bytes: content.byteLength, gzipBytes: gzipSync(content).byteLength };
  }),
);

const entry = metrics.find((metric) => /^index-[\w-]+\.js$/u.test(metric.name));
if (!entry) throw new Error('Bundle-Analyse fehlgeschlagen: Einstiegschunk nicht gefunden.');

const largest = [...metrics].sort((left, right) => right.bytes - left.bytes)[0];
const trainer = metrics.filter((metric) => /Trainer|Tracing|Training|trainer/u.test(metric.name));
const totalBytes = metrics.reduce((sum, metric) => sum + metric.bytes, 0);
const totalGzipBytes = metrics.reduce((sum, metric) => sum + metric.gzipBytes, 0);
const limitBytes = 500_000;

console.log(
  JSON.stringify(
    {
      entry,
      total: { bytes: totalBytes, gzipBytes: totalGzipBytes },
      chunkCount: metrics.length,
      largest,
      trainer,
      entryLimitBytes: limitBytes,
      entryWithinLimit: entry.bytes < limitBytes,
    },
    null,
    2,
  ),
);

if (entry.bytes >= limitBytes) {
  throw new Error(
    `Der Einstiegschunk ist ${entry.bytes} Byte groß und überschreitet das Phase-3-Ziel von ${limitBytes} Byte.`,
  );
}
