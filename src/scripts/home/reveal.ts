// Adds .in to each element once, the first time it scrolls into view (the CSS fades it up).
export function initReveal(elements: Iterable<Element>) {
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				e.target.classList.add('in');
				io.unobserve(e.target);
			}
		},
		{ threshold: 0.3 },
	);
	for (const el of elements) io.observe(el);
}
