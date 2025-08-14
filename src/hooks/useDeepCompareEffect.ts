import { useEffect, useRef, EffectCallback } from 'react';

function isObject(obj: unknown): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object';
}

function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;

  if (!isObject(a) || !isObject(b)) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

export function useDeepCompareEffect(effect: EffectCallback, dependencies: any[]) {
  const previousDeps = useRef<any[]>([]);

  if (!deepEqual(previousDeps.current, dependencies)) {
    previousDeps.current = dependencies;
  }

  useEffect(effect, [previousDeps.current]);
}
