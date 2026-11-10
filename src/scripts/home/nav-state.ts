import { $ } from '../util';

// A thin band across the middle of the screen: whichever section crosses it is "current".
const MIDDLE_BAND = '-45% 0px -55% 0px';

// Calls onChange(true) while any of the targets crosses the band, onChange(false) once none do.
function watchAny(targets: Iterable<Element>, rootMargin: string, onChange: (any: boolean) => void) {
	const seen = new Set<Element>();
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
			onChange(seen.size > 0);
		},
		{ rootMargin },
	);
	for (const el of targets) io.observe(el);
}

export function initNavState() {
	// "About" gets its oval outline while any About-area screen is in view; "Hello" while Hello is.
	const aboutLink = $('.nav-group a[href="#about"]');
	const helloLink = $('.nav-group a[href="#hello"]');
	watchAny(document.querySelectorAll('.about-screen, .stat-story, .facts'), MIDDLE_BAND, (on) =>
		aboutLink.setAttribute('aria-current', String(on)),
	);
	watchAny([$('#hello')], MIDDLE_BAND, (on) => helloLink.setAttribute('aria-current', String(on)));

	// Nav colour: milk while a dark-chapter screen is under the nav (a thin band at the top of the screen).
	// The band starts 1px down: on Hello (the last screen, so the page can't scroll further) the stat
	// screen ends exactly at the top, and IntersectionObserver counts a touching edge as intersecting.
	watchAny(document.querySelectorAll('.interlude, .stat-story'), '-1px 0px -95% 0px', (on) =>
		document.documentElement.classList.toggle('on-dark', on),
	);
}
