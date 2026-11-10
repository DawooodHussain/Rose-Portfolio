import { $ } from './util';

// Opens the browser's print dialog (where "Save as PDF" lives). Some places block that
// dialog silently, e.g. editor preview panes and embedded browsers: window.print() just
// returns without firing 'beforeprint'. In that case, show the keyboard shortcut instead.
export function initPrintButton(button: HTMLElement, hint: HTMLElement) {
	button.addEventListener('click', () => {
		let opened = false;
		const markOpened = () => (opened = true);
		addEventListener('beforeprint', markOpened, { once: true });
		try {
			window.print();
		} catch {
			// Treated the same as a blocked dialog.
		}
		setTimeout(() => {
			removeEventListener('beforeprint', markOpened);
			hint.hidden = opened;
		}, 600);
	});
}

initPrintButton($('[data-print]'), $('[data-print-hint]'));
