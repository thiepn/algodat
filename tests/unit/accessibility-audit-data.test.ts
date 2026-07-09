import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import keyboardAudit from '../../data/accessibility-keyboard-audit.json';
import treeAudit from '../../data/accessibility-tree-audit.json';

const AuditResultSchema = z.enum(['passed', 'limited_not_public_route']);
const SeveritySchema = z.enum(['none', 'minor', 'major', 'blocking']);

const KeyboardAuditEntrySchema = z.object({
  flowId: z.string().min(1),
  stepId: z.string().min(1),
  route: z.string().min(1),
  control: z.string().min(1),
  expectedKeyboardAction: z.string().min(1),
  expectedFocusTarget: z.string().min(1),
  result: AuditResultSchema,
  severity: SeveritySchema,
  evidence: z.string().min(1),
  testType: z.string().min(1),
});

const KeyboardAuditSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  releaseCandidate: z.literal('1.0.0-rc.2'),
  auditType: z.literal('manual_non_screenreader_accessibility_audit'),
  auditedAt: z.string().min(1),
  realScreenreaderTest: z.literal('not_executed'),
  finalScreenreaderGate: z.literal('open'),
  entries: z.array(KeyboardAuditEntrySchema).min(8),
});

const TreeRouteSchema = z.object({
  route: z.string().min(1),
  title: z.string().min(1),
  language: z.literal('de'),
  landmarks: z.array(z.string().min(1)).min(1),
  headingsChecked: z.literal(true),
  interactiveNamesChecked: z.literal(true),
  ariaReferencesChecked: z.literal(true),
  axeViolations: z.literal(0),
  result: z.literal('passed'),
  evidence: z.string().min(1),
});

const AccessibilityTreeAuditSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  releaseCandidate: z.literal('1.0.0-rc.2'),
  auditType: z.literal('browser_accessibility_tree_fallback'),
  auditedAt: z.string().min(1),
  realScreenreaderTest: z.literal('not_executed'),
  finalScreenreaderGate: z.literal('open'),
  routes: z.array(TreeRouteSchema).min(6),
  specialStructures: z
    .array(
      z.object({
        type: z.string().min(1),
        requirement: z.string().min(1),
        result: z.literal('passed'),
        evidence: z.string().min(1),
      }),
    )
    .min(4),
  limitations: z.array(z.string().min(1)).min(1),
});

describe('Accessibility-Fallback-Auditdaten', () => {
  it('validiert die Keyboard-only-Testmatrix', () => {
    const parsed = KeyboardAuditSchema.parse(keyboardAudit);
    expect(parsed.entries.some((entry) => entry.flowId === 'cheat-sheet')).toBe(true);
    expect(parsed.entries.some((entry) => entry.severity === 'blocking')).toBe(false);
    expect(parsed.entries.some((entry) => entry.severity === 'major')).toBe(false);
  });

  it('validiert den Accessibility-Tree-Fallback-Audit', () => {
    const parsed = AccessibilityTreeAuditSchema.parse(treeAudit);
    expect(parsed.routes.map((route) => route.route)).toContain('/spickzettel');
    expect(parsed.realScreenreaderTest).toBe('not_executed');
    expect(parsed.finalScreenreaderGate).toBe('open');
  });
});
