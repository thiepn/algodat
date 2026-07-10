import { useEffect, useMemo, useState } from 'react';
import type { CropRegion, LocalDocumentBinding } from '../../persistence/database/schema';

interface LocalPdfRendererProps {
  binding: LocalDocumentBinding;
  pageStart: number;
  pageEnd?: number;
  cropRegions?: CropRegion[];
  label: string;
  solutionBinding?: LocalDocumentBinding | undefined;
  solutionPageStart?: number | null | undefined;
}

function pageRange(start: number, end?: number) {
  const last = Math.max(start, end ?? start);
  return Array.from({ length: last - start + 1 }, (_, index) => start + index);
}

function createObjectUrl(binding: LocalDocumentBinding) {
  return URL.createObjectURL(new Blob([binding.bytes], { type: binding.mimeType }));
}

export function LocalPdfRenderer({
  binding,
  pageStart,
  pageEnd,
  cropRegions = [],
  label,
  solutionBinding,
  solutionPageStart,
}: LocalPdfRendererProps) {
  const [page, setPage] = useState(pageStart);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fitWidth, setFitWidth] = useState(true);
  const [showSolution, setShowSolution] = useState(Boolean(solutionBinding));
  const objectUrl = useMemo(() => createObjectUrl(binding), [binding]);
  const solutionObjectUrl = useMemo(
    () => (solutionBinding ? createObjectUrl(solutionBinding) : null),
    [solutionBinding],
  );

  useEffect(
    () => () => {
      URL.revokeObjectURL(objectUrl);
      if (solutionObjectUrl) URL.revokeObjectURL(solutionObjectUrl);
    },
    [objectUrl, solutionObjectUrl],
  );

  const pages = pageRange(pageStart, pageEnd);
  const selectedCrop = cropRegions.find((crop) => crop.page === page) ??
    cropRegions[0] ?? {
      page,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      coordinateSystem: 'normalized_page' as const,
    };

  const frameStyle = {
    transform: `scale(${fitWidth ? 1 : zoom}) rotate(${rotation}deg)`,
    transformOrigin: 'top left',
  };

  return (
    <section className="local-pdf-renderer" aria-label={label}>
      <div className="local-pdf-toolbar" role="group" aria-label="PDF-Steuerung">
        <button type="button" onClick={() => setPage((value) => Math.max(pageStart, value - 1))}>
          Vorherige Seite
        </button>
        <label>
          Seite
          <input
            aria-label="Seitennummer"
            min={pageStart}
            max={pageEnd ?? binding.pageCount ?? pageStart}
            type="number"
            value={page}
            onChange={(event) => setPage(Number(event.target.value))}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            setPage((value) => Math.min(pageEnd ?? binding.pageCount ?? value + 1, value + 1))
          }
        >
          Nächste Seite
        </button>
        <button type="button" aria-keyshortcuts="+" onClick={() => setZoom((value) => value + 0.1)}>
          Vergrößern
        </button>
        <button
          type="button"
          aria-keyshortcuts="-"
          onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))}
        >
          Verkleinern
        </button>
        <button type="button" onClick={() => setFitWidth((value) => !value)}>
          {fitWidth ? 'Manueller Zoom' : 'Breite einpassen'}
        </button>
        <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)}>
          Drehen
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setRotation(0);
            setFitWidth(true);
          }}
        >
          Crop zurücksetzen
        </button>
        {solutionBinding && (
          <button type="button" onClick={() => setShowSolution((value) => !value)}>
            {showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
          </button>
        )}
        <button type="button" onClick={() => window.print()}>
          Lokal drucken
        </button>
        <a
          className="button-link"
          href={`${objectUrl}#page=${page}`}
          target="_blank"
          rel="noreferrer"
        >
          Native PDF-Ansicht
        </a>
      </div>

      <p className="notice">
        Anzeige aus lokal verbundener Datei: {binding.actualFilename}. Es wird ein Blob-URL nur im
        Browser erzeugt; keine Datei wird hochgeladen oder öffentlich verlinkt.
      </p>

      <div className={showSolution && solutionBinding ? 'pdf-side-by-side' : 'pdf-single'}>
        <article className="pdf-page-card">
          <h2>Originalseite {page}</h2>
          <p>
            Crop-Region: Seite {selectedCrop.page}, x {selectedCrop.x.toFixed(2)}, y{' '}
            {selectedCrop.y.toFixed(2)}, Breite {selectedCrop.width.toFixed(2)}, Höhe{' '}
            {selectedCrop.height.toFixed(2)}.
          </p>
          <div className="pdf-crop-shell" style={frameStyle}>
            <iframe
              className="pdf-viewer pdf-viewer--region"
              title={`${label}: lokale Originalseite ${page}`}
              src={`${objectUrl}#page=${page}`}
            />
            <span
              className="pdf-crop-overlay"
              aria-hidden="true"
              style={{
                left: `${selectedCrop.x * 100}%`,
                top: `${selectedCrop.y * 100}%`,
                width: `${selectedCrop.width * 100}%`,
                height: `${selectedCrop.height * 100}%`,
              }}
            />
          </div>
          <div className="button-row">
            {pages.map((candidatePage) => (
              <button
                key={candidatePage}
                type="button"
                className={candidatePage === page ? 'module-toc__active' : undefined}
                onClick={() => setPage(candidatePage)}
              >
                Seite {candidatePage}
              </button>
            ))}
          </div>
        </article>

        {showSolution && solutionBinding && solutionObjectUrl && (
          <article className="pdf-page-card">
            <h2>Lösungsseite {solutionPageStart ?? page}</h2>
            <iframe
              className="pdf-viewer"
              title={`${label}: lokale Lösungsseite`}
              src={`${solutionObjectUrl}#page=${solutionPageStart ?? page}`}
            />
            <a
              className="button-link"
              href={`${solutionObjectUrl}#page=${solutionPageStart ?? page}`}
              target="_blank"
              rel="noreferrer"
            >
              Lösung in nativer PDF-Ansicht öffnen
            </a>
          </article>
        )}
      </div>
    </section>
  );
}
