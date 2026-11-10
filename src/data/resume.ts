export const resume = {
  fullName: "Daud Hussain",
  role: "Full Stack Developer",
  location: "Lahore, Pakistan",
  summary:
    "Full stack developer with 2 years of experience building web applications with React, Next.js, Java, Node.js, and Python. Currently a Java developer at BrickxAI, while studying at Frontier Group of Colleges, Arifwala. Open to freelance work.",
  experience: [
    {
      org: "BrickxAI",
      role: "Java Developer",
      detail: "",
      dates: "2026 - Present",
      points: [
        "Develop and maintain Java applications for an enterprise retail client.",
      ],
    },
  ],
  education: [
    {
      org: "Frontier Group of Colleges, Arifwala",
      role: "Intermediate in Computer Science",
      dates: "2025 - Present",
    },
  ],
  skills: [
    {
      group: "Frontend",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      group: "Backend",
      items: ["Java (Spring Boot)", "Node.js", "Express", "Python (FastAPI)"],
    },
    {
      group: "Data & DevOps",
      items: ["PostgreSQL", "MongoDB", "Docker", "AWS"],
    },
  ],
  languages: "Learning Spanish and Hindi",
  interests: "Chess, philosophy, reading, series and movies",
};

export const facts = [
  { label: "Currently", value: "Java developer, BrickxAI" },
  { label: "Experience", value: "2 years" },
  { label: "Education", value: "Frontier Group of Colleges, Arifwala" },
  { label: "Based in", value: resume.location },
].filter((f) => f.value);
