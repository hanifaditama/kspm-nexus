export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  author: {
    name: string;
    image?: string;
  };
  mainImage?: string;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "seminar" | "workshop" | "competition" | "webinar";
  image?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  division: string;
  image?: string;
  linkedin?: string;
}

export interface Program {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}
