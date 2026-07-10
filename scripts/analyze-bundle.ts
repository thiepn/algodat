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
const warning500kBytes = 500_000;
const warning1MbBytes = 1_000_000;
const emergencyLimitBytes = 5_000_000;
const warning500k = entry.bytes >= warning500kBytes;
const warning1MB = entry.bytes >= warning1MbBytes;
const withinEmergencyLimit = entry.bytes < emergencyLimitBytes;

console.log(
  JSON.stringify(
    {
      entry,
      entryRawBytes: entry.bytes,
      entryGzipBytes: entry.gzipBytes,
      total: { bytes: totalBytes, gzipBytes: totalGzipBytes },
      totalRawBytes: totalBytes,
      totalGzipBytes,
      chunkCount: metrics.length,
      largest,
      trainer,
      warning500k,
      warning1MB,
      withinEmergencyLimit,
      policy: {
        warning500kBytes,
        warning1MbBytes,
        emergencyLimitBytes,
        note: '500 kB und 1 MB sind Warnschwellen. Erst ab 5 MB Einstiegschunk wird der Build hart gestoppt.',
      },
    },
    null,
    2,
  ),
);

if (warning500k) {
  console.warn(
    `Hinweis: Der Einstiegschunk ist ${entry.bytes} Byte groß und überschreitet die 500-kB-Warnschwelle.`,
  );
}

if (warning1MB) {
  console.warn(
    `Starke Warnung: Der Einstiegschunk ist ${entry.bytes} Byte groß und überschreitet 1 MB.`,
  );
}

if (!withinEmergencyLimit) {
  throw new Error(
    `Der Einstiegschunk ist ${entry.bytes} Byte groß und überschreitet die Notfallgrenze von ${emergencyLimitBytes} Byte.`,
  );
}
