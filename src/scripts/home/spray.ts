import { rand } from '../util';

// Ink drops thrown by a splash: a small pool of spans, reused.

export interface View {
	W: number;
	H: number;
}

export const gravity = (H: number) => 3.4 * H; // px/s²

interface Drop {
	el: HTMLSpanElement;
	alive: boolean;
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
}

export function createSpray(stage: HTMLElement, view: View, poolSize = 32) {
	const layer = document.createElement('div');
	layer.className = 'spray';
	layer.setAttribute('aria-hidden', 'true');
	stage.append(layer);
	const drops = Array.from({ length: poolSize }, () => {
		const el = document.createElement('span');
		el.className = 'drop';
		layer.append(el);
		return { el, alive: false } as Drop;
	});

	// Throws drops up and outward from x; strength 0..1 sets how many and how high.
	const splash = (x: number, y: number, spread: number, strength: number) => {
		const { H } = view;
		const count = Math.round(4 + 12 * strength);
		for (let k = 0; k < count; k++) {
			const d = drops.find((o) => !o.alive);
			if (!d) return;
			const side = k % 2 ? 1 : -1;
			const angle = side * rand(0.12, 0.95); // from vertical, outward
			const speed = Math.sqrt(2 * gravity(H) * H * rand(0.03, 0.2) * strength);
			d.alive = true;
			d.x = x + side * rand(0, spread);
			d.y = y;
			d.vx = Math.sin(angle) * speed;
			d.vy = -Math.cos(angle) * speed;
			d.size = rand(3, 9) * (0.6 + 0.4 * strength);
			d.el.style.width = d.el.style.height = `${d.size.toFixed(1)}px`;
			d.el.style.opacity = '1';
		}
	};

	// Drops fly and stretch along their path. When one falls back to surfaceAt(x) it disappears
	// and onLand(x, size) is called (for its tiny ripple). Returns true while any are in the air.
	const update = (dt: number, surfaceAt: (x: number) => number, onLand: (x: number, size: number) => void) => {
		const { H } = view;
		const g = gravity(H);
		let busy = false;
		for (const d of drops) {
			if (!d.alive) continue;
			busy = true;
			d.vy += g * dt;
			d.x += d.vx * dt;
			d.y += d.vy * dt;
			if (d.vy > 0 && d.y >= surfaceAt(d.x)) {
				d.alive = false;
				d.el.style.opacity = '0';
				onLand(d.x, d.size);
				continue;
			}
			const speed = Math.hypot(d.vx, d.vy);
			const stretch = 1 + Math.min(1.4, speed / (2.2 * H));
			const angle = (Math.atan2(d.vy, d.vx) * 180) / Math.PI - 90;
			d.el.style.transform = `translate3d(${(d.x - d.size / 2).toFixed(1)}px, ${(d.y - d.size / 2).toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg) scale(${(1 / Math.sqrt(stretch)).toFixed(3)}, ${stretch.toFixed(3)})`;
		}
		return busy;
	};

	return { splash, update };
}
