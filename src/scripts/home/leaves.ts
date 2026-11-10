import { rand } from '../util';

// Falling leaves on the caption screen: a tiny physics loop, not keyframes.
//  - A strong gust throws each leaf in from the left; air drag bleeds that speed off smoothly
//    until only a light breeze carries it (no stop, just slowing down).
//  - Gravity pulls it down slowly, to a low terminal speed, like a light leaf.
//  - Flutter: it swings side to side, tilts into each swing and flips in 3D while it falls.
// Leaves enter from the left edge and are recycled once they leave the screen.
// Runs only while the field is visible. The caller skips it under reduced motion.

const SOURCES = ['/flowers/leaf-a.webp', '/flowers/leaf-b.webp', '/flowers/leaf-c.webp'];
const COUNT = 7;

interface Leaf {
	img: HTMLImageElement;
	size: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	wait: number; // seconds before its gust, so they arrive one by one
	fall: number; // terminal falling speed, px/s
	phase: number;
	freq: number; // flutter, rad/s
	swing: number; // side-to-side swing, px
	tilt: number;
	flipK: number;
}

export function initLeaves(field: HTMLElement) {
	const leaves = Array.from({ length: COUNT }, (_, i) => {
		const img = new Image();
		img.src = SOURCES[i % SOURCES.length];
		img.alt = '';
		field.append(img);
		return { img } as Leaf;
	});

	let W = 0;
	let H = 0;
	let t = 0;
	let last = 0;
	let raf = 0;

	const spawn = (l: Leaf, wait: number) => {
		l.size = rand(26, 52) * (l.img.src.includes('leaf-b') ? 1.4 : 1);
		l.img.style.width = `${l.size.toFixed(0)}px`;
		l.x = -l.size * 2;
		l.wait = wait;
		l.img.style.transform = `translate3d(${l.x}px, 0, 0)`;
		l.y = rand(0.02, 0.4) * H;
		l.vx = rand(700, 1150); // the gust
		l.vy = rand(-15, 0);
		l.fall = rand(22, 40);
		l.phase = rand(0, Math.PI * 2);
		l.freq = rand(1.4, 2.6);
		l.swing = rand(14, 30);
		l.tilt = rand(-40, 40);
		l.flipK = rand(0.5, 0.9);
	};

	const step = (now: number) => {
		const dt = Math.min(0.05, (now - (last || now)) / 1000);
		last = now;
		t += dt;
		// After the gust: a light breeze that slowly swells and fades.
		const wind = 22 + 12 * Math.sin(t * 0.37) + 6 * Math.sin(t * 0.91 + 1.3);
		for (const l of leaves) {
			if (l.wait > 0) {
				l.wait -= dt;
				continue;
			}
			l.phase += l.freq * dt;
			const s = Math.sin(l.phase);
			l.vx += (wind - l.vx) * 1.3 * dt; // air drag
			// Falls faster mid-swing, slower (even lifts a little) at the ends of each swing.
			l.vy += (l.fall * (1 - 0.6 * Math.abs(Math.cos(l.phase))) - l.vy) * 0.8 * dt;
			l.x += l.vx * dt;
			l.y += l.vy * dt;
			const x = l.x + l.swing * s;
			const rot = l.tilt + 28 * Math.cos(l.phase);
			const flipX = 55 * Math.sin(l.phase * l.flipK);
			const flipY = 35 * Math.cos(l.phase * 0.6);
			l.img.style.transform = `translate3d(${x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) rotateX(${flipX.toFixed(1)}deg) rotateY(${flipY.toFixed(1)}deg)`;
			if (l.x > W + l.size * 2 || l.y > H + l.size * 2) spawn(l, rand(0.5, 4));
		}
		raf = requestAnimationFrame(step);
	};

	const size = () => ({ width: W, height: H } = field.getBoundingClientRect());
	size();
	leaves.forEach((l, i) => spawn(l, i * rand(0.5, 1.1)));
	addEventListener('resize', size);
	new IntersectionObserver(([e]) => {
		cancelAnimationFrame(raf);
		last = 0;
		if (e.isIntersecting) raf = requestAnimationFrame(step);
	}).observe(field);
}
