import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CheatSheetBlock, CheatSheetDocument, CheatSheetMode } from '../../domain/cheat-sheet';
import {
  createCheatSheet,
  deleteCheatSheet,
  duplicateCheatSheet,
  getCheatSheet,
  listCheatSheetBlocks,
  listCheatSheetPresets,
  listCheatSheets,
  updateCheatSheetBlocks,
} from './cheat-sheet-service';

const modeLabels: Record<CheatSheetMode, string> = {
  standard: 'Standard',
  weakness: 'Schwächenorientiert',
  slot: 'Klausurslot-orientiert',
  manual: 'Manuell',
  minimal: 'Minimal',
};

export function CheatSheetLandingPage() {
  const [sheets, setSheets] = useState<CheatSheetDocument[]>([]);
  useEffect(() => void listCheatSheets().then(setSheets), []);
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Phase 16 · A4-Spickzettel</p>
        <h1>A4-Spickzettel</h1>
        <p>
          Erstelle lokal einen quellengebundenen, druckbaren zweiseitigen A4-Spickzettel. Die
          Inhalte sind kurze Referenzblöcke und keine historischen Originalaufgaben.
        </p>
      </header>
      <div className="button-row">
        <Link className="button-link" to="/spickzettel/neu">
          Neuen Spickzettel erstellen
        </Link>
        <Link className="button-link" to="/spickzettel/vorlagen">
          Vorlagen ansehen
        </Link>
      </div>
      <section className="card-grid">
        {sheets.map((sheet) => (
          <article className="card" key={sheet.sheetId}>
            <span className="status-badge status-badge--info">{modeLabels[sheet.mode]}</span>
            <h2>{sheet.title}</h2>
            <p>
              {sheet.selectedBlockIds.length} Blöcke · Status {sheet.validationStatus} · zuletzt{' '}
              {new Date(sheet.updatedAt).toLocaleString('de-DE')}
            </p>
            <Link className="button-link" to={`/spickzettel/${sheet.sheetId}`}>
              Öffnen
            </Link>
          </article>
        ))}
      </section>
      {sheets.length === 0 && (
        <p className="notice">Noch kein Spickzettel gespeichert. Starte mit einer Vorlage.</p>
      )}
    </div>
  );
}

