export const BRAND = {
  name: "Diagonally",
  tagline: "Think Diagonally.",
  description: "A math learning platform where students build games instead of taking tests.",
  url: "https://diagonally.org",
}

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "For Schools", href: "/schools" },
  { label: "For Parents", href: "/parents" },
  { label: "Blog", href: "/blog" },
  { label: "Research", href: "/research" },
]

export const SOCIAL_LINKS = [
  { label: "Substack", href: "#", icon: "BookOpen" },
  { label: "YouTube", href: "#", icon: "Youtube" },
  { label: "GitHub", href: "https://github.com/mrdavola/option-c", icon: "Github" },
]

export const TEAM = [
  {
    name: "Barbara Jauregui Wurst",
    role: "Education & Field Operations",
    bio: "Physician, WHO technical officer across 25+ countries. Founded an Acton Academy. Designs learning experiences and runs pilots. Making sure everything works for real learners in real classrooms.",
    image: "/images/team/barbara.jpg",
  },
  {
    name: "Mike Davola",
    role: "Builder & Technology",
    bio: "Runs hackathons and practicethons for students. Teaches teachers how to use tech. Builds half-formed ideas into working prototypes on screen while we watch. Ships now. Not later.",
    image: "/images/team/mike.jpg",
  },
  {
    name: "Scott R. Nicoll",
    role: "Storytelling & Curriculum",
    bio: "12 years developing Critical Thinking curricula across South Korea, China, and Hong Kong. 200+ published articles. 20,000+ audience built from scratch. The storyteller on this dynamic team.",
    image: "/images/team/scott.jpg",
  },
]

export const PILOT_STATS = [
  { value: "11/11", label: "wanted to keep building after spring break" },
  { value: "0", label: "prompts needed to start collaborating" },
  { value: "4", label: "learners recorded explaining their ideas" },
  { value: "6", label: "AI iterations by one learner before time ran out" },
]

export const COMPARISON_DATA = [
  {
    name: "Khanmigo",
    description: "AI tutor on Khan Academy's linear curriculum",
    gap: "Still a worksheet path. Learner has no ownership.",
    ownership: false, community: false, tracking: true, ai: true, openSource: false,
  },
  {
    name: "MagicSchool",
    description: "AI toolkit for teachers",
    gap: "Built for teachers, not learners. No student building.",
    ownership: false, community: false, tracking: false, ai: true, openSource: false,
  },
  {
    name: "Synthesis",
    description: "Premium microschool programs",
    gap: "Closed ecosystem. Not a tool other schools can adopt.",
    ownership: true, community: true, tracking: true, ai: false, openSource: false,
  },
  {
    name: "ChatGPT",
    description: "Open-ended AI",
    gap: "No structure, no progress tracking, no community.",
    ownership: false, community: false, tracking: false, ai: true, openSource: false,
  },
  {
    name: "Diagonally",
    description: "Students build math games with AI",
    gap: "",
    ownership: true, community: true, tracking: true, ai: true, openSource: true,
    highlighted: true,
  },
]
