// Enhancement #23: Blog/News Section
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Blog & News' };

const BLOG_POSTS = [
  {
    id: '1', slug: 'introducing-ai-empire-45-tools',
    title: 'Introducing AI Empire: 45 Powerful AI Tools in One Platform',
    excerpt: 'We\'re excited to launch AI Empire with 45 AI-powered tools spanning code auditing, creative generation, business intelligence, and more.',
    author: 'AI Empire Team', date: 'March 15, 2026',
    tags: ['Launch', 'AI Tools', 'Product'],
    coverColor: '#6366f1',
  },
  {
    id: '2', slug: 'how-ai-is-revolutionizing-productivity',
    title: 'How AI is Revolutionizing Productivity in 2026',
    excerpt: 'From automated code reviews to AI-generated marketing copy, discover how artificial intelligence is transforming how we work.',
    author: 'AI Empire Team', date: 'March 10, 2026',
    tags: ['AI', 'Productivity', 'Trends'],
    coverColor: '#10b981',
  },
  {
    id: '3', slug: 'token-economy-explained',
    title: 'Understanding the AI Empire Token Economy',
    excerpt: 'Learn how our token system works, how to earn tokens by watching ads and referring friends, and how to use them across all 45 tools.',
    author: 'AI Empire Team', date: 'March 5, 2026',
    tags: ['Tokens', 'Guide', 'Economy'],
    coverColor: '#eab308',
  },
  {
    id: '4', slug: 'top-10-ai-tools-developers',
    title: 'Top 10 AI Tools Every Developer Should Use in 2026',
    excerpt: 'CodeAudit, BugBuster, APIGen and more - explore the developer-focused AI tools that can supercharge your workflow.',
    author: 'AI Empire Team', date: 'February 28, 2026',
    tags: ['Developer', 'Tools', 'Guide'],
    coverColor: '#f97316',
  },
  {
    id: '5', slug: 'referral-program-launch',
    title: 'New: Earn Tokens by Referring Friends!',
    excerpt: 'Our new referral program rewards you with 50 tokens for every friend who signs up. Your friends get 25 bonus tokens too!',
    author: 'AI Empire Team', date: 'February 20, 2026',
    tags: ['Referral', 'Tokens', 'Update'],
    coverColor: '#a855f7',
  },
  {
    id: '6', slug: 'security-best-practices',
    title: 'Keeping Your AI Empire Account Secure',
    excerpt: 'Two-factor authentication, email verification, and more - learn about our security features and best practices for protecting your account.',
    author: 'AI Empire Team', date: 'February 15, 2026',
    tags: ['Security', 'Guide', '2FA'],
    coverColor: '#ef4444',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm mb-8 inline-block hover:underline" style={{ color: 'var(--accent)' }}>
          <span className="inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Back to Home</span>
        </Link>
        <h1 className="text-3xl font-bold text-gradient mb-2">Blog & News</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>Latest updates, tutorials, and insights from the AI Empire team</p>

        <div className="grid gap-6">
          {BLOG_POSTS.map(post => (
            <article key={post.id} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="h-2" style={{ background: post.coverColor }} />
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-light)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs flex items-center gap-1 hover:underline cursor-pointer" style={{ color: 'var(--accent)' }}>
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
