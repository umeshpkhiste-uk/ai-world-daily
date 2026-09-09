export const CATEGORIES = ['All', 'General AI', 'AI Research', 'AI Companies', 'AI Technology', 'AI Startups', 'AI Products', 'Global AI News', 'AI Business', 'AI Regulations', 'AI Science'] as const;
export type Category = (typeof CATEGORIES)[number];
export type NewsItem = { id: string; title: string; summary: string; category: Category; sourceName: string; sourceUrl: string; publishedAt: string; importanceScore: number; isMock?: boolean; coveredBy?: number };
export type CompanyUpdate = Pick<NewsItem, 'title' | 'summary' | 'sourceName' | 'sourceUrl' | 'publishedAt'>;
export type Preferences = { interests: string[]; theme: 'system' | 'light' | 'dark'; notifications: 'daily' | 'breaking' | 'company' | 'disabled' };
