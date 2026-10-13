import type { CSSProperties } from 'react';

export function textAlignment(value: unknown): CSSProperties {
  return value === 'left' || value === 'center' || value === 'right' || value === 'justify'
    ? { textAlign: value } : {};
}
