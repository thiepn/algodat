import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { inspectDeploymentAssets } from '../../scripts/deployment-safety';

describe('Deployment-Sicherheitsprüfung', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'algodat-deployment-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  async function errorsFor(relative: string, contents: string | Uint8Array = '') {
    const target = path.join(directory, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
    return (await inspectDeploymentAssets(directory)).errors;
  }

  it('lehnt PDF-Dateien ab', async () => {
    expect(await errorsFor('quelle.pdf')).toContain('Private Binärdatei im Deployment: quelle.pdf');
  });

  it('lehnt einen als PNG abgelegten Quellscan ab', async () => {
    expect(await errorsFor('scans/klausur-seite.png')).toContain(
      'Nicht freigegebene PNG-Datei im Deployment: scans/klausur-seite.png',
    );
  });

  it('lehnt private Quellordnernamen ab', async () => {
    expect(await errorsFor('assets/app.js', 'const quelle = "info 1 copy/Klausur.pdf";')).toContain(
      'Privater Quellordner in assets/app.js',
    );
  });

  it('lehnt den neuen privaten PDF-Quellordner ab', async () => {
    expect(await errorsFor('assets/app.js', 'const quelle = "pdfs/Vorlesungen.pdf";')).toContain(
      'Privater PDF-Quellordner in assets/app.js',
    );
  });

  it('lehnt absolute Windows-Pfade ab', async () => {
    expect(
      await errorsFor('content.json', '{"path":"C:\\\\Users\\\\junso\\\\quelle.pdf"}'),
    ).toContain('Windows-Absolutpfad in content.json');
  });

  it('lehnt öffentliche PDF-Links im HTML ab', async () => {
    expect(await errorsFor('index.html', '<a href="assets/klausur.pdf">Quelle</a>')).toContain(
      'Öffentlicher PDF-Verweis in index.html',
    );
  });

  it('lehnt Quellbinärdateien im Service-Worker-Precache ab', async () => {
    expect(await errorsFor('sw.js', 'precacheAndRoute([{url:"assets/klausur.pdf"}]);')).toContain(
      'Private Quelle im Precache: sw.js',
    );
  });

  it('lehnt nicht öffentlich freigegebene Inhaltsstatus ab', async () => {
    expect(
      await errorsFor(
        'assets/content.json',
        '{"publicDistributionStatus":"local_only","solutionValidationStatus":"generated_unverified"}',
      ),
    ).toContain('Nicht öffentlich freigegebener Inhaltsstatus in assets/content.json');
  });

  it('lehnt Debugtraces und Source Maps ab', async () => {
    expect(await errorsFor('assets/app.js', 'const debugTrace = [];')).toContain(
      'Unerlaubter Debug- oder Referenztrace in assets/app.js',
    );
    expect(await errorsFor('assets/app.js.map', '{}')).toContain(
      'Unerlaubte Source Map im Deployment: assets/app.js.map',
    );
  });

  it('lehnt vollständige Nutzerhistorien im Lernorchestrator-Build ab', async () => {
    expect(await errorsFor('assets/app.js', '{"practiceAttempts":[]}')).toContain(
      'Vollständige Nutzerhistorie im Deployment: assets/app.js',
    );
    expect(await errorsFor('assets/app.js', 'const marker = "fullUserHistory";')).toContain(
      'Vollständige Nutzerhistorie im Deployment: assets/app.js',
    );
  });

  it('lehnt ungültige Orchestrator-Policies und private Testfixtures ab', async () => {
    expect(await errorsFor('assets/policy.json', '{"policyValidationStatus":"invalid"}')).toContain(
      'Ungültige Orchestrator-Policy im Deployment: assets/policy.json',
    );
    expect(await errorsFor('assets/app.js', 'const fixture = "private-test-fixture";')).toContain(
      'Private Testfixture im Deployment: assets/app.js',
    );
  });
  it('lehnt Phase-16-Release-Leaks ab', async () => {
    expect(await errorsFor('assets/export.json', '{"algodat-progress-export":true}')).toContain(
      'Exportdatei oder Exportnutzdaten im Deployment: assets/export.json',
    );
    expect(await errorsFor('assets/cheat.json', 'invalid-cheat-sheet-block')).toContain(
      'Ungültiger Spickzettelblock im Deployment: assets/cheat.json',
    );
    expect(await errorsFor('assets/exam.json', '{"fullyAutoGradable":false}')).toContain(
      'Unbewertbarer ExamSlot im Deployment: assets/exam.json',
    );
    expect(
      await errorsFor('assets/app.js', 'const marker = "solutionBeforeSubmission";'),
    ).toContain('Referenzlösung vor Abgabe im Deployment: assets/app.js');
  });
});
