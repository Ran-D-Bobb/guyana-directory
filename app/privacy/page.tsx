import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Waypoint',
  description: 'Privacy Policy for the Waypoint app - Discover Guyana',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-4 text-sm text-muted-foreground">Last updated: February 2, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Introduction</h2>
          <p>
            Waypoint (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application and website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Information We Collect</h2>

          <h3 className="mt-4 text-lg font-medium">Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> When you sign in with Google, we receive
              your name, email address, and profile photo.
            </li>
            <li>
              <strong>User Content:</strong> Reviews, ratings, and comments you post about businesses.
            </li>
            <li>
              <strong>Business Listings:</strong> If you submit a business, we collect the
              business name, description, contact information, and photos.
            </li>
          </ul>

          <h3 className="mt-4 text-lg font-medium">Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Device Information:</strong> Device type, operating system, and unique
              device identifiers for push notifications.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, and interaction patterns
              to improve our service.
            </li>
            <li>
              <strong>Location:</strong> With your permission, approximate location to show
              nearby businesses (not stored on our servers).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To personalize your experience and show relevant content</li>
            <li>To send push notifications (with your consent)</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To detect and prevent fraud or abuse</li>
            <li>To analyze usage patterns and improve our app</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Sharing Your Information</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Service Providers:</strong> Third parties that help us operate the app
              (hosting, analytics, push notifications).
            </li>
            <li>
              <strong>Public Content:</strong> Reviews and ratings are publicly visible to
              other users.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal information. However, no method of transmission over the Internet is
            100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of push notifications at any time</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p>Our app uses the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google Sign-In:</strong> For authentication.{' '}
              <a href="https://policies.google.com/privacy" className="text-primary hover:underline">
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>Supabase:</strong> For data storage and authentication.{' '}
              <a href="https://supabase.com/privacy" className="text-primary hover:underline">
                Supabase Privacy Policy
              </a>
            </li>
            <li>
              <strong>Firebase Cloud Messaging:</strong> For push notifications.{' '}
              <a href="https://firebase.google.com/support/privacy" className="text-primary hover:underline">
                Firebase Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Children&apos;s Privacy</h2>
          <p>
            Our app is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the &quot;Last
            updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please
            contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong>{' '}
            <a href="mailto:privacy@waypoint.gy" className="text-primary hover:underline">
              privacy@waypoint.gy
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
