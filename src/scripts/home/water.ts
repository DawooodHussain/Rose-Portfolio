// A 1D water surface (wave equation) spanning the screen plus a margin each side, where extra
// damping (a "sponge") absorbs the waves so they leave the screen instead of bouncing back.
// Heights are in px, + is down. It advances in fixed steps, so it behaves the same at any frame rate.

const STEP = 1 / 120;

export class WaterSurface {
	private readonly h: Float32Array;
	private readonly v: Float32Array;
	private x0 = 0;
	private dx = 1;
	private width = 0;
	private acc = 0;

	constructor(private readonly n = 220) {
		this.h = new Float32Array(n);
		this.v = new Float32Array(n);
	}

	// Spans the screen width W plus a quarter of it each side, and flattens the water.
	resize(W: number) {
		this.width = W;
		this.x0 = -0.25 * W;
		this.dx = (1.5 * W) / (this.n - 1);
		this.reset();
	}

	reset() {
		this.h.fill(0);
		this.v.fill(0);
	}

	heightAt(x: number) {
		const f = (x - this.x0) / this.dx;
		const i = Math.floor(f);
		if (i < 0 || i >= this.n - 1) return 0;
		const t = f - i;
		return this.h[i] * (1 - t) + this.h[i + 1] * t;
	}

	// A Gaussian bump at x: dh pushes the surface down, dv gives it a downward kick.
	disturb(x: number, width: number, dh: number, dv: number) {
		for (let i = 0; i < this.n; i++) {
			const d = (this.x0 + i * this.dx - x) / width;
			if (d > 3 || d < -3) continue;
			const g = Math.exp(-d * d);
			this.h[i] += dh * g;
			this.v[i] += dv * g;
		}
	}

	advance(dt: number) {
		this.acc += dt;
		while (this.acc >= STEP) {
			this.step();
			this.acc -= STEP;
		}
	}

	// How much is still moving; below ~0.15 the surface looks flat.
	energy() {
		let e = 0;
		for (let i = 0; i < this.n; i++) e = Math.max(e, Math.abs(this.h[i]), Math.abs(this.v[i]) * 0.1);
		return e;
	}

	private step() {
		const { h, v, n, x0, dx, width: W } = this;
		const c = 0.45 * W; // wave speed, px/s
		const c2 = (c * c) / (dx * dx);
		for (let i = 0; i < n; i++) {
			const l = i > 0 ? h[i - 1] : h[i];
			const r = i < n - 1 ? h[i + 1] : h[i];
			const xi = x0 + i * dx;
			const edge = xi < 0 ? xi / x0 : xi > W ? (xi - W) / -x0 : 0;
			v[i] += (c2 * (l + r - 2 * h[i]) - 6 * h[i] - (2 + 16 * edge) * v[i]) * STEP;
		}
		for (let i = 0; i < n; i++) h[i] += v[i] * STEP;
	}
}
