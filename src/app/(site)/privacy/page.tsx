import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Fitzone Supplements handles information collected through this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <p>
        This policy explains what information {SITE.name} (“we”, “us”) collects through this website and how it is
        used. We aim to collect as little personal information as possible.
      </p>

      <h2>Information you choose to give us</h2>
      <ul>
        <li>
          <strong className="text-white">Inquiry form:</strong> your name, mobile number, and message, used only to
          respond to your inquiry.
        </li>
        <li>
          <strong className="text-white">Website reviews:</strong> the name, rating and comment you submit. Approved
          reviews are shown publicly on this website.
        </li>
        <li>
          <strong className="text-white">WhatsApp:</strong> when you tap a WhatsApp button, a message is prepared in the
          WhatsApp app. Nothing is sent until you press send. Conversations on WhatsApp are subject to WhatsApp’s own
          privacy policy.
        </li>
      </ul>

      <h2>Cart</h2>
      <p>Your shopping cart is stored only in your own browser (local storage). It is not sent to us unless you send it on WhatsApp.</p>

      <h2>Website analytics</h2>
      <p>
        We record anonymous website activity — such as page views, product views and clicks on WhatsApp, call or
        directions buttons — to understand which products interest visitors. This uses a random identifier kept in your
        browser tab for that session only. We do not use advertising cookies, do not store your IP address with these
        events, and do not use third-party tracking scripts. If your browser sends a “Do Not Track” or Global Privacy
        Control signal, no analytics events are recorded.
      </p>

      <h2>Embedded maps</h2>
      <p>The contact page includes an embedded Google Map. Google may collect data when the map loads, under Google’s privacy policy.</p>

      <h2>Sharing</h2>
      <p>We do not sell your information. Data is stored with our hosting and database providers solely to operate this website.</p>

      <h2>Your choices</h2>
      <p>
        To ask us to access, correct or delete information you submitted, call {SITE.phoneDisplay} or visit the store at {FULL_ADDRESS}.
      </p>
    </LegalPage>
  );
}
