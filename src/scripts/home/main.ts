// Entry point for the home page: wires up each behaviour module.
import { $, prefersReducedMotion } from '../util';
import { initCopyButtons } from './copy-email';
import { initLeaves } from './leaves';
import { initMenu } from './menu';
import { initNavState } from './nav-state';
import { initReveal } from './reveal';
import { createRoamMark } from './roam-mark';
import { createStatStory } from './stat-story';
import { initPageTransitions } from './transitions';

const reducedMotion = prefersReducedMotion();

initReveal(document.querySelectorAll('.about-para, .facts'));
initNavState();
initCopyButtons();
const menu = initMenu();
initPageTransitions({ isMenuOpen: menu.isOpen });

if (!reducedMotion) initLeaves($('.leaf-field'));

// Scroll-driven pieces: the roaming asterisk always; the stat story only with motion
// (under reduced motion it's a plain screen, see stat.css).
const statStory = $('.stat-story');
const placeRoam = createRoamMark($<SVGSVGElement>('.roam-mark'), $('.interlude'), statStory, reducedMotion);
const stat = reducedMotion ? null : createStatStory(statStory);

let queued = false;
addEventListener(
	'scroll',
	() => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			placeRoam();
			stat?.update();
		});
	},
	{ passive: true },
);

const remeasure = () => {
	placeRoam();
	if (!stat) return;
	stat.measure();
	stat.update(true);
};
addEventListener('resize', remeasure);
document.fonts.ready.then(remeasure);
