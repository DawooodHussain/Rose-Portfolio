// Resume content for the demo (the facts screen and /resume).
// Copied from ../frontend/src/data/content.ts; keep the two in sync by hand.
// Convention: an empty string means "not available yet", and that field is not rendered.
export const resume = {
	fullName: 'Daud', // full name as it should appear on the resume (GitHub shows "Dawood Hussain")
	role: 'Full Stack Developer',
	location: 'Lahore, Pakistan',
	summary:
		'Full stack developer with 2 years of experience building web applications with React, Next.js, Java, Node.js, and Python. Currently a Java developer at BrickxAI, while studying at Frontier Group of Colleges, Arifwala. Open to freelance work.',
	experience: [
		{
			org: 'BrickxAI',
			role: 'Java Developer',
			detail: '',
			dates: '', // e.g. '2024 — Present'
			points: ['Develop and maintain Java applications for an enterprise retail client.'],
		},
	],
	education: [
		{
			org: 'Frontier Group of Colleges, Arifwala',
			role: 'Currently enrolled', // program, e.g. 'BS Computer Science'
			dates: '', // e.g. '2023 — 2027'
		},
	],
	skills: [
		{ group: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
		{ group: 'Backend', items: ['Java (Spring Boot)', 'Node.js', 'Express', 'Python (FastAPI)'] },
		{ group: 'Data & DevOps', items: ['PostgreSQL', 'MongoDB', 'Docker', 'AWS'] },
	],
	languages: 'Learning Spanish and Hindi', // add the languages you speak fluently
	interests: 'Chess, philosophy, reading, series and movies',
};

// The four quiet rows on the story's facts screen.
export const facts = [
	{ label: 'Currently', value: 'Java developer, BrickxAI' },
	{ label: 'Experience', value: '2 years' },
	{ label: 'Education', value: 'Frontier Group of Colleges, Arifwala' },
	{ label: 'Based in', value: resume.location },
].filter((f) => f.value);
