interface RolePeriod {
  title: string;
  startDate: string;
  endDate?: string;
  goals: string[];
}

interface WorkExperience {
  title: string;
  startDate: string;
  endDate?: string;
  company: string;
  location: string;
  description: string;
  goals: string[];
  currentJob: boolean;
  // Progression track: multiple roles held within the same organization,
  // rendered as a connected mini-timeline inside one experience card
  // (newest role first). When set, `goals` on the entry itself is unused.
  roles?: RolePeriod[];
}

const workExperience: WorkExperience[] = [
  {
    title: "ICS Summer Academy: Intelligent Robotics",
    startDate: "2026-02-01",
    company: "UCI Donald Bren School of ICS",
    location: "Irvine, CA",
    description:
      "Started out helping the instructing professor build the session's robot, then moved up to leading the program assistant team for the July session.",
    goals: [],
    roles: [
      {
        title: "Lead Program Assistant",
        startDate: "2026-07-01",
        endDate: "2026-07-31",
        goals: [
          "Lead the program assistant team for the Intelligent Robotics session, supporting daily lectures and labs where 30+ high school students design and build autonomous driving robots.",
          "Mentor students through hands-on lab work spanning Arduino programming in C, circuit building, and robot assembly, debugging both code and hardware issues on the spot.",
          "Coordinate daily session logistics between instructors and staff, preparing lab materials and robot kits and keeping the program schedule running smoothly.",
        ],
      },
      {
        title: "Robotics Assistant to the Instructing Professor",
        startDate: "2026-02-01",
        goals: [
          "Invited by the instructing professor to help design, build, and iterate on the autonomous driving robot used as the reference platform for the Intelligent Robotics curriculum.",
          "Develop and test the robot across its full stack, including Arduino firmware in C, sensor and motor circuitry, and chassis assembly, so the build is reliable and easy for students to reproduce.",
          "Refine the demo through repeated build-test cycles, documenting issues and fixes to shape the hands-on lab instructions used during the program.",
        ],
      },
    ],
    currentJob: true,
  },
  {
    title: "AI Research Assistant & Web Development Intern",
    startDate: "2026-01-01",
    company: "Live Good Inc.",
    location: "Irvine, CA",
    description:
      "Develop and maintain responsive web pages and evaluate AI integration opportunities for the company website.",
    goals: [
      "Develop and maintain responsive web pages and site functionality using WordPress and PHP, with hands-on work in theme customization, template updates, and plugin modifications.",
      "Research and evaluate potential AI integration use cases for the company website by focusing on technical feasibility, user impact, and alignment with business needs.",
    ],
    currentJob: true,
  },
  {
    title: "Social Chair",
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    company: "Thai Culture Association",
    location: "UC Irvine",
    description:
      "Planned and ran club hangouts and cultural events to bring Thai and Southeast Asian students together at UCI.",
    goals: [
      "Planned and led social and cultural events that brought Thai and Southeast Asian students together and helped build a stronger community on campus.",
      "Managed event logistics and execution to ensure each event was organized and ran smoothly.",
      "Worked closely with the executive board to create welcoming, well-organized events that kept members involved and excited to participate.",
    ],
    currentJob: false,
  },
  {
    title: "Thai Culture Night Staff",
    startDate: "2022-01-01",
    endDate: "2026-06-30",
    company: "Thai Culture Association",
    location: "UC Irvine",
    description:
      "Supported the annual Thai Culture Night for four years across backstage coordination, the cultural play, and Thai Market Night.",
    goals: [
      "Supported Thai Culture Night and Thai Market Night over four years, beginning backstage with the cultural play before moving into event-day operations.",
      "Organized vendor booths and ensured activities ran smoothly.",
      "Helped create a welcoming space where attendees could experience Thai food, culture, and community.",
    ],
    currentJob: false,
  },
  {
    title: "Lead IT Services Assistant",
    startDate: "2023-04-01",
    endDate: "2025-09-30",
    company: "UCI Division of Continuing Education",
    location: "Irvine, CA",
    description:
      "Led IT support operations for the division, managing endpoint systems, help desk tickets, and network infrastructure for 300+ end users.",
    goals: [
      "Delivered IT support and network troubleshooting for 300+ end users across Windows 10/11 and macOS environments.",
      "Provisioned, configured, and supported 200+ endpoint systems, including hardware set up, OS troubleshooting, software installation, device imaging, and workstation deployment.",
      "Managed 50+ help desk tickets weekly and achieved an 85% resolution rate within 24 hours through structured troubleshooting, timely follow-up and cross-department coordination.",
      "Supported Active Directory administration through account unlocks, user updates, and access-related troubleshooting.",
      "Implemented regular system updates and patch management protocols across the company's networks.",
    ],
    currentJob: false,
  },
  {
    title: "Front-End Developer Intern",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    company: "Nichietsu System Development",
    location: "Ho Chi Minh, Vietnam",
    description:
      "Designed and implemented responsive front-end features using TypeScript and React, translating Figma designs into functional interfaces.",
    goals: [
      "Designed and implemented front-end features using TypeScript and React, translating Figma design specifications into responsive and functional interfaces while ensuring consistency in layout, styling, and overall user experience.",
      "Developed responsive and dynamic web interfaces using HTML and Tailwind CSS for both users and admins workflows to deliver optimized and consistent layout and styling.",
      "Conducted thorough cross-platform testing of web and mobile applications, diagnosing and resolving UI/UX issues to improve functionality and performance and ensure alignment with coding standards.",
      "Optimized website accessibility and user experience by 30% through compatibility testing across diverse devices.",
    ],
    currentJob: false,
  },
  {
    title: "Undergraduate Research Assistant",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    company: "UCI Samueli School of Engineering, Professor Rimoli's Lab",
    location: "Irvine, CA",
    description:
      "Contributed to tensegrity structure simulation research by developing unit tests and optimizing computational algorithms in Python.",
    goals: [
      "Developed unit tests for tensegrity structure simulation code in Python, boosting code reliability and maintainability.",
      "Optimized a conjugate gradient descent algorithm, reducing computational time and enhancing performance.",
    ],
    currentJob: false,
  },
  {
    title: "Event Assistant",
    startDate: "2022-03-01",
    endDate: "2024-04-30",
    company: "UCI Division of Continuing Education",
    location: "Irvine, CA",
    description:
      "Provided technical support for instructors and managed event equipment setup and breakdown.",
    goals: [
      "Provided hands-on technical support for instructors and kept classroom hardware and software working reliably.",
      "Resolved computer and Zoom issues during live sessions so classes could continue with minimal interruption.",
      "Prepared and tested equipment before events and handled breakdown and storage afterward.",
    ],
    currentJob: false,
  },
  {
    title: "Undergraduate Lab Tutor",
    startDate: "2023-03-01",
    endDate: "2024-06-30",
    company: "UCI Donald Bren School of ICS",
    location: "Irvine, CA",
    description:
      "Provided one-on-one academic support for 300+ students in Python and C++ coursework during lab sessions.",
    goals: [
      "Provided one-on-one support for 300+ students in Python and C++ coursework by explaining programming concepts, debugging code, and guiding problem-solving during lab sessions.",
      "Clarified object-oriented programming, algorithm design, and debugging techniques to help students strengthen their technical foundations and improve homework comprehension.",
      "Diagnosed code issues and provided individualized support to improve student homework understanding.",
    ],
    currentJob: false,
  },
  {
    title: "Freshman Edge Peer Mentor",
    startDate: "2022-05-01",
    endDate: "2022-09-30",
    company: "UCI Student Success Initiatives",
    location: "Irvine, CA",
    description:
      "Mentored incoming freshmen and coordinated events to foster academic success and community building at UCI.",
    goals: [
      "Mentored and supported 10+ mentees by providing resources for goal-setting and academic success at UCI.",
      "Coordinated 5+ events designed to strengthen student engagement, peer connection, and academic community building.",
      "Delivered structured support to 150+ participants through organized events and intentional interactions, fostering meaningful engagement and community building.",
    ],
    currentJob: false,
  },
  {
    title: "Research Assistant, Vaccine R&D Lab Center",
    startDate: "2022-04-01",
    endDate: "2023-04-30",
    company: "University of California, Irvine",
    location: "Irvine, CA",
    description:
      "Prepared laboratory equipment and materials and kept the lab stocked and ready for vaccine research work.",
    goals: [
      "Prepared and organized laboratory equipment and materials for vaccine research projects.",
      "Maintained inventory records and monitored supplies to keep the lab stocked and ready for daily work.",
      "Supported experiments as needed through equipment setup, material preparation, and cleanup.",
    ],
    currentJob: false,
  },
];

export default workExperience;
