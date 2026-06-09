interface Language {
  name: string;
  level: string;
  description: string;
  show: boolean;
}

const languages: Language[] = [
  {
    name: "English",
    level: "Fluent",
    description: "Native speaker — fluent in reading, writing, and speaking",
    show: true,
  },
  {
    name: "Vietnamese",
    level: "Native/Fluent",
    description: "Fluent in speaking and writing",
    show: true,
  },
];

export default languages;
