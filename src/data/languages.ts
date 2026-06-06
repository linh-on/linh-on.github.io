interface Language {
    name: string;
    level: string;
    description: string;
    show: boolean;
}

const languages: Language[] = [
    {
        name: "English",
        level: "Native",
        description: "Native speaker — fluent in reading, writing, and speaking",
        show: true
    },
    {
        name: "Vietnamese",
        level: "Bilingual",
        description: "I speak fluently and write fluently",
        show: false
    }
];

export default languages;
