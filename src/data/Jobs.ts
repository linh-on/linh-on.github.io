interface WorkExperience {
    title: string;
    startDate: string;
    endDate?: string;
    company: string;
    location: string;
    description: string;
    goals: string[];
    currentJob: boolean;
}

const workExperience: WorkExperience[] = [
    {
        title: "AI Research Assistant & Web Development Intern",
        startDate: "2026-01-01",
        company: "Live Good Inc.",
        location: "Irvine, CA",
        description: "Contributing to AI research initiatives and building web features to support the company's mission.",
        goals: [
            "Developed and maintained web application features using modern JavaScript frameworks.",
            "Assisted in AI research tasks including data processing and model evaluation.",
            "Collaborated with cross-functional teams to deliver product improvements.",
        ],
        currentJob: true,
    },
    {
        title: "Lead IT Services Assistant",
        startDate: "2023-04-01",
        endDate: "2025-09-30",
        company: "UCI Division of Continuing Education",
        location: "Irvine, CA",
        description: "Led IT support operations for the division, managing technical infrastructure and providing hands-on technical assistance.",
        goals: [
            "Provided technical support and troubleshooting for faculty, staff, and students.",
            "Managed and maintained hardware, software, and network systems for the division.",
            "Trained and supervised junior IT assistants to ensure consistent service quality.",
        ],
        currentJob: false,
    },
    {
        title: "Front-End Developer Intern",
        startDate: "2024-07-01",
        endDate: "2024-09-30",
        company: "Nichietsu System Development",
        location: "Remote",
        description: "Built and improved front-end features for web applications in a Japanese software development environment.",
        goals: [
            "Developed responsive UI components using HTML, CSS, and JavaScript.",
            "Collaborated with designers to implement pixel-perfect interfaces from Figma mockups.",
            "Participated in code reviews and agile sprint cycles to deliver features on schedule.",
        ],
        currentJob: false,
    },
    {
        title: "Undergraduate Research Assistant",
        startDate: "2024-03-01",
        endDate: "2024-06-30",
        company: "UCI Samueli School of Engineering — Professor Rimoli's Lab",
        location: "Irvine, CA",
        description: "Contributed to engineering research under faculty supervision, applying computational and software skills to lab projects.",
        goals: [
            "Assisted with data collection, processing, and analysis for ongoing research experiments.",
            "Implemented scripts and tools in Python to automate research workflows.",
            "Presented findings during lab meetings and contributed to documentation of results.",
        ],
        currentJob: false,
    },
];

export default workExperience;