export function CheatSheetNewPage() {
  const navigate = useNavigate();
  const presets = listCheatSheetPresets();
  const create = async (mode: CheatSheetMode) => {
    const sheet = await createCheatSheet(mode);
    await navigate(`/spickzettel/${sheet.sheetId}`);
  };
  return (
    <div className="page-flow">
      <Link className="back-link" to="/spickzettel">
        ← Spickzettel
      </Link>
      <header className="page-header">
        <h1>Spickzettel-Modus wählen</h1>
        <p>Alle Modi bleiben lokal, nicht-generativ und auf zwei A4-Seiten begrenzt.</p>
      </header>
      <section className="card-grid">
        {presets.map((preset) => (
          <article className="card" key={preset.presetId}>
            <h2>{preset.title}</h2>
            <p>{preset.description}</p>
            <p className="notice">{preset.priorityHint}</p>
            <button type="button" onClick={() => void create(preset.mode)}>
              {preset.title} erstellen
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export function CheatSheetTemplatesPage() {
  return (
    <div className="page-flow">
      <header className="page-header">
        <h1>Spickzettel-Vorlagen</h1>
        <p>Vorlagen bestimmen nur die Auswahlpriorität. Die Druckgrenze bleibt immer gleich.</p>
      </header>
      <section className="card-grid">
        {listCheatSheetPresets().map((preset) => (
          <article className="card" key={preset.presetId}>
            <h2>{preset.title}</h2>
            <p>{preset.description}</p>
            <p>{preset.maxBlocks} maximale Blöcke.</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function CheatSheetEditorPage() {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<CheatSheetDocument | undefined>();
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const blocks = listCheatSheetBlocks();
  const blocksById = useMemo(
    () => new Map(blocks.map((block) => [block.blockId, block])),
    [blocks],
  );
  useEffect(() => {
    if (!sheetId) return;
    void getCheatSheet(sheetId).then((loaded) => {
      setSheet(loaded);
      setSelected(loaded?.selectedBlockIds ?? []);
      setExpanded(loaded?.lockedBlockIds ?? []);
    });
  }, [sheetId]);
  if (!sheet) return <Missing title="Spickzettel nicht gefunden" to="/spickzettel" />;
  const save = async () => {
    const updated = await updateCheatSheetBlocks(
      sheet,
      selected,
      expanded.filter((blockId) => selected.includes(blockId)),
    );
    setSheet(updated);
    setSelected(updated.selectedBlockIds);
    setExpanded(updated.lockedBlockIds);
  };
  const moveSelectedBlock = (blockId: string, direction: -1 | 1) => {
    setSelected((current) => {
      const index = current.indexOf(blockId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target] as string, next[index] as string];
      return next;
    });
  };
  const duplicate = async () => {
    const copy = await duplicateCheatSheet(sheet);
    await navigate(`/spickzettel/${copy.sheetId}`);
  };
  const remove = async () => {
    await deleteCheatSheet(sheet.sheetId);
    await navigate('/spickzettel');
  };
  return (
    <div className="page-flow">
      <Link className="back-link" to="/spickzettel">
        ← Spickzettel
      </Link>
      <header className="page-header">
        <p className="eyebrow">{modeLabels[sheet.mode]}</p>
        <h1>{sheet.title}</h1>
        <p>
          {sheet.selectedBlockIds.length} Blöcke · {sheet.sourceSummary.length} Quellenanker ·{' '}
          {sheet.validationStatus}
        </p>
      </header>
      <div className="button-row">
        <button type="button" onClick={() => void save()}>
          Auswahl speichern
        </button>
        <button type="button" onClick={() => void duplicate()}>
          Duplizieren
        </button>
        <button type="button" onClick={() => void remove()}>
          Löschen
        </button>
        <Link className="button-link" to={`/spickzettel/${sheet.sheetId}/vorschau`}>
          Vorschau
        </Link>
        <Link className="button-link" to={`/spickzettel/${sheet.sheetId}/drucken`}>
          Drucken
        </Link>
      </div>
      <section>
        <h2>Blockkatalog</h2>
        <div className="card-grid">
          {blocks.map((block) => (
            <BlockToggle
              key={block.blockId}
              block={block}
              checked={selected.includes(block.blockId)}
              onChange={(checked) =>
                setSelected((current) =>
                  checked
                    ? [...current, block.blockId]
                    : current.filter((blockId) => blockId !== block.blockId),
                )
              }
            />
          ))}
        </div>
      </section>
      <section aria-labelledby="selected-blocks-title">
        <h2 id="selected-blocks-title">Gewählte Reihenfolge und Varianten</h2>
        <p>
          Verschiebe Blöcke mit Tastaturbuttons. „Erweitert bevorzugen“ versucht die ausführlichere
          Variante, fällt bei Platzmangel aber auf kompakt zurück.
        </p>
        {selected.length ? (
          <ol className="stack">
            {selected.map((blockId, index) => {
              const block = blocksById.get(blockId);
              if (!block) return null;
              return (
                <li className="card" key={blockId}>
                  <strong>{block.title}</strong>
                  <p>
                    Aktuelle Variante:{' '}
                    {sheet.blockVariants[blockId] === 'expanded' ? 'erweitert' : 'kompakt'}
                  </p>
                  <div className="button-row">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSelectedBlock(blockId, -1)}
                    >
                      {block.title} nach oben
                    </button>
                    <button
                      type="button"
                      disabled={index === selected.length - 1}
                      onClick={() => moveSelectedBlock(blockId, 1)}
                    >
                      {block.title} nach unten
                    </button>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={expanded.includes(blockId)}
                        onChange={(event) =>
                          setExpanded((current) =>
                            event.target.checked
                              ? [...current, blockId]
                              : current.filter((candidate) => candidate !== blockId),
                          )
                        }
                      />
                      Erweiterte Variante bevorzugen
                    </label>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="notice">Noch keine Blöcke ausgewählt.</p>
        )}
      </section>
    </div>
  );
}

export function CheatSheetPreviewPage() {
  const { sheetId } = useParams();
  const [sheet, setSheet] = useState<CheatSheetDocument | undefined>();
  useEffect(() => {
    if (sheetId) void getCheatSheet(sheetId).then(setSheet);
  }, [sheetId]);
  if (!sheet) return <Missing title="Vorschau nicht gefunden" to="/spickzettel" />;
  return (
    <div className="page-flow">
      <Link className="back-link" to={`/spickzettel/${sheet.sheetId}`}>
        ← Bearbeiten
      </Link>
      <header className="page-header">
        <h1>Vorschau: {sheet.title}</h1>
        <p>Die Vorschau verwendet dieselben Platzierungen wie die Druckansicht.</p>
      </header>
      <CheatSheetPrintSurface sheet={sheet} />
    </div>
  );
}

export function CheatSheetPrintPage() {
  const { sheetId } = useParams();
  const [sheet, setSheet] = useState<CheatSheetDocument | undefined>();
  useEffect(() => {
    if (sheetId) void getCheatSheet(sheetId).then(setSheet);
  }, [sheetId]);
  if (!sheet) return <Missing title="Druckansicht nicht gefunden" to="/spickzettel" />;
  return (
    <div className="page-flow cheat-sheet-print-route">
      <header className="page-header no-print">
        <h1>{sheet.title}</h1>
        <p>Druckansicht mit zwei A4-Seiten, Quellenankern und browserbasiertem Druck.</p>
      </header>
      <div className="button-row no-print">
        <Link className="button-link" to={`/spickzettel/${sheet.sheetId}`}>
          Zurück
        </Link>
        <button type="button" onClick={() => window.print()}>
          Browser-Druck öffnen
        </button>
      </div>
      <CheatSheetPrintSurface sheet={sheet} />
    </div>
  );
}

export function CheatSheetSettingsPage() {
  return (
    <div className="page-flow">
      <header className="page-header">
        <h1>Spickzettel-Einstellungen</h1>
        <p>Phase 16 fixiert A4, zwei Seiten, Duplex-Annahme und monochrom verständliches Layout.</p>
      </header>
      <ul>
        <li>Mindestschriftgröße: 7,5 pt.</li>
        <li>Keine automatische Schrumpfung unter die Mindestgröße.</li>
        <li>Browserbasierter Druck; keine Server-PDF-Erzeugung.</li>
      </ul>
    </div>
  );
}

function BlockToggle({
  block,
  checked,
  onChange,
}: {
  block: CheatSheetBlock;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <article className="card">
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <strong>{block.title}</strong>
      </label>
      <p>{block.compactContent.join(' ')}</p>
      <p className="notice">
        Aufgabe {block.examTaskNumbers.join(', ')} · {block.sourceRefs.length} Quellenanker
      </p>
    </article>
  );
}

function CheatSheetPrintSurface({ sheet }: { sheet: CheatSheetDocument }) {
  const blocksById = useMemo(
    () => new Map(listCheatSheetBlocks().map((block) => [block.blockId, block])),
    [],
  );
  const pages = [1, 2].map((page) => ({
    page,
    placements: sheet.placements
      .filter((placement) => placement.page === page)
      .sort((left, right) => left.order - right.order),
  }));
  return (
    <section className="cheat-sheet-pages" aria-label="Zweiseitiger A4-Spickzettel">
      {pages.map((page) => (
        <article className="cheat-sheet-page" key={page.page}>
          <header>
            <p className="eyebrow">A4-Seite {page.page}/2 · Quellengebundene Referenz</p>
            <h2>{sheet.title}</h2>
          </header>
          <div className="cheat-sheet-blocks">
            {page.placements.map((placement) => {
              const block = blocksById.get(placement.blockId);
              if (!block) return null;
              const lines =
                placement.variant === 'expanded'
                  ? [...block.compactContent, ...block.optionalExpandedContent]
                  : block.compactContent;
              return (
                <section className="cheat-sheet-block" key={placement.blockId}>
                  <h3>{block.title}</h3>
                  <ul>
                    {lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="source-note">
                    Quellen:{' '}
                    {block.sourceRefs.map((ref) => `${ref.sourceId}, S. ${ref.page}`).join('; ')}
                  </p>
                </section>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
}

function Missing({ title, to }: { title: string; to: string }) {
  return (
    <section className="page-flow">
      <h1>{title}</h1>
      <Link to={to}>Zurück</Link>
    </section>
  );
}
