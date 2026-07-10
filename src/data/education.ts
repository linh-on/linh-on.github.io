interface Education {
    title: string;
    startDate: string;
    endDate?: string;
    school: string;
    location: string;
    description: string;
    currentUni: boolean;
}

const education: Education[] = [
    {
        title: "Master of Science in Computer Science",
        startDate: "2025-09-01",
        endDate: "",
        school: "University of California, Irvine",
        location: "Irvine, CA",
        description: "Expected graduation December 2026.\nFocusing on advanced topics in software engineering, AI/ML, and systems.",
        currentUni: true,
    },
    {
        title: "Bachelor of Science in Computer Science and Engineering",
        startDate: "2021-09-01",
        endDate: "2025-03-31",
        school: "University of California, Irvine",
        location: "Irvine, CA",
        description: "GPA: 3.86. Graduated Cum Laude from the Henry Samueli School of Engineering.\nCoursework in algorithms, data structures, embedded systems, computer architecture, and software engineering.",
        currentUni: false,
    },
];

export default education;
