let idCounter = 0
export const nextId = (prefix) => `${prefix}-${Date.now()}-${idCounter++}`

export const createEmptyCandidate = () => ({
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
})

export const demoCandidate = {
  personal: {
    fullName: 'Aarav Sharma',
    title: 'Full Stack Software Engineer',
    email: 'aarav.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    linkedin: 'linkedin.com/in/aaravsharma',
    github: 'github.com/aaravsharma',
    portfolio: 'aaravsharma.dev',
  },
  summary:
    'Results-driven Full Stack Developer with 3+ years of experience building scalable web applications using Java, Spring Boot, and React. Proven track record of designing RESTful APIs, optimizing database performance with PostgreSQL and MongoDB, and shipping AI-powered features that improve user engagement. Passionate about clean code, system design, and problem-solving.',
  education: [
    {
      id: nextId('edu'),
      degree: 'B.Tech in Computer Science',
      university: 'Indian Institute of Technology, Hyderabad',
      year: '2023',
      score: 'CGPA: 8.7/10',
    },
  ],
  experience: [
    {
      id: nextId('exp'),
      title: 'Software Engineer',
      company: 'TechNova Solutions',
      startDate: 'Jan 2023',
      endDate: 'Present',
      location: 'Hybrid',
      responsibilities:
        'Developed and maintained RESTful APIs using Java and Spring Boot, serving 50,000+ daily active users\nBuilt responsive front-end interfaces with React, improving average page load speed by 35%\nDesigned PostgreSQL database schemas and optimized queries, reducing average response time by 40%\nIntegrated MongoDB for flexible document storage in a microservices architecture\nContainerized services with Docker and streamlined the team\'s deployment pipeline',
    },
    {
      id: nextId('exp'),
      title: 'Software Engineering Intern',
      company: 'Brightpath Labs',
      startDate: 'May 2022',
      endDate: 'Dec 2022',
      location: 'On-site',
      responsibilities:
        'Built REST APIs with Spring Boot for an internal analytics platform\nCollaborated with senior engineers to implement unit tests, increasing code coverage by 25%\nImproved UI components and fixed bugs using React and JavaScript',
    },
  ],
  projects: [
    {
      id: nextId('proj'),
      name: 'AI Resume Screener',
      date: 'Aug 2024',
      tech: 'Python, OpenAI API, React, Flask',
      description:
        'Built an AI-powered tool that scores resumes against job descriptions using NLP\nAchieved 90% keyword-match accuracy for recruiters\nCut manual screening time in half',
      link: 'github.com/aaravsharma/ai-resume-screener',
    },
    {
      id: nextId('proj'),
      name: 'Real-Time Chat Application',
      date: 'Mar 2024',
      tech: 'Java, Spring Boot, WebSocket, MongoDB, React',
      description:
        'Developed a real-time messaging platform supporting 1,000+ concurrent users\nBuilt WebSocket-based communication with MongoDB persistence',
      link: 'github.com/aaravsharma/realtime-chat',
    },
  ],
  skills: [
    'Java',
    'Spring Boot',
    'React',
    'PostgreSQL',
    'MongoDB',
    'REST APIs',
    'Docker',
    'JavaScript',
    'HTML',
    'CSS',
    'Git',
    'Python',
  ],
  certifications: ['AWS Certified Cloud Practitioner', 'Oracle Certified Associate - Java SE'],
  achievements: ['Winner, National Hackathon 2023', 'Speaker at React India Meetup 2023'],
}

export const demoJobDescription = `We're hiring a Full Stack Developer to help build scalable web applications for our growing product team.

What you'll do:
- Build user-facing features in React and JavaScript
- Design and maintain REST APIs using Spring Boot
- Work with PostgreSQL and MongoDB to model application data
- Deploy containerized services with Docker as part of our cloud deployment process
- Apply strong problem-solving skills to debug and improve existing systems
- Help bring AI and LLM capabilities into the product

What we're looking for:
- Hands-on experience with React, JavaScript, and REST API design
- Comfort working with PostgreSQL and containerized tools like Docker
- A track record of shipping scalable web applications
- Interest in AI and LLM-based product features
- Excellent problem-solving ability and clear communication`
