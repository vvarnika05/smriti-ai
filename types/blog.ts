export interface BlogPost {
  title: string;
  slug: string;
  featureImage: {
    url: string;
    description?: string;
  };
  summary: string;
  content: any; // Rich text JSON
  author: string;
  publishDate: string;
}
