// Cut a botanical illustration off its paper background into a transparent WebP.
//
//   node scripts/cutout-flower.mjs <input.jpg> <output.webp> [crop=x,y,w,h] [maxSize=1400]
//
// Samples the paper colour from the image border, then makes pixels near that colour
// transparent with a soft falloff (so watercolour edges stay smooth), trims the margins,
// and resizes. Uses sharp, which Astro already installs.
import sharp from 'sharp';

const [input, output, cropArg, maxArg] = process.argv.slice(2);
if (!input || !output) {
	console.error('usage: node scripts/cutout-flower.mjs <input> <output.webp> [x,y,w,h] [maxSize]');
	process.exit(1);
}

let img = sharp(input);
if (cropArg && cropArg !== '-') {
	const [left, top, width, height] = cropArg.split(',').map(Number);
	img = img.extract({ left, top, width, height });
}
const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// Paper colour = median of a 12px border ring.
const ring = [];
const B = 12;
for (let y = 0; y < height; y++) {
	for (let x = 0; x < width; x++) {
		if (x >= B && x < width - B && y >= B && y < height - B) continue;
		const i = (y * width + x) * 3;
		ring.push([data[i], data[i + 1], data[i + 2]]);
	}
}
const median = (k) => ring.map((p) => p[k]).sort((a, b) => a - b)[ring.length >> 1];
const paper = [median(0), median(1), median(2)];

// Alpha from distance to paper colour: <= T0 fully transparent, >= T1 fully opaque.
const T0 = Number(process.env.T0) || 22;
const T1 = Number(process.env.T1) || 70;
const out = Buffer.alloc(width * height * 4);
for (let p = 0; p < width * height; p++) {
	const r = data[p * 3];
	const g = data[p * 3 + 1];
	const b = data[p * 3 + 2];
	const d = Math.hypot(r - paper[0], g - paper[1], b - paper[2]);
	const t = Math.min(1, Math.max(0, (d - T0) / (T1 - T0)));
	const a = t * t * (3 - 2 * t); // smoothstep
	out[p * 4] = r;
	out[p * 4 + 1] = g;
	out[p * 4 + 2] = b;
	out[p * 4 + 3] = Math.round(a * 255);
}

const max = Number(maxArg) || 1400;
await sharp(out, { raw: { width, height, channels: 4 } })
	.trim({ threshold: 1 })
	.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
	.webp({ quality: 86, alphaQuality: 90 })
	.toFile(output);

const meta = await sharp(output).metadata();
console.log(`${output}: ${meta.width}x${meta.height}, paper rgb(${paper.join(',')})`);
