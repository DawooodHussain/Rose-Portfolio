import { clamp01 } from '../util';

// One asterisk for the caption + stat screens: it arrives at the bottom with the caption screen,
// travels to the top (one full turn) as the stat screen comes in, sits there, and leaves with it.
// Returns the function that places it for the current scroll position.
export function createRoamMark(roam: SVGSVGElement, interlude: HTMLElement, statStory: HTMLElement, reducedMotion: boolean) {
	return () => {
		const vh = innerHeight;
		// Unrotated size (the bounding box of a rotated star is larger).
		const size = roam.clientHeight || 56;
		const bottomY = vh - 40 - size;
		const topY = 16;
		const start = interlude.offsetTop;
		const end = statStory.offsetTop + statStory.offsetHeight - vh;
		const y0 = scrollY;
		let y;
		if (y0 < start) y = bottomY + (start - y0); // arriving with the caption screen
		else if (y0 < start + vh) y = bottomY + (topY - bottomY) * ((y0 - start) / vh); // bottom → top
		else if (y0 <= end) y = topY; // sits at the top of the stat screen
		else y = topY - (y0 - end); // leaves with the stat screen
		// One full turn during the bottom → top travel, so it's upright whenever a screen is at rest.
		const rot = reducedMotion ? 0 : clamp01((y0 - start) / vh) * 360;
		roam.style.transform = `translate(-50%, ${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
	};
}
