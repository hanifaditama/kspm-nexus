import type { Article, Event, TeamMember, Program } from "@/types/content";

export const programs: Program[] = [
  {
    _id: "1",
    title: "Market Analysis Workshop",
    description: "Learn fundamental and technical analysis techniques used by professional analysts in capital markets.",
    icon: "BarChart3",
    features: ["Technical Analysis", "Fundamental Analysis", "Risk Assessment", "Portfolio Management"],
  },
  {
    _id: "2",
    title: "Investment Simulation",
    description: "Practice real-world investment strategies using simulated trading platforms with real market data.",
    icon: "TrendingUp",
    features: ["Stock Trading", "Bond Markets", "Derivatives", "Performance Tracking"],
  },
  {
    _id: "3",
    title: "Financial Literacy",
    description: "Build a strong foundation in personal finance and investment principles for long-term wealth building.",
    icon: "BookOpen",
    features: ["Personal Finance", "Investment Basics", "Financial Planning", "Economic Indicators"],
  },
  {
    _id: "4",
    title: "Research & Publication",
    description: "Conduct in-depth research on capital market topics and publish findings in academic journals.",
    icon: "FileText",
    features: ["Market Research", "Data Analysis", "Academic Writing", "Peer Review"],
  },
];

export const articles: Article[] = [
  {
    _id: "1",
    title: "Understanding Bull and Bear Markets: A Comprehensive Guide",
    slug: "understanding-bull-bear-markets",
    excerpt: "An in-depth look at market cycles and how to position your portfolio during different market conditions.",
    publishedAt: "2024-03-15",
    category: "Market Analysis",
    author: { name: "Sarah Chen" },
  },
  {
    _id: "2",
    title: "The Impact of Interest Rates on Stock Valuations",
    slug: "interest-rates-stock-valuations",
    excerpt: "Exploring the relationship between central bank policies and equity market performance.",
    publishedAt: "2024-03-10",
    category: "Economics",
    author: { name: "Michael Rahman" },
  },
  {
    _id: "3",
    title: "ESG Investing: Trends and Opportunities in 2024",
    slug: "esg-investing-trends-2024",
    excerpt: "How environmental, social, and governance factors are reshaping investment strategies globally.",
    publishedAt: "2024-03-05",
    category: "Sustainable Finance",
    author: { name: "Aisha Putri" },
  },
];

export const events: Event[] = [
  {
    _id: "1",
    title: "Capital Market Summit 2024",
    slug: "capital-market-summit-2024",
    description: "Annual summit featuring industry leaders discussing the future of capital markets in Southeast Asia.",
    date: "2024-04-20",
    time: "09:00 - 17:00",
    location: "Auditorium Building A",
    type: "seminar",
  },
  {
    _id: "2",
    title: "Stock Trading Competition",
    slug: "stock-trading-competition",
    description: "Inter-university trading competition with real-time market simulation and expert judges.",
    date: "2024-05-10",
    time: "08:00 - 16:00",
    location: "Online Platform",
    type: "competition",
  },
  {
    _id: "3",
    title: "Technical Analysis Masterclass",
    slug: "technical-analysis-masterclass",
    description: "Hands-on workshop on advanced charting techniques and indicator-based trading strategies.",
    date: "2024-05-25",
    time: "13:00 - 17:00",
    location: "Room 301, Business Faculty",
    type: "workshop",
  },
];

export const team: TeamMember[] = [
  { _id: "1", name: "Ahmad Rizky", role: "President", division: "Executive Board", linkedin: "#" },
  { _id: "2", name: "Dina Maharani", role: "Vice President", division: "Executive Board", linkedin: "#" },
  { _id: "3", name: "Fajar Nugroho", role: "Head of Education", division: "Education", linkedin: "#" },
  { _id: "4", name: "Siti Aisyah", role: "Head of Research", division: "Research", linkedin: "#" },
  { _id: "5", name: "Budi Santoso", role: "Head of Events", division: "Events", linkedin: "#" },
  { _id: "6", name: "Lina Kartika", role: "Head of PR", division: "Public Relations", linkedin: "#" },
  { _id: "7", name: "Reza Pratama", role: "Research Analyst", division: "Research", linkedin: "#" },
  { _id: "8", name: "Maya Indah", role: "Content Writer", division: "Public Relations", linkedin: "#" },
];
