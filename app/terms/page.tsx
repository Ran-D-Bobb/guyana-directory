import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Waypoint',
  description: 'Terms of Service for the Waypoint app - Discover Guyana',
};

export default function TermsOfServicePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-4 text-sm text-muted-foreground">Last updated: February 2, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Agreement to Terms</h2>
          <p>
            By accessing or using Waypoint (&quot;the App&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Description of Service</h2>
          <p>
            Waypoint is a business directory and discovery platform for Guyana. The App allows
            users to browse business listings, read and write reviews, discover events, and
            explore tourism experiences.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 13 years old to create an account.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must provide accurate information when creating your account.</li>
            <li>You may not use another person&apos;s account without permission.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">User Content</h2>
          <p>
            You retain ownership of content you submit (reviews, photos, business listings).
            By posting content, you grant us a non-exclusive, worldwide, royalty-free license
            to use, display, and distribute that content within the App.
          </p>

          <h3 className="mt-4 text-lg font-medium">Content Guidelines</h3>
          <p>You agree not to post content that:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Is false, misleading, or fraudulent</li>
            <li>Infringes on intellectual property rights</li>
            <li>Is defamatory, obscene, or offensive</li>
            <li>Harasses, threatens, or discriminates against others</li>
            <li>Contains spam, advertising, or promotional material</li>
            <li>Violates any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Business Listings</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Business owners may claim and manage their listings after verification.</li>
            <li>All business information must be accurate and up-to-date.</li>
            <li>We reserve the right to remove listings that violate our guidelines.</li>
            <li>Featured or promoted listings are subject to additional terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Reviews and Ratings</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Reviews must be based on genuine experiences with the business.</li>
            <li>You may not review your own business or a competitor&apos;s business.</li>
            <li>We may remove reviews that violate our content guidelines.</li>
            <li>Business owners may respond to reviews but may not remove them.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Intellectual Property</h2>
          <p>
            The App, including its design, features, and content (excluding user content),
            is owned by Waypoint and protected by copyright, trademark, and other intellectual
            property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Disclaimer of Warranties</h2>
          <p>
            The App is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
            the accuracy of business information, reviews, or other content. We are not
            responsible for interactions between users and businesses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Waypoint shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from
            your use of the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Waypoint from any claims, damages, or
            expenses arising from your use of the App, your content, or your violation of
            these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Modifications to Service</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue the App at any time
            without notice. We may also update these Terms of Service, and continued use
            of the App constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            Guyana, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong>{' '}
            <a href="mailto:legal@waypoint.gy" className="text-primary hover:underline">
              legal@waypoint.gy
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
