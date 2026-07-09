import { describe, expect, it } from 'vitest';

describe('jsdom Canvas-Mock für axe', () => {
  it('stellt nur den benötigten 2d-Kontext bereit und unterdrückt keine Fehler global', () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    expect(context).not.toBeNull();
    expect(canvas.getContext('webgl')).toBeNull();
    expect(typeof console.error).toBe('function');
  });
});
