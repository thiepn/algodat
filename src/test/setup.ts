import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value(contextId: string) {
      if (contextId !== '2d') return null;
      return {
        canvas: this,
        clearRect: () => undefined,
        fillRect: () => undefined,
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        measureText: (text: string) => ({ width: text.length * 8 }),
        putImageData: () => undefined,
      };
    },
  });
}
