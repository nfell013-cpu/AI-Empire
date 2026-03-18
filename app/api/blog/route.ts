// Enhancement #23: Blog API (for future dynamic content)
import { NextResponse } from 'next/server';

const BLOG_POSTS = [
  {
    id: '1', slug: 'introducing-ai-empire-45-tools',
    title: 'Introducing AI Empire: 45 Powerful AI Tools in One Platform',
    excerpt: 'We\'re excited to launch AI Empire with 45 AI-powered tools spanning code auditing, creative generation, business intelligence, and more.',
    author: 'AI Empire Team', date: '2026-03-15', tags: ['Launch', 'AI Tools'],
  },
  {
    id: '2', slug: 'how-ai-is-revolutionizing-productivity',
    title: 'How AI is Revolutionizing Productivity in 2026',
    excerpt: 'From automated code reviews to AI-generated marketing copy, discover how artificial intelligence is transforming how we work.',
    author: 'AI Empire Team', date: '2026-03-10', tags: ['AI', 'Productivity'],
  },
  {
    id: '3', slug: 'token-economy-explained',
    title: 'Understanding the AI Empire Token Economy',
    excerpt: 'Learn how our token system works, how to earn tokens, and how to use them across all 45 tools.',
    author: 'AI Empire Team', date: '2026-03-05', tags: ['Tokens', 'Guide'],
  },
];

export async function GET() {
  return NextResponse.json({ posts: BLOG_POSTS });
}
