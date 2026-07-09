import { describe, expect, it } from 'vitest';
import trainers from '../../src/content/generated/graph-tracing-trainers.json';
import { GraphTracingTrainerSchema } from '../../src/content/schemas';
import {
  canonicalPrimAnswer,
  canonicalPrimStructuredAnswer,
  canonicalEdgeId,
  deriveGraphTracingMastery,
  edgeListToInput,
  enumerateMsts,
  evaluatePrimAnswer,
  isMinimumSpanningTree,
  keyRowToInput,
  normalizeUndirectedEdge,
  parentRowToInput,
  parseUndirectedEdgeList,
  primKeyTableToInput,
  primParentTableToInput,
  primSelectedEdges,
  primSelectedVertices,
  primTotalWeight,
  solvePrim,
  validateSpanningTree,
} from '../../src/domain/graph-tracing';

const trainer = GraphTracingTrainerSchema.parse(
  trainers.find((candidate) => candidate.id === 'trainer-graph-prim-mst-v1'),
);
const problem = trainer.problem;
if (problem.algorithm !== 'prim') throw new Error('Prim-Fixture fehlt.');

describe('Prim-MST-Graph-Tracing', () => {
  it('berechnet die kanonische Prim-Spur deterministisch', () => {
    const steps = solvePrim(problem);
    expect(steps.map((step) => step.selectedVertex)).toEqual([null, 'A', 'B', 'D', 'E', 'C', 'F']);
    expect(steps.at(-1)?.selectedEdges).toEqual(['A-B', 'B-D', 'D-E', 'B-C', 'D-F']);
    expect(steps.at(-1)?.totalWeight).toBe(18);
    expect(primSelectedVertices(problem)).toBe('A, B, D, E, C, F');
    expect(primSelectedEdges(problem)).toBe('A-B, B-D, D-E, B-C, D-F');
    expect(primTotalWeight(problem)).toBe(18);
    expect(primKeyTableToInput(problem)).toContain('6: A=0 B=2 C=4 D=3 E=1 F=8');
    expect(primParentTableToInput(problem)).toContain('6: A=NIL B=A C=B D=B E=D F=D');
    expect(canonicalPrimStructuredAnswer(problem).selectedEdges).toBe(
      canonicalPrimAnswer(problem).selectedEdges,
    );
  });

  it('validiert MST-Endbäume unabhängig vom Prim-Trace', () => {
    const oracle = enumerateMsts(problem.vertices, problem.edges);
    expect(oracle.status).toBe('ok');
    expect(oracle.minimumWeight).toBe(18);
    expect(
      isMinimumSpanningTree(problem.vertices, problem.edges, ['A-B', 'B-D', 'D-E', 'B-C', 'D-F']),
    ).toBe(true);
    const cyclic = validateSpanningTree(problem.vertices, problem.edges, [
      'A-B',
      'B-C',
      'A-C',
      'D-E',
      'D-F',
    ]);
    expect(cyclic.isTree).toBe(false);
  });

  it('normalisiert Kanten und Tabellenzeilen robust', () => {
    expect(canonicalEdgeId('B', 'A')).toBe('A-B');
    expect(normalizeUndirectedEdge('{B,A}')).toBe('A-B');
    expect(normalizeUndirectedEdge('kaputt')).toBe('kaputt');
    expect(parseUndirectedEdgeList('{B,A}; C-D\nE-F')).toEqual(['A-B', 'C-D', 'E-F']);
    expect(edgeListToInput(['A-B', 'B-C'])).toBe('A-B, B-C');
    expect(keyRowToInput(['A', 'B'], { A: 0, B: null })).toBe('A=0 B=∞');
    expect(parentRowToInput(['A', 'B'], { A: null, B: 'A' })).toBe('A=NIL B=A');
  });

  it('deckt Oracle-Grenzfälle ab', () => {
    expect(enumerateMsts([], [])).toEqual({
      status: 'no_spanning_tree',
      minimumWeight: null,
      trees: [],
    });
    expect(enumerateMsts(['A'], [])).toEqual({
      status: 'ok',
      minimumWeight: 0,
      trees: [[]],
    });
    expect(
      enumerateMsts(
        ['A', 'B', 'C'],
        [
          { from: 'A', to: 'B', weight: 1 },
          { from: 'B', to: 'C', weight: 1 },
          { from: 'A', to: 'C', weight: 1 },
        ],
      ),
    ).toMatchObject({ status: 'ok', minimumWeight: 2 });
    expect(enumerateMsts(['A', 'B', 'C'], [{ from: 'A', to: 'B', weight: 1 }])).toMatchObject({
      status: 'no_spanning_tree',
      minimumWeight: null,
    });
    expect(
      enumerateMsts(
        ['A', 'B', 'C', 'D'],
        [
          { from: 'A', to: 'B', weight: 1 },
          { from: 'B', to: 'C', weight: 2 },
          { from: 'C', to: 'D', weight: 3 },
          { from: 'A', to: 'D', weight: 4 },
        ],
        0,
      ),
    ).toEqual({ status: 'not_checked_too_large', minimumWeight: null, trees: [] });
  });

  it('erkennt ungültige und nicht minimale Baumkandidaten differenziert', () => {
    const unknown = validateSpanningTree(problem.vertices, problem.edges, [
      'A-B',
      'B-D',
      'D-E',
      'B-C',
      'X-Y',
    ]);
    expect(unknown.isTree).toBe(false);
    expect(unknown.isAcyclic).toBe(false);

    const malformed = validateSpanningTree(problem.vertices, problem.edges, [
      'A-B',
      'B-D',
      'D-E',
      'B-C',
      'kaputt',
    ]);
    expect(malformed.isTree).toBe(false);

    expect(isMinimumSpanningTree(problem.vertices, problem.edges, ['A-B'])).toBe(false);
    expect(
      isMinimumSpanningTree(problem.vertices, problem.edges, ['A-B', 'A-C', 'C-E', 'E-F', 'B-D']),
    ).toBe(false);
  });

  it('terminiert bei nicht zusammenhängender Prim-Eingabe ohne erfundenen Spannbaum', () => {
    const disconnected = {
      ...problem,
      vertices: ['A', 'B', 'C'],
      vertexOrder: ['A', 'B', 'C'],
      startVertex: 'A',
      edges: [{ from: 'A', to: 'B', weight: 1 }],
    };
    const steps = solvePrim(disconnected);
    expect(steps.map((step) => step.selectedVertex)).toEqual([null, 'A', 'B']);
    expect(steps.at(-1)?.selectedEdges).toEqual(['A-B']);
  });

  it('bewertet die kanonische Antwort voll und erkennt falsches Gewicht', () => {
    const full = evaluatePrimAnswer(problem, canonicalPrimAnswer(problem));
    expect(full.points).toBe(40);
    expect(full.errors).toHaveLength(0);

    const broken = evaluatePrimAnswer(problem, {
      ...canonicalPrimAnswer(problem),
      totalWeight: '19',
      selectedEdges: 'A-B, A-C, C-D, D-E, D-F',
    });
    expect(broken.points).toBeLessThan(40);
    expect(broken.errors.map((error) => error.errorCode)).toContain('prim_total_weight_wrong');
    expect(broken.errors.map((error) => error.errorCode)).toContain('prim_not_minimum_weight');
  });

  it('bewertet fehlende Begründung, falschen Start und Tabellenfehler separat', () => {
    const broken = evaluatePrimAnswer(problem, {
      ...canonicalPrimAnswer(problem),
      startVertex: 'B',
      selectedVertices: 'A, D, B',
      keyTable: '0: A=0',
      parentTable: '0: A=NIL',
      safeEdgeExplanation: 'lokal klein',
      runtime: 'O(n^2)',
    });
    expect(broken.errors.map((error) => error.errorCode)).toEqual(
      expect.arrayContaining([
        'prim_start_wrong',
        'prim_vertex_order_wrong',
        'prim_key_table_wrong',
        'prim_parent_table_wrong',
        'prim_safe_edge_explanation_missing',
        'prim_runtime_wrong',
      ]),
    );
  });

  it('leitet Mastery V11 aus Prim-Rubrikergebnissen ab', () => {
    const result = evaluatePrimAnswer(problem, canonicalPrimAnswer(problem));
    const mastery = deriveGraphTracingMastery(result);
    expect(mastery.modelVersion).toBe('mastery-v11');
    expect(mastery.dimensions.prim_sichere_kante).toBe(1);
  });
});
