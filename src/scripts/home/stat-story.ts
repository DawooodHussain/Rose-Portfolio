import { $, clamp01, rand, smoothstep } from '../util';
import { createSpray, gravity, type View } from './spray';
import { WaterSurface } from './water';

// Stat screen: "02" drops into the GitHub line like a stone into water.
// Scroll is only the camera: it raises the line and lets "02" fall (smoothed, so wheel steps
// glide). Everything after the impact runs in real time, like real water, even if you stop:
//  - The line is a simulated water surface (water.ts). The impact dips it and the rebound
//    travels outward as ripples that lose energy and settle flat.
//  - "02" keeps sinking under the surface, slowed by drag, until it's gone.
//  - A crown of ink drops (spray.ts) and the letters right under the impact are thrown up. They
//    fly under gravity, and each one sends out its own small ripple where it lands. The letters
//    then drift back into line.
// The loop runs only while the screen is visible and stops itself once the water is still.

const P_FALL = 0.06; // "02" starts to fall
const P_HIT = 0.4; // "02" meets the surface

interface Flight {
	x: number;
	y: number;
	vx: number;
	vy: number;
	rot: number;
	vr: number;
	landed: boolean;
}

export function createStatStory(statStory: HTMLElement) {
	const stage = $('.stat-stage', statStory);
	const track = $('.mq-track', statStory);
	const marquee = $('.marquee', statStory);
	const letters = [...statStory.querySelectorAll<HTMLElement>('.mq-ch')];
	const num = $('.stat-num', statStory);
	const label = $('.stat-label', statStory);
	const stat = $('.stat', statStory);

	const view: View = { W: innerWidth, H: innerHeight };
	const water = new WaterSurface();
	const spray = createSpray(stage, view);

	// Layout, re-read on resize.
	let lefts: number[] = [];
	let numTop0 = 0;
	let numH = 0;
	let numW = 0;
	let fontPx = 0;
	let trackW = 0;

	// Scroll progress through the screen (target) and the smoothed "camera" that follows it.
	let pTarget = 0;
	let pSmooth = 0;

	// "02": scroll-linked until it meets the water, then real-time.
	let under = false;
	let sinkY = 0;
	let sinkV = 0;

	// Letters thrown by the impact: offset from their slot, with their own velocity and spin.
	const fly: (Flight | null)[] = letters.map(() => null);
	let jetAt = -1;

	const marqueeShift = () => pSmooth * 0.22 * trackW;

	const throwLetters = () => {
		const { W, H } = view;
		const shift = marqueeShift();
		const cx = W / 2;
		letters
			.map((_, i) => ({ i, d: lefts[i] - shift - cx }))
			.filter((o) => Math.abs(o.d) < numW * 0.55)
			.sort((a, b) => Math.abs(a.d) - Math.abs(b.d))
			.slice(0, 3)
			.forEach(({ i, d }, rank) => {
				const side = Math.sign(d) || 1;
				const height = H * (rank === 0 ? rand(0.22, 0.28) : rand(0.11, 0.17));
				fly[i] = {
					x: 0,
					y: 0,
					vx: side * W * (rank === 0 ? rand(0.005, 0.02) : rand(0.05, 0.09)),
					vy: -Math.sqrt(2 * gravity(H) * height),
					rot: 0,
					vr: side * (rank === 0 ? rand(20, 60) : rand(120, 280)),
					landed: false,
				};
			});
	};

	const measure = () => {
		view.W = innerWidth;
		view.H = innerHeight;
		lefts = letters.map((el) => el.offsetLeft + el.offsetWidth / 2);
		stat.style.setProperty('--sink', '0px');
		const stageTop = stage.getBoundingClientRect().top;
		const r = num.getBoundingClientRect();
		numTop0 = r.top - stageTop;
		numH = r.height;
		numW = r.width;
		fontPx = parseFloat(getComputedStyle(marquee).fontSize);
		trackW = track.scrollWidth;
		water.resize(view.W);
	};

	// Moves "02": falls with the scroll, then sinks on its own after the impact. Returns true
	// while it's still gliding back up after a scroll up.
	const updateNumber = (now: number, dt: number, surface: number) => {
		const { W, H } = view;
		const cx = W / 2;
		const fall = Math.max(0, surface - (numTop0 + numH));
		if (!under && pSmooth >= P_HIT) {
			// Impact: dip the surface under "02", throw a crown of drops, then the letters.
			under = true;
			sinkY = fall;
			sinkV = 0.9 * H;
			water.disturb(cx, numW * 0.33, 0.035 * H, 0.6 * H);
			spray.splash(cx, surface, numW * 0.4, 1);
			jetAt = now + 90; // the rebound jet comes a beat after the dip
		} else if (under && pSmooth < P_HIT - 0.03) {
			under = false; // scrolled back up: "02" rises out again
		}
		if (under && numTop0 + sinkY < surface + numH * 0.2) {
			sinkV = Math.max(0.12 * H, sinkV - 3 * sinkV * dt); // drag, never quite stopping
			sinkY += sinkV * dt;
		}
		let rising = false;
		if (!under) {
			const t = clamp01((pSmooth - P_FALL) / (P_HIT - P_FALL));
			const target = t * t * fall; // gravity: speeds up as it falls
			// Glides (instead of jumping) back up when you scroll up after it sank.
			sinkY = dt ? sinkY + (target - sinkY) * (1 - Math.exp(-dt * 8)) : target;
			rising = Math.abs(target - sinkY) > 0.5;
		}
		stat.style.setProperty('--sink', `${sinkY.toFixed(1)}px`);
		const hidden = numTop0 + sinkY + numH - (surface + water.heightAt(cx));
		num.style.clipPath = `inset(-10% -10% ${Math.min(numH + 4, Math.max(0, hidden)).toFixed(1)}px -10%)`;
		return rising;
	};

	// Letters ride the surface; thrown ones fly, land, then drift back into their slot.
	// Returns true while any letter is still away from its slot.
	const updateLetters = (dt: number, surface: number, shift: number) => {
		const { W, H } = view;
		const g = gravity(H);
		let busy = false;
		letters.forEach((el, i) => {
			const slot = lefts[i] - shift;
			const f = fly[i];
			let ox = 0;
			let oy: number | undefined;
			let spin = 0;
			if (f && !f.landed) {
				busy = true;
				f.vy += g * dt;
				f.x += f.vx * dt;
				f.y += f.vy * dt;
				f.rot += f.vr * dt;
				const level = water.heightAt(slot + f.x);
				if (f.vy > 0 && f.y >= level) {
					f.landed = true;
					water.disturb(slot + f.x, 0.03 * W, 0.012 * H, 0.15 * H);
					spray.splash(slot + f.x, surface + level, fontPx * 0.2, 0.3);
				}
				ox = f.x;
				oy = f.y;
				spin = f.rot;
			}
			if (f && f.landed) {
				busy = true;
				// Critically damped spring back to the slot (no overshoot, no hard stop).
				const w = 5;
				f.vx += (-w * w * f.x - 2 * w * f.vx) * dt;
				f.x += f.vx * dt;
				f.vr += (-w * w * f.rot - 2 * w * f.vr) * dt;
				f.rot += f.vr * dt;
				if (Math.abs(f.x) < 0.3 && Math.abs(f.rot) < 0.3 && Math.abs(f.vx) < 2) fly[i] = null;
				ox = f.x;
				spin = f.rot;
			}
			const x = slot + ox;
			if (oy === undefined) oy = water.heightAt(x);
			const slope = (Math.atan((water.heightAt(x + 4) - water.heightAt(x - 4)) / 8) * 180) / Math.PI;
			const rot = spin + Math.max(-25, Math.min(25, slope));
			el.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
		});
		return busy;
	};

	let raf = 0;
	let last = 0;
	let visible = false;

	const tick = (now: number) => {
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
		last = now;
		const { W, H } = view;

		// Camera: the smoothed scroll progress raises the line.
		pSmooth += (pTarget - pSmooth) * (1 - Math.exp(-dt * 7));
		if (Math.abs(pTarget - pSmooth) < 0.0002) pSmooth = pTarget;
		const lineY = (0.82 - 0.32 * smoothstep(Math.min(1, pSmooth / 0.42))) * H;
		statStory.style.setProperty('--line-y', (lineY / H).toFixed(4));
		const surface = lineY - fontPx * 0.42; // the top of the letters is the water surface
		label.style.opacity = String(1 - clamp01((pSmooth - 0.04) / 0.1));

		water.advance(dt);
		const rising = updateNumber(now, dt, surface);
		if (jetAt > 0 && now >= jetAt) {
			jetAt = -1;
			throwLetters();
		}

		const dropsBusy = spray.update(
			dt,
			(x) => surface + water.heightAt(x),
			(x, size) => water.disturb(x, 0.01 * W, 0.0006 * H * size, 0),
		);
		const shift = marqueeShift();
		track.style.transform = `translate3d(${(-shift).toFixed(1)}px, 0, 0)`;
		const lettersBusy = updateLetters(dt, surface, shift);

		// Keep going while anything still moves; stop once the water is still.
		const sinking = under && numTop0 + sinkY < surface + numH * 0.2;
		if (dropsBusy || lettersBusy || sinking || rising || jetAt > 0 || water.energy() > 0.15 || pSmooth !== pTarget) {
			raf = visible ? requestAnimationFrame(tick) : 0;
		} else {
			water.reset();
			raf = 0;
		}
		if (!raf) last = 0;
	};

	const run = () => {
		if (!raf && visible) raf = requestAnimationFrame(tick);
	};

	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible) run();
	}).observe(statStory);

	return {
		measure,
		// Reads the scroll position; instant skips the camera smoothing (after a resize).
		update(instant = false) {
			pTarget = clamp01((scrollY - statStory.offsetTop) / (statStory.offsetHeight - innerHeight));
			if (instant) pSmooth = pTarget;
			run();
		},
	};
}
