import type { Metadata } from "next";
import { getStaticPageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = getStaticPageMetadata(
  "Privacy Policy",
  `${SITE_NAME} privacy policy. We don't collect, store, or sell your data.`
);

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: September 2, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2>Our Commitment</h2>
          <p>
            {SITE_NAME} is built with privacy as a core principle. We do not collect,
            store, transmit, or sell any personal data from our users.
          </p>
        </section>

        <section>
          <h2>Data Processing</h2>
          <p>
            All tool processing happens directly in your web browser. Your inputs
            and results never leave your device. We have no server-side processing
            of user data.
          </p>
        </section>

        <section>
          <h2>Analytics</h2>
          <p>
            We do not use any analytics tools, tracking scripts, cookies, or
            fingerprinting technologies. Your visit to {SITE_NAME} is completely anonymous.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>
            We do not integrate any third-party services that collect user data.
            The only external resource we load is our web font.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            If we ever need to update this policy, we will keep the same
            privacy-first principles. Any changes will be posted on this page.
          </p>
        </section>
      </div>
    </div>
  );
}
