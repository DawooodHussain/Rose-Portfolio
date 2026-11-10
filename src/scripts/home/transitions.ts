import { $, prefersReducedMotion } from '../util';

// In-page links scroll without adding #hash to the URL. Two of them play the chevron wipe:
//  - About, from the hero (also when you scroll down from the hero)
//  - Hello, from anywhere
// The wipe covers the screen, the page jumps underneath it, and the wipe's copy of the
// target's content hands off to the real one. Focus moves to the target for keyboard users.

type WipeKind = 'about' | 'hello';

export function initPageTransitions({ isMenuOpen }: { isMenuOpen: () => boolean }) {
	const root = document.documentElement;
	const hero = $('#top');
	const about = $('#about');
	const hello = $('#hello');

	// The Hello wipe carries a copy of the Hello screen's content (without ids).
	const wipeHello = $('.wipe-hello');
	for (const el of hello.querySelectorAll('.hello-inner, .hello-corners')) {
		const copy = el.cloneNode(true) as Element;
		copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
		wipeHello.append(copy);
	}

	const atHero = () => scrollY < hero.offsetHeight / 2;
	const wiping = () => root.classList.contains('wiping');
	const canWipeFromHero = () => atHero() && !prefersReducedMotion() && !isMenuOpen();
	const focusTarget = (t: HTMLElement) => {
		t.setAttribute('tabindex', '-1');
		t.focus({ preventScroll: true });
	};

	// A trackpad flick keeps sending wheel events after the fingers lift (momentum), with a
	// steadily shrinking delta. After a scroll-triggered wipe, swallow only that shrinking tail,
	// so the page doesn't fly past About. Any new scroll (a delta that grows again, as a fresh
	// swipe or a mouse-wheel click does) is let through at once. Clicks never lock.
	let momentumUntil = 0;
	let lastDelta = 0;

	const playWipe = (kind: WipeKind, target: HTMLElement, fromScroll = false) => {
		root.dataset.wipe = kind;
		root.classList.add('wiping');
		$(`.wipe-${kind}`).addEventListener(
			'animationend',
			() => {
				scrollTo({ top: target.offsetTop, behavior: 'instant' });
				root.classList.remove('wiping');
				momentumUntil = fromScroll ? performance.now() + 1200 : 0;
				focusTarget(target);
			},
			{ once: true },
		);
	};

	const goTo = (t: HTMLElement) => {
		if (wiping()) return;
		const reduced = prefersReducedMotion();
		if (!reduced && t === about && atHero()) playWipe('about', about);
		else if (!reduced && t === hello && Math.abs(scrollY - hello.offsetTop) > 4) playWipe('hello', hello);
		else {
			t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
			focusTarget(t);
		}
	};

	document.addEventListener('click', (e) => {
		const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
		const t = a && document.getElementById(a.hash.slice(1));
		if (!t) return;
		e.preventDefault();
		goTo(t);
	});

	// Scrolling down from the hero plays the About wipe instead of a plain scroll.
	const scrollFromHero = (e: Event) => {
		e.preventDefault();
		if (!wiping()) playWipe('about', about, true);
	};

	addEventListener(
		'wheel',
		(e) => {
			const delta = Math.abs(e.deltaY);
			const isMomentum = delta < lastDelta || (delta <= 2 && lastDelta <= 2);
			lastDelta = delta;
			if (wiping()) return e.preventDefault(); // the 0.9s wipe itself: the page must stay still under it
			if (performance.now() < momentumUntil) {
				if (isMomentum) return e.preventDefault();
				momentumUntil = 0; // a real scroll: stop swallowing
			}
			if (e.deltaY > 0 && canWipeFromHero()) scrollFromHero(e);
		},
		{ passive: false },
	);

	let touchY: number | null = null;
	addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
	addEventListener(
		'touchmove',
		(e) => {
			if (wiping()) return e.preventDefault();
			if (touchY === null || !canWipeFromHero()) return;
			if (touchY - e.touches[0].clientY > 24) {
				touchY = null;
				scrollFromHero(e);
			}
		},
		{ passive: false },
	);

	addEventListener('keydown', (e) => {
		const scrollKey = ['ArrowDown', 'PageDown', ' '].includes(e.key);
		if (!scrollKey || e.altKey || e.ctrlKey || e.metaKey) return;
		if ((e.target as Element).closest('button, input, textarea, select, [contenteditable]')) return;
		if (wiping()) return e.preventDefault();
		if (canWipeFromHero()) scrollFromHero(e);
	});
}
