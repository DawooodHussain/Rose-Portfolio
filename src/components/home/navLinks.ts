// Links shared by the desktop nav and the mobile menu. In-page links play the page transitions
// (see src/scripts/home/transitions.ts); external ones open in a new tab.
import { profile } from '../../data/profile';

export interface NavLink {
	label: string;
	href: string;
	external?: boolean;
}

export const sectionLinks: NavLink[] = [
	{ label: 'About', href: '#about' },
	{ label: 'Hello', href: '#hello' },
];

export const outboundLinks: NavLink[] = [
	{ label: 'GitHub', href: profile.github, external: true },
	{ label: 'LinkedIn', href: profile.linkedin, external: true },
	{ label: 'Resume', href: profile.resume },
].filter((l) => l.href);

export const linkAttrs = (l: NavLink) => (l.external ? { target: '_blank', rel: 'noreferrer' } : {});
