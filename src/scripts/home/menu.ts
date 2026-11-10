import { $ } from '../util';

// Mobile menu: open/close, close on link click or Escape, return focus to the button.
export function initMenu() {
	const menu = $('#menu');
	const menuBtn = $('.menu-btn');
	const setMenu = (open: boolean) => {
		menu.hidden = !open;
		menuBtn.setAttribute('aria-expanded', String(open));
		document.body.style.overflow = open ? 'hidden' : '';
		if (open) $('a', menu).focus();
		else menuBtn.focus();
	};
	menuBtn.addEventListener('click', () => setMenu(true));
	$('.menu-close', menu).addEventListener('click', () => setMenu(false));
	menu.addEventListener('click', (e) => (e.target as Element).closest('a') && setMenu(false));
	addEventListener('keydown', (e) => e.key === 'Escape' && !menu.hidden && setMenu(false));

	return { isOpen: () => !menu.hidden };
}
