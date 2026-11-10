// [data-copy] buttons copy their value: they show "Copied", or the value itself if the clipboard is blocked.
export function initCopyButtons() {
	document.querySelectorAll<HTMLElement>('[data-copy]').forEach((btn) => {
		btn.addEventListener('click', async () => {
			const initial = btn.textContent;
			try {
				await navigator.clipboard.writeText(btn.dataset.copy!);
				btn.textContent = 'Copied';
			} catch {
				btn.textContent = btn.dataset.copy!;
			}
			setTimeout(() => (btn.textContent = initial), 2000);
		});
	});
}
