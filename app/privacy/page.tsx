import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Waypoint',
  description: 'Privacy Policy for the Waypoint app - Discover Guyana',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 pb-24">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Waypoint
      </Link>

      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated: February 21, 2026
      </p>

      <div className="prose prose-gray max-w-none space-y-8">
        {/* 1. Introduction */}
        <section>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Waypoint (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Waypoint
            mobile application and website (collectively, the &quot;Service&quot;). Waypoint is a
            platform for discovering local businesses, experiences, stays, and events across Guyana.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our Service. By using Waypoint, you agree to the collection
            and use of information in accordance with this policy.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section>
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>

          <h3 className="mt-4 text-lg font-medium">2.1 Information You Provide Directly</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> When you create an account, you choose an
              account type (personal or business). If you sign up with email, we collect your
              name, email address, and password. If you sign in with Google, we receive your name,
              email address, and profile photo from your Google account.
            </li>
            <li>
              <strong>Profile Information:</strong> You may optionally provide a phone number and
              update your display name or photo.
            </li>
            <li>
              <strong>Reviews and Ratings:</strong> If you have a personal account, you may submit
              star ratings (1&ndash;5) and written reviews for businesses. These are publicly
              visible.
            </li>
            <li>
              <strong>Business Listings:</strong> If you have a business account, you may submit
              business information including name, description, contact details (phone, email,
              website), address, business hours, and up to 3 photos.
            </li>
          </ul>

          <h3 className="mt-4 text-lg font-medium">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Device Information:</strong> Device type, operating system, and browser type.
              If you opt in to push notifications, we collect a device token.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, and interaction patterns
              (such as business page views and contact button clicks) to improve our Service.
            </li>
            <li>
              <strong>Location Data:</strong> Only with your explicit permission, we access your
              device&apos;s approximate location to show nearby businesses. Your location
              coordinates are processed on your device and are <strong>not stored on our
              servers</strong>.
            </li>
          </ul>

          <h3 className="mt-4 text-lg font-medium">2.3 Information We Do Not Collect</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not use third-party analytics or advertising trackers.</li>
            <li>We do not use cookies for cross-site tracking.</li>
            <li>We do not collect payment or financial information.</li>
            <li>We do not access your contacts, calendar, or other device data.</li>
          </ul>
        </section>

        {/* 3. Google User Data */}
        <section>
          <h2 className="text-xl font-semibold">3. Google User Data</h2>
          <p>
            When you choose to sign in with Google, we request access to the following information
            from your Google account:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your profile photo</li>
          </ul>

          <h3 className="mt-4 text-lg font-medium">3.1 How We Use Google Data</h3>
          <p>
            We use the information received from Google <strong>solely</strong> for the following
            purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To create and authenticate your Waypoint account</li>
            <li>To display your name and profile photo within the app</li>
            <li>To associate your reviews and business listings with your account</li>
          </ul>

          <h3 className="mt-4 text-lg font-medium">3.2 Google API Services User Data Policy</h3>
          <p>
            Waypoint&apos;s use and transfer of information received from Google APIs adheres to
            the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. Specifically:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We only use Google user data to provide and improve the Waypoint Service as
              described in this Privacy Policy.
            </li>
            <li>
              We do not transfer Google user data to third parties except as necessary to provide
              the Service, as required by law, or with your explicit consent.
            </li>
            <li>
              We do not use Google user data for advertising or marketing purposes.
            </li>
            <li>
              We do not allow humans to read your Google user data unless we have your
              affirmative consent, it is necessary for security purposes, to comply with
              applicable law, or our use is limited to internal operations.
            </li>
          </ul>
        </section>

        {/* 4. How We Use Your Information */}
        <section>
          <h2 className="text-xl font-semibold">4. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Provide the Service:</strong> To create and manage your account, display
              business listings, and enable reviews.
            </li>
            <li>
              <strong>Personalization:</strong> To show relevant content based on your location
              (when permitted) and browsing activity.
            </li>
            <li>
              <strong>Notifications:</strong> To send push notifications about your account or
              businesses you manage, with your consent.
            </li>
            <li>
              <strong>Service Improvement:</strong> To analyze aggregated, non-identifying usage
              patterns and improve app features.
            </li>
            <li>
              <strong>Safety and Security:</strong> To detect and prevent fraud, abuse, or
              violations of our Terms of Service.
            </li>
            <li>
              <strong>Communication:</strong> To respond to your support requests or inquiries.
            </li>
          </ul>
        </section>

        {/* 5. How We Share Your Information */}
        <section>
          <h2 className="text-xl font-semibold">5. How We Share Your Information</h2>
          <p>
            <strong>We do not sell your personal information.</strong> We may share information
            only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Public Content:</strong> Reviews, ratings, and business listings you create
              are publicly visible to all users.
            </li>
            <li>
              <strong>Service Providers:</strong> We use trusted third-party services to operate
              our platform (see Section 8). These providers only access data necessary to perform
              their functions and are obligated to protect it.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information when required by
              law, regulation, legal process, or governmental request.
            </li>
            <li>
              <strong>Safety:</strong> We may share information when we believe it is necessary to
              protect the rights, property, or safety of Waypoint, our users, or the public.
            </li>
          </ul>
        </section>

        {/* 6. Data Retention */}
        <section>
          <h2 className="text-xl font-semibold">6. Data Retention</h2>
          <p>We retain your information as follows:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Data:</strong> Retained for as long as your account is active. If
              you delete your account, we will delete your personal data within 30 days, except
              where retention is required by law.
            </li>
            <li>
              <strong>Reviews and Ratings:</strong> Retained for as long as your account is
              active. Deleted when you delete your account or individually remove a review.
            </li>
            <li>
              <strong>Business Listings:</strong> Retained for as long as the business is listed
              on the platform. Deleting your account will also remove your business listings.
            </li>
            <li>
              <strong>Usage Data:</strong> Aggregated, non-identifying usage statistics may be
              retained indefinitely for service improvement.
            </li>
            <li>
              <strong>Location Data:</strong> Not stored on our servers. Processed on your device
              only during active use.
            </li>
          </ul>
        </section>

        {/* 7. Data Deletion */}
        <section>
          <h2 className="text-xl font-semibold">7. Your Rights and Data Deletion</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Access:</strong> Request a copy of the personal information we hold about
              you.
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate information through your
              account settings.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your account and all associated
              personal data. You can do this from your account settings or by contacting us at{' '}
              <a href="mailto:privacy@waypoint.gy" className="text-primary hover:underline">
                privacy@waypoint.gy
              </a>
              .
            </li>
            <li>
              <strong>Revoke Google Access:</strong> You can revoke Waypoint&apos;s access to your
              Google account at any time through your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Account permissions
              </a>
              .
            </li>
            <li>
              <strong>Location Permission:</strong> You can disable location access at any time
              through your device settings or the app.
            </li>
            <li>
              <strong>Push Notifications:</strong> You can opt out of push notifications at any
              time through your device settings.
            </li>
            <li>
              <strong>Withdraw Consent:</strong> You can withdraw consent for any data processing
              by contacting us or adjusting your settings.
            </li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, email us at{' '}
            <a href="mailto:privacy@waypoint.gy" className="text-primary hover:underline">
              privacy@waypoint.gy
            </a>
            . We will respond to your request within 30 days.
          </p>
        </section>

        {/* 8. Third-Party Services */}
        <section>
          <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
          <p>
            We use the following third-party services to operate Waypoint. Each service only
            receives the minimum data necessary for its function:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google Sign-In:</strong> Authentication provider.{' '}
              <a
                href="https://policies.google.com/privacy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>Supabase:</strong> Database hosting and authentication infrastructure.{' '}
              <a
                href="https://supabase.com/privacy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase Privacy Policy
              </a>
            </li>
            <li>
              <strong>Firebase Cloud Messaging:</strong> Push notification delivery.{' '}
              <a
                href="https://firebase.google.com/support/privacy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Firebase Privacy Policy
              </a>
            </li>
            <li>
              <strong>Geoapify:</strong> Address autocomplete and map previews.{' '}
              <a
                href="https://www.geoapify.com/privacy-policy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Geoapify Privacy Policy
              </a>
            </li>
            <li>
              <strong>Vercel:</strong> Web hosting and content delivery.{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        {/* 9. Data Security */}
        <section>
          <h2 className="text-xl font-semibold">9. Data Security</h2>
          <p>We protect your information through the following measures:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All data transmitted between your device and our servers is encrypted using TLS/SSL.</li>
            <li>Passwords are hashed and never stored in plain text.</li>
            <li>Database access is controlled through Row Level Security (RLS) policies ensuring users can only access authorized data.</li>
            <li>Administrative access is restricted and audited.</li>
          </ul>
          <p className="mt-2">
            While we implement industry-standard security measures, no method of electronic
            transmission or storage is 100% secure. We cannot guarantee absolute security, but we
            are committed to protecting your information.
          </p>
        </section>

        {/* 10. Children's Privacy */}
        <section>
          <h2 className="text-xl font-semibold">10. Children&apos;s Privacy</h2>
          <p>
            Waypoint is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If we become aware that we have
            collected personal information from a child under 13, we will take steps to delete
            that information promptly. If you believe a child under 13 has provided us with
            personal information, please contact us at{' '}
            <a href="mailto:privacy@waypoint.gy" className="text-primary hover:underline">
              privacy@waypoint.gy
            </a>
            .
          </p>
        </section>

        {/* 11. International Data */}
        <section>
          <h2 className="text-xl font-semibold">11. International Data Transfers</h2>
          <p>
            Your information may be processed and stored on servers located outside of Guyana,
            including in the United States (where our hosting providers operate). By using the
            Service, you consent to the transfer of your information to these locations. We ensure
            that any such transfers comply with applicable data protection laws and that your
            information remains protected as described in this policy.
          </p>
        </section>

        {/* 12. Cookies */}
        <section>
          <h2 className="text-xl font-semibold">12. Cookies and Local Storage</h2>
          <p>
            Waypoint uses essential cookies and browser local storage solely for authentication
            and session management. We do not use advertising cookies, tracking cookies, or any
            third-party cookie-based analytics. The cookies we use are strictly necessary for the
            Service to function.
          </p>
        </section>

        {/* 13. Changes */}
        <section>
          <h2 className="text-xl font-semibold">13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we make material changes,
            we will notify you by updating the &quot;Last updated&quot; date at the top of this
            page and, where appropriate, through an in-app notification. We encourage you to
            review this Privacy Policy periodically. Your continued use of the Service after
            changes are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        {/* 14. Contact */}
        <section>
          <h2 className="text-xl font-semibold">14. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our
            data practices, please contact us:
          </p>
          <div className="mt-3 rounded-lg border bg-muted/50 p-4">
            <p><strong>Waypoint</strong></p>
            <p className="mt-1">
              Email:{' '}
              <a href="mailto:privacy@waypoint.gy" className="text-primary hover:underline">
                privacy@waypoint.gy
              </a>
            </p>
            <p className="mt-1">Georgetown, Guyana</p>
          </div>
        </section>
      </div>
    </main>
  );
}
