// Enhancement #19: Privacy Policy Page
import Link from 'next/link';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm mb-8 inline-block hover:underline" style={{ color: 'var(--accent)' }}>← Back to Home</Link>
        <h1 className="text-3xl font-bold text-gradient mb-2">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Last updated: March 18, 2026</p>

        <div className="space-y-8" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>1. Information We Collect</h2>
            <p className="mb-2"><strong>Account Information:</strong> Name, email address, and encrypted password when you register.</p>
            <p className="mb-2"><strong>Usage Data:</strong> Tool usage patterns, token transactions, and interaction data to improve our services.</p>
            <p><strong>Payment Information:</strong> Processed securely through Stripe and Coinbase Commerce. We do not store credit card numbers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>2. How We Use Your Information</h2>
            <p>We use collected information to: provide and improve our services, process payments, send important account notifications, personalize your experience, and maintain platform security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption. Passwords are hashed using bcrypt. We use HTTPS for all data transfers. Data is stored in PostgreSQL databases with regular backups.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>4. Cookies</h2>
            <p>We use essential cookies for authentication and session management. Analytics cookies (Google Analytics) help us understand usage patterns. You can control cookie preferences through our cookie consent banner.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>5. Third-Party Services</h2>
            <p>We integrate with: Stripe (payments), Coinbase Commerce (crypto payments), Google Analytics (usage analytics), AWS S3 (file storage). Each has their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>6. Your Rights (GDPR)</h2>
            <p className="mb-2">Under GDPR and similar regulations, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data (available via Profile → Export Data)</li>
              <li>Correct inaccurate data (via Profile settings)</li>
              <li>Request data deletion (contact support)</li>
              <li>Data portability (JSON export available)</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon account deletion, personal data is removed within 30 days. Anonymized usage data may be retained for analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Children&apos;s Privacy</h2>
            <p>Our services are not intended for users under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>9. Contact Us</h2>
            <p>For privacy-related inquiries: <a href="mailto:privacy@aiempire.app" className="hover:underline" style={{ color: 'var(--accent)' }}>privacy@aiempire.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
