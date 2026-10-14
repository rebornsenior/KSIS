import type { CSSProperties } from 'react';

export function textAlignment(value: unknown): CSSProperties {
  return value === 'left' || value === 'center' || value === 'right' || value === 'justify'
    ? { textAlign: value } : {};
}

export function headingAlignment(value: unknown): CSSProperties {
  if (value === 'center' || value === 'right') {
    return {
      textAlign: value,
      width: 'fit-content',
      maxWidth: '100%',
      marginLeft: 'auto',
      marginRight: value === 'center' ? 'auto' : 0,
    };
  }
  return textAlignment(value);
}

export function quoteAlignment(value: unknown): CSSProperties {
  return {
    ...textAlignment(value),
    width: value === 'justify' ? '100%' : 'fit-content',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
    ...(value === 'center' || value === 'right'
      ? { marginLeft: 'auto', marginRight: value === 'center' ? 'auto' : 0 }
      : {}),
  };
}

export function imageAlignment(value: unknown): CSSProperties {
  return value === 'center' || value === 'right'
    ? { marginLeft: 'auto', marginRight: value === 'center' ? 'auto' : 0 }
    : {};
}
