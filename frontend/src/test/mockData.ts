import type { Tag, RSSFeed, Article } from '@/types/article'

export const mockTags: Tag[] = [
  {
    id: 1,
    name: 'Technology',
    description: 'Tech news and updates',
    color: '#3B82F6',
    created_at: '2025-10-03T16:58:39',
    updated_at: '2025-10-03T16:58:39',
  },
  {
    id: 2,
    name: 'Science',
    description: 'Scientific discoveries and research',
    color: '#10B981',
    created_at: '2025-10-03T16:58:39',
    updated_at: '2025-10-03T16:58:39',
  },
  {
    id: 3,
    name: 'Business',
    description: 'Business and finance news',
    color: '#F59E0B',
    created_at: '2025-10-03T16:58:39',
    updated_at: '2025-10-03T16:58:39',
  },
]

export const mockRSSFeeds: RSSFeed[] = [
  {
    id: 1,
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    description: 'Technology and startup news',
    is_active: true,
    tags: [{ id: 1, name: 'Technology', color: '#3B82F6' }],
    created_at: '2025-10-03T16:59:34',
    updated_at: '2025-10-03T16:59:34',
    last_fetched_at: null,
  },
  {
    id: 2,
    name: 'Ars Technica',
    url: 'http://feeds.arstechnica.com/arstechnica/index',
    description: 'Technology news and analysis',
    is_active: true,
    tags: [{ id: 1, name: 'Technology', color: '#3B82F6' }],
    created_at: '2025-10-03T16:59:34',
    updated_at: '2025-10-03T16:59:34',
    last_fetched_at: null,
  },
  {
    id: 3,
    name: 'Science Daily',
    url: 'https://www.sciencedaily.com/rss/all.xml',
    description: 'Latest science news',
    is_active: true,
    tags: [{ id: 2, name: 'Science', color: '#10B981' }],
    created_at: '2025-10-03T16:59:34',
    updated_at: '2025-10-03T16:59:34',
    last_fetched_at: null,
  },
]

export const mockArticles: Article[] = [
  {
    id: 1,
    title: 'Anthropic hires new CTO with focus on AI infrastructure',
    content: 'As part of the change, Anthropic is updating the structure of its core technical group...',
    source: 'TechCrunch',
    published_date: '2025-10-02T19:00:39',
    url: 'https://techcrunch.com/2025/10/02/anthropic-hires-new-cto',
    metadata: {},
    created_at: '2025-10-03T16:52:33',
    updated_at: '2025-10-03T16:52:33',
  },
  {
    id: 2,
    title: 'New quantum computing breakthrough announced',
    content: 'Scientists have achieved a major breakthrough in quantum computing stability...',
    source: 'Latest Science News -- ScienceDaily',
    published_date: '2025-10-02T15:30:00',
    url: 'https://www.sciencedaily.com/releases/2025/10/quantum.htm',
    metadata: {},
    created_at: '2025-10-03T14:20:15',
    updated_at: '2025-10-03T14:20:15',
  },
]
