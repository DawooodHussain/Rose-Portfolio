// Small helpers shared by the page scripts.

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

// querySelector for elements the markup always renders (a missing one is a bug, not a state).
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
	root.querySelector<T>(selector)!;
