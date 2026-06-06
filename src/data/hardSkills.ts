interface HardSkill {
  name: string;
  description: string;
  icon: string;
}

const hardSkills: HardSkill[] = [
  {
    name: "React.js",
    description: "Building dynamic, component-driven web UIs with React and modern hooks",
    icon: "react"
  },
  {
    name: "TypeScript",
    description: "Writing type-safe JavaScript for scalable front-end and back-end applications",
    icon: "typescript"
  },
  {
    name: "Node.js & Express",
    description: "Developing RESTful APIs and server-side applications with Node.js and Express",
    icon: "nodejs"
  },
  {
    name: "Python",
    description: "Scripting, data processing, Flask APIs, and AI/ML workflows with Python",
    icon: "tools-fill"
  },
  {
    name: "PostgreSQL",
    description: "Designing relational database schemas and writing efficient SQL queries",
    icon: "mongodb"
  },
  {
    name: "Embedded Systems",
    description: "Programming microcontrollers (Arduino, Tiva C) in C/C++ for hardware projects",
    icon: "tools-fill"
  }
];

export default hardSkills;
